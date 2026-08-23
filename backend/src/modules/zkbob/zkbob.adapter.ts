import crypto from 'node:crypto';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import { env } from '../../config/env';

// PoolVault ABI — only the functions/events we need
export const POOL_VAULT_ABI = [
  {
    type: 'function',
    name: 'deposit',
    inputs: [{ name: 'paymentId', type: 'bytes32' }],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'ref', type: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'poolBalance',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Deposited',
    inputs: [
      { name: 'paymentId', type: 'bytes32', indexed: true },
      { name: 'sender', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Withdrawn',
    inputs: [
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'ref', type: 'bytes32', indexed: true },
    ],
  },
] as const;

export interface CreateIntentParams {
  paymentId: string;
  amount: string;
  currency: string;
  network: string;
}

export interface PaymentIntentResult {
  protocol: string;
  protocolVersion: string;
  asset: string;
  network: string;
  expectedAmount: string;
  paymentIdentifier: string;
  commitment: string;
  recipientIdentifier: string;
}

export interface VerifyPaymentParams {
  paymentIdentifier: string;
  expectedAmount: string;
  txHash?: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  txHash?: string;
  blockNumber?: number;
}

export interface WithdrawParams {
  recipientAddress: `0x${string}`;
  amountEth: string;
  ref: string;
}

export interface WithdrawResult {
  txHash: string;
}

export interface PrivacyPaymentProtocol {
  createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntentResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  withdrawToMerchant(params: WithdrawParams): Promise<WithdrawResult>;
  getPoolBalance(): Promise<string>;
}

export class ZkBobAdapter implements PrivacyPaymentProtocol {
  private poolAddress: `0x${string}`;
  private publicClient;
  private walletClient;

  constructor() {
    this.poolAddress = env.POOL_VAULT_ADDRESS as `0x${string}`;

    this.publicClient = createPublicClient({
      chain: foundry,
      transport: http(env.ANVIL_RPC_URL),
    });

    const account = privateKeyToAccount(env.OPERATOR_PRIVATE_KEY as `0x${string}`);
    this.walletClient = createWalletClient({
      account,
      chain: foundry,
      transport: http(env.ANVIL_RPC_URL),
    });
  }

  async createPaymentIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    // Deterministic commitment hash used as the on-chain bytes32 paymentId
    const commitment = crypto
      .createHash('sha256')
      .update(`${params.paymentId}:${params.amount}:${params.currency}`)
      .digest('hex');

    const paymentIdentifier = `zkbob_note_${params.paymentId}`;

    return {
      protocol: 'zkBob',
      protocolVersion: '1.0.0',
      asset: params.currency || 'ETH',
      network: params.network || 'anvil',
      expectedAmount: params.amount,
      paymentIdentifier,
      commitment: `0x${commitment}`,
      // Real PoolVault contract address — frontend sends ETH here
      recipientIdentifier: this.poolAddress,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    if (!params.txHash) {
      return { verified: false };
    }

    try {
      const receipt = await this.publicClient.getTransactionReceipt({
        hash: params.txHash as `0x${string}`,
      });

      if (!receipt || receipt.status !== 'success') {
        return { verified: false };
      }

      // Verify tx was sent to our PoolVault contract
      const tx = await this.publicClient.getTransaction({
        hash: params.txHash as `0x${string}`,
      });

      if (!tx || tx.to?.toLowerCase() !== this.poolAddress.toLowerCase()) {
        return { verified: false };
      }

      // Verify the transferred value matches expected amount
      const expectedWei = parseEther(params.expectedAmount);
      if (tx.value < expectedWei) {
        return { verified: false };
      }

      return {
        verified: true,
        txHash: params.txHash,
        blockNumber: Number(receipt.blockNumber),
      };
    } catch {
      return { verified: false };
    }
  }

  async withdrawToMerchant(params: WithdrawParams): Promise<WithdrawResult> {
    const parsedFloat = parseFloat(params.amountEth);
    if (isNaN(parsedFloat) || parsedFloat <= 0) {
      throw new Error('Invalid withdrawal amount');
    }
    // Format float to string without trailing exponent artifacts
    const cleanAmountStr = parsedFloat.toFixed(6);
    const amountWei = parseEther(cleanAmountStr);

    // Encode ref as bytes32
    const refBytes = crypto.createHash('sha256').update(params.ref).digest();
    const ref = (`0x${refBytes.toString('hex')}`) as `0x${string}`;

    try {
      const txHash = await this.walletClient.writeContract({
        address: this.poolAddress,
        abi: POOL_VAULT_ABI,
        functionName: 'withdraw',
        args: [params.recipientAddress, amountWei, ref],
      });

      await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      return { txHash };
    } catch (error: any) {
      console.error('Failed to execute PoolVault withdrawal:', error);
      throw new Error(error?.shortMessage || error?.message || 'On-chain withdrawal failed');
    }
  }

  async getPoolBalance(): Promise<string> {
    const balance = await this.publicClient.getBalance({
      address: this.poolAddress,
    });
    const eth = Number(balance) / 1e18;
    return eth.toFixed(6);
  }
}

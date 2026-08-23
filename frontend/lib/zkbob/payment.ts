import { zkbobClient } from './client';
import { sendTransaction } from '../wallet/provider';
import { ZkBobPaymentResult, ZkBobPaymentRequest } from './types';
import { ZkBobError } from './errors';

// PoolVault.deposit(bytes32) selector: keccak256('deposit(bytes32)')[0:4] = 0xb214faa5
async function encodeDepositCalldata(commitment: string): Promise<string> {
  // Function selector for deposit(bytes32) = 0xb214faa5
  const selector = 'b214faa5';
  // Pad commitment to 32 bytes (remove 0x prefix, pad to 64 hex chars)
  const padded = commitment.replace(/^0x/, '').padStart(64, '0');
  return `0x${selector}${padded}`;
}

export class PrivatePaymentService {
  async pay(params: ZkBobPaymentRequest): Promise<ZkBobPaymentResult> {
    try {
      // 1. Generate zkBob proof commitment
      const proofResult = await zkbobClient.prepareProof({
        paymentId: params.paymentId,
        amount: params.amount,
        commitment: params.commitment,
      });

      // 2. The recipient is the real PoolVault contract address from the session intent
      const recipient = params.recipientIdentifier || zkbobClient.getPoolAddress();

      if (!recipient || recipient === '0x0000000000000000000000000000000000000000') {
        throw new ZkBobError('Pool vault address is not configured. Cannot process payment.');
      }

      // 3. Encode deposit(bytes32) calldata so PoolVault emits Deposited event with our commitment
      const calldata = await encodeDepositCalldata(params.commitment);

      // 4. Submit payment to PoolVault on Anvil via MetaMask with encoded calldata
      const txHash = await sendTransaction({
        from: params.senderAddress,
        to: recipient,
        valueEth: params.amount,
        data: calldata,
      });

      return {
        success: true,
        txHash,
        nullifier: proofResult.nullifier,
        proof: proofResult.proof,
        paymentId: params.paymentId,
      };
    } catch (err: unknown) {
      if (err instanceof ZkBobError) throw err;
      const msg = err instanceof Error ? err.message : 'Private payment failed';
      throw new ZkBobError(msg);
    }
  }
}

export const privatePaymentService = new PrivatePaymentService();
import { zkbobClient } from './client';
import { sendTransaction } from '../wallet/provider';
import { ZkBobPaymentResult, ZkBobPaymentRequest } from './types';
import { ZkBobError } from './errors';

export class PrivatePaymentService {
  async pay(params: ZkBobPaymentRequest): Promise<ZkBobPaymentResult> {
    try {
      // 1. Generate zkBob proof
      const proofResult = await zkbobClient.prepareProof({
        paymentId: params.paymentId,
        amount: params.amount,
        commitment: params.commitment,
      });

      // 2. Submit payment to zkBob recipient pool on Anvil via MetaMask
      const recipient = params.recipientIdentifier || zkbobClient.getPoolAddress();

      const txHash = await sendTransaction({
        from: params.senderAddress,
        to: recipient,
        valueEth: params.amount,
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

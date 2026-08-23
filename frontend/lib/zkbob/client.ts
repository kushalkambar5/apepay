import { ZkBobProofResult } from './types';
import { generatePaymentProof } from './proof';

export class ZkBobClient {
  // Pool address is set dynamically per-payment from session.intent.recipientIdentifier
  private poolAddress: string;

  constructor(poolAddress = '') {
    this.poolAddress = poolAddress;
  }

  /** Update pool address from checkout session intent */
  setPoolAddress(address: string) {
    this.poolAddress = address;
  }

  async prepareProof(params: {
    paymentId: string;
    amount: string;
    commitment: string;
  }): Promise<ZkBobProofResult> {
    return generatePaymentProof(params);
  }

  getPoolAddress(): string {
    return this.poolAddress;
  }
}

export const zkbobClient = new ZkBobClient();


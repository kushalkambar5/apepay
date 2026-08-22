import { ZkBobProofResult } from './types';
import { generatePaymentProof } from './proof';

export class ZkBobClient {
  private poolAddress: string;

  constructor(poolAddress = '0x1111111111111111111111111111111111111111') {
    this.poolAddress = poolAddress;
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

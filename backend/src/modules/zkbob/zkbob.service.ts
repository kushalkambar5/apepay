import { ZkBobAdapter, PrivacyPaymentProtocol, CreateIntentParams, PaymentIntentResult, VerifyPaymentParams, VerifyPaymentResult } from './zkbob.adapter';

export class ZkBobService {
  private adapter: PrivacyPaymentProtocol;

  constructor(adapter?: PrivacyPaymentProtocol) {
    this.adapter = adapter || new ZkBobAdapter();
  }

  async generateIntent(params: CreateIntentParams): Promise<PaymentIntentResult> {
    return this.adapter.createPaymentIntent(params);
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    return this.adapter.verifyPayment(params);
  }
}

export const zkbobService = new ZkBobService();

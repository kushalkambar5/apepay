import {
  ZkBobAdapter,
  PrivacyPaymentProtocol,
  CreateIntentParams,
  PaymentIntentResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  WithdrawParams,
  WithdrawResult,
} from './zkbob.adapter';

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

  /** Withdraw ETH from the PoolVault to a merchant payout address. */
  async withdrawToMerchant(params: WithdrawParams): Promise<WithdrawResult> {
    return this.adapter.withdrawToMerchant(params);
  }

  /** Return current ETH balance of the PoolVault in ETH (string). */
  async getPoolBalance(): Promise<string> {
    return this.adapter.getPoolBalance();
  }
}

export const zkbobService = new ZkBobService();

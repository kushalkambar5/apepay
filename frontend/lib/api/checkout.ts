import { apiRequest } from './client';
import { CheckoutSession } from '@/types';

export interface SubmitTxParams {
  txHash?: string;
  proof?: Record<string, unknown>;
  nullifier?: string;
}

export const checkoutApi = {
  async getSession(paymentId: string): Promise<CheckoutSession> {
    return apiRequest<CheckoutSession>(`/checkout/${paymentId}`, {
      method: 'GET',
      useAuth: false,
    });
  },

  async submitTransaction(
    paymentId: string,
    params: SubmitTxParams
  ): Promise<{ paymentId: string; status: string; message: string }> {
    return apiRequest<{ paymentId: string; status: string; message: string }>(
      `/checkout/${paymentId}/submit-tx`,
      {
        method: 'POST',
        body: JSON.stringify(params),
        useAuth: false,
      }
    );
  },
};

import { apiRequest } from './client';
import { Payment } from '@/types';

export const paymentsApi = {
  async listPayments(): Promise<{ payments: Payment[] }> {
    return apiRequest<{ payments: Payment[] }>('/dashboard/payments', {
      method: 'GET',
    });
  },

  async getPayment(paymentId: string): Promise<Payment> {
    return apiRequest<Payment>(`/dashboard/payments/${paymentId}`, {
      method: 'GET',
    });
  },
};

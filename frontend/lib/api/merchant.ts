import { apiRequest } from './client';
import { Merchant, MerchantWallet } from '@/types';

export interface UpdateMerchantParams {
  businessName?: string;
  website?: string;
}

export interface AddWalletParams {
  address: string;
  network?: string;
  walletType?: 'payout' | 'authentication';
}

export const merchantApi = {
  async getProfile(): Promise<Merchant> {
    return apiRequest<Merchant>('/dashboard/merchant', { method: 'GET' });
  },

  async updateProfile(params: UpdateMerchantParams): Promise<Merchant> {
    return apiRequest<Merchant>('/dashboard/merchant', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  },

  async getWallets(): Promise<{ wallets: MerchantWallet[] }> {
    return apiRequest<{ wallets: MerchantWallet[] }>('/dashboard/wallets', {
      method: 'GET',
    });
  },

  async addWallet(params: AddWalletParams): Promise<MerchantWallet> {
    return apiRequest<MerchantWallet>('/dashboard/wallets', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

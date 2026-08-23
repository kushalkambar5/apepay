import { apiRequest } from './client';
import { ApiKey } from '@/types';

export interface CreateApiKeyParams {
  name: string;
  environment?: 'test' | 'live';
}

export const apiKeysApi = {
  async listKeys(): Promise<{ keys: ApiKey[] }> {
    return apiRequest<{ keys: ApiKey[] }>('/dashboard/api-keys', {
      method: 'GET',
    });
  },

  async createKey(params: CreateApiKeyParams): Promise<ApiKey> {
    return apiRequest<ApiKey>('/dashboard/api-keys', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async revokeKey(keyId: string): Promise<{ success: boolean; key: ApiKey }> {
    if (!keyId || keyId === 'undefined') {
      throw new Error('Invalid API key ID');
    }
    return apiRequest<{ success: boolean; key: ApiKey }>(
      `/dashboard/api-keys/${keyId}`,
      {
        method: 'DELETE',
      }
    );
  },
};

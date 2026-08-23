import { apiRequest } from './client';
import { WebhookDelivery, WebhookEndpoint } from '@/types';

export const webhooksApi = {
  async listDeliveries(): Promise<{ deliveries: WebhookDelivery[] }> {
    return apiRequest<{ deliveries: WebhookDelivery[] }>('/dashboard/webhooks', {
      method: 'GET',
    });
  },

  async listEndpoints(): Promise<{ endpoints: WebhookEndpoint[] }> {
    return apiRequest<{ endpoints: WebhookEndpoint[] }>(
      '/dashboard/webhooks/endpoints',
      {
        method: 'GET',
      }
    );
  },

  async addEndpoint(url: string): Promise<WebhookEndpoint> {
    return apiRequest<WebhookEndpoint>('/dashboard/webhooks/endpoints', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },

  async deleteEndpoint(id: string): Promise<{ success: boolean }> {
    if (!id || id === 'undefined') {
      throw new Error('Invalid Webhook endpoint ID');
    }
    return apiRequest<{ success: boolean }>(`/dashboard/webhooks/endpoints/${id}`, {
      method: 'DELETE',
    });
  },

  async retryDelivery(deliveryId: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(
      `/dashboard/webhooks/${deliveryId}/retry`,
      {
        method: 'POST',
      }
    );
  },
};

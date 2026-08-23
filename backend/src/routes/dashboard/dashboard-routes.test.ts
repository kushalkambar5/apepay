import { describe, it, expect, beforeAll } from 'vitest';
import Fastify from 'fastify';
import { dashboardApiKeyRoutes } from './apiKeys';
import { dashboardWebhookRoutes } from './webhooks';
import { dashboardAuthRoutes } from './auth';
import { errorHandler } from '../../middleware/error.middleware';

describe('Dashboard HTTP Routes DELETE Test', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    app.setErrorHandler(errorHandler);
    await app.register(dashboardAuthRoutes, { prefix: '/dashboard/auth' });
    await app.register(dashboardApiKeyRoutes, { prefix: '/dashboard' });
    await app.register(dashboardWebhookRoutes, { prefix: '/dashboard' });

    const email = `test_routes_${Date.now()}@apepay.local`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/dashboard/auth/register',
      payload: {
        email,
        password: 'password123',
        businessName: 'Route Test Store',
      },
    });

    const body = JSON.parse(regRes.payload);
    authToken = body.token;
  });

  it('should test invalid UUID ID in delete key', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/dashboard/api-keys/undefined',
      headers: { authorization: `Bearer ${authToken}` },
    });
    console.log('DELETE API KEY INVALID ID RES:', res.statusCode, res.payload);
  });

  it('should test invalid UUID ID in delete webhook endpoint', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/dashboard/webhooks/endpoints/undefined',
      headers: { authorization: `Bearer ${authToken}` },
    });
    console.log('DELETE WEBHOOK ENDPOINT INVALID ID RES:', res.statusCode, res.payload);
  });
});

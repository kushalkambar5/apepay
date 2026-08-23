import { describe, it, expect, beforeAll } from 'vitest';
import Fastify from 'fastify';
import { dashboardApiKeyRoutes } from './apiKeys';
import { dashboardWebhookRoutes } from './webhooks';
import { dashboardAuthRoutes } from './auth';
import { errorHandler } from '../../middleware/error.middleware';

import { dashboardZkBobRoutes } from './zkbob';

describe('Dashboard HTTP Routes DELETE Test', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    app.setErrorHandler(errorHandler);
    app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req: any, body: string, done: any) => {
      if (!body || body.trim() === '') {
        done(null, null);
        return;
      }
      try {
        const json = JSON.parse(body);
        done(null, json);
      } catch (err: any) {
        done(err, undefined);
      }
    });

    await app.register(dashboardAuthRoutes, { prefix: '/dashboard/auth' });
    await app.register(dashboardApiKeyRoutes, { prefix: '/dashboard' });
    await app.register(dashboardWebhookRoutes, { prefix: '/dashboard' });
    await app.register(dashboardZkBobRoutes, { prefix: '/dashboard' });

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

  it('should test empty body DELETE request with content-type application/json', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/dashboard/api-keys',
      headers: { authorization: `Bearer ${authToken}` },
      payload: { name: 'Empty Body Test Key', environment: 'test' },
    });
    const key = JSON.parse(createRes.payload);
    expect(createRes.statusCode).toBe(201);

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/dashboard/api-keys/${key.id}`,
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
    });
    expect(deleteRes.statusCode).toBe(200);
  });

  it('should return 400 for invalid UUID ID format in delete key', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/dashboard/api-keys/undefined',
      headers: { authorization: `Bearer ${authToken}` },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid UUID ID format in delete webhook endpoint', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/dashboard/webhooks/endpoints/undefined',
      headers: { authorization: `Bearer ${authToken}` },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 for non-existent UUID key revocation', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await app.inject({
      method: 'DELETE',
      url: `/dashboard/api-keys/${fakeUuid}`,
      headers: { authorization: `Bearer ${authToken}`, 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('API Key not found or already revoked');
  });

  it('should return 404 for non-existent UUID webhook endpoint deletion', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await app.inject({
      method: 'DELETE',
      url: `/dashboard/webhooks/endpoints/${fakeUuid}`,
      headers: { authorization: `Bearer ${authToken}`, 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Webhook endpoint not found');
  });

  it('should auto-register recipientAddress if no payout wallet exists when initiating withdraw', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/dashboard/zkbob/withdraw',
      headers: { authorization: `Bearer ${authToken}` },
      payload: {
        amountEth: '0.1',
        recipientAddress: '0x5d76000000000000000000000000000000085fdA',
      },
    });
    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.payload);
    expect(payload.success).toBe(true);
    expect(payload.recipient).toBe('0x5D76000000000000000000000000000000085fdA');
  });
});

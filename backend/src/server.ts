import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/error.middleware';

import { paymentsRoutes } from './routes/v1/payments';
import { merchantRoutes } from './routes/v1/merchant';
import { webhooksV1Routes } from './routes/v1/webhooks';
import { checkoutRoutes } from './routes/checkout/checkout';

import { dashboardAuthRoutes } from './routes/dashboard/auth';
import { dashboardMerchantRoutes } from './routes/dashboard/merchant';
import { dashboardApiKeyRoutes } from './routes/dashboard/apiKeys';
import { dashboardPaymentRoutes } from './routes/dashboard/payments';
import { dashboardWebhookRoutes } from './routes/dashboard/webhooks';
import { dashboardZkBobRoutes } from './routes/dashboard/zkbob';

import { runBlockchainIndexer } from './workers/indexer.worker';
import { runWebhookWorker } from './workers/webhook.worker';

const app = Fastify({
  logger: false, // Custom pino logger handled in middleware / services
});

async function buildServer() {
  // CORS Configuration
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Idempotency-Key'],
    credentials: true,
  });

  // Global Error Handler
  app.setErrorHandler(errorHandler);

  // Allow empty JSON bodies without throwing Fastify FST_ERR_CTP_EMPTY_JSON_BODY error
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

  // Health check route
  app.get('/health', async () => {
    return { status: 'ok', service: 'ApePay API', timestamp: new Date() };
  });

  // Merchant Public V1 REST API
  await app.register(paymentsRoutes, { prefix: '/v1/payments' });
  await app.register(merchantRoutes, { prefix: '/v1/merchant' });
  await app.register(webhooksV1Routes, { prefix: '/v1' });

  // Customer Checkout API
  await app.register(checkoutRoutes, { prefix: '/checkout' });

  // Merchant Dashboard API
  await app.register(dashboardAuthRoutes, { prefix: '/dashboard/auth' });
  await app.register(dashboardMerchantRoutes, { prefix: '/dashboard' });
  await app.register(dashboardApiKeyRoutes, { prefix: '/dashboard' });
  await app.register(dashboardPaymentRoutes, { prefix: '/dashboard' });
  await app.register(dashboardWebhookRoutes, { prefix: '/dashboard' });
  await app.register(dashboardZkBobRoutes, { prefix: '/dashboard' });

  return app;
}

async function start() {
  try {
    const server = await buildServer();
    await server.listen({ port: env.PORT, host: env.HOST });
    logger.info(`🚀 ApePay Backend Server listening at http://${env.HOST}:${env.PORT}`);

    // Launch background workers
    runBlockchainIndexer();
    runWebhookWorker();
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

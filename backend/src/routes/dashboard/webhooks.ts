import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { webhookService } from '../../modules/webhooks/webhook.service';
import { authenticateDashboard } from '../../middleware/auth.middleware';
import { NotFoundError } from '../../lib/errors';

const addEndpointSchema = z.object({
  url: z.string().url(),
});

const paramIdSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format' }),
});

export async function dashboardWebhookRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  fastify.get('/webhooks', async (request, reply) => {
    const merchant = request.merchant!;
    const deliveries = await webhookService.listDeliveries(merchant.id);
    reply.send({ deliveries });
  });

  fastify.get('/webhooks/endpoints', async (request, reply) => {
    const merchant = request.merchant!;
    const endpoints = await webhookService.listEndpoints(merchant.id);
    reply.send({ endpoints });
  });

  fastify.post('/webhooks/endpoints', async (request, reply) => {
    const body = addEndpointSchema.parse(request.body);
    const merchant = request.merchant!;
    const endpoint = await webhookService.registerEndpoint(merchant.id, body.url);
    reply.status(201).send(endpoint);
  });

  fastify.delete<{ Params: { id: string } }>('/webhooks/endpoints/:id', async (request, reply) => {
    const { id } = paramIdSchema.parse(request.params);
    const merchant = request.merchant!;
    const deleted = await webhookService.deleteEndpoint(merchant.id, id);
    reply.send({ success: true, endpoint: deleted });
  });

  fastify.post<{ Params: { id: string } }>('/webhooks/:id/retry', async (request, reply) => {
    const { id } = paramIdSchema.parse(request.params);
    const merchant = request.merchant!;
    const delivery = await webhookService.getDelivery(merchant.id, id);
    if (!delivery) {
      throw new NotFoundError('Webhook delivery not found');
    }
    await webhookService.deliverWebhook(id);
    reply.send({ success: true, message: 'Webhook delivery re-triggered' });
  });
}

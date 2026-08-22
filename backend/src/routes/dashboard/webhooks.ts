import { FastifyInstance } from 'fastify';
import { webhookService } from '../../modules/webhooks/webhook.service';
import { authenticateDashboard } from '../../middleware/auth.middleware';

export async function dashboardWebhookRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  fastify.get('/webhooks', async (request, reply) => {
    const merchant = request.merchant!;
    const deliveries = await webhookService.listDeliveries(merchant.id);
    reply.send({ deliveries });
  });

  fastify.post<{ Params: { id: string } }>('/webhooks/:id/retry', async (request, reply) => {
    const { id } = request.params;
    await webhookService.deliverWebhook(id);
    reply.send({ success: true, message: 'Webhook delivery re-triggered' });
  });
}

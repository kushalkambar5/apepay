import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { webhookService } from '../../modules/webhooks/webhook.service';
import { authenticateApiKey } from '../../middleware/auth.middleware';

const registerWebhookSchema = z.object({
  url: z.string().url(),
});

export async function webhooksV1Routes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateApiKey);

  /**
   * GET /v1/webhook-endpoints
   * List webhook endpoints for merchant
   */
  fastify.get('/webhook-endpoints', async (request, reply) => {
    const merchant = request.merchant!;
    const endpoints = await webhookService.listEndpoints(merchant.id);
    reply.send({ endpoints });
  });

  /**
   * POST /v1/webhook-endpoints
   * Register a new webhook endpoint (returns secret once)
   */
  fastify.post('/webhook-endpoints', async (request, reply) => {
    const body = registerWebhookSchema.parse(request.body);
    const merchant = request.merchant!;

    const endpoint = await webhookService.registerEndpoint(merchant.id, body.url);

    reply.status(201).send({
      id: endpoint.id,
      url: endpoint.url,
      secret: endpoint.secret, // Returns plain secret once for HMAC verification setup
      isActive: endpoint.isActive,
      createdAt: endpoint.createdAt,
    });
  });

  /**
   * DELETE /v1/webhook-endpoints/:id
   * Delete a webhook endpoint
   */
  fastify.delete<{ Params: { id: string } }>('/webhook-endpoints/:id', async (request, reply) => {
    const { id } = request.params;
    const merchant = request.merchant!;

    await webhookService.deleteEndpoint(merchant.id, id);
    reply.send({ success: true, message: 'Webhook endpoint deleted' });
  });
}

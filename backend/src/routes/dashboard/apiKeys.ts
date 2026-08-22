import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { apiKeyService } from '../../modules/api-keys/api-key.service';
import { authenticateDashboard } from '../../middleware/auth.middleware';

const createApiKeySchema = z.object({
  name: z.string().min(1),
  environment: z.enum(['test', 'live']).optional().default('test'),
});

export async function dashboardApiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  fastify.get('/api-keys', async (request, reply) => {
    const merchant = request.merchant!;
    const keys = await apiKeyService.listApiKeys(merchant.id);
    reply.send({ keys });
  });

  fastify.post('/api-keys', async (request, reply) => {
    const body = createApiKeySchema.parse(request.body);
    const merchant = request.merchant!;
    const key = await apiKeyService.createApiKey(merchant.id, body.name, body.environment);
    reply.status(201).send(key);
  });

  fastify.delete<{ Params: { id: string } }>('/api-keys/:id', async (request, reply) => {
    const { id } = request.params;
    const merchant = request.merchant!;
    const revoked = await apiKeyService.revokeApiKey(merchant.id, id);
    reply.send({ success: true, key: revoked });
  });
}

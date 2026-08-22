import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { merchantService } from '../../modules/merchants/merchant.service';
import { authenticateDashboard } from '../../middleware/auth.middleware';

const updateProfileSchema = z.object({
  businessName: z.string().optional(),
  website: z.string().url().optional(),
});

const addWalletSchema = z.object({
  address: z.string(),
  network: z.string().optional().default('anvil'),
  walletType: z.enum(['payout', 'authentication']).optional().default('payout'),
});

export async function dashboardMerchantRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  fastify.get('/merchant', async (request, reply) => {
    const merchant = request.merchant!;
    const profile = await merchantService.getMerchantProfile(merchant.id);
    reply.send(profile);
  });

  fastify.put('/merchant', async (request, reply) => {
    const body = updateProfileSchema.parse(request.body);
    const merchant = request.merchant!;
    const updated = await merchantService.updateMerchantProfile(merchant.id, body);
    reply.send(updated);
  });

  fastify.get('/wallets', async (request, reply) => {
    const merchant = request.merchant!;
    const wallets = await merchantService.getWallets(merchant.id);
    reply.send({ wallets });
  });

  fastify.post('/wallets', async (request, reply) => {
    const body = addWalletSchema.parse(request.body);
    const merchant = request.merchant!;
    const wallet = await merchantService.addWallet(merchant.id, body);
    reply.status(201).send(wallet);
  });
}

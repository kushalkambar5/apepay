import { merchantService } from '../../modules/merchants/merchant.service';
import { authenticateApiKey } from '../../middleware/auth.middleware';
export async function merchantRoutes(fastify) {
    fastify.addHook('preHandler', authenticateApiKey);
    /**
     * GET /v1/merchant
     * Get authenticated merchant info
     */
    fastify.get('/', async (request, reply) => {
        const merchant = request.merchant;
        const profile = await merchantService.getMerchantProfile(merchant.id);
        reply.send({
            id: profile.id,
            businessName: profile.businessName,
            website: profile.website,
            status: profile.status,
            wallets: profile.wallets.map((w) => ({
                network: w.network,
                address: w.address,
                walletType: w.walletType,
                isActive: w.isActive,
            })),
            createdAt: profile.createdAt,
        });
    });
}

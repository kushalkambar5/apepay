import { z } from 'zod';
import { paymentService } from '../../modules/payments/payment.service';
import { authenticateApiKey } from '../../middleware/auth.middleware';
const createPaymentSchema = z.object({
    amount: z.string().or(z.number()).transform((val) => val.toString()),
    currency: z.string().optional().default('ETH'),
    orderId: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    redirectUrl: z.string().url().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
export async function paymentsRoutes(fastify) {
    // Protect all /v1/payments routes with API Key authentication
    fastify.addHook('preHandler', authenticateApiKey);
    /**
     * POST /v1/payments
     * Create a new payment session. Supports Idempotency-Key header.
     */
    fastify.post('/', async (request, reply) => {
        const body = createPaymentSchema.parse(request.body);
        const idempotencyKey = request.headers['idempotency-key'] || undefined;
        const merchant = request.merchant;
        const payment = await paymentService.createPayment({
            merchantId: merchant.id,
            amount: body.amount,
            currency: body.currency,
            orderId: body.orderId,
            webhookUrl: body.webhookUrl,
            redirectUrl: body.redirectUrl,
            idempotencyKey,
            metadata: body.metadata,
        });
        reply.status(201).send({
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            checkoutUrl: payment.checkoutUrl,
            redirectUrl: payment.redirectUrl,
            expiresAt: payment.expiresAt,
            createdAt: payment.createdAt,
        });
    });
    /**
     * GET /v1/payments/:paymentId
     * Fetch payment status and details.
     */
    fastify.get('/:paymentId', async (request, reply) => {
        const { paymentId } = request.params;
        const merchant = request.merchant;
        const payment = await paymentService.getPaymentByPublicId(paymentId, merchant.id);
        reply.send({
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            checkoutUrl: payment.checkoutUrl,
            redirectUrl: payment.redirectUrl,
            expiresAt: payment.expiresAt,
            paidAt: payment.paidAt,
            createdAt: payment.createdAt,
        });
    });
    /**
     * POST /v1/payments/:paymentId/cancel
     * Cancel a pending payment.
     */
    fastify.post('/:paymentId/cancel', async (request, reply) => {
        const { paymentId } = request.params;
        const merchant = request.merchant;
        const payment = await paymentService.cancelPayment(paymentId, merchant.id);
        reply.send({
            paymentId: payment.paymentId,
            status: payment.status,
            updatedAt: payment.updatedAt,
        });
    });
}

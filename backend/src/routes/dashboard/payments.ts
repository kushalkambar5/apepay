import { FastifyInstance } from 'fastify';
import { paymentService } from '../../modules/payments/payment.service';
import { authenticateDashboard } from '../../middleware/auth.middleware';

export async function dashboardPaymentRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  fastify.get('/payments', async (request, reply) => {
    const merchant = request.merchant!;
    const paymentsList = await paymentService.listMerchantPayments(merchant.id);
    reply.send({ payments: paymentsList });
  });

  fastify.get<{ Params: { id: string } }>('/payments/:id', async (request, reply) => {
    const { id } = request.params;
    const merchant = request.merchant!;
    const payment = await paymentService.getPaymentWithTimeline(id, merchant.id);
    reply.send(payment);
  });
}

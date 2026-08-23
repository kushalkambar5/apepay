import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { paymentService } from '../../modules/payments/payment.service';
import { zkbobService } from '../../modules/zkbob/zkbob.service';
import { logger } from '../../lib/logger';

const submitTxSchema = z.object({
  txHash: z.string().optional(),
  proof: z.record(z.string(), z.unknown()).optional(),
  nullifier: z.string().optional(),
});

export async function checkoutRoutes(fastify: FastifyInstance) {
  /**
   * GET /checkout/:paymentId
   * Public endpoint used by customer checkout UI.
   * Returns only safe, public fields.
   */
  fastify.get<{ Params: { paymentId: string } }>('/:paymentId', async (request, reply) => {
    const { paymentId } = request.params;
    const session = await paymentService.getCheckoutSession(paymentId);
    reply.send(session);
  });

  /**
   * POST /checkout/:paymentId/submit-tx
   * Public endpoint where customer frontend signals transaction submission.
   * Verifies the tx on-chain against the PoolVault contract before marking as paid.
   */
  fastify.post<{ Params: { paymentId: string } }>('/:paymentId/submit-tx', async (request, reply) => {
    const { paymentId } = request.params;
    const body = submitTxSchema.parse(request.body);

    logger.info({ paymentId, txHash: body.txHash }, 'Customer submitted payment transaction');

    if (body.txHash) {
      // Fetch the payment to get the expected amount
      const session = await paymentService.getCheckoutSession(paymentId);

      // Verify on-chain: receipt must exist, status=success, to=PoolVault, value>=expectedAmount
      const verifyResult = await zkbobService.verifyPayment({
        paymentIdentifier: paymentId,
        expectedAmount: session.amount ?? '0',
        txHash: body.txHash,
      });

      if (verifyResult.verified) {
        await paymentService.markAsPaid(paymentId, body.txHash);
        logger.info({ paymentId, txHash: body.txHash }, 'Payment verified and marked as paid');
      } else {
        logger.warn({ paymentId, txHash: body.txHash }, 'Transaction verification failed');
      }
    }

    reply.send({
      paymentId,
      status: 'processing',
      message: 'Transaction submitted for blockchain verification',
    });
  });
}

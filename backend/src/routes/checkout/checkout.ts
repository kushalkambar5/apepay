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
   * Does NOT mark payment as paid automatically.
   */
  fastify.post<{ Params: { paymentId: string } }>('/:paymentId/submit-tx', async (request, reply) => {
    const { paymentId } = request.params;
    const body = submitTxSchema.parse(request.body);

    logger.info({ paymentId, txHash: body.txHash }, 'Customer submitted payment transaction/proof');

    // Trigger verification check (or prioritize in indexer)
    if (body.txHash) {
      // In local anvil / MVP mode, verify and queue confirmation
      const verifyResult = await zkbobService.verifyPayment({
        paymentIdentifier: paymentId,
        expectedAmount: '0',
        txHash: body.txHash,
      });

      if (verifyResult.verified) {
        await paymentService.markAsPaid(paymentId, body.txHash);
      }
    }

    reply.send({
      paymentId,
      status: 'processing',
      message: 'Transaction submitted for blockchain verification',
    });
  });
}

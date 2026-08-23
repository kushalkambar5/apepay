import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zkbobService } from '../../modules/zkbob/zkbob.service';
import { merchantService } from '../../modules/merchants/merchant.service';
import { db, withdrawalEvents } from '../../db';
import { eq } from 'drizzle-orm';
import { authenticateDashboard } from '../../middleware/auth.middleware';
import { BadRequestError } from '../../lib/errors';
import { logger } from '../../lib/logger';

import { getAddress, isAddress } from 'viem';

const withdrawSchema = z.object({
  amountEth: z.string().refine((v) => parseFloat(v) > 0, { message: 'Amount must be > 0' }),
  recipientAddress: z.string().optional(),
});

export async function dashboardZkBobRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateDashboard);

  /**
   * GET /dashboard/zkbob/pool-balance
   * Returns the current ETH balance held in the PoolVault contract.
   */
  fastify.get('/zkbob/pool-balance', async (_request, reply) => {
    const balance = await zkbobService.getPoolBalance();
    reply.send({ balanceEth: balance });
  });

  /**
   * POST /dashboard/zkbob/withdraw
   * Triggers an on-chain withdrawal from the PoolVault to the merchant's payout wallet.
   */
  fastify.post('/zkbob/withdraw', async (request, reply) => {
    const merchant = request.merchant!;
    const body = withdrawSchema.parse(request.body);

    // Find merchant's registered payout wallet
    const wallets = await merchantService.getWallets(merchant.id);
    let payoutWallet = wallets.find((w) => w.walletType === 'payout' && w.isActive);

    const formattedRecipient = body.recipientAddress && isAddress(body.recipientAddress, { strict: false })
      ? getAddress(body.recipientAddress)
      : undefined;

    // Auto-register payout wallet if recipientAddress is passed and no payout wallet is stored
    if ((!payoutWallet || !payoutWallet.address) && formattedRecipient) {
      payoutWallet = await merchantService.addWallet(merchant.id, {
        address: formattedRecipient,
        network: 'anvil',
        walletType: 'payout',
      });
    }

    const recipientAddress = payoutWallet?.address
      ? (isAddress(payoutWallet.address, { strict: false }) ? getAddress(payoutWallet.address) : payoutWallet.address)
      : formattedRecipient;

    if (!recipientAddress) {
      throw new BadRequestError(
        'No active payout wallet configured. Please connect a wallet or add one in settings.'
      );
    }

    logger.info(
      { merchantId: merchant.id, recipient: recipientAddress, amountEth: body.amountEth },
      'Initiating zkBob pool withdrawal'
    );

    // Insert a pending withdrawal record
    const [withdrawalRecord] = await db
      .insert(withdrawalEvents)
      .values({
        merchantId: merchant.id,
        recipientAddress: recipientAddress,
        amountEth: body.amountEth,
        status: 'pending',
      })
      .returning();

    try {
      // Execute the on-chain withdrawal via OPERATOR_PRIVATE_KEY
      const result = await zkbobService.withdrawToMerchant({
        recipientAddress: recipientAddress as `0x${string}`,
        amountEth: body.amountEth,
        ref: withdrawalRecord.id,
      });

      // Update record to confirmed
      await db
        .update(withdrawalEvents)
        .set({ txHash: result.txHash, status: 'confirmed' })
        .where(eq(withdrawalEvents.id, withdrawalRecord.id));

      logger.info(
        { merchantId: merchant.id, txHash: result.txHash, amountEth: body.amountEth },
        'zkBob withdrawal confirmed'
      );

      reply.send({
        success: true,
        txHash: result.txHash,
        amountEth: body.amountEth,
        recipient: recipientAddress,
        status: 'confirmed',
      });
    } catch (err) {
      // Mark withdrawal as failed
      await db
        .update(withdrawalEvents)
        .set({ status: 'failed' })
        .where(eq(withdrawalEvents.id, withdrawalRecord.id));

      throw err;
    }
  });

  /**
   * GET /dashboard/zkbob/withdrawals
   * Lists all withdrawal events for this merchant.
   */
  fastify.get('/zkbob/withdrawals', async (request, reply) => {
    const merchant = request.merchant!;
    const history = await db
      .select()
      .from(withdrawalEvents)
      .where(eq(withdrawalEvents.merchantId, merchant.id));

    reply.send({ withdrawals: history });
  });
}

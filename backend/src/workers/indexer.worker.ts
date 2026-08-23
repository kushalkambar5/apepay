import { eq } from 'drizzle-orm';
import { db, payments, paymentIntents } from '../db';
import { blockchainService } from '../modules/blockchain/blockchain.service';
import { paymentService } from '../modules/payments/payment.service';
import { env } from '../config/env';
import { POOL_VAULT_ABI } from '../modules/zkbob/zkbob.adapter';
import { createPublicClient, http } from 'viem';
import { foundry } from 'viem/chains';
import { logger } from '../lib/logger';

export async function runBlockchainIndexer() {
  logger.info('Starting Blockchain Indexer Worker...');

  const pollInterval = 5000; // Poll every 5 seconds

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(env.ANVIL_RPC_URL),
  });

  const poolAddress = env.POOL_VAULT_ADDRESS as `0x${string}`;

  const tick = async () => {
    try {
      const blockNumber = await blockchainService.getLatestBlockNumber();

      // Find pending payments
      const pendingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.status, 'pending'));

      for (const payment of pendingPayments) {
        // Check if payment has expired
        if (payment.expiresAt && payment.expiresAt < new Date()) {
          await db
            .update(payments)
            .set({ status: 'expired', updatedAt: new Date() })
            .where(eq(payments.id, payment.id));
          logger.info({ paymentId: payment.paymentId }, 'Marked payment as expired');
          continue;
        }

        // Fetch corresponding intent
        const [intent] = await db
          .select()
          .from(paymentIntents)
          .where(eq(paymentIntents.paymentId, payment.id))
          .limit(1);

        if (!intent) continue;

        // Scan PoolVault Deposited events for this paymentId (commitment as bytes32)
        try {
          const depositedEvent = POOL_VAULT_ABI.find(
            (x): x is typeof POOL_VAULT_ABI[3] => x.type === 'event' && x.name === 'Deposited'
          );
          if (!depositedEvent) continue;

          const logs = await publicClient.getLogs({
            address: poolAddress,
            event: depositedEvent as any,
            fromBlock: 0n,
            toBlock: blockNumber,
          });

          for (const log of logs) {
            const args = (log as any).args as { paymentId?: string; sender?: string; amount?: bigint };
            const commitmentHex = intent.commitment?.replace(/^0x/, '');
            const logPaymentId = (args.paymentId || '').replace(/^0x/, '');

            if (
              logPaymentId === commitmentHex &&
              payment.status === 'pending' &&
              log.transactionHash
            ) {
              const expectedWei = BigInt(Math.floor(parseFloat(payment.amount || '0') * 1e18));
              if ((args.amount || 0n) >= expectedWei) {
                await paymentService.markAsPaid(payment.paymentId, log.transactionHash);
                logger.info(
                  { paymentId: payment.paymentId, txHash: log.transactionHash },
                  'Indexer: auto-confirmed payment via Deposited event'
                );
                break;
              }
            }
          }
        } catch (scanErr) {
          logger.warn({ err: scanErr, paymentId: payment.paymentId }, 'Failed to scan Deposited events');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error in Blockchain Indexer tick');
    } finally {
      setTimeout(tick, pollInterval);
    }
  };

  tick();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBlockchainIndexer();
}

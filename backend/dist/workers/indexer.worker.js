import { eq } from 'drizzle-orm';
import { db, payments, paymentIntents } from '../db';
import { blockchainService } from '../modules/blockchain/blockchain.service';
import { logger } from '../lib/logger';
export async function runBlockchainIndexer() {
    logger.info('Starting Blockchain Indexer Worker...');
    const pollInterval = 5000; // Poll every 5 seconds
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
                if (!intent)
                    continue;
                // Check Anvil RPC for matching transactions or events
                // Note: In Anvil MVP mode, if transaction is submitted via submit-tx or detected on chain, mark paid
                // Here we simulate block scanning validation
            }
        }
        catch (err) {
            logger.error({ err }, 'Error in Blockchain Indexer tick');
        }
        finally {
            setTimeout(tick, pollInterval);
        }
    };
    tick();
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runBlockchainIndexer();
}

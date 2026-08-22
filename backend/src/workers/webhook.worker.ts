import { eq, and, lte } from 'drizzle-orm';
import { db, webhookDeliveries } from '../db';
import { webhookService } from '../modules/webhooks/webhook.service';
import { logger } from '../lib/logger';

export async function runWebhookWorker() {
  logger.info('Starting Webhook Delivery Worker...');

  const pollInterval = 3000; // Poll every 3 seconds

  const tick = async () => {
    try {
      const now = new Date();
      const pendingDeliveries = await db
        .select()
        .from(webhookDeliveries)
        .where(
          and(
            eq(webhookDeliveries.status, 'pending'),
            lte(webhookDeliveries.nextRetryAt, now)
          )
        );

      for (const delivery of pendingDeliveries) {
        logger.info({ deliveryId: delivery.id, event: delivery.eventType }, 'Delivering webhook payload');
        await webhookService.deliverWebhook(delivery.id);
      }
    } catch (err) {
      logger.error({ err }, 'Error in Webhook Worker tick');
    } finally {
      setTimeout(tick, pollInterval);
    }
  };

  tick();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runWebhookWorker();
}

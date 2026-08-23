import crypto from 'node:crypto';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db, webhookEndpoints, webhookDeliveries } from '../../db';
import { signWebhookPayload } from '../../lib/crypto';
import { logger } from '../../lib/logger';
import { NotFoundError } from '../../lib/errors';
export class WebhookService {
    async registerEndpoint(merchantId, url) {
        const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
        const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
        const [endpoint] = await db
            .insert(webhookEndpoints)
            .values({
            merchantId,
            url,
            secret,
            secretHash,
            isActive: true,
        })
            .returning();
        return {
            ...endpoint,
            secret, // Return plain secret key once upon registration
        };
    }
    async listEndpoints(merchantId) {
        return db
            .select({
            id: webhookEndpoints.id,
            url: webhookEndpoints.url,
            isActive: webhookEndpoints.isActive,
            createdAt: webhookEndpoints.createdAt,
        })
            .from(webhookEndpoints)
            .where(eq(webhookEndpoints.merchantId, merchantId));
    }
    async deleteEndpoint(merchantId, endpointId) {
        await db
            .delete(webhookDeliveries)
            .where(eq(webhookDeliveries.webhookEndpointId, endpointId));
        const [deleted] = await db
            .delete(webhookEndpoints)
            .where(and(eq(webhookEndpoints.id, endpointId), eq(webhookEndpoints.merchantId, merchantId)))
            .returning();
        if (!deleted) {
            throw new NotFoundError('Webhook endpoint not found');
        }
        return deleted;
    }
    async enqueueWebhookDelivery(merchantId, paymentRecord, eventType) {
        const endpoints = await db
            .select()
            .from(webhookEndpoints)
            .where(and(eq(webhookEndpoints.merchantId, merchantId), eq(webhookEndpoints.isActive, true)));
        const payload = {
            event: eventType,
            data: {
                paymentId: paymentRecord.paymentId,
                orderId: paymentRecord.orderId,
                amount: paymentRecord.amount,
                currency: paymentRecord.currency,
                status: paymentRecord.status,
                paidAt: paymentRecord.paidAt,
                metadata: paymentRecord.metadata,
            },
            createdAt: new Date().toISOString(),
        };
        // Enqueue for registered webhook endpoints
        for (const endpoint of endpoints) {
            await db.insert(webhookDeliveries).values({
                webhookEndpointId: endpoint.id,
                paymentId: paymentRecord.id,
                eventType,
                payload,
                status: 'pending',
                attemptCount: 0,
                nextRetryAt: new Date(),
            });
        }
        // Also support ad-hoc payment webhookUrl passed during POST /v1/payments
        if (paymentRecord.webhookUrl && endpoints.length === 0) {
            logger.info({ paymentId: paymentRecord.paymentId, url: paymentRecord.webhookUrl }, 'Enqueuing ad-hoc payment webhookUrl');
            await this.sendAdHocWebhook(paymentRecord.webhookUrl, payload);
        }
    }
    async sendAdHocWebhook(url, payload) {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }
        catch (err) {
            logger.warn({ err, url }, 'Failed to deliver ad-hoc webhook');
        }
    }
    async deliverWebhook(deliveryId) {
        const [delivery] = await db
            .select()
            .from(webhookDeliveries)
            .where(eq(webhookDeliveries.id, deliveryId))
            .limit(1);
        if (!delivery)
            return;
        const [endpoint] = await db
            .select()
            .from(webhookEndpoints)
            .where(eq(webhookEndpoints.id, delivery.webhookEndpointId))
            .limit(1);
        if (!endpoint || !endpoint.url)
            return;
        const signature = endpoint.secret
            ? signWebhookPayload(delivery.payload, endpoint.secret)
            : '';
        const attemptCount = (delivery.attemptCount || 0) + 1;
        try {
            const response = await fetch(endpoint.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-ApePay-Signature': signature,
                    'User-Agent': 'ApePay-Webhook-Worker/1.0',
                },
                body: JSON.stringify(delivery.payload),
            });
            if (response.ok) {
                await db
                    .update(webhookDeliveries)
                    .set({
                    status: 'delivered',
                    attemptCount,
                    lastResponseCode: response.status,
                    deliveredAt: new Date(),
                })
                    .where(eq(webhookDeliveries.id, deliveryId));
            }
            else {
                await this.handleDeliveryFailure(deliveryId, attemptCount, response.status, `HTTP ${response.statusText}`);
            }
        }
        catch (err) {
            await this.handleDeliveryFailure(deliveryId, attemptCount, 500, err?.message || 'Network failure');
        }
    }
    async handleDeliveryFailure(deliveryId, attemptCount, responseCode, errorMessage) {
        const maxAttempts = 5;
        const isFailed = attemptCount >= maxAttempts;
        // Exponential backoff: 10s, 30s, 2m, 10m
        const backoffSeconds = [10, 30, 120, 600][attemptCount - 1] || 600;
        const nextRetryAt = isFailed ? null : new Date(Date.now() + backoffSeconds * 1000);
        await db
            .update(webhookDeliveries)
            .set({
            status: isFailed ? 'failed' : 'pending',
            attemptCount,
            nextRetryAt,
            lastResponseCode: responseCode,
            lastError: errorMessage,
        })
            .where(eq(webhookDeliveries.id, deliveryId));
    }
    async getDelivery(merchantId, deliveryId) {
        const endpoints = await this.listEndpoints(merchantId);
        const endpointIds = endpoints.map((e) => e.id);
        if (endpointIds.length === 0)
            return null;
        const [delivery] = await db
            .select()
            .from(webhookDeliveries)
            .where(and(eq(webhookDeliveries.id, deliveryId), inArray(webhookDeliveries.webhookEndpointId, endpointIds)))
            .limit(1);
        return delivery || null;
    }
    async listDeliveries(merchantId) {
        const endpoints = await this.listEndpoints(merchantId);
        const endpointIds = endpoints.map((e) => e.id);
        if (endpointIds.length === 0)
            return [];
        return db
            .select()
            .from(webhookDeliveries)
            .where(inArray(webhookDeliveries.webhookEndpointId, endpointIds))
            .orderBy(desc(webhookDeliveries.createdAt))
            .limit(50);
    }
}
export const webhookService = new WebhookService();

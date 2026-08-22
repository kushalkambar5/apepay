import { eq, and, desc } from 'drizzle-orm';
import { db, payments, paymentIntents, paymentEvents, merchants } from '../../db';
import { generatePaymentId } from '../../lib/crypto';
import { zkbobService } from '../zkbob/zkbob.service';
import { webhookService } from '../webhooks/webhook.service';
import { env } from '../../config/env';
import { NotFoundError, BadRequestError, ConflictError } from '../../lib/errors';
import { logger } from '../../lib/logger';

export interface CreatePaymentParams {
  merchantId: string;
  amount: string;
  currency?: string;
  orderId?: string;
  webhookUrl?: string;
  redirectUrl?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

export class PaymentService {
  async createPayment(params: CreatePaymentParams) {
    const { merchantId, amount, currency = 'ETH', orderId, webhookUrl, redirectUrl, idempotencyKey, metadata } = params;

    if (!amount || parseFloat(amount) <= 0) {
      throw new BadRequestError('Amount must be greater than 0');
    }

    // Check idempotency key if provided
    if (idempotencyKey) {
      const [existingPayment] = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.merchantId, merchantId),
            eq(payments.idempotencyKey, idempotencyKey)
          )
        )
        .limit(1);

      if (existingPayment) {
        logger.info({ paymentId: existingPayment.paymentId, idempotencyKey }, 'Returning existing idempotent payment');
        return existingPayment;
      }
    }

    const publicPaymentId = generatePaymentId();
    const checkoutUrl = `${env.FRONTEND_URI}/p/${publicPaymentId}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Atomic DB transaction
    return await db.transaction(async (tx) => {
      // 1. Insert payment record
      const [payment] = await tx
        .insert(payments)
        .values({
          paymentId: publicPaymentId,
          merchantId,
          orderId: orderId || null,
          amount: amount.toString(),
          currency: currency.toUpperCase(),
          network: 'anvil',
          status: 'pending',
          checkoutUrl,
          redirectUrl: redirectUrl || null,
          webhookUrl: webhookUrl || null,
          idempotencyKey: idempotencyKey || null,
          metadata: metadata || null,
          expiresAt,
        })
        .returning();

      // 2. Generate zkBob payment intent
      const intentData = await zkbobService.generateIntent({
        paymentId: publicPaymentId,
        amount: amount.toString(),
        currency: currency.toUpperCase(),
        network: 'anvil',
      });

      // 3. Insert payment intent record
      const [intent] = await tx
        .insert(paymentIntents)
        .values({
          paymentId: payment.id,
          protocol: intentData.protocol,
          protocolVersion: intentData.protocolVersion,
          asset: intentData.asset,
          network: intentData.network,
          expectedAmount: intentData.expectedAmount,
          paymentIdentifier: intentData.paymentIdentifier,
          commitment: intentData.commitment,
          recipientIdentifier: intentData.recipientIdentifier,
          expiresAt,
        })
        .returning();

      // 4. Create payment event
      await tx.insert(paymentEvents).values({
        paymentId: payment.id,
        eventType: 'payment.created',
        oldStatus: null,
        newStatus: 'pending',
        source: 'api',
        metadata: { orderId, amount, currency },
      });

      return {
        ...payment,
        intent,
      };
    });
  }

  async getPaymentByPublicId(publicPaymentId: string, merchantId?: string) {
    const conditions = [eq(payments.paymentId, publicPaymentId)];
    if (merchantId) {
      conditions.push(eq(payments.merchantId, merchantId));
    }

    const [payment] = await db
      .select()
      .from(payments)
      .where(and(...conditions))
      .limit(1);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const [intent] = await db
      .select()
      .from(paymentIntents)
      .where(eq(paymentIntents.paymentId, payment.id))
      .limit(1);

    return {
      ...payment,
      intent,
    };
  }

  async getPaymentWithTimeline(publicPaymentId: string, merchantId: string) {
    const paymentData = await this.getPaymentByPublicId(publicPaymentId, merchantId);

    const events = await db
      .select()
      .from(paymentEvents)
      .where(eq(paymentEvents.paymentId, paymentData.id))
      .orderBy(desc(paymentEvents.createdAt));

    return {
      ...paymentData,
      events,
    };
  }

  async getCheckoutSession(publicPaymentId: string) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, publicPaymentId))
      .limit(1);

    if (!payment) {
      throw new NotFoundError('Checkout session not found');
    }

    const [merchant] = await db
      .select({
        businessName: merchants.businessName,
        website: merchants.website,
      })
      .from(merchants)
      .where(eq(merchants.id, payment.merchantId!))
      .limit(1);

    const [intent] = await db
      .select({
        protocol: paymentIntents.protocol,
        protocolVersion: paymentIntents.protocolVersion,
        asset: paymentIntents.asset,
        network: paymentIntents.network,
        expectedAmount: paymentIntents.expectedAmount,
        paymentIdentifier: paymentIntents.paymentIdentifier,
        commitment: paymentIntents.commitment,
        recipientIdentifier: paymentIntents.recipientIdentifier,
      })
      .from(paymentIntents)
      .where(eq(paymentIntents.paymentId, payment.id))
      .limit(1);

    // Return safe customer fields only (no merchant API keys, internal UUIDs, or sensitive DB keys)
    return {
      paymentId: payment.paymentId,
      merchant: {
        name: merchant?.businessName || 'ApePay Merchant',
        website: merchant?.website || null,
      },
      amount: payment.amount,
      currency: payment.currency,
      network: payment.network,
      status: payment.status,
      redirectUrl: payment.redirectUrl,
      expiresAt: payment.expiresAt,
      paidAt: payment.paidAt,
      intent,
    };
  }

  async markAsPaid(publicPaymentId: string, txHash?: string) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.paymentId, publicPaymentId))
      .limit(1);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === 'paid') {
      return payment; // Already paid
    }

    const oldStatus = payment.status;
    const now = new Date();

    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: 'paid',
        paidAt: now,
        updatedAt: now,
      })
      .where(eq(payments.id, payment.id))
      .returning();

    // Create payment event
    await db.insert(paymentEvents).values({
      paymentId: payment.id,
      eventType: 'payment.paid',
      oldStatus,
      newStatus: 'paid',
      source: 'blockchain_indexer',
      metadata: { txHash, paidAt: now },
    });

    // Queue webhook delivery if endpoint exists or payment has webhookUrl
    await webhookService.enqueueWebhookDelivery(payment.merchantId!, updatedPayment, 'payment.paid');

    return updatedPayment;
  }

  async cancelPayment(publicPaymentId: string, merchantId: string) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.paymentId, publicPaymentId), eq(payments.merchantId, merchantId)))
      .limit(1);

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === 'paid') {
      throw new ConflictError('Cannot cancel a completed payment');
    }

    const oldStatus = payment.status;
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id))
      .returning();

    await db.insert(paymentEvents).values({
      paymentId: payment.id,
      eventType: 'payment.cancelled',
      oldStatus,
      newStatus: 'cancelled',
      source: 'api',
    });

    return updatedPayment;
  }

  async listMerchantPayments(merchantId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.merchantId, merchantId))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const paymentService = new PaymentService();

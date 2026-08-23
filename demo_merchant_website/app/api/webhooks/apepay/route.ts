import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export interface WebhookRecord {
  id: string;
  receivedAt: string;
  event: string;
  paymentId: string;
  orderId?: string;
  amount?: string;
  currency?: string;
  status?: string;
  signature?: string;
  signatureVerified?: boolean;
  payload: any;
}

// In-memory webhook log storage for demo inspection
declare global {
  var _apepayWebhookLogs: WebhookRecord[] | undefined;
}

if (!global._apepayWebhookLogs) {
  global._apepayWebhookLogs = [];
}

/**
 * Verify HMAC-SHA256 signature from ApePay against secret
 */
function verifyHmacSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = `sha256=${hmac.digest('hex')}`;

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-apepay-signature') || request.headers.get('x-signature') || '';
    const secret = process.env.APEPAY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || 'whsec_52953e169b8eef4914e06b1d819afef4f256deead48f0883';

    let signatureVerified = false;
    if (signature && secret) {
      signatureVerified = verifyHmacSignature(rawBody, signature, secret);
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    const logEntry: WebhookRecord = {
      id: `wh_log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      receivedAt: new Date().toISOString(),
      event: payload.event || payload.eventType || 'payment.updated',
      paymentId: payload.paymentId || payload.data?.paymentId || 'pay_unknown',
      orderId: payload.orderId || payload.data?.orderId,
      amount: payload.amount || payload.data?.amount,
      currency: payload.currency || payload.data?.currency || 'ETH',
      status: payload.status || payload.data?.status,
      signature,
      signatureVerified,
      payload,
    };

    global._apepayWebhookLogs?.unshift(logEntry);
    
    // Keep max 50 recent logs
    if (global._apepayWebhookLogs && global._apepayWebhookLogs.length > 50) {
      global._apepayWebhookLogs = global._apepayWebhookLogs.slice(0, 50);
    }

    console.log('[Demo Webhook Receiver] Payment event received:', logEntry.event, logEntry.paymentId, 'HMAC Verified:', signatureVerified);

    return NextResponse.json({
      success: true,
      message: 'Webhook received successfully by ApeCommerce Store',
      signatureVerified,
      logId: logEntry.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process webhook' },
      { status: 400 }
    );
  }
}


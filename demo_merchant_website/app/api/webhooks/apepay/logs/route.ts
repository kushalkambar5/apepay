import { NextResponse } from 'next/server';
import { WebhookRecord } from '../route';

declare global {
  var _apepayWebhookLogs: WebhookRecord[] | undefined;
}

export async function GET() {
  const logs = global._apepayWebhookLogs || [];
  return NextResponse.json({
    count: logs.length,
    logs,
  });
}

export async function DELETE() {
  global._apepayWebhookLogs = [];
  return NextResponse.json({ success: true, message: 'Webhook logs cleared' });
}

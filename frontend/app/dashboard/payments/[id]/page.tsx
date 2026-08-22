'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/dashboard/Header';
import { paymentsApi } from '@/lib/api/payments';
import { Payment } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PaymentTimeline } from '@/components/dashboard/PaymentTimeline';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { ArrowLeft, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);

  useEffect(() => {
    async function loadPayment() {
      try {
        const data = await paymentsApi.getPayment(paymentId);
        setPayment(data);
      } catch (err: any) {
        setError(err?.message || 'Payment not found');
      } finally {
        setLoading(false);
      }
    }
    loadPayment();
  }, [paymentId]);

  const handleCopyId = () => {
    if (payment?.paymentId) {
      navigator.clipboard.writeText(payment.paymentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <Header title="Payment Details" />

      <div className="px-8 space-y-6">
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center text-xs font-mono text-[#888888] hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          <span>Back to payments</span>
        </Link>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#888888]">
            Loading payment details...
          </div>
        ) : error || !payment ? (
          <Card className="p-8 text-center text-xs text-[#ee0000]">
            {error || 'Payment not found'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Info Panel */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold font-mono text-[#171717]">
                        {payment.paymentId}
                      </h2>
                      <button
                        onClick={handleCopyId}
                        className="text-[#888888] hover:text-[#171717] transition-colors p-1"
                      >
                        {copiedId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-[#888888]">
                      Order Ref: <span className="font-mono text-[#171717]">{payment.orderId || '—'}</span>
                    </p>
                  </div>

                  <Badge status={payment.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Amount</span>
                    <p className="font-bold text-base text-[#171717]">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Network</span>
                    <p className="font-semibold text-[#171717]">
                      {payment.network || 'Anvil'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Privacy Protocol</span>
                    <p className="font-semibold text-[#0070f3] flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>zkBob v1.0</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Created At</span>
                    <p className="text-[#4d4d4d]">{formatDate(payment.createdAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Paid At</span>
                    <p className="text-[#4d4d4d]">{formatDate(payment.paidAt)}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[#888888] uppercase tracking-wider text-[10px]">Expires At</span>
                    <p className="text-[#4d4d4d]">{formatDate(payment.expiresAt)}</p>
                  </div>
                </div>

                {/* Public Checkout Link Action */}
                <div className="border-t border-[#ebebeb] pt-4 flex items-center justify-between">
                  <span className="text-xs text-[#888888]">Customer Checkout URL:</span>
                  <a
                    href={payment.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#0070f3] hover:underline"
                  >
                    <span>{payment.checkoutUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>

              {/* Privacy Model Notice */}
              <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 text-xs text-[#4d4d4d] space-y-1">
                <p className="font-semibold text-[#171717]">🔒 Zero-Knowledge Privacy Model</p>
                <p>
                  Customer wallet addresses, IP addresses, and private notes are omitted by design to enforce strict customer payment privacy.
                </p>
              </div>
            </div>

            {/* Right Timeline Panel */}
            <div>
              <Card className="p-6">
                <PaymentTimeline
                  status={payment.status}
                  createdAt={payment.createdAt}
                  paidAt={payment.paidAt}
                  events={payment.events}
                />
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

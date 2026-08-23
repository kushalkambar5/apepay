'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApePayPaymentStatus, PaymentResponse } from '../../lib/apepay-client';
import { CheckCircle2, ShieldCheck, ArrowLeft, RefreshCw, Copy, ExternalLink, PackageCheck, AlertCircle } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-DEMO-9982';
  const paymentId = searchParams.get('paymentId');

  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadStatus = async () => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchApePayPaymentStatus(paymentId);
    setPaymentData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, [paymentId]);

  const handleCopyPaymentId = () => {
    if (paymentId) {
      navigator.clipboard.writeText(paymentId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Success Card */}
      <div className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-modal">
        {/* Header */}
        <div className="bg-[#171717] px-6 py-8 text-center text-white relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 font-mono-tech border border-emerald-500/30 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>PAYMENT CONFIRMED VIA APEPAY</span>
          </span>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white">
            Thank you for your order!
          </h1>
          <p className="mt-2 text-xs text-[#888888]">
            Order reference: <span className="font-mono-tech text-white font-semibold">{orderId}</span>
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Alert Banner */}
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center space-x-3">
              <PackageCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-900">Order Processing Initiated</h4>
                <p className="text-[11px] text-emerald-700">
                  ApePay has recorded your zero-knowledge commitment payment on the EVM blockchain.
                </p>
              </div>
            </div>

            <button
              onClick={loadStatus}
              title="Refresh status"
              className="rounded-full border border-emerald-200 bg-white p-1.5 text-emerald-700 hover:bg-emerald-100"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Payment Receipt Breakdown Table */}
          <div className="rounded-xl border border-[#ebebeb] bg-[#fafafa] p-5 space-y-3 font-mono-tech text-xs">
            <h3 className="font-sans text-xs font-semibold text-[#171717] uppercase tracking-wider mb-3">
              Transaction Details
            </h3>

            <div className="flex justify-between border-b border-[#ebebeb] pb-2">
              <span className="text-[#888888]">Order ID:</span>
              <span className="text-[#171717] font-bold">{orderId}</span>
            </div>

            {paymentId && (
              <div className="flex justify-between border-b border-[#ebebeb] pb-2 items-center">
                <span className="text-[#888888]">Payment ID:</span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#171717] font-semibold">{paymentId}</span>
                  <button
                    onClick={handleCopyPaymentId}
                    className="text-[#888888] hover:text-[#171717]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between border-b border-[#ebebeb] pb-2">
              <span className="text-[#888888]">Payment Status:</span>
              <span className="inline-flex items-center space-x-1 font-bold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{paymentData?.status || 'PAID / CONFIRMED'}</span>
              </span>
            </div>

            <div className="flex justify-between border-b border-[#ebebeb] pb-2">
              <span className="text-[#888888]">Currency / Asset:</span>
              <span className="text-[#171717]">{paymentData?.currency || 'ETH (zkBob Pool)'}</span>
            </div>

            <div className="flex justify-between border-b border-[#ebebeb] pb-2">
              <span className="text-[#888888]">Amount Paid:</span>
              <span className="text-[#171717] font-bold">{paymentData?.amount || '0.045'} ETH</span>
            </div>

            <div className="flex justify-between pt-1 text-[11px]">
              <span className="text-[#888888]">Privacy Shield Protocol:</span>
              <span className="text-[#0070f3]">zkBob Commitment Protocol v1</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <a
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full border border-[#ebebeb] bg-white px-6 py-2.5 text-xs font-medium text-[#171717] shadow-sm hover:bg-[#fafafa]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Storefront</span>
            </a>

            <a
              href="http://localhost:3000/dashboard/payments"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full bg-[#171717] px-6 py-2.5 text-xs font-medium text-white shadow-sm hover:bg-[#333333]"
            >
              <span>Inspect in ApePay Dashboard</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-xs font-mono-tech text-[#888888]">
        Loading order receipt...
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

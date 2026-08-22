'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';

interface PaymentSuccessProps {
  amount: string;
  currency: string;
  orderId?: string | null;
  redirectUrl?: string | null;
}

export function PaymentSuccess({ amount, currency, orderId, redirectUrl }: PaymentSuccessProps) {
  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  return (
    <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0070f3]/10 text-[#0070f3]">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-tight text-[#171717]">
          Payment Successful
        </h3>
        <p className="text-3xl font-mono font-bold text-[#171717]">
          {formatCurrency(amount, currency)}
        </p>
        <p className="text-xs text-[#888888]">
          Your private payment has been confirmed on the blockchain.
        </p>
      </div>

      {orderId && (
        <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-3 text-xs font-mono">
          <span className="text-[#888888]">Order ID: </span>
          <span className="font-semibold text-[#171717]">{orderId}</span>
        </div>
      )}

      {redirectUrl ? (
        <div className="space-y-2">
          <Button
            onClick={() => (window.location.href = redirectUrl)}
            className="w-full"
            variant="primary"
          >
            <span>Return to merchant</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-[11px] text-[#888888]">
            Auto-redirecting in 4 seconds...
          </p>
        </div>
      ) : (
        <Button
          onClick={() => window.close()}
          className="w-full"
          variant="outline"
        >
          Close Page
        </Button>
      )}
    </div>
  );
}

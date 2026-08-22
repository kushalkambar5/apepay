'use client';

import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentPendingProps {
  onCheckStatus: () => void;
  isChecking: boolean;
}

export function PaymentPending({ onCheckStatus, isChecking }: PaymentPendingProps) {
  return (
    <div className="text-center space-y-6 py-4 animate-in fade-in duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5a623]/10 text-[#ab570a]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-[#171717]">
          Payment Submitted
        </h3>
        <p className="text-xs text-[#888888] max-w-xs mx-auto leading-relaxed">
          We&apos;re waiting for the payment to be verified on-chain. This page will update automatically.
        </p>
      </div>

      <div className="pt-2">
        <Button
          onClick={onCheckStatus}
          isLoading={isChecking}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Check status</span>
        </Button>
      </div>
    </div>
  );
}

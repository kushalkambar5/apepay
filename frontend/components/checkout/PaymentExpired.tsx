'use client';

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaymentExpiredProps {
  redirectUrl?: string | null;
}

export function PaymentExpired({ redirectUrl }: PaymentExpiredProps) {
  return (
    <div className="text-center space-y-6 py-4 animate-in fade-in duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ee0000]/10 text-[#ee0000]">
        <Clock className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-[#171717]">
          Payment Expired
        </h3>
        <p className="text-xs text-[#888888] max-w-xs mx-auto leading-relaxed">
          This payment request is no longer valid. Please return to the merchant and create a new payment session.
        </p>
      </div>

      {redirectUrl && (
        <Button
          onClick={() => (window.location.href = redirectUrl)}
          className="w-full"
          variant="outline"
        >
          <span>Return to merchant</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Lock } from 'lucide-react';

export function PrivacyInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 text-xs transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-medium text-[#171717] hover:text-[#0070f3] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-[#0070f3]" />
          <span>How is my payment private?</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#888888] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2 border-t border-[#ebebeb] pt-3 text-[#4d4d4d] leading-relaxed animate-in fade-in duration-200">
          <p>
            ApePay uses <strong>zkBob</strong> to process this payment through a privacy-preserving pool.
          </p>
          <p>
            The merchant receives cryptographic confirmation of your payment, but your public wallet address is <strong>never provided</strong> to the merchant as part of the order.
          </p>
          <p className="text-[11px] text-[#888888] italic">
            Public blockchain data may still contain protocol-level transaction information.
          </p>
        </div>
      )}
    </div>
  );
}

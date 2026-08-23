'use client';

import React from 'react';
import { ShieldCheck, ArrowRight, Lock, Zap } from 'lucide-react';

interface HeroProps {
  onBrowseClick: () => void;
  onOpenSettings: () => void;
}

export function Hero({ onBrowseClick, onOpenSettings }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#ebebeb] bg-[#fafafa] pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Multi-color mesh gradient backdrop */}
      <div className="absolute inset-0 mesh-gradient-bg opacity-70 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow Mono Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#ebebeb] bg-white/80 px-3.5 py-1 text-xs font-medium text-[#171717] shadow-sm backdrop-blur-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-[#0070f3]" />
            <span className="font-mono-tech uppercase tracking-wider text-[11px]">
              APEPAY PRIVACY DEMO STORE
            </span>
          </div>

          {/* Headline (Sentence-case, period-terminated, negative tracking) */}
          <h1 className="text-4xl font-semibold tracking-display-hero text-[#171717] sm:text-5xl md:text-6xl leading-[1.08]">
            Privacy-first hardware & cypherpunk developer gear.
          </h1>

          {/* Lead Paragraph */}
          <p className="mt-6 text-lg text-[#4d4d4d] leading-relaxed max-w-2xl mx-auto">
            Explore premium hardware keycards, zero-knowledge signers, and privacy apparel.
            Every checkout is powered by <span className="font-semibold text-[#171717]">ApePay</span> with zero-knowledge commitment protocols.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBrowseClick}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full bg-[#171717] px-7 py-3 text-base font-medium text-white shadow-stacked-md hover:bg-[#333333] transition-all"
            >
              <span>Explore Gear</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full border border-[#ebebeb] bg-white px-7 py-3 text-base font-medium text-[#171717] shadow-stacked-sm hover:bg-[#fafafa] transition-all"
            >
              <Lock className="h-4 w-4 text-[#0070f3]" />
              <span>Configure ApePay API</span>
            </button>
          </div>

          {/* Feature Badges Strip */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left border-t border-[#ebebeb]/80 pt-8 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-[#0070f3] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#171717]">zkBob Privacy Protocol</h4>
                <p className="text-xs text-[#888888]">Breaks linkability between payer & merchant payout address</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-[#f5a623] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#171717]">Instant Webhook Delivery</h4>
                <p className="text-xs text-[#888888]">HMAC SHA-256 signed events dispatched on payment</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-[#7928ca] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-[#171717]">Idempotent Checkout</h4>
                <p className="text-xs text-[#888888]">Strict merchant order mapping & session protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

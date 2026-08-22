'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Shield } from 'lucide-react';

export default function PublicDocsPage() {
  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col justify-between">
      <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#171717]">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717] text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span>ApePay Public Docs</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Create Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 border-b border-[#ebebeb] pb-6">
          <h1 className="text-3xl font-extrabold text-[#171717]">ApePay REST API Reference</h1>
          <p className="text-sm text-[#888888]">Integrate private Ethereum payments in your web applications</p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#171717]">Authentication</h2>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              All API requests to <code>/v1/payments</code> require a Bearer token header containing your API key:
            </p>
            <div className="rounded-lg bg-[#171717] p-3 text-white font-mono text-xs">
              Authorization: Bearer ape_test_xxxxxxxxxxxxx
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#171717]">1. Create Payment Session</h2>
            <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 font-mono text-xs space-y-2">
              <span className="font-bold text-[#0070f3]">POST /v1/payments</span>
              <pre>{`{
  "amount": "0.1",
  "currency": "ETH",
  "orderId": "ORDER-123",
  "redirectUrl": "https://yourstore.com/order/ORDER-123/success"
}`}</pre>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#171717]">2. Customer Checkout</h2>
            <p className="text-xs text-[#4d4d4d]">
              Redirect your customer to the returned <code>checkoutUrl</code> (e.g. <code>http://localhost:3000/p/pay_abc123</code>). The customer connects MetaMask and pays privately via zkBob without revealing their wallet address to your backend.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#ebebeb] py-8 text-center font-mono text-xs text-[#888888]">
        <p>© 2026 ApePay Protocol</p>
      </footer>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, Wallet, Terminal, CheckCircle2, ArrowRight, Layers, Cpu, Code2 } from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#171717]">
            <Image
              src="/logo.png"
              alt="ApePay Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-contain"
            />
            <span>ApePay</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4d4d4d]">
            <Link href="/#how-it-works" className="hover:text-[#171717] transition-colors">
              How it Works
            </Link>
            <Link href="/#why-apepay" className="hover:text-[#171717] transition-colors">
              Why ApePay
            </Link>
            <Link href="/pricing" className="hover:text-[#171717] transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-[#171717] transition-colors">
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Start accepting payments
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#171717] leading-[1.1]">
          Private crypto payments <br className="hidden sm:inline" />
          for your business.
        </h1>

        <p className="text-lg text-[#4d4d4d] max-w-2xl mx-auto leading-relaxed">
          Accept Ethereum payments without exposing your customer&apos;s public wallet address or on-chain identity to the merchant.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/register">
            <Button size="lg" className="h-12 px-8 text-base">
              <span>Start accepting payments</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              <span>View documentation</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#fafafa] border-y border-[#ebebeb] px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-[#171717]">How it works</h2>
            <p className="text-sm text-[#888888]">End-to-end zero-knowledge payment flow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <Card className="p-5 text-center space-y-2 bg-white">
              <span className="font-mono text-xs text-[#0070f3] font-bold">01</span>
              <h4 className="text-sm font-bold text-[#171717]">Customer</h4>
              <p className="text-xs text-[#888888]">Opens checkout URL</p>
            </Card>

            <div className="hidden md:flex justify-center text-[#ebebeb]">
              <ArrowRight className="h-5 w-5 text-[#888888]" />
            </div>

            <Card className="p-5 text-center space-y-2 bg-white">
              <span className="font-mono text-xs text-[#0070f3] font-bold">02</span>
              <h4 className="text-sm font-bold text-[#171717]">Connect Wallet</h4>
              <p className="text-xs text-[#888888]">MetaMask checkout</p>
            </Card>

            <div className="hidden md:flex justify-center text-[#ebebeb]">
              <ArrowRight className="h-5 w-5 text-[#888888]" />
            </div>

            <Card className="p-5 text-center space-y-2 bg-white border-[#0070f3]/30">
              <span className="font-mono text-xs text-[#0070f3] font-bold">03</span>
              <h4 className="text-sm font-bold text-[#171717]">zkBob Pool</h4>
              <p className="text-xs text-[#888888]">Merchant receives confirmation</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why ApePay Section */}
      <section id="why-apepay" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-[#171717]">Why ApePay?</h2>
          <p className="text-sm text-[#888888]">Built for modern Web3 merchants &amp; privacy-conscious buyers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <CheckCircle2 className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">No customer account</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Customers never need to sign up or create an ApePay account to complete checkout.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Wallet className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">MetaMask checkout</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Seamless 1-click payment flow with native Web3 browser wallet integration.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Lock className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">Privacy-preserving</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Zero customer wallet metadata shared with merchants or stored in database logs.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Terminal className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">REST API</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Clean API endpoints for backend payment session creation and status polling.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Code2 className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">Webhooks</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Cryptographically signed HTTP POST notifications dispatched upon payment confirmation.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Cpu className="h-6 w-6 text-[#0070f3]" />
            <h3 className="text-base font-bold text-[#171717]">Developer SDK</h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Simple JavaScript &amp; Python integrations for Node.js, Next.js, and serverless environments.
            </p>
          </Card>
        </div>
      </section>

      {/* Developer Preview Section */}
      <section className="py-20 bg-[#171717] text-white px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="font-mono text-xs text-[#0070f3] uppercase tracking-wider font-semibold">
              Developer API
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Create a payment in 3 lines of code</h2>
          </div>

          <div className="rounded-xl border border-white/10 bg-black p-6 font-mono text-xs space-y-4 text-emerald-400 overflow-x-auto">
            <p className="text-gray-400">// POST /v1/payments</p>
            <pre className="text-white">
{`const response = await fetch("http://localhost:4000/v1/payments", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ape_test_xxxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ amount: "0.1", currency: "ETH", orderId: "ORDER-123" })
});`}
            </pre>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#171717]">
          Ready to accept private payments?
        </h2>
        <p className="text-sm text-[#888888]">
          Set up your merchant gateway in under 2 minutes.
        </p>
        <Link href="/register">
          <Button size="lg" className="h-12 px-8 text-base">
            Create merchant account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ebebeb] py-8 px-6 text-center font-mono text-xs text-[#888888]">
        <p>© 2026 ApePay Protocol. Built for private Ethereum commerce.</p>
      </footer>
    </div>
  );
}

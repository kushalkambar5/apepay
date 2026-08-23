'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col justify-between">
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

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Start accepting payments</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="py-20 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#171717]">Transparent Pricing</h1>
          <p className="text-sm text-[#888888]">No hidden protocol markups. Zero monthly fees for local demo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#0070f3] uppercase font-bold">Local Demo</span>
              <h2 className="text-3xl font-bold text-[#171717]">0%</h2>
              <p className="text-xs text-[#888888]">Free for local Anvil development &amp; testing</p>
            </div>

            <ul className="space-y-3 text-xs text-[#4d4d4d]">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Unlimited API key generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Local Anvil RPC integration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>zkBob proof generation engine</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Webhook delivery log history</span>
              </li>
            </ul>

            <Link href="/register" className="block">
              <Button className="w-full">Create Free Account</Button>
            </Link>
          </Card>

          <Card className="p-8 space-y-6 border-[#171717]">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#0070f3] uppercase font-bold">Mainnet Production</span>
              <h2 className="text-3xl font-bold text-[#171717]">0.5%</h2>
              <p className="text-xs text-[#888888]">Per transaction protocol verification fee</p>
            </div>

            <ul className="space-y-3 text-xs text-[#4d4d4d]">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>All Local Demo features</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Ethereum Mainnet &amp; Arbitrum support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>99.9% Indexer SLA guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Dedicated webhook retry queues</span>
              </li>
            </ul>

            <Link href="/register" className="block">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </Card>
        </div>
      </main>

      <footer className="border-t border-[#ebebeb] py-8 text-center font-mono text-xs text-[#888888]">
        <p>© 2026 ApePay Protocol</p>
      </footer>
    </div>
  );
}

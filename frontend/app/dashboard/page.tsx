'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { paymentsApi } from '@/lib/api/payments';
import { merchantApi } from '@/lib/api/merchant';
import { Payment, MerchantWallet } from '@/types';
import { Header } from '@/components/dashboard/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PaymentTable } from '@/components/dashboard/PaymentTable';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatAddress } from '@/lib/formatters';
import { CreditCard, Wallet, ArrowRight, CheckCircle2, Shield, Plus, Key } from 'lucide-react';

export default function DashboardOverviewPage() {
  const { merchant, user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallets, setWallets] = useState<MerchantWallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [paymentsRes, walletsRes] = await Promise.all([
          paymentsApi.listPayments().catch(() => ({ payments: [] })),
          merchantApi.getWallets().catch(() => ({ wallets: [] })),
        ]);
        setPayments(paymentsRes.payments || []);
        setWallets(walletsRes.wallets || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    if (merchant) {
      loadDashboardData();
    }
  }, [merchant]);

  // Compute stats
  const totalPayments = payments.length;
  const paidPayments = payments.filter((p) => p.status === 'paid').length;
  const pendingPayments = payments.filter(
    (p) => p.status === 'pending' || p.status === 'processing' || p.status === 'created'
  ).length;

  const payoutWallet = wallets.find((w) => w.walletType === 'payout') || wallets[0];

  return (
    <div className="space-y-8 pb-12">
      <Header title="Overview" />

      <div className="px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex items-center justify-between rounded-xl border border-[#ebebeb] bg-white p-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-[#171717]">
              Good morning, {user?.name || merchant?.businessName || 'Merchant'}
            </h2>
            <p className="text-xs text-[#888888]">
              Your private Ethereum payment gateway is active on Anvil local environment.
            </p>
          </div>
          <Link href="/dashboard/docs">
            <Button variant="outline" size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Create Payment via API</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Payments"
            value={totalPayments}
            description="Lifetime payment sessions created"
            icon={CreditCard}
          />
          <StatsCard
            title="Paid Payments"
            value={paidPayments}
            description="Verified on-chain via zkBob"
            icon={CheckCircle2}
            highlight
          />
          <StatsCard
            title="Pending Payments"
            value={pendingPayments}
            description="Awaiting customer completion"
            icon={Wallet}
          />
        </div>

        {/* Connected Payout Wallet Card */}
        <Card className="flex items-center justify-between p-5 bg-[#fafafa]/60">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#171717] text-white">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#888888]">
                  Payout Wallet
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>
              <p className="font-mono text-sm font-semibold text-[#171717]">
                {payoutWallet ? formatAddress(payoutWallet.address) : 'No wallet connected'}
              </p>
            </div>
          </div>

          <Link href="/dashboard/wallet">
            <Button variant="outline" size="sm">
              Manage Wallet
            </Button>
          </Link>
        </Card>

        {/* Recent Payments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight text-[#171717]">
              Recent Payments
            </h3>
            <Link
              href="/dashboard/payments"
              className="inline-flex items-center gap-1 text-xs font-mono font-medium text-[#0070f3] hover:underline"
            >
              <span>View all payments</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <PaymentTable payments={payments} limit={5} />
        </div>
      </div>
    </div>
  );
}

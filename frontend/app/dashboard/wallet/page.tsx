'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { isAddress } from 'viem';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { merchantApi } from '@/lib/api/merchant';
import { MerchantWallet } from '@/types';
import { useWallet } from '@/hooks/use-wallet';
import { formatAddress } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Wallet, ArrowUpRight, Shield, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

export default function WalletPage() {
  const [wallets, setWallets] = useState<MerchantWallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [poolBalance, setPoolBalance] = useState<string>('0.000000');
  const [poolBalanceLoading, setPoolBalanceLoading] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [withdrawResult, setWithdrawResult] = useState<{ txHash: string; amountEth: string } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const { account, connect } = useWallet();

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await merchantApi.getWallets();
      setWallets(res.wallets || []);
    } catch (err) {
      console.error('Failed to fetch merchant wallets', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoolBalance = useCallback(async () => {
    setPoolBalanceLoading(true);
    try {
      const res = await merchantApi.getPoolBalance();
      setPoolBalance(res.balanceEth);
      setWithdrawAmount(res.balanceEth);
    } catch (err) {
      console.error('Failed to fetch pool balance', err);
      setPoolBalance('0.000000');
    } finally {
      setPoolBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets();
    fetchPoolBalance();
  }, [fetchPoolBalance]);

  const activeWallet = wallets[0];
  const displayAddress = activeWallet?.address || account.address;

  const handleCopy = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);
    setWithdrawResult(null);
    setWithdrawLoading(true);

    const amount = parseFloat(withdrawAmount);
    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid amount greater than 0.');
      setWithdrawLoading(false);
      return;
    }
    if (amount > parseFloat(poolBalance)) {
      setWithdrawError('Withdrawal amount exceeds the pool balance.');
      setWithdrawLoading(false);
      return;
    }

    try {
      const result = await merchantApi.withdraw(withdrawAmount);
      setWithdrawResult({ txHash: result.txHash, amountEth: result.amountEth });
      // Refresh pool balance after successful withdrawal
      await fetchPoolBalance();
    } catch (err: any) {
      setWithdrawError(err?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const poolBalanceNum = parseFloat(poolBalance);
  const hasBalance = poolBalanceNum > 0;

  return (
    <div className="space-y-8 pb-12">
      <Header title="Payout Wallet" />

      <div className="px-8 space-y-6 max-w-4xl">
        {/* Wallet Status Card */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#171717] text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#171717]">Payout Wallet</h3>
                <p className="text-xs text-[#888888]">Receives settled zkBob pool balances</p>
              </div>
            </div>

            {displayAddress ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-600 border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#888888]/10 px-3 py-1 text-xs font-mono text-[#888888] border border-[#ebebeb]">
                Disconnected
              </span>
            )}
          </div>

          {displayAddress ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#888888] uppercase tracking-wider text-[10px]">Address</span>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#171717]">{formatAddress(displayAddress)}</p>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 p-1 text-[#888888] hover:text-[#171717] hover:bg-[#ebebeb]/50 rounded transition-colors"
                    title={copied ? 'Copied!' : 'Copy full address'}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[#888888] uppercase tracking-wider text-[10px]">Network</span>
                <p className="font-semibold text-[#171717]">Anvil (Chain 31337)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#888888] uppercase tracking-wider text-[10px]">Asset</span>
                <p className="font-semibold text-[#171717]">ETH</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-[#888888]">No payout wallet configured for this merchant</p>
              <Button onClick={connect} variant="outline" size="sm">
                Connect MetaMask
              </Button>
            </div>
          )}
        </Card>

        {/* zkBob Pool Balance & Withdrawal Section */}
        <Card className="p-6 space-y-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle>zkBob Pool Balance</CardTitle>
              <CardDescription>
                Accumulated payments held in the PoolVault contract — ready to withdraw
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPoolBalance}
              disabled={poolBalanceLoading}
              className="h-8 w-8 p-0 text-[#888888] hover:text-[#171717]"
              title="Refresh pool balance"
            >
              <RefreshCw className={cn('h-4 w-4', poolBalanceLoading && 'animate-spin')} />
            </Button>
          </CardHeader>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight font-mono text-[#171717]">
              {poolBalanceLoading ? (
                <span className="text-2xl text-[#888888]">Fetching...</span>
              ) : (
                poolBalance
              )}
            </span>
            <span className="text-lg font-mono font-semibold text-[#888888]">ETH</span>
          </div>

          {/* zkBob Info Banner */}
          <div className="rounded-lg border border-[#0070f3]/20 bg-[#0070f3]/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#0070f3]">
              <Shield className="h-4 w-4" />
              <span>Zero-Knowledge Privacy Pool</span>
            </div>
            <p className="text-[#4d4d4d] leading-relaxed">
              Payments flow into the <strong>PoolVault</strong> contract on Anvil. The pool operator (your{' '}
              <code className="bg-[#0070f3]/10 px-1 rounded">PRIVATE_KEY</code>) signs withdrawals and sends
              ETH directly to your payout wallet via an on-chain transaction.
            </p>
          </div>

          {/* Success result */}
          {withdrawResult && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
              <p className="font-semibold text-emerald-700">Withdrawal Successful!</p>
              <p className="text-emerald-600">Amount: <strong>{withdrawResult.amountEth} ETH</strong></p>
              <div className="flex items-center gap-1 text-emerald-600 font-mono">
                <span>Tx: {withdrawResult.txHash.slice(0, 20)}...</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Error result */}
          {withdrawError && (
            <div className="rounded-lg border border-[#ee0000]/20 bg-[#ee0000]/5 p-3 text-xs text-[#ee0000]">
              {withdrawError}
            </div>
          )}

          {/* Withdraw Amount Input + Button */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  max={poolBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.000000"
                  disabled={withdrawLoading || !hasBalance}
                  className="w-full h-10 px-3 pr-12 font-mono text-sm border border-[#ebebeb] rounded-lg bg-white text-[#171717] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#888888]">
                  ETH
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawAmount(poolBalance)}
                disabled={!hasBalance || withdrawLoading}
                className="text-xs h-10 px-3"
              >
                Max
              </Button>
            </div>

            <Button
              onClick={handleWithdraw}
              isLoading={withdrawLoading}
              disabled={withdrawLoading || !hasBalance || !displayAddress}
              className="w-full"
              variant="primary"
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              {!displayAddress
                ? 'Configure payout wallet first'
                : !hasBalance
                  ? 'No balance to withdraw'
                  : 'Withdraw via zkBob Pool'}
            </Button>

            {!displayAddress && (
              <p className="text-[10px] text-[#888888] text-center">
                Add a payout wallet in Settings → Wallet to enable withdrawals.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
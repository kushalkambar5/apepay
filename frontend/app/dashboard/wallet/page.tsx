'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPublicClient, http, formatEther, isAddress } from 'viem';
import { foundry } from 'viem/chains';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { merchantApi } from '@/lib/api/merchant';
import { MerchantWallet } from '@/types';
import { useWallet } from '@/hooks/use-wallet';
import { formatAddress } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { Wallet, ArrowUpRight, Lock, RefreshCw, Copy, Check } from 'lucide-react';

export default function WalletPage() {
  const [wallets, setWallets] = useState<MerchantWallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('0.0000');
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
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

  useEffect(() => {
    fetchWallets();
  }, []);

  const activeWallet = wallets[0];
  const displayAddress = activeWallet?.address || account.address;

  const handleCopy = () => {
    if (displayAddress) {
      navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchAnvilBalance = useCallback(async (addr: string) => {
    if (!addr || !isAddress(addr)) return;
    setBalanceLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: foundry,
        transport: http('http://127.0.0.1:8545'),
      });
      const balanceWei = await publicClient.getBalance({ address: addr as `0x${string}` });
      const formattedEth = formatEther(balanceWei);
      const numEth = parseFloat(formattedEth);
      setBalance(numEth.toFixed(4));
    } catch (err) {
      if (account.balanceEth) {
        setBalance(account.balanceEth);
      } else {
        setBalance('0.0000');
      }
    } finally {
      setBalanceLoading(false);
    }
  }, [account.balanceEth]);

  useEffect(() => {
    if (displayAddress) {
      fetchAnvilBalance(displayAddress);
    }
  }, [displayAddress, fetchAnvilBalance]);

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
                <p className="text-xs text-[#888888]">Receives settled zkBob balances</p>
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

        {/* Private Balance & Withdrawal Section */}
        <Card className="p-6 space-y-6">
          <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Private Balance</CardTitle>
              <CardDescription>
                Accumulated settled payments in zkBob pool & wallet balance on Anvil
              </CardDescription>
            </div>
            {displayAddress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchAnvilBalance(displayAddress)}
                disabled={balanceLoading}
                className="h-8 w-8 p-0 text-[#888888] hover:text-[#171717]"
                title="Refresh balance from Anvil"
              >
                <RefreshCw className={cn("h-4 w-4", balanceLoading && "animate-spin")} />
              </Button>
            )}
          </CardHeader>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight font-mono text-[#171717]">
              {balanceLoading ? (
                <span className="text-2xl text-[#888888]">Fetching...</span>
              ) : (
                balance
              )}
            </span>
            <span className="text-lg font-mono font-semibold text-[#888888]">ETH</span>
          </div>

          <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#171717]">
              <Lock className="h-4 w-4 text-[#0070f3]" />
              <span>Withdrawal Notice</span>
            </div>
            <p className="text-[#888888] leading-relaxed">
              Withdrawal functionality is coming soon in this local demo. Once enabled, settled funds can be withdrawn directly into your connected payout wallet via zero-knowledge proof exit transactions.
            </p>
          </div>

          <Button disabled variant="secondary" className="w-full">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            <span>Withdraw (Coming Soon in Demo)</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}

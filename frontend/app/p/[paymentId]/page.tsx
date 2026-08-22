'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { checkoutApi } from '@/lib/api/checkout';
import { CheckoutSession, CheckoutState } from '@/types';
import { useWallet } from '@/hooks/use-wallet';
import { privatePaymentService } from '@/lib/zkbob/payment';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatAddress } from '@/lib/formatters';
import { PrivacyInfo } from '@/components/checkout/PrivacyInfo';
import { PaymentProgress } from '@/components/checkout/PaymentProgress';
import { PaymentSuccess } from '@/components/checkout/PaymentSuccess';
import { PaymentPending } from '@/components/checkout/PaymentPending';
import { PaymentExpired } from '@/components/checkout/PaymentExpired';
import { Shield, Wallet, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';

export default function HostedCheckoutPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.paymentId;

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<CheckoutState>('idle');
  const [isPollerActive, setIsPollerActive] = useState<boolean>(false);

  const { account, connect, switchNetwork, isWrongNetwork } = useWallet();

  // Load checkout session from API
  const fetchSession = useCallback(async () => {
    try {
      const data = await checkoutApi.getSession(paymentId);
      setSession(data);

      if (data.status === 'paid') {
        setState('success');
      } else if (data.status === 'expired' || data.status === 'cancelled') {
        setState('expired');
      } else if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        setState('expired');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Polling mechanism when payment is pending verification
  useEffect(() => {
    if (!isPollerActive || state === 'success' || state === 'expired') return;

    const interval = setInterval(async () => {
      try {
        const data = await checkoutApi.getSession(paymentId);
        if (data.status === 'paid') {
          setSession(data);
          setState('success');
          setIsPollerActive(false);
        }
      } catch {
        // Ignore background poll errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPollerActive, paymentId, state]);

  // Handle wallet state sync
  useEffect(() => {
    if (state === 'success' || state === 'expired' || state === 'submitting' || state === 'verifying') {
      return;
    }

    if (isWrongNetwork) {
      setState('wrong_network');
    } else if (account.address) {
      // Check sufficient balance
      if (session && parseFloat(account.balanceEth) < parseFloat(session.amount)) {
        setState('insufficient_balance');
      } else {
        setState('wallet_connected');
      }
    }
  }, [account, isWrongNetwork, session, state]);

  const handlePayPrivately = async () => {
    if (!session || !account.address) return;

    try {
      setError(null);
      setState('preparing_payment');

      // 1. Generate zkBob proof & prompt MetaMask signature
      setState('awaiting_wallet');
      const result = await privatePaymentService.pay({
        paymentId: session.paymentId,
        amount: session.amount,
        currency: session.currency,
        recipientIdentifier: session.intent?.recipientIdentifier || '',
        commitment: session.intent?.commitment || '',
        senderAddress: account.address,
      });

      // 2. Submit transaction to backend verification endpoint
      setState('submitting');
      await checkoutApi.submitTransaction(session.paymentId, {
        txHash: result.txHash,
        proof: result.proof,
        nullifier: result.nullifier,
      });

      // 3. Enter polling verification state
      setState('verifying');
      setIsPollerActive(true);
    } catch (err: any) {
      setError(err?.message || 'Payment execution failed');
      setState('failed');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#171717] mx-auto" />
          <p className="text-sm font-mono text-[#888888]">Loading payment...</p>
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4">
        <Card className="max-w-md w-full text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-[#ee0000] mx-auto" />
          <h2 className="text-lg font-bold text-[#171717]">Payment Not Found</h2>
          <p className="text-xs text-[#888888]">{error}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-between py-12 px-4">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ebebeb] bg-white text-xs font-mono text-[#4d4d4d] shadow-2xs">
          <Shield className="h-3.5 w-3.5 text-[#0070f3]" />
          <span>Secured by ApePay</span>
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="w-full max-w-md mx-auto my-6">
        <Card className="shadow-lg p-6 space-y-6 bg-white border-[#ebebeb]">
          {/* Merchant & Amount Info */}
          <div className="text-center space-y-2 border-b border-[#ebebeb] pb-6">
            <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">
              {session?.merchant.name}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#171717]">
                {session?.amount}
              </span>
              <span className="text-lg font-mono font-medium text-[#888888]">
                {session?.currency}
              </span>
            </div>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0070f3]/10 text-[#0070f3] text-[11px] font-mono font-medium">
                Privacy protected by zkBob
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="rounded-lg bg-[#ee0000]/10 border border-[#ee0000]/20 p-3 text-xs text-[#ee0000] space-y-1">
              <p className="font-semibold">Payment Action Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Render state-specific screen */}
          {state === 'success' ? (
            <PaymentSuccess
              amount={session?.amount || '0'}
              currency={session?.currency || 'ETH'}
              orderId={session?.redirectUrl ? 'ORDER-CONFIRMED' : null}
              redirectUrl={session?.redirectUrl}
            />
          ) : state === 'expired' ? (
            <PaymentExpired redirectUrl={session?.redirectUrl} />
          ) : state === 'verifying' || state === 'submitting' ? (
            <div className="space-y-6">
              <PaymentProgress currentState={state} />
              <PaymentPending
                onCheckStatus={fetchSession}
                isChecking={loading}
              />
            </div>
          ) : state === 'wrong_network' ? (
            <div className="text-center space-y-4 py-2">
              <div className="rounded-lg bg-[#f5a623]/10 border border-[#f5a623]/20 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-[#ab570a] font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Wrong Network</span>
                </div>
                <p className="text-xs text-[#4d4d4d]">
                  This payment requires <strong>Anvil (Chain ID 31337)</strong>. Your wallet is currently connected to another network.
                </p>
              </div>
              <Button onClick={switchNetwork} className="w-full">
                Switch to Anvil
              </Button>
            </div>
          ) : state === 'insufficient_balance' ? (
            <div className="text-center space-y-4 py-2">
              <div className="rounded-lg bg-[#ee0000]/10 border border-[#ee0000]/20 p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-[#ee0000] font-semibold text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Insufficient Balance</span>
                </div>
                <p className="text-xs text-[#4d4d4d]">
                  You need <strong>{formatCurrency(session?.amount, session?.currency)}</strong>, but your wallet only has <strong>{account.balanceEth} ETH</strong> available.
                </p>
              </div>
            </div>
          ) : !account.address ? (
            /* DISCONNECTED state */
            <div className="space-y-4 text-center">
              <Button
                onClick={connect}
                className="w-full h-12 text-base font-semibold"
                variant="primary"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
              <p className="text-[11px] text-[#888888]">
                No ApePay account required
              </p>
            </div>
          ) : (
            /* WALLET CONNECTED & READY TO PAY */
            <div className="space-y-6">
              <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-3 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-[#888888]">
                  <span>Connected Wallet</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Ready
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium text-[#171717]">
                  <span>{formatAddress(account.address)}</span>
                  <span>{account.balanceEth} ETH</span>
                </div>
              </div>

              <Button
                onClick={handlePayPrivately}
                isLoading={state === 'preparing_payment' || state === 'awaiting_wallet'}
                className="w-full h-12 text-base font-semibold"
                variant="primary"
              >
                Pay privately ({session?.amount} {session?.currency})
              </Button>
            </div>
          )}

          {/* Privacy accordion component */}
          <PrivacyInfo />
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] font-mono text-[#888888] space-y-1">
        <p>ApePay Protocol • Zero-Knowledge Private Payments</p>
      </footer>
    </main>
  );
}

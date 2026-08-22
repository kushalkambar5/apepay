'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useWallet } from '@/hooks/use-wallet';
import { merchantApi } from '@/lib/api/merchant';
import { apiKeysApi } from '@/lib/api/api-keys';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatAddress } from '@/lib/formatters';
import { Shield, Wallet, Key, CheckCircle2, ArrowRight, Copy, Check, AlertTriangle } from 'lucide-react';

export default function OnboardingWizardPage() {
  const [step, setStep] = useState<number>(1);
  const [businessName, setBusinessName] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { merchant, refreshMerchant } = useAuth();
  const { account, connect, switchNetwork, isWrongNetwork } = useWallet();
  const router = useRouter();

  // Initialize form from existing merchant profile
  React.useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.businessName || '');
      setWebsite(merchant.website || '');
    }
  }, [merchant]);

  // Handle Step 2: Save business profile
  const handleSaveBusiness = async () => {
    setLoading(true);
    setError(null);
    try {
      await merchantApi.updateProfile({ businessName, website });
      await refreshMerchant();
      setStep(3);
    } catch (err: any) {
      setError(err?.message || 'Failed to update business profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Register payout wallet
  const handleSaveWallet = async () => {
    if (!account.address) {
      setError('Please connect MetaMask payout wallet first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await merchantApi.addWallet({
        address: account.address,
        network: 'anvil',
        walletType: 'payout',
      });
      setStep(4);
    } catch (err: any) {
      setError(err?.message || 'Failed to save payout wallet');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 5: Generate test API key
  const handleGenerateApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const keyRecord = await apiKeysApi.createKey({
        name: 'Default Test Key',
        environment: 'test',
      });
      setGeneratedApiKey(keyRecord.key || keyRecord.keyPrefix || 'ape_test_key_generated');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    if (generatedApiKey) {
      navigator.clipboard.writeText(generatedApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-bold text-xl text-[#171717]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span>ApePay Onboarding</span>
          </div>
          <p className="text-xs font-mono text-[#888888]">Step {step} of 5</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#ebebeb] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#171717] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <Card className="p-8 shadow-sm space-y-6">
          {error && (
            <div className="rounded-md bg-[#ee0000]/10 border border-[#ee0000]/20 p-3 text-xs text-[#ee0000]">
              {error}
            </div>
          )}

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#171717] text-white">
                <Shield className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-[#171717]">
                  Welcome to ApePay
                </h2>
                <p className="text-sm text-[#888888] max-w-md mx-auto">
                  Let&apos;s get your private Ethereum payment gateway configured in under 2 minutes.
                </p>
              </div>
              <Button onClick={() => setStep(2)} className="w-full h-11 text-base">
                <span>Get started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: BUSINESS */}
          {step === 2 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Business information</CardTitle>
                <CardDescription>
                  Tell us about the storefront accepting payments.
                </CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="Business Name"
                  placeholder="Kush T-Shirt Store"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <Input
                  label="Website URL"
                  placeholder="https://kushstore.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <Button onClick={handleSaveBusiness} isLoading={loading} className="w-full">
                  <span>Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: WALLET */}
          {step === 3 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Connect payout wallet</CardTitle>
                <CardDescription>
                  ApePay needs a payout wallet to receive your settled private balances.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                {isWrongNetwork ? (
                  <div className="rounded-lg border border-[#f5a623]/20 bg-[#f5a623]/10 p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#ab570a] font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Wrong Network</span>
                    </div>
                    <p className="text-[#4d4d4d]">
                      Please switch your MetaMask network to <strong>Anvil (Chain ID 31337)</strong>.
                    </p>
                    <Button onClick={switchNetwork} size="sm" variant="primary">
                      Switch Network
                    </Button>
                  </div>
                ) : account.address ? (
                  <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Payout wallet state</span>
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Address</span>
                      <span className="font-semibold text-[#171717]">{formatAddress(account.address)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#888888]">Network</span>
                      <span className="font-semibold text-[#171717]">Anvil</span>
                    </div>
                  </div>
                ) : (
                  <Button onClick={connect} variant="outline" className="w-full h-12">
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect MetaMask
                  </Button>
                )}

                <Button
                  onClick={handleSaveWallet}
                  disabled={!account.address || isWrongNetwork}
                  isLoading={loading}
                  className="w-full"
                >
                  <span>Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT CONFIGURATION */}
          {step === 4 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Payment configuration</CardTitle>
                <CardDescription>
                  Review the active network and privacy protocol engine.
                </CardDescription>
              </CardHeader>

              <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#888888]">Target Blockchain</span>
                  <span className="font-semibold text-[#171717]">Anvil (Chain 31337)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#888888]">Default Asset</span>
                  <span className="font-semibold text-[#171717]">ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#888888]">Privacy Protocol Engine</span>
                  <span className="font-semibold text-[#0070f3]">zkBob v1.0</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setStep(5);
                  handleGenerateApiKey();
                }}
                className="w-full"
              >
                <span>Continue</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP 5: API KEY */}
          {step === 5 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Your API Key</CardTitle>
                <CardDescription>
                  Copy this key now. For security, ApePay will not display it again.
                </CardDescription>
              </CardHeader>

              {generatedApiKey && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#171717] p-3 text-white font-mono text-xs">
                    <Key className="h-4 w-4 text-[#0070f3] shrink-0" />
                    <span className="flex-1 truncate">{generatedApiKey}</span>
                    <button
                      onClick={handleCopyKey}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                    >
                      {copiedKey ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#ee0000]">
                    ⚠ Store this API key securely. It authorizes payment creation requests.
                  </p>
                </div>
              )}

              <Button onClick={handleFinish} className="w-full">
                <span>Finish setup & Go to Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

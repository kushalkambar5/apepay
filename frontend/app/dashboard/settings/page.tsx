'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { merchantApi } from '@/lib/api/merchant';
import { Check, Save } from 'lucide-react';

export default function SettingsPage() {
  const { merchant, refreshMerchant } = useAuth();
  const [businessName, setBusinessName] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (merchant) {
      setBusinessName(merchant.businessName || '');
      setWebsite(merchant.website || '');
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await merchantApi.updateProfile({ businessName, website });
      await refreshMerchant();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update merchant settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <Header title="Settings" />

      <div className="px-8 space-y-6 max-w-2xl">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Merchant Profile</CardTitle>
            <CardDescription>
              Update your business details shown to customers during hosted checkout.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-[#ee0000]/10 border border-[#ee0000]/20 p-3 text-xs text-[#ee0000]">
                  {error}
                </div>
              )}

              <Input
                label="Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <Input
                label="Storefront Website URL"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://kushstore.com"
              />

              <div className="pt-2">
                <Button type="submit" isLoading={loading} variant="primary">
                  {saved ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

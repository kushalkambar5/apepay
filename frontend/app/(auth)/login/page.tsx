'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-[#171717]">
            <Image
              src="/logo.png"
              alt="ApePay Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span>ApePay</span>
          </Link>
          <p className="text-xs font-mono text-[#888888]">
            Merchant Gateway Sign In
          </p>
        </div>

        <Card className="p-8 shadow-sm">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your merchant dashboard.
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
                label="Email address"
                type="email"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-right">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-mono text-[#0070f3] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full"
                variant="primary"
              >
                <span>Sign in</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#888888]">
          Don&apos;t have a merchant account?{' '}
          <Link href="/register" className="font-semibold text-[#171717] hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}

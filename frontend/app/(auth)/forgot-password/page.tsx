'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
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
        </div>

        <Card className="p-8 shadow-sm">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="h-10 w-10 text-[#0070f3] mx-auto" />
              <h3 className="text-lg font-bold text-[#171717]">Reset link sent</h3>
              <p className="text-xs text-[#888888]">
                If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
              </p>
              <Link href="/login" className="inline-block w-full">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <CardHeader className="px-0 pt-0">
                <CardTitle>Reset your password</CardTitle>
                <CardDescription>
                  Enter your merchant account email to receive reset instructions.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="name@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button type="submit" isLoading={loading} className="w-full">
                    Send Reset Link
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center text-xs font-mono text-[#888888] hover:text-[#171717]">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

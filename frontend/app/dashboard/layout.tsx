'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { merchant, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboarding = pathname === '/dashboard/onboarding';

  useEffect(() => {
    if (!loading && !merchant) {
      router.push('/login');
    }
  }, [loading, merchant, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#171717] mx-auto" />
          <p className="text-xs font-mono text-[#888888]">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!merchant) return null;

  // Onboarding wizard renders full screen without sidebar
  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

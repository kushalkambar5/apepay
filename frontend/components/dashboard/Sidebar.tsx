'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Key,
  Webhook,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { formatAddress } from '@/lib/formatters';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
];

const developerNavItems: NavItem[] = [
  { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { label: 'Documentation', href: '/dashboard/docs', icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { merchant, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex w-64 flex-col border-r border-[#ebebeb] bg-white h-screen sticky top-0">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#ebebeb] px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-[#171717]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#171717] text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span>ApePay</span>
        </Link>
        <span className="rounded-full bg-[#fafafa] border border-[#ebebeb] px-2 py-0.5 text-[10px] font-mono text-[#888888]">
          ANVIL
        </span>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div>
          <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#171717] text-white'
                      : 'text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-2">
            Developers
          </p>
          <nav className="space-y-1">
            {developerNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#171717] text-white'
                      : 'text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-2 text-[10px] font-mono uppercase tracking-wider text-[#888888] mb-2">
            Account
          </p>
          <nav className="space-y-1">
            <Link
              href="/dashboard/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive('/dashboard/settings')
                  ? 'bg-[#171717] text-white'
                  : 'text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]'
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Merchant Account Info */}
      <div className="border-t border-[#ebebeb] p-4 space-y-3 bg-[#fafafa]/50">
        {merchant && (
          <div className="rounded-lg border border-[#ebebeb] bg-white p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#171717] truncate max-w-[130px]">
                {merchant.businessName}
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] font-mono text-[#888888]">
              {merchant.status === 'active' ? 'Gateway Ready' : 'Setup Incomplete'}
            </p>
          </div>
        )}

        <button
          onClick={logout}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-[#ee0000] hover:bg-[#ee0000]/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

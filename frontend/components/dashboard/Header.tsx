'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Terminal, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Header({ title }: { title: string }) {
  const { merchant } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#ebebeb] bg-white px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-[#171717]">{title}</h1>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#fafafa] px-3 py-1 text-[#4d4d4d]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Anvil (31337)</span>
        </div>

        <Link
          href="/dashboard/docs"
          className="flex items-center gap-1 text-[#4d4d4d] hover:text-[#171717] transition-colors"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>API Docs</span>
        </Link>
      </div>
    </header>
  );
}

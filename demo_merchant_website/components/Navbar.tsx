'use client';

import React from 'react';
import { ShoppingBag, Settings, Terminal, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSettings: () => void;
  onOpenWebhookLogs: () => void;
  apiStatus: 'connected' | 'disconnected' | 'testing';
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function Navbar({
  cartCount,
  onOpenCart,
  onOpenSettings,
  onOpenWebhookLogs,
  apiStatus,
  selectedCategory,
  onSelectCategory,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <a href="#" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#171717]">ApeGear</span>
          </a>
          <span className="inline-flex items-center rounded-full bg-[#fafafa] px-2.5 py-0.5 text-xs font-medium text-[#888888] border border-[#ebebeb] font-mono-tech">
            DEMO MERCHANT
          </span>
        </div>

        {/* Category Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {['All', 'Hardware', 'Apparel', 'Accessories', 'Digital Goods'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Actions & Status */}
        <div className="flex items-center space-x-2.5">
          {/* ApePay API Status Pill */}
          <button
            onClick={onOpenSettings}
            title="ApePay Connection Status (Click to configure)"
            className="hidden sm:flex items-center space-x-1.5 rounded-full border border-[#ebebeb] bg-[#fafafa] px-3 py-1 text-xs font-medium text-[#4d4d4d] hover:bg-[#f5f5f5] transition-colors"
          >
            {apiStatus === 'connected' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-mono-tech text-[11px]">ApePay API: Ready</span>
              </>
            ) : apiStatus === 'testing' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono-tech text-[11px]">Checking...</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-mono-tech text-[11px]">ApePay: Demo Mode</span>
              </>
            )}
          </button>

          {/* Webhook Logs Inspector Button */}
          <button
            onClick={onOpenWebhookLogs}
            title="Inspect Live ApePay Webhook Logs"
            className="flex items-center space-x-1.5 rounded-full border border-[#ebebeb] bg-white px-3 py-1 text-xs font-medium text-[#171717] hover:bg-[#fafafa] shadow-sm transition-colors"
          >
            <Terminal className="h-3.5 w-3.5 text-[#0070f3]" />
            <span className="hidden lg:inline font-mono-tech text-[11px]">Webhooks</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Merchant API Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-[#171717] hover:bg-[#fafafa] shadow-sm transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Shopping Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center space-x-2 rounded-full bg-[#171717] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#333333] transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#0070f3] text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

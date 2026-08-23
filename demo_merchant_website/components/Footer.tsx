'use client';

import React from 'react';
import { Shield, ExternalLink, Terminal } from 'lucide-react';

interface FooterProps {
  onOpenSettings: () => void;
  onOpenWebhookLogs: () => void;
}

export function Footer({ onOpenSettings, onOpenWebhookLogs }: FooterProps) {
  return (
    <footer className="border-t border-[#ebebeb] bg-white text-[#4d4d4d] pt-12 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#171717] text-white">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-semibold text-[#171717]">ApeCommerce Store</span>
            </div>
            <p className="mt-3 text-xs text-[#888888] leading-relaxed">
              Official demonstration merchant store showcasing privacy-preserving crypto payments via ApePay.
            </p>
          </div>

          {/* Products Col */}
          <div>
            <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-3">
              Catalog
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#products-catalog" className="hover:text-[#171717] transition-colors">Hardware Keycards</a></li>
              <li><a href="#products-catalog" className="hover:text-[#171717] transition-colors">Zero-Knowledge Signers</a></li>
              <li><a href="#products-catalog" className="hover:text-[#171717] transition-colors">Cypherpunk Apparel</a></li>
              <li><a href="#products-catalog" className="hover:text-[#171717] transition-colors">Digital RPC Node Passes</a></li>
            </ul>
          </div>

          {/* ApePay Protocol Col */}
          <div>
            <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-3">
              ApePay Protocol
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="http://localhost:3000/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 hover:text-[#171717] transition-colors text-[#0070f3]"
                >
                  <span>Merchant Dashboard</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <button onClick={onOpenSettings} className="hover:text-[#171717] transition-colors">
                  API Key Settings
                </button>
              </li>
              <li>
                <button onClick={onOpenWebhookLogs} className="inline-flex items-center space-x-1 hover:text-[#171717] transition-colors">
                  <Terminal className="h-3 w-3 text-[#0070f3]" />
                  <span>Webhook Inspector</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Developers Col */}
          <div>
            <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-3">
              Technology Stack
            </h4>
            <ul className="space-y-2 text-xs text-[#888888] font-mono-tech">
              <li>Next.js 16 App Router</li>
              <li>Tailwind CSS v4 (DESIGN.md)</li>
              <li>ApePay REST API v1</li>
              <li>zkBob Zero-Knowledge Pool</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#ebebeb] pt-8 text-xs text-[#888888]">
          <p>© 2026 ApeCommerce Store. Powered by ApePay Privacy Gateway.</p>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4 font-mono-tech text-[11px]">
            <span>STRICT IDEMPOTENCY ENABLED</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">zkBob SHIELD ACTIVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

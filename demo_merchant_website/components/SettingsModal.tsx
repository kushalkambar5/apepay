'use client';

import React, { useState } from 'react';
import { X, Check, RefreshCw, Server, Key, Link2, Bell } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  backendUrl: string;
  onSaveBackendUrl: (url: string) => void;
  checkoutFrontendUrl: string;
  onSaveCheckoutFrontendUrl: (url: string) => void;
  onTestConnection: () => Promise<boolean>;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  backendUrl,
  onSaveBackendUrl,
  checkoutFrontendUrl,
  onSaveCheckoutFrontendUrl,
  onTestConnection,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [backendInput, setBackendInput] = useState(backendUrl);
  const [checkoutInput, setCheckoutInput] = useState(checkoutFrontendUrl);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    onSaveBackendUrl(backendInput.trim());
    onSaveCheckoutFrontendUrl(checkoutInput.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetDefaults = () => {
    const defaultBackend = 'http://localhost:4000';
    const defaultCheckout = 'http://localhost:3000';
    const defaultKey = 'apk_test_1234567890abcdef12345678';

    setBackendInput(defaultBackend);
    setCheckoutInput(defaultCheckout);
    setKeyInput(defaultKey);

    onSaveBackendUrl(defaultBackend);
    onSaveCheckoutFrontendUrl(defaultCheckout);
    onSaveApiKey(defaultKey);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const success = await onTestConnection();
    setTesting(false);
    if (success) {
      setTestResult('Successfully connected to ApePay Backend!');
    } else {
      setTestResult('Unable to reach ApePay Backend at configured URL.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-[#171717]" />
            <h3 className="text-lg font-semibold text-[#171717]">Developer & API Settings</h3>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#4d4d4d] hover:bg-[#ebebeb] hover:text-[#171717] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Merchant API Key */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-1.5">
              <Key className="h-3.5 w-3.5 text-[#0070f3]" />
              <span>Merchant API Key (x-api-key)</span>
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="apk_test_..."
              className="w-full rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 text-xs font-mono-tech text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-[#888888]">
              Obtained from your ApePay Dashboard (`/dashboard/api-keys`).
            </p>
          </div>

          {/* ApePay Backend API URL */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-1.5">
              <Server className="h-3.5 w-3.5 text-[#0070f3]" />
              <span>ApePay Backend REST API URL</span>
            </label>
            <input
              type="text"
              value={backendInput}
              onChange={(e) => setBackendInput(e.target.value)}
              placeholder="http://localhost:4000"
              className="w-full rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 text-xs font-mono-tech text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
            />
          </div>

          {/* ApePay Hosted Checkout UI URL */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-1.5">
              <Link2 className="h-3.5 w-3.5 text-[#0070f3]" />
              <span>ApePay Checkout Frontend URL</span>
            </label>
            <input
              type="text"
              value={checkoutInput}
              onChange={(e) => setCheckoutInput(e.target.value)}
              placeholder="http://localhost:3000"
              className="w-full rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 text-xs font-mono-tech text-[#171717] focus:border-[#171717] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Store Webhook Endpoint */}
          <div>
            <label className="flex items-center space-x-1.5 text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono-tech mb-1.5">
              <Bell className="h-3.5 w-3.5 text-[#0070f3]" />
              <span>Store Webhook Endpoint (Read-Only)</span>
            </label>
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/apepay` : 'http://localhost:3001/api/webhooks/apepay'}
              className="w-full rounded-lg border border-[#ebebeb] bg-[#f5f5f5] px-3 py-2 text-xs font-mono-tech text-[#888888] cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-[#888888]">
              Register this URL in ApePay Merchant Dashboard (`/dashboard/webhooks`).
            </p>
          </div>

          {/* Test Connection Banner */}
          {testResult && (
            <div className={`p-3 rounded-lg text-xs font-medium border ${testResult.includes('Successfully') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#ebebeb] pt-4">
          <button
            onClick={handleResetDefaults}
            className="w-full sm:w-auto text-xs text-[#888888] hover:text-[#171717] transition-colors"
          >
            Reset Defaults
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 rounded-full border border-[#ebebeb] bg-[#fafafa] px-4 py-2 text-xs font-medium text-[#171717] hover:bg-[#ebebeb]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>Test API</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 rounded-full bg-[#171717] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#333333]"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

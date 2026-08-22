'use client';

import React, { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Terminal, Copy, Check, Code2 } from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'fetch' | 'curl' | 'python'>('fetch');
  const [copied, setCopied] = useState<boolean>(false);

  const fetchCode = `const response = await fetch("http://localhost:4000/v1/payments", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ape_test_xxxxxxxxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    amount: "0.1",
    currency: "ETH",
    orderId: "ORDER-123",
    redirectUrl: "https://kushstore.com/order/ORDER-123/success"
  })
});

const data = await response.json();
console.log(data);`;

  const curlCode = `curl -X POST http://localhost:4000/v1/payments \\
  -H "Authorization: Bearer ape_test_xxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "0.1",
    "currency": "ETH",
    "orderId": "ORDER-123"
  }'`;

  const pythonCode = `import requests

response = requests.post(
    "http://localhost:4000/v1/payments",
    headers={
        "Authorization": "Bearer ape_test_xxxxxxxxx",
        "Content-Type": "application/json"
    },
    json={
        "amount": "0.1",
        "currency": "ETH",
        "orderId": "ORDER-123"
    }
)
print(response.json())`;

  const responseJson = `{
  "paymentId": "pay_a82bc1947e",
  "orderId": "ORDER-123",
  "amount": "0.1",
  "currency": "ETH",
  "status": "pending",
  "checkoutUrl": "http://localhost:3000/p/pay_a82bc1947e",
  "redirectUrl": "https://kushstore.com/order/ORDER-123/success",
  "expiresAt": "2026-08-23T02:38:10.000Z"
}`;

  const currentCode =
    activeTab === 'fetch'
      ? fetchCode
      : activeTab === 'curl'
      ? curlCode
      : pythonCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <Header title="Developer Documentation" />

      <div className="px-8 space-y-8 max-w-5xl">
        {/* Quick Start Guide */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-[#171717]">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 space-y-2">
              <span className="font-mono text-xs text-[#0070f3] font-bold">STEP 01</span>
              <h4 className="text-sm font-semibold text-[#171717]">Create API Key</h4>
              <p className="text-xs text-[#888888]">Issue a test API key in your ApePay dashboard.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="font-mono text-xs text-[#0070f3] font-bold">STEP 02</span>
              <h4 className="text-sm font-semibold text-[#171717]">Create Payment</h4>
              <p className="text-xs text-[#888888]">Make a POST request to create a payment session.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="font-mono text-xs text-[#0070f3] font-bold">STEP 03</span>
              <h4 className="text-sm font-semibold text-[#171717]">Redirect Customer</h4>
              <p className="text-xs text-[#888888]">Redirect customer to the returned hosted checkout URL.</p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="font-mono text-xs text-[#0070f3] font-bold">STEP 04</span>
              <h4 className="text-sm font-semibold text-[#171717]">Listen for Webhook</h4>
              <p className="text-xs text-[#888888]">Receive signed payment.paid event notifications.</p>
            </Card>
          </div>
        </div>

        {/* API Endpoint Details */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-emerald-500/10 px-2 py-1 text-xs font-mono font-bold text-emerald-600 border border-emerald-500/20">
                POST
              </span>
              <span className="font-mono text-sm font-bold text-[#171717]">/v1/payments</span>
            </div>

            <div className="flex items-center gap-2 border-b border-transparent">
              <button
                onClick={() => setActiveTab('fetch')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeTab === 'fetch' ? 'bg-[#171717] text-white' : 'text-[#888888] hover:text-[#171717]'
                }`}
              >
                Fetch JS
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeTab === 'curl' ? 'bg-[#171717] text-white' : 'text-[#888888] hover:text-[#171717]'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                  activeTab === 'python' ? 'bg-[#171717] text-white' : 'text-[#888888] hover:text-[#171717]'
                }`}
              >
                Python
              </button>
            </div>
          </div>

          <div className="relative rounded-lg bg-[#171717] p-4 text-white font-mono text-xs overflow-x-auto">
            <button
              onClick={handleCopy}
              className="absolute right-3 top-3 p-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <pre>{currentCode}</pre>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#888888]">Response JSON</h4>
            <div className="rounded-lg bg-[#fafafa] border border-[#ebebeb] p-4 font-mono text-xs text-[#171717] overflow-x-auto">
              <pre>{responseJson}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

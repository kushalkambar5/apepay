'use client';

import React, { useState, useEffect } from 'react';
import { X, Terminal, RefreshCw, Trash2, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface WebhookLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebhookLogsModal({ isOpen, onClose }: WebhookLogsModalProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/apepay/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    await fetch('/api/webhooks/apepay/logs', { method: 'DELETE' });
    setLogs([]);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[#ebebeb] bg-white p-6 shadow-modal max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#171717]">ApePay Live Webhook Inspector</h3>
              <p className="text-xs text-[#888888]">
                Real-time HTTP POST events received at <code className="font-mono-tech text-[11px] text-[#0070f3]">/api/webhooks/apepay</code>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              title="Refresh logs"
              className="rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#4d4d4d] hover:bg-[#ebebeb]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {logs.length > 0 && (
              <button
                onClick={handleClear}
                title="Clear logs"
                className="rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#888888] hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full border border-[#ebebeb] bg-[#fafafa] p-1.5 text-[#4d4d4d] hover:bg-[#ebebeb]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Logs List Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 font-mono-tech text-xs">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-[#ebebeb] bg-[#fafafa] p-4 space-y-2 shadow-stacked-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ebebeb] pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-full bg-[#171717] px-2.5 py-0.5 text-[10px] font-medium text-white">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>{log.event}</span>
                    </span>
                    <span className="text-[#888888] text-[11px]">{log.paymentId}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-[#888888] text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(log.receivedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {log.signature && (
                  <div className="text-[10px] text-[#4d4d4d]">
                    <span className="text-[#888888]">HMAC Signature: </span>
                    <span className="text-emerald-700 font-mono-tech truncate">{log.signature}</span>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg bg-[#171717] p-3 text-emerald-400 text-[11px]">
                  <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-[#888888] font-sans">
              <ShieldCheck className="mx-auto h-8 w-8 text-[#ebebeb] mb-2" />
              <p className="text-sm font-medium text-[#171717]">No webhook events received yet</p>
              <p className="text-xs text-[#888888] mt-1">
                Perform a checkout with ApePay to trigger live webhook notifications.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ebebeb] pt-3 text-center text-[11px] text-[#888888] font-mono-tech">
          POLLING EVERY 3 SECONDS • MAC SIGNATURE SHA-256 VERIFIED
        </div>
      </div>
    </div>
  );
}

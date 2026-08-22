'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { webhooksApi } from '@/lib/api/webhooks';
import { WebhookDelivery, WebhookEndpoint } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import { Plus, Webhook, RefreshCw, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function WebhooksPage() {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('https://kushstore.com/api/payment/webhook');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [delRes, endRes] = await Promise.all([
        webhooksApi.listDeliveries().catch(() => ({ deliveries: [] })),
        webhooksApi.listEndpoints().catch(() => ({ endpoints: [] })),
      ]);
      setDeliveries(delRes.deliveries || []);
      setEndpoints(endRes.endpoints || []);
    } catch (err) {
      console.error('Failed to fetch webhooks data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await webhooksApi.addEndpoint(url);
      setIsAddOpen(false);
      if (created.secret) {
        setNewSecret(created.secret);
      }
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to add webhook endpoint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (!confirm('Are you sure you want to remove this webhook endpoint?')) return;
    try {
      await webhooksApi.deleteEndpoint(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete endpoint', err);
    }
  };

  const handleRetryDelivery = async (deliveryId: string) => {
    try {
      await webhooksApi.retryDelivery(deliveryId);
      fetchData();
    } catch (err) {
      console.error('Failed to retry webhook', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <Header title="Webhooks" />

      <div className="px-8 space-y-8">
        {/* Endpoint Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#171717]">Webhook Endpoints</h2>
              <p className="text-xs text-[#888888]">
                Receive real-time signed HTTP POST notifications when payments are verified.
              </p>
            </div>
            <Button onClick={() => setIsAddOpen(true)} variant="primary" size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              <span>Add endpoint</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {endpoints.length === 0 ? (
              <Card className="col-span-2 p-6 text-center text-xs text-[#888888]">
                No webhook endpoints added yet. Add an endpoint URL to receive payment events.
              </Card>
            ) : (
              endpoints.map((ep) => (
                <Card key={ep.id} className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-[#171717] truncate max-w-[280px]">
                      {ep.url}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#888888] font-mono border-t border-[#ebebeb] pt-3">
                    <span>Events: payment.paid, payment.failed, payment.expired</span>
                    <button
                      onClick={() => handleDeleteEndpoint(ep.id)}
                      className="text-[#ee0000] hover:text-[#c50000] transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Deliveries Log Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-[#171717]">Recent Deliveries</h3>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HTTP Response</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-[#888888]">
                    No webhook deliveries logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono text-xs font-semibold text-[#171717]">
                      {delivery.eventType}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-mono font-medium ${
                          delivery.status === 'delivered'
                            ? 'text-emerald-600'
                            : 'text-[#ee0000]'
                        }`}
                      >
                        {delivery.status === 'delivered' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        <span>{delivery.status.toUpperCase()}</span>
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[#4d4d4d]">
                      {delivery.lastResponseCode || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-[#888888]">
                      {formatRelativeTime(delivery.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleRetryDelivery(delivery.id)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#0070f3] hover:underline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Endpoint Modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Webhook Endpoint"
          description="Enter the HTTPS URL on your server to receive payment notifications."
        >
          <form onSubmit={handleAddEndpoint} className="space-y-4">
            {error && (
              <div className="rounded-md bg-[#ee0000]/10 border border-[#ee0000]/20 p-3 text-xs text-[#ee0000]">
                {error}
              </div>
            )}

            <Input
              label="Endpoint URL"
              type="url"
              placeholder="https://kushstore.com/api/payment/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />

            <Button type="submit" isLoading={submitting} className="w-full">
              Add Endpoint
            </Button>
          </form>
        </Modal>

        {/* Secret Display Modal */}
        <Modal
          isOpen={!!newSecret}
          onClose={() => setNewSecret(null)}
          title="Webhook Signing Secret"
          description="Use this secret to verify X-ApePay-Signature HMAC headers on your server."
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-[#ebebeb] bg-[#171717] p-3 text-white font-mono text-xs break-all">
              {newSecret}
            </div>
            <Button onClick={() => setNewSecret(null)} className="w-full">
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

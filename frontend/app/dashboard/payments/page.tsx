'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { PaymentTable } from '@/components/dashboard/PaymentTable';
import { paymentsApi } from '@/lib/api/payments';
import { Payment, PaymentStatus } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.listPayments();
      setPayments(res.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.orderId && p.orderId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' || p.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      <Header title="Payments" />

      <div className="px-8 space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#ebebeb] bg-white p-4 shadow-2xs">
          <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#888888]" />
              <Input
                placeholder="Search payment or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 rounded-md border border-[#ebebeb] bg-white px-3 py-1 text-xs text-[#171717] focus:border-[#171717] focus:outline-none"
            >
              <option value="all">All status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <Button onClick={fetchPayments} isLoading={loading} variant="outline" size="sm">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Payments Table */}
        <PaymentTable payments={filteredPayments} />
      </div>
    </div>
  );
}

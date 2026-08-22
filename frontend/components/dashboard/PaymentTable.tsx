'use client';

import React from 'react';
import Link from 'next/link';
import { Payment } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatPaymentId, formatRelativeTime } from '@/lib/formatters';
import { ExternalLink, ArrowRight } from 'lucide-react';

interface PaymentTableProps {
  payments: Payment[];
  limit?: number;
}

export function PaymentTable({ payments, limit }: PaymentTableProps) {
  const displayPayments = limit ? payments.slice(0, limit) : payments;

  if (displayPayments.length === 0) {
    return (
      <div className="rounded-lg border border-[#ebebeb] bg-[#fafafa]/50 p-8 text-center">
        <p className="text-sm font-medium text-[#171717]">No payments recorded yet</p>
        <p className="mt-1 text-xs text-[#888888]">
          Create a payment session via REST API or checkout flow to see transactions here.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payment ID</TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayPayments.map((payment) => (
          <TableRow key={payment.paymentId}>
            <TableCell className="font-mono text-xs font-medium text-[#171717]">
              <Link
                href={`/dashboard/payments/${payment.paymentId}`}
                className="hover:underline flex items-center gap-1.5"
              >
                <span>{payment.paymentId}</span>
              </Link>
            </TableCell>
            <TableCell className="font-mono text-xs text-[#4d4d4d]">
              {payment.orderId || '—'}
            </TableCell>
            <TableCell className="font-mono font-semibold text-[#171717]">
              {formatCurrency(payment.amount, payment.currency)}
            </TableCell>
            <TableCell>
              <Badge status={payment.status} />
            </TableCell>
            <TableCell className="text-xs text-[#888888]">
              {formatRelativeTime(payment.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Link
                href={`/dashboard/payments/${payment.paymentId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#0070f3] hover:text-[#0761d1] transition-colors"
              >
                <span>Details</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

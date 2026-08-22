import React from 'react';
import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types';

export interface BadgeProps {
  children?: React.ReactNode;
  status?: PaymentStatus | string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function Badge({ children, status, variant, className }: BadgeProps) {
  let badgeVariant = variant || 'neutral';
  let label = children;

  if (status) {
    switch (status.toLowerCase()) {
      case 'paid':
        badgeVariant = 'success';
        label = label || 'PAID';
        break;
      case 'pending':
      case 'created':
      case 'processing':
        badgeVariant = 'warning';
        label = label || status.toUpperCase();
        break;
      case 'expired':
      case 'cancelled':
        badgeVariant = 'neutral';
        label = label || status.toUpperCase();
        break;
      case 'failed':
        badgeVariant = 'error';
        label = label || 'FAILED';
        break;
      default:
        badgeVariant = 'neutral';
        label = label || status.toUpperCase();
    }
  }

  const variantStyles = {
    default: 'bg-[#171717] text-white',
    success: 'bg-[#0070f3]/10 text-[#0070f3] border border-[#0070f3]/20',
    warning: 'bg-[#f5a623]/10 text-[#ab570a] border border-[#f5a623]/20',
    error: 'bg-[#ee0000]/10 text-[#ee0000] border border-[#ee0000]/20',
    info: 'bg-[#7928ca]/10 text-[#7928ca] border border-[#7928ca]/20',
    neutral: 'bg-[#fafafa] text-[#888888] border border-[#ebebeb]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide uppercase',
        variantStyles[badgeVariant],
        className
      )}
    >
      {label}
    </span>
  );
}

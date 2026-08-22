import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { PaymentEvent, PaymentStatus } from '@/types';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
}

interface PaymentTimelineProps {
  status: PaymentStatus;
  createdAt: string;
  paidAt?: string | null;
  events?: PaymentEvent[];
}

export function PaymentTimeline({ status, createdAt, paidAt, events = [] }: PaymentTimelineProps) {
  const isPaid = status === 'paid';
  const isPending = status === 'pending' || status === 'created' || status === 'processing';
  const isFailed = status === 'failed' || status === 'expired' || status === 'cancelled';

  // Map events if existing or compute steps based on payment status
  const createdEvent = events.find((e) => e.eventType === 'payment.created');
  const paidEvent = events.find((e) => e.eventType === 'payment.paid');

  const steps: Step[] = [
    {
      id: 'created',
      title: 'Payment Created',
      description: 'API checkout session created by merchant',
      isCompleted: true,
      isCurrent: !isPaid && !isFailed,
      timestamp: createdEvent?.createdAt || createdAt,
    },
    {
      id: 'initiated',
      title: 'Customer Initiated Payment',
      description: 'Customer opened hosted checkout and connected wallet',
      isCompleted: isPaid || status === 'processing',
      isCurrent: status === 'pending',
      timestamp: isPaid ? paidAt || undefined : undefined,
    },
    {
      id: 'detected',
      title: 'Payment Detected',
      description: 'Zero-knowledge transaction broadcasted to Anvil blockchain pool',
      isCompleted: isPaid,
      isCurrent: status === 'processing',
    },
    {
      id: 'verification',
      title: 'Cryptographic Verification',
      description: 'zkBob proof commitment and nullifier validated',
      isCompleted: isPaid,
      isCurrent: false,
    },
    {
      id: 'confirmed',
      title: 'Payment Confirmed',
      description: 'Payment status updated to PAID in PostgreSQL ledger',
      isCompleted: isPaid,
      isCurrent: false,
      timestamp: paidAt || undefined,
    },
    {
      id: 'webhook',
      title: 'Webhook Delivered',
      description: 'Signed payment.paid event dispatched to merchant endpoint',
      isCompleted: isPaid,
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold tracking-tight text-[#171717]">Lifecycle Timeline</h4>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#ebebeb]">
        {steps.map((step, idx) => {
          let nodeClass = 'bg-white border-[#ebebeb] text-[#888888]';
          if (step.isCompleted) {
            nodeClass = 'bg-[#171717] border-[#171717] text-white';
          } else if (step.isCurrent) {
            nodeClass = 'bg-[#0070f3] border-[#0070f3] text-white animate-pulse';
          } else if (isFailed && idx === 1) {
            nodeClass = 'bg-[#ee0000] border-[#ee0000] text-white';
          }

          return (
            <div key={step.id} className="relative flex items-start group">
              <div
                className={cn(
                  'absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold transition-all',
                  nodeClass
                )}
              >
                {step.isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : step.isCurrent ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="space-y-1 pl-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#171717]">{step.title}</span>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-[#888888]">
                      {formatDate(step.timestamp)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#888888]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

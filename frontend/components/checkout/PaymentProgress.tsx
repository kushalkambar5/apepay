import React from 'react';
import { CheckoutState } from '@/types';
import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  state: 'completed' | 'active' | 'pending';
}

interface PaymentProgressProps {
  currentState: CheckoutState;
}

export function PaymentProgress({ currentState }: PaymentProgressProps) {
  const getStepState = (targetStep: string): 'completed' | 'active' | 'pending' => {
    const order = ['preparing', 'proof', 'wallet', 'submitting', 'verifying', 'success'];

    let currentIndex = 0;
    switch (currentState) {
      case 'preparing_payment':
        currentIndex = 0;
        break;
      case 'awaiting_wallet':
        currentIndex = 2;
        break;
      case 'submitting':
        currentIndex = 3;
        break;
      case 'submitted':
      case 'verifying':
        currentIndex = 4;
        break;
      case 'success':
        currentIndex = 5;
        break;
      default:
        currentIndex = 0;
    }

    const stepIndex = order.indexOf(targetStep);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const steps = [
    { id: 'preparing', title: 'Payment prepared' },
    { id: 'proof', title: 'Proof generated' },
    { id: 'wallet', title: 'Waiting for wallet confirmation' },
    { id: 'submitting', title: 'Submitting transaction' },
    { id: 'verifying', title: 'Payment verification' },
  ];

  return (
    <div className="rounded-xl border border-[#ebebeb] bg-[#fafafa]/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#888888]">
          Processing Private Payment
        </h4>
        <span className="flex h-2 w-2 rounded-full bg-[#0070f3] animate-ping" />
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const state = getStepState(step.id);
          return (
            <div key={step.id} className="flex items-center gap-3 text-xs">
              {state === 'completed' && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-white">
                  <Check className="h-2.5 w-2.5" />
                </div>
              )}
              {state === 'active' && (
                <Loader2 className="h-4 w-4 animate-spin text-[#0070f3]" />
              )}
              {state === 'pending' && (
                <Circle className="h-4 w-4 text-[#ebebeb]" />
              )}
              <span
                className={cn(
                  'font-medium',
                  state === 'completed' && 'text-[#171717]',
                  state === 'active' && 'text-[#0070f3]',
                  state === 'pending' && 'text-[#888888]'
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

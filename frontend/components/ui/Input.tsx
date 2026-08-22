import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-medium uppercase tracking-wider text-[#4d4d4d]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#171717] placeholder-[#888888] transition-colors focus:border-[#171717] focus:outline-none focus:ring-1 focus:ring-[#171717] disabled:cursor-not-allowed disabled:bg-[#fafafa] disabled:opacity-60',
            error && 'border-[#ee0000] focus:border-[#ee0000] focus:ring-[#ee0000]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[#ee0000]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#888888]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

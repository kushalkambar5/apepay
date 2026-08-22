import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs rounded-full',
    md: 'h-10 px-4 text-sm rounded-full',
    lg: 'h-12 px-6 text-base rounded-full',
  };

  const variantStyles = {
    primary:
      'bg-[#171717] text-white hover:bg-[#333333] active:bg-[#000000] focus-visible:ring-[#171717]',
    secondary:
      'bg-[#fafafa] text-[#171717] border border-[#ebebeb] hover:bg-[#f5f5f5] hover:border-[#a1a1a1]',
    outline:
      'bg-transparent text-[#171717] border border-[#ebebeb] hover:bg-[#fafafa] hover:border-[#171717]',
    danger:
      'bg-[#ee0000] text-white hover:bg-[#c50000] focus-visible:ring-[#ee0000]',
    ghost:
      'bg-transparent text-[#4d4d4d] hover:bg-[#fafafa] hover:text-[#171717]',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
      {children}
    </button>
  );
}

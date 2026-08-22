import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          'relative w-full max-w-lg rounded-xl border border-[#ebebeb] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200',
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-[#888888] hover:bg-[#fafafa] hover:text-[#171717] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight text-[#171717]">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-[#888888]">{description}</p>
          )}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

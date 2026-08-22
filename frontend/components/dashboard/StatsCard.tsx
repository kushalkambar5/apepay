import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
  highlight?: boolean;
}

export function StatsCard({ title, value, description, icon: Icon, trend, highlight }: StatsCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', highlight && 'border-[#171717]/20 bg-[#fafafa]/50')}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-wider text-[#888888]">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-[#888888]" />}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-3xl font-bold tracking-tight text-[#171717]">{value}</p>
        {trend && <span className="text-xs font-mono text-emerald-600">{trend}</span>}
      </div>
      {description && <p className="mt-2 text-xs text-[#888888]">{description}</p>}
    </Card>
  );
}

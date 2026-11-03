import React from 'react';
import { cn } from '@/utils/cn';

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const normalized = (status || 'CONFIRMED').toUpperCase();

  let style = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  let label = 'CONFIRMED';

  if (normalized.includes('CANCEL')) {
    style = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    label = 'CANCELLED';
  } else if (normalized.includes('RAC') || normalized.includes('WAIT')) {
    style = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    label = normalized;
  } else if (normalized === 'ACTIVE') {
    style = 'bg-rail-blue/10 text-rail-blue border-rail-blue/20 animate-pulse';
    label = 'LIVE JOURNEY';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider',
        style,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

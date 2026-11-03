import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StationAlertBadgeProps {
  isActive: boolean;
  stationCode?: string;
  className?: string;
}

export function StationAlertBadge({ isActive, stationCode, className }: StationAlertBadgeProps) {
  if (!isActive) return null;

  return (
    <div className={cn(
      'inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse-glow',
      className
    )}>
      <Bell className="h-3 w-3 animate-swing" />
      <span>Alert: {stationCode || 'Set'}</span>
    </div>
  );
}

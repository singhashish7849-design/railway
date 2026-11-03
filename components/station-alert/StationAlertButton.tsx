import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StationAlertButtonProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export function StationAlertButton({ onClick, isActive, className }: StationAlertButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex h-9.5 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all border outline-none active:scale-95 shadow-sm',
        isActive
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
          : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850',
        className
      )}
    >
      <Bell className={cn('h-4 w-4', isActive && 'animate-bounce text-emerald-500')} />
      <span>{isActive ? 'Active Alert' : 'Set Station Alert'}</span>
    </button>
  );
}

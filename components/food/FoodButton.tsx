import React from 'react';
import { Utensils } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FoodButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
}

export function FoodButton({ onClick, className, label = 'Order Food' }: FoodButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex h-9.5 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all border outline-none active:scale-95 shadow-sm bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850',
        className
      )}
    >
      <Utensils className="h-4 w-4 text-emerald-500" />
      <span>{label}</span>
    </button>
  );
}

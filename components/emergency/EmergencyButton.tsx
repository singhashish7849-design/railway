import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmergencyButtonProps {
  onClick: () => void;
  className?: string;
}

export function EmergencyButton({ onClick, className }: EmergencyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex h-9.5 items-center justify-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-black text-white px-5 shadow-glow shadow-rose-500/20 border border-rose-500 transition-all hover:scale-102 flex-shrink-0 outline-none select-none',
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 animate-bounce" />
      <span>🚨 Emergency</span>
    </button>
  );
}

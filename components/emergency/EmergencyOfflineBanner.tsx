import React from 'react';
import { WifiOff, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmergencyOfflineBannerProps {
  isCached: boolean;
  className?: string;
}

export function EmergencyOfflineBanner({ isCached, className }: EmergencyOfflineBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-3.5 rounded-2xl border text-xs font-black transition-all select-none',
        isCached
          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="h-4 w-4 flex-shrink-0 animate-pulse" />
        <span className="truncate">
          {isCached
            ? '✓ Emergency information available offline'
            : 'Caching emergency details for offline use...'}
        </span>
      </div>

      {isCached && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-650 text-white flex-shrink-0 text-[10px]">
          <Check className="h-3 w-3 stroke-[3]" />
        </span>
      )}
    </div>
  );
}

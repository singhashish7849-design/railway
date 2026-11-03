'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

export function EmergencyStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black border uppercase tracking-wider',
        isOnline
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-550 dark:text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isOnline ? 'bg-emerald-555 animate-pulse' : 'bg-amber-500'
        )}
      />
      <span>{isOnline ? '🟢 Connected' : '🟡 Offline'}</span>
    </div>
  );
}

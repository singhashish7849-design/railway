import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { EmergencyEvent } from '@/types/emergency';

interface EmergencyLocationCardProps {
  event: EmergencyEvent;
}

export function EmergencyLocationCard({ event }: EmergencyLocationCardProps) {
  const hasLocation = event.latitude !== undefined && event.longitude !== undefined;

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-3.5">
      <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
        <MapPin className="h-4 w-4 text-rose-500 animate-pulse" />
        <span>Current Coordinates</span>
      </div>

      {hasLocation ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-semibold">GPS Position</span>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
              Accuracy: ±{event.accuracy?.toFixed(0)}m
            </span>
          </div>
          <p className="font-mono text-base font-black text-slate-900 dark:text-white leading-none">
            {event.latitude?.toFixed(6)}, {event.longitude?.toFixed(6)}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <Navigation className="h-3 w-3 -rotate-45" />
            <span>Captured at {new Date(event.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      ) : (
        <div className="py-2 space-y-1">
          <p className="text-xs font-black text-rose-500">Location unavailable</p>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            GPS coordinates could not be loaded. Please ensure Location Services are enabled on your device.
          </p>
        </div>
      )}
    </div>
  );
}

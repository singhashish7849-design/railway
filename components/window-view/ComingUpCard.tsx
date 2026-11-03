'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { WindowFeature } from '@/types/windowView';
import { cn } from '@/utils/cn';

interface ComingUpCardProps {
  upcomingFeatures: WindowFeature[];
}

export function ComingUpCard({ upcomingFeatures }: ComingUpCardProps) {
  const [visibleFeature, setVisibleFeature] = useState<WindowFeature | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    // Find closest landmark that is AHEAD and within 2km (2000m)
    const criticalFeature = upcomingFeatures.find(
      (f) => f.direction === 'AHEAD' && f.distanceKm > 0.05 && f.distanceKm <= 2.0
    );

    if (criticalFeature) {
      if (criticalFeature.id !== dismissedId) {
        setVisibleFeature(criticalFeature);
      }
    } else {
      setVisibleFeature(null);
    }
  }, [upcomingFeatures, dismissedId]);

  if (!visibleFeature) return null;

  const handleDismiss = () => {
    setDismissedId(visibleFeature.id);
    setVisibleFeature(null);
  };

  const getEmoji = (type: string) => {
    switch (type) {
      case 'RIVER': return '🌊';
      case 'MOUNTAIN': return '🏔️';
      case 'BRIDGE': return '🌉';
      case 'TUNNEL': return '🚇';
      case 'CITY': return '🏙️';
      case 'ATTRACTION': return '🏛️';
      default: return '✨';
    }
  };

  const distanceText = visibleFeature.distanceKm < 1.0 
    ? `${Math.round(visibleFeature.distanceKm * 1000)} m`
    : `${visibleFeature.distanceKm} km`;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm glass-panel rounded-2xl p-4 border border-emerald-500/30 dark:border-emerald-500/20 shadow-[0_12px_40px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-6 zoom-in-95 duration-500">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
            Coming Up Ahead
          </p>
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 leading-tight flex items-center gap-1.5">
            <span>{getEmoji(visibleFeature.type)}</span>
            <span>{visibleFeature.name}</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Approx. <strong>{distanceText}</strong> ahead
          </p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

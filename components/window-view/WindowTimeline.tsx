'use client';

import React from 'react';
import { WindowFeature } from '@/types/windowView';
import { cn } from '@/utils/cn';

interface WindowTimelineProps {
  upcomingFeatures: WindowFeature[];
  activeFeature: WindowFeature | null;
  onFeatureSelect: (feature: WindowFeature) => void;
}

export function WindowTimeline({
  upcomingFeatures,
  activeFeature,
  onFeatureSelect,
}: WindowTimelineProps) {
  const getEmoji = (type: string) => {
    switch (type) {
      case 'RIVER': return '🌊';
      case 'MOUNTAIN': return '🏔️';
      case 'BRIDGE': return '🌉';
      case 'TUNNEL': return '🚇';
      case 'CITY': return '🏙️';
      case 'ATTRACTION': return '🏛️';
      default: return '📍';
    }
  };

  // Limit to maximum 6 timeline items to prevent crowding
  const displayFeatures = upcomingFeatures.slice(0, 6);

  return (
    <div className="premium-glass-card rounded-3xl p-5 border shadow-glass space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Window View Timeline
        </h4>
        <span className="text-[10px] font-semibold text-slate-400">
          Click nodes to inspect scene
        </span>
      </div>

      <div className="relative pt-6 pb-8 overflow-hidden select-none">
        {/* Timeline Path Line with End Arrow */}
        <div className="absolute top-[37px] left-6 right-6 h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="absolute top-[33.5px] right-4 text-[10px] text-slate-350 dark:text-slate-700 font-bold select-none">
          ▶
        </div>

        {/* Nodes Container */}
        <div className="relative h-16 mx-4">
          {/* NOW Marker (Always at the left) */}
          <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center z-10">
            <span className="text-[9px] font-bold text-rail-blue uppercase tracking-wide">NOW</span>
            <div className="h-4.5 w-4.5 rounded-full border-[3px] border-white dark:border-slate-900 bg-rail-blue shadow-[0_0_8px_rgba(2,132,199,0.7)] mt-1.5 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 mt-2">Start</span>
          </div>

          {/* POIs spaced proportionally based on distance */}
          {displayFeatures.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              No landmarks ahead on this sector.
            </div>
          ) : (
            displayFeatures.map((f) => {
              const isActive = activeFeature?.id === f.id;
              // Map 0-10km distance to 15% - 85% width proportionally
              const leftPercent = Math.min(85, Math.max(18, (f.distanceKm / 10) * 70 + 15));
              
              return (
                <button
                  key={f.id}
                  onClick={() => onFeatureSelect(f)}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 -translate-x-1/2 flex flex-col items-center z-10 cursor-pointer group outline-none transition-transform duration-300 hover:scale-105"
                >
                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {f.distanceKm}k
                  </span>
                  
                  {/* Circle point node */}
                  <div className={cn(
                    'h-4.5 w-4.5 rounded-full border-[3px] border-white dark:border-slate-900 transition-all mt-1.5 shadow-sm',
                    isActive
                      ? 'bg-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-rail-blue'
                  )} />

                  {/* Icon label */}
                  <span className="text-sm mt-1">{getEmoji(f.type)}</span>
                  <span className={cn(
                    'text-[9px] font-extrabold max-w-[65px] text-center truncate mt-0.5 transition-colors',
                    isActive 
                      ? 'text-emerald-500 dark:text-emerald-400 font-extrabold' 
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  )}>
                    {f.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

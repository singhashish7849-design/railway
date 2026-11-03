'use client';

import React from 'react';
import { Gauge, MapPin, RefreshCw, ArrowRight, Navigation } from 'lucide-react';
import { LiveJourney } from '@/types/train';
import { DelayBadge } from './DelayBadge';
import { ProgressRing } from './ProgressRing';
import { ETAChip } from './ETAChip';
import { formatDistance, formatTimeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

interface JourneyCardProps {
  journey: LiveJourney;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function JourneyCard({
  journey,
  onRefresh,
  isRefreshing,
  className,
}: JourneyCardProps) {
  return (
    <div
      className={cn(
        'glass-panel relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-glass transition-all duration-300 border border-slate-200/50 dark:border-slate-800/40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md',
        className
      )}
    >
      {/* Row 1: Badges & ETA */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-3.5 py-1 font-mono text-xs font-bold text-rail-blue shadow-sm">
            #{journey.number}
          </span>
          <DelayBadge delayMinutes={journey.delayMinutes} className="rounded-full px-3.5 py-1 border border-slate-100 dark:border-slate-800" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Navigation className="h-3.5 w-3.5 text-slate-400 -rotate-45" />
            <span>ETA: {journey.ETA}</span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
              title="Refresh Live Status"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin text-rail-blue')}
              />
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Train Title & Subtitle */}
      <div className="mt-5">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {journey.name}
        </h2>
        <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>{journey.origin.name} ({journey.origin.code})</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          <span>{journey.destination.name} ({journey.destination.code})</span>
        </div>
      </div>

      {/* Row 3: Primary Live Status Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Current / Last Passed Station */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/20 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-100/50 dark:border-emerald-900/30">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current / Last Station
            </span>
            <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 leading-tight">
              {journey.currentStation?.name || journey.previousStation?.name || 'In Transit'}
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              Platform {journey.currentStation?.platform || '1'}
            </span>
          </div>
        </div>

        {/* Speed & Motion */}
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/20 shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-50 dark:bg-sky-950/40 text-rail-blue border border-sky-100/50 dark:border-sky-900/30">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Live Speed
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                {journey.speedKmh}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">km/h</span>
            </div>
          </div>
        </div>

        {/* Journey Progress Ring */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/20 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Distance Covered
            </span>
            <p className="font-mono text-base font-extrabold text-slate-900 dark:text-white mt-0.5 leading-tight">
              {journey.distanceCoveredKm} km / {journey.totalDistanceKm} km
            </p>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              {journey.remainingDistanceKm} km remaining
            </span>
          </div>
          <div className="flex-shrink-0">
            <ProgressRing progress={journey.completionPercentage} size={56} strokeWidth={5} />
          </div>
        </div>
      </div>

      {/* Row 4: Footer Meta */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>Auto-refreshes every 30 seconds</span>
        <span>Updated {formatTimeAgo(journey.lastUpdated)}</span>
      </div>
    </div>
  );
}

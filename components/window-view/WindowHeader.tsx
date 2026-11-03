'use client';

import React from 'react';
import { ArrowLeft, Navigation, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface WindowHeaderProps {
  trainNumber: string;
  trainName: string;
  speedKmh: number;
  isMoving: boolean;
  elevation?: number;
  weatherTemp?: number;
  weatherCondition?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function WindowHeader({
  trainNumber,
  trainName,
  speedKmh,
  isMoving,
  elevation,
  weatherTemp,
  weatherCondition,
  isRefreshing,
  onRefresh,
}: WindowHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4.5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/60 shadow-glass">
      <div className="flex items-center gap-3">
        <Link
          href={`/train/${trainNumber}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-rail-blue/10 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-rail-blue">
              {trainNumber}
            </span>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              {trainName}
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 flex items-center gap-1.5">
            <span>Window View Intel</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-emerald-500 font-extrabold">Active Session</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Speedometer */}
        <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Speed</p>
          <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 flex items-center justify-center gap-1">
            <Navigation className={cn('h-3 w-3 text-rail-blue', isMoving && 'animate-pulse')} />
            <span>{speedKmh} km/h</span>
          </p>
        </div>

        {/* Elevation */}
        {elevation !== undefined && (
          <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Elevation</p>
            <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              🏔️ {elevation} m
            </p>
          </div>
        )}

        {/* Weather summary */}
        {weatherTemp !== undefined && (
          <div className="bg-slate-100 dark:bg-slate-900/60 px-3.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Weather</p>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
              🌡️ {weatherTemp}°C · {weatherCondition}
            </p>
          </div>
        )}

        {/* Manual Refresh Trigger */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Force refresh nearby geographical features."
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
        )}
      </div>
    </header>
  );
}

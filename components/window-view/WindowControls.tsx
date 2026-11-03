'use client';

import React from 'react';
import { LayoutGrid, MapPin, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';

interface WindowControlsProps {
  activeTab: 'window' | 'map';
  setActiveTab: (tab: 'window' | 'map') => void;
  autoView: boolean;
  setAutoView: (val: boolean) => void;
  isNightOverride: boolean | null;
  setIsNightOverride: (val: boolean | null) => void;
}

export function WindowControls({
  activeTab,
  setActiveTab,
  autoView,
  setAutoView,
  isNightOverride,
  setIsNightOverride,
}: WindowControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4.5 rounded-2xl glass-panel border border-slate-200/50 dark:border-slate-800/60 shadow-glass">
      {/* View Selector Tab */}
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('window')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-lg',
            activeTab === 'window'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Window View</span>
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-lg',
            activeTab === 'map'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <MapPin className="h-4 w-4" />
          <span>Live Map</span>
        </button>
      </div>

      {/* Action Switches */}
      <div className="flex items-center gap-3">
        {/* Auto View mode */}
        <button
          onClick={() => setAutoView(!autoView)}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 text-xs font-bold border rounded-xl transition-all',
            autoView
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-glow'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
          title="Switches cinematic scene automatically as train moves near new notable landmarks."
        >
          {autoView ? <Eye className="h-4 w-4 animate-pulse" /> : <EyeOff className="h-4 w-4" />}
          <span>Auto View: {autoView ? 'ON' : 'OFF'}</span>
        </button>

        {/* Ambient Time Override */}
        <button
          onClick={() => {
            if (isNightOverride === null) setIsNightOverride(true);
            else if (isNightOverride === true) setIsNightOverride(false);
            else setIsNightOverride(null);
          }}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2 text-xs font-bold border rounded-xl transition-all',
            isNightOverride !== null
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          )}
          title="Override local time atmosphere to preview Sunrise/Sunset/Night lighting profiles."
        >
          {isNightOverride === true && <Moon className="h-4 w-4" />}
          {isNightOverride === false && <Sun className="h-4 w-4" />}
          {isNightOverride === null && <Sun className="h-4 w-4 opacity-50" />}
          <span>
            {isNightOverride === true && 'Night Mode'}
            {isNightOverride === false && 'Day Mode'}
            {isNightOverride === null && 'Auto Time'}
          </span>
        </button>
      </div>
    </div>
  );
}

import React from 'react';

export function BookingSkeleton() {
  return (
    <div className="space-y-4 text-left">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-6 shadow-sm space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1 text-right">
              <div className="h-6 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          <div className="h-10 w-full rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 pt-2" />
        </div>
      ))}
    </div>
  );
}

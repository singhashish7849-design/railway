import React from 'react';
import { Train, ArrowRight } from 'lucide-react';
import { EmergencyEvent } from '@/types/emergency';

interface EmergencyJourneyCardProps {
  event: EmergencyEvent;
}

export function EmergencyJourneyCard({ event }: EmergencyJourneyCardProps) {
  const formattedTime = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
        <Train className="h-4 w-4 text-rail-blue" />
        <span>Train & Journey Cache</span>
      </div>

      <div className="space-y-3">
        {/* Train Details */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="rounded-md bg-rail-blue/10 px-2 py-0.5 font-mono text-[11px] font-bold text-rail-blue">
              #{event.trainNumber}
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
              {event.trainName}
            </h4>
          </div>
        </div>

        {/* Coach / Seat Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 p-3 rounded-2xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Coach</span>
            <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {event.coach || 'N/A'}
            </p>
          </div>
          <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 p-3 rounded-2xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Seat</span>
            <p className="font-mono text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {event.seat || 'N/A'}
            </p>
          </div>
        </div>

        {/* Station Navigation */}
        <div className="space-y-2 pt-1 border-t border-slate-200/30 dark:border-slate-800/30">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Current Station</span>
              <span className="text-slate-900 dark:text-white">{event.currentStation || 'In Transit'}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div className="text-right">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Next Station</span>
              <span className="text-slate-900 dark:text-white">{event.nextStation || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase text-right pt-2 border-t border-slate-100 dark:border-slate-850">
          Last Cached Update: {formattedTime}
        </div>
      </div>
    </div>
  );
}

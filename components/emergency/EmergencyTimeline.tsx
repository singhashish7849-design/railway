import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TimelineStep {
  time: string;
  text: string;
  status: 'completed' | 'waiting' | 'failed' | 'info';
}

interface EmergencyTimelineProps {
  steps: TimelineStep[];
}

export function EmergencyTimeline({ steps }: EmergencyTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
        <Clock className="h-4 w-4 text-rail-blue" />
        <span>Emergency Activity Log</span>
      </div>

      <div className="relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2.5 space-y-5">
        {steps.map((step, idx) => {
          let IconComponent = Clock;
          let colorClass = 'text-slate-450';

          if (step.status === 'completed') {
            IconComponent = CheckCircle2;
            colorClass = 'text-emerald-500';
          } else if (step.status === 'failed') {
            IconComponent = AlertCircle;
            colorClass = 'text-rose-500';
          } else if (step.status === 'info') {
            IconComponent = Info;
            colorClass = 'text-sky-500';
          }

          return (
            <div key={idx} className="relative flex items-start gap-3 text-left">
              {/* Bullet node */}
              <div className="absolute -left-[25px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                <IconComponent className={cn('h-3.5 w-3.5', colorClass, step.status === 'waiting' && 'animate-spin')} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p className={cn(
                    'text-xs font-black leading-snug truncate',
                    step.status === 'completed' ? 'text-slate-950 dark:text-white' : 'text-slate-550 dark:text-slate-400'
                  )}>
                    {step.text}
                  </p>
                  <span className="text-[9.5px] font-mono text-slate-400 font-bold flex-shrink-0">
                    {step.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

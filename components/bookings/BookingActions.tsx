import React from 'react';
import Link from 'next/link';
import { Map, Grid, BarChart3, Eye, UtensilsCrossed, ShieldAlert } from 'lucide-react';

interface BookingActionsProps {
  trainNumber: string;
}

export function BookingActions({ trainNumber }: BookingActionsProps) {
  const tNo = trainNumber || '12952';

  const actions = [
    { label: 'Track Train', href: `/train/${tNo}`, icon: Map, color: 'text-rail-blue bg-rail-blue/10 border-rail-blue/20' },
    { label: 'Seat Layout', href: `/seat-selection?train=${tNo}`, icon: Grid, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Analytics', href: `/analytics?train=${tNo}`, icon: BarChart3, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { label: 'Window View', href: `/window-view?train=${tNo}`, icon: Eye, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Order Food', href: `/food?train=${tNo}`, icon: UtensilsCrossed, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'Emergency', href: `/emergency?train=${tNo}`, icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.label}
            href={act.href}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center group"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${act.color} transition-transform group-hover:scale-105`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">
              {act.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

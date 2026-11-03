import React from 'react';
import { User, Shield } from 'lucide-react';
import { BookingPassenger } from '@/lib/bookings/types';
import { BookingStatusBadge } from './BookingStatusBadge';

interface PassengerListProps {
  passengers?: BookingPassenger[];
}

export function PassengerList({ passengers }: PassengerListProps) {
  if (!passengers || passengers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-left space-y-1">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
          <User className="h-4 w-4" />
          <span>Passenger Information</span>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Passenger status & berth allocation: <span className="italic font-normal">Not available for this PNR</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Passenger Details ({passengers.length})
        </h4>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
        {passengers.map((p, idx) => (
          <div key={p.id || idx} className="flex items-center justify-between p-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                P{idx + 1}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {p.name || `Passenger ${idx + 1}`}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  {p.age ? `${p.age} yrs` : 'Age unavailable'} {p.gender ? `· ${p.gender}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  Coach: {p.coach || 'Not available'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Berth: {p.berth_number || 'Not available'} {p.berth_type ? `(${p.berth_type})` : ''}
                </p>
              </div>
              <BookingStatusBadge status={p.booking_status || 'CONFIRMED'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

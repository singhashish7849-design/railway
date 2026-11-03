import React from 'react';
import { Ticket, Plus } from 'lucide-react';

interface EmptyBookingsProps {
  onAddBooking: () => void;
}

export function EmptyBookings({ onAddBooking }: EmptyBookingsProps) {
  return (
    <div className="glass-panel mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center shadow-glass space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rail-blue/10 text-rail-blue shadow-glow">
        <Ticket className="h-8 w-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          My journeys will appear here
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs">
          Link your first booking to keep your train journey information, live status, and seat details together in one place.
        </p>
      </div>

      <button
        onClick={onAddBooking}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 px-5 text-xs font-bold text-white shadow-glow transition-all"
      >
        <Plus className="h-4 w-4" />
        <span>+ Add Booking</span>
      </button>
    </div>
  );
}

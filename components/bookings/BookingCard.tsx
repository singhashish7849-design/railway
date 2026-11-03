import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, Calendar, MapPin, Ticket, ChevronRight } from 'lucide-react';
import { Booking } from '@/lib/bookings/types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingActions } from './BookingActions';

interface BookingCardProps {
  booking: Booking;
  onRemoveRequest: (booking: Booking) => void;
}

export function BookingCard({ booking, onRemoveRequest }: BookingCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 shadow-sm hover:shadow-md transition-all space-y-4 text-left">
      
      {/* Header Row: Train Number, Name, Class & Status */}
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-rail-blue/10 px-2 py-0.5 font-mono text-xs font-black text-rail-blue">
              #{booking.train_number}
            </span>
            <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              {booking.train_name}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
            PNR: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{booking.pnr}</span> · Class: {booking.class_code || '2A'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.booking_status} />
          <button
            onClick={() => onRemoveRequest(booking)}
            className="rounded-xl p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Remove Booking from RailGaadi"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Station Route & Schedule Grid */}
      <div className="grid grid-cols-3 items-center gap-2 py-1">
        {/* Origin */}
        <div className="space-y-0.5 text-left">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {booking.departure_time || '16:55'}
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {booking.from_station_name}
          </p>
          <p className="font-mono text-[10px] font-bold text-slate-400">
            {booking.from_station_code}
          </p>
        </div>

        {/* Direction Indicator */}
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{booking.journey_date || '15 Aug 2026'}</span>
          </div>
          <div className="flex items-center gap-2 w-full px-2">
            <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
            <ArrowRight className="h-4 w-4 text-rail-blue flex-shrink-0" />
            <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Destination */}
        <div className="space-y-0.5 text-right">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {booking.arrival_time || '08:35'}
          </span>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
            {booking.to_station_name}
          </p>
          <p className="font-mono text-[10px] font-bold text-slate-400">
            {booking.to_station_code}
          </p>
        </div>
      </div>

      {/* Integrated Action Bar */}
      <BookingActions trainNumber={booking.train_number} />

      {/* View Details Link */}
      <div className="pt-1 flex items-center justify-end">
        <Link
          href={`/bookings/${booking.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-rail-blue hover:text-sky-600 transition-colors"
        >
          <span>View Full Booking Details</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

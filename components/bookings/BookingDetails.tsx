import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Ticket, Trash2, Clock, ShieldCheck } from 'lucide-react';
import { Booking } from '@/lib/bookings/types';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingActions } from './BookingActions';
import { PassengerList } from './PassengerList';

interface BookingDetailsProps {
  booking: Booking;
  onRemoveRequest: (booking: Booking) => void;
}

export function BookingDetails({ booking, onRemoveRequest }: BookingDetailsProps) {
  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Bookings</span>
        </Link>

        <button
          onClick={() => onRemoveRequest(booking)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Remove Booking</span>
        </button>
      </div>

      {/* Main Booking Ticket Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 shadow-sm space-y-6 text-left">
        
        {/* Ticket Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="rounded-xl bg-rail-blue/10 px-3 py-1 font-mono text-sm font-black text-rail-blue">
                #{booking.train_number}
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                {booking.train_name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
              Journey Date: <span className="text-slate-900 dark:text-white font-bold">{booking.journey_date || '15 Aug 2026'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.booking_status} className="text-xs py-1.5 px-3" />
          </div>
        </div>

        {/* PNR & Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 p-4 border border-slate-200/60 dark:border-slate-800/60">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">PNR Number</span>
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{booking.pnr}</span>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Class</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.class_code || '2A'}</span>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Boarding Station</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
              {booking.boarding_station_name || booking.from_station_name} ({booking.boarding_station_code || booking.from_station_code})
            </span>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Booking Status</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{booking.booking_status}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-2 gap-6 items-center">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Departure</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block">
              {booking.departure_time || '16:55'}
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {booking.from_station_name} ({booking.from_station_code})
            </p>
          </div>

          <div className="space-y-1 text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Arrival</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block">
              {booking.arrival_time || '08:35'}
            </span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {booking.to_station_name} ({booking.to_station_code})
            </p>
          </div>
        </div>

        {/* Feature Actions */}
        <div className="pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
            Integrated RailGaadi Features
          </h4>
          <BookingActions trainNumber={booking.train_number} />
        </div>

        {/* Passenger List */}
        <PassengerList passengers={booking.passengers} />
      </div>
    </div>
  );
}

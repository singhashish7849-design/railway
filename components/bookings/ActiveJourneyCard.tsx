import React from 'react';
import Link from 'next/link';
import { Radio, MapPin, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Booking } from '@/lib/bookings/types';
import { useBookingStatus } from '@/hooks/useBookings';

interface ActiveJourneyCardProps {
  booking: Booking;
}

export function ActiveJourneyCard({ booking }: ActiveJourneyCardProps) {
  const { liveStatus, loading, error, refreshStatus } = useBookingStatus(booking.id);

  return (
    <div className="rounded-3xl border border-rail-blue/30 bg-gradient-to-br from-rail-blue/10 via-slate-900/90 to-slate-950 p-6 text-white shadow-2xl space-y-4 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-rail-blue/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
            LIVE JOURNEY
          </span>
        </div>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Refresh Live Status"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Train Info */}
      <div>
        <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
          <span>{booking.train_name}</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10 text-sky-300">
            #{booking.train_number}
          </span>
        </h3>
        <p className="text-xs text-slate-300 font-medium mt-0.5">
          {booking.from_station_name} ({booking.from_station_code}) → {booking.to_station_name} ({booking.to_station_code})
        </p>
      </div>

      {/* Live Progress Data */}
      {liveStatus ? (
        <div className="space-y-3 rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Location</span>
              <span className="font-bold text-emerald-300">
                {liveStatus.currentStation?.name || liveStatus.ETA || 'En Route'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Next Halt</span>
              <span className="font-bold text-white">
                {liveStatus.nextStation?.name || 'Approaching Destination'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Progress: {liveStatus.completionPercentage || 50}%</span>
              <span>{liveStatus.delayMinutes > 0 ? `${liveStatus.delayMinutes} mins delay` : 'Running On Time'}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rail-blue to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, liveStatus.completionPercentage || 50)}%` }}
              />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-slate-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span>Railway live information temporarily updating...</span>
        </div>
      ) : (
        <div className="h-16 w-full rounded-2xl bg-white/5 animate-pulse" />
      )}

      {/* Action Trigger */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-mono">
          PNR: {booking.pnr}
        </span>
        <Link
          href={`/train/${booking.train_number}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-500 px-4 text-xs font-bold text-white shadow-glow transition-all"
        >
          <span>Open Live Tracking</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { Train, Clock, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FoodOrderStatusProps {
  stationName: string;
  stationCode: string;
  distanceKm: number | null;
  etaText: string;
  foodStatus: string;
}

export function FoodOrderStatus({
  stationName,
  stationCode,
  distanceKm,
  etaText,
  foodStatus,
}: FoodOrderStatusProps) {
  // Flag indicating if train is approaching station (e.g. within 15km)
  const isApproaching = distanceKm !== null && distanceKm <= 15;

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      {/* Upper header */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 dark:border-slate-850 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8.5 w-8.5 rounded-xl bg-rail-blue/10 text-rail-blue flex items-center justify-center flex-shrink-0">
            <Train className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
              Train HUD
            </p>
            <p className="text-xs font-black text-slate-850 dark:text-white mt-1 leading-none">
              Live Approach Tracker
            </p>
          </div>
        </div>

        {/* State Badge */}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider',
            isApproaching
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
          )}
        >
          {isApproaching ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Approaching</span>
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>On Route</span>
            </>
          )}
        </span>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Delivery Station */}
        <div className="space-y-1">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span>Delivery Station</span>
          </p>
          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
            {stationName} ({stationCode})
          </p>
        </div>

        {/* Remaining info */}
        <div className="space-y-1">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Train ETA Stop</span>
          </p>
          <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
            {etaText}
          </p>
        </div>
      </div>

      {/* Telemetry info */}
      {distanceKm !== null && (
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold text-slate-550 dark:text-slate-400">
            Train is <span className="font-black text-slate-900 dark:text-white">{distanceKm.toFixed(1)} km</span> away.
          </div>
          <span className="text-[10px] font-extrabold text-rail-blue uppercase tracking-widest">
            Live GPS
          </span>
        </div>
      )}

      {/* Special Context Status Notice */}
      {isApproaching && foodStatus === 'READY_FOR_DELIVERY' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 rounded-2xl p-3.5 flex items-start gap-2.5 leading-normal animate-pulse">
          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold">Food is ready at platform!</p>
            <p className="text-[9.5px] text-emerald-500/80 mt-0.5 font-semibold">
              The delivery executive is waiting at {stationName} station. Please remain at your seat in Coach/Berth.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

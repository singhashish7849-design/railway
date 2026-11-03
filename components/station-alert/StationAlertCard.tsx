import React from 'react';
import { BellRing, MapPin, Clock, Armchair, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StationAlertCardProps {
  stationName: string;
  stationCode: string;
  distanceKm: number | null;
  eta: string;
  seatInfo: { coachNumber?: string; seatNumber?: string; type?: string } | null;
  onDisable: () => void;
  className?: string;
}

export function StationAlertCard({
  stationName,
  stationCode,
  distanceKm,
  eta,
  seatInfo,
  onDisable,
  className,
}: StationAlertCardProps) {
  const distanceText = distanceKm !== null ? `${distanceKm.toFixed(1)} km` : 'Calculating...';
  const showSeat = seatInfo && (seatInfo.coachNumber || seatInfo.seatNumber);

  return (
    <div className={cn(
      'premium-glass-card rounded-3xl p-5 border border-emerald-500/25 dark:border-emerald-500/15 shadow-glass space-y-4 transition-all duration-300',
      className
    )}>
      {/* Title & Badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
          <BellRing className="h-4 w-4 animate-bounce" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest">
            Station Alert Active
          </span>
        </div>
        <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
          Target: {stationCode}
        </span>
      </div>

      {/* Target Station Name */}
      <div>
        <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight tracking-tight">
          {stationName}
        </h3>
        <p className="text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Approaching Station
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3.5 bg-white/20 dark:bg-slate-900/30 p-3 rounded-2xl border border-white/30 dark:border-white/5">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-rail-blue mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Distance</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
              {distanceText}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-rail-blue mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">ETA</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
              {eta}
            </p>
          </div>
        </div>
      </div>

      {/* Seat Allocation Details */}
      {showSeat && (
        <div className="bg-rail-blue/5 border border-rail-blue/15 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="h-8.5 w-8.5 rounded-xl bg-rail-blue/10 border border-rail-blue/20 text-rail-blue flex items-center justify-center flex-shrink-0">
            <Armchair className="h-4.5 w-4.5" />
          </div>
          <div className="text-xs">
            <p className="text-[9px] text-slate-400 font-bold uppercase">Assigned Seat Details</p>
            <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">
              Coach {seatInfo.coachNumber} · Seat {seatInfo.seatNumber}
            </p>
            {seatInfo.type && (
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">
                {seatInfo.type}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action to disable */}
      <button
        onClick={onDisable}
        className="w-full inline-flex h-9.5 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-rose-500/5 hover:border-rose-500/20 hover:text-rose-500 font-bold text-xs text-slate-500 dark:text-slate-400 transition-all active:scale-97"
      >
        Disable Alert
      </button>
    </div>
  );
}

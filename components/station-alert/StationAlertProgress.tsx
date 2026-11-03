import React from 'react';
import { Train, MapPin } from 'lucide-react';
import { LiveJourney } from '@/types/train';
import { useStationRouteProgress } from '@/hooks/useStationAlert';

interface StationAlertProgressProps {
  journey: LiveJourney | null;
  stationCode: string;
}

export function StationAlertProgress({ journey, stationCode }: StationAlertProgressProps) {
  const { percentage, coveredKm, remainingKm } = useStationRouteProgress(journey, stationCode);
  const station = journey?.stations.find((s) => s.code === stationCode);

  return (
    <div className="premium-glass-card rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-glass space-y-4">
      {/* Title */}
      <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
        <span>Route Progress</span>
        <span>{percentage}%</span>
      </div>

      {/* Progress track slider */}
      <div className="relative pt-4 pb-2">
        {/* Track Line */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative">
          <div
            className="h-full bg-gradient-to-r from-rail-blue to-sky-400 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Sliding Train Icon Indicator */}
        <div
          className="absolute top-1.5 -translate-x-1/2 transition-all duration-500"
          style={{ left: `${percentage}%` }}
        >
          <div className="h-6.5 w-6.5 rounded-full bg-white dark:bg-slate-900 border-2 border-rail-blue text-rail-blue flex items-center justify-center shadow-md animate-pulse">
            <Train className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Station Target Pin on the right end */}
        <div className="absolute right-0 top-1.5 translate-x-1/2">
          <div className="h-6.5 w-6.5 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-350 dark:border-slate-700 text-slate-500 flex items-center justify-center">
            <MapPin className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Progress information details */}
      <div className="flex justify-between items-center text-xs font-bold pt-1">
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Covered</p>
          <p className="text-slate-900 dark:text-white mt-0.5">
            {coveredKm.toFixed(1)} km
          </p>
        </div>

        <div className="text-center bg-rail-blue/5 border border-rail-blue/10 rounded-xl px-3 py-1">
          <p className="text-[9px] text-rail-blue uppercase tracking-wider font-extrabold">Remaining</p>
          <p className="text-xs font-black text-rail-blue mt-0.5">
            {remainingKm.toFixed(1)} km
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] text-slate-400 uppercase tracking-wide font-extrabold">Destination</p>
          <p className="text-slate-900 dark:text-white mt-0.5 truncate max-w-[80px]">
            {station?.name || stationCode}
          </p>
        </div>
      </div>
    </div>
  );
}

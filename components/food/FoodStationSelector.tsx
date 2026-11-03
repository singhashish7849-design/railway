import React from 'react';
import { Sparkles, MapPin, Clock, ArrowRight } from 'lucide-react';
import { FoodStation } from '@/types/food';
import { cn } from '@/utils/cn';

interface FoodStationSelectorProps {
  stations: FoodStation[];
  onSelect: (station: FoodStation) => void;
  loading: boolean;
  error: string | null;
  mode: string;
}

export function FoodStationSelector({
  stations,
  onSelect,
  loading,
  error,
  mode,
}: FoodStationSelectorProps) {
  // Simple recommendation logic: recommend the station with the most restaurants or the largest station
  // In mock data: Ambala Cantt (UMB) or Vadodara JN (BRC) have the best food selections!
  const recommendedStation = stations.find(
    (s) => s.code === 'UMB' || s.code === 'BRC' || s.code === 'NDLS'
  ) || stations[0];

  if (loading) {
    return (
      <div className="space-y-3.5">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-28 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 rounded-2xl p-4 text-center">
        <p>Food ordering is temporarily unavailable.</p>
        <p className="text-[10px] text-rose-450 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">
      {/* Recommended Section (If any station available) */}
      {recommendedStation && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-3xl p-5 space-y-3.5">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>Recommended Stop</span>
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
              {recommendedStation.name} ({recommendedStation.code})
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-0.5 font-semibold">
              Excellent selection of food partners · Ideal delivery window
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>Arrival: {recommendedStation.eta}</span>
            </span>
          </div>

          <button
            onClick={() => onSelect(recommendedStation)}
            className="w-full inline-flex h-9.5 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow transition-all active:scale-97"
          >
            <span>Explore Food Partner Options</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Mode Label */}
      <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
        <span>Stations on route</span>
        <span className="text-emerald-500">{mode}</span>
      </div>

      {/* Stations List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
        {stations.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-450 font-semibold">
            No delivery stations available on this journey route.
          </div>
        ) : (
          stations.map((st) => (
            <button
              key={st.code}
              onClick={() => onSelect(st)}
              className="w-full text-left p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-between transition-all duration-200 outline-none group active:scale-99"
            >
              <div className="flex gap-3.5 items-center">
                <div className="h-8.5 w-8.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-rail-blue group-hover:text-white transition-colors">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    {st.name} ({st.code})
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    ETA: {st.eta}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 group-hover:text-rail-blue transition-colors">
                <span>View Menus</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

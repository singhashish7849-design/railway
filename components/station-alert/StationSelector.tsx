import React, { useState, useMemo } from 'react';
import { Search, Clock, AlertTriangle, Check } from 'lucide-react';
import { Station } from '@/types/train';
import { cn } from '@/utils/cn';

interface StationSelectorProps {
  stations: Station[];
  selectedStationCode: string;
  onSelect: (station: Station) => void;
}

export function StationSelector({ stations, selectedStationCode, onSelect }: StationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = useMemo(() => {
    return stations.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    });
  }, [stations, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search station or code..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue transition-all"
        />
      </div>

      {/* Station List */}
      <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1 select-none" style={{ scrollbarWidth: 'none' }}>
        {filteredStations.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-semibold">
            No matching stations found on route.
          </div>
        ) : (
          filteredStations.map((station) => {
            const isSelected = selectedStationCode === station.code;
            const isPassed = station.status === 'passed';

            return (
              <button
                key={station.code}
                type="button"
                onClick={() => onSelect(station)}
                className={cn(
                  'w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-200 outline-none group active:scale-99',
                  isSelected
                    ? 'bg-rail-blue/10 border-rail-blue text-rail-blue shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850',
                  isPassed && 'opacity-55 hover:bg-transparent cursor-default'
                )}
              >
                <div className="flex gap-3.5 items-center">
                  {/* Select check badge */}
                  <div className={cn(
                    'h-5 w-5 rounded-full border flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-rail-blue border-rail-blue text-white'
                      : isPassed
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      : 'border-slate-350 dark:border-slate-700 text-transparent group-hover:border-rail-blue'
                  )}>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black tracking-tight">{station.name}</span>
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-bold uppercase">
                        {station.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10.5px] text-slate-400 dark:text-slate-500 font-bold mt-1">
                      {station.scheduledArrival && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Arr: {station.scheduledArrival}</span>
                        </span>
                      )}
                      {station.scheduledDeparture && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Dep: {station.scheduledDeparture}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delay & status info */}
                <div className="text-right">
                  {isPassed ? (
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Passed
                    </span>
                  ) : (
                    <>
                      {station.delayMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{station.delayMinutes}m delay</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          On time
                        </span>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

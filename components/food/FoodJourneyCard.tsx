import React from 'react';
import Link from 'next/link';
import { Utensils, ArrowRight, Clock, Star } from 'lucide-react';
import { FoodStation, FoodRestaurant } from '@/types/food';
import { useFoodStations, useFoodRestaurants } from '@/hooks/useFood';
import { cn } from '@/utils/cn';

interface FoodJourneyCardProps {
  trainNumber: string;
}

export function FoodJourneyCard({ trainNumber }: FoodJourneyCardProps) {
  const { stations, loading: stationsLoading } = useFoodStations(trainNumber);

  // Recommend the best stop
  const recommendStop = stations.find(
    (s) => s.code === 'UMB' || s.code === 'BRC' || s.code === 'NDLS'
  ) || stations[0];

  const { restaurants, loading: restaurantsLoading } = useFoodRestaurants(
    recommendStop?.code || ''
  );

  if (stationsLoading || !recommendStop) return null;

  return (
    <div className="premium-glass-card rounded-3xl p-5.5 border border-emerald-500/25 shadow-glass bg-gradient-to-br from-emerald-500/5 to-teal-500/5 flex flex-col md:flex-row items-center justify-between gap-5 select-none">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Utensils className="h-5.5 w-5.5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            🍱 Food For Your Journey
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8.5px] font-bold text-emerald-500 uppercase tracking-wide">
              Fresh Delivery
            </span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal max-w-xl font-medium">
            Pre-order delicious meals delivered hot directly to your seat at <span className="font-extrabold text-slate-800 dark:text-white">{recommendStop.name} ({recommendStop.code})</span>.
          </p>
          
          <div className="flex gap-4 items-center mt-3 text-[10px] font-extrabold text-slate-450 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              <span>ETA: {recommendStop.eta}</span>
            </span>
            {restaurants.length > 0 && (
              <span>· {restaurants.length} certified restaurants available</span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/food?trainNumber=${trainNumber}`}
        className="inline-flex h-9.5 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white px-5 shadow-glow transition-all whitespace-nowrap self-end md:self-center active:scale-95"
      >
        <span>Explore Food stops</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

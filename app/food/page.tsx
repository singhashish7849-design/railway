'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Utensils, Search, Sparkles } from 'lucide-react';
import { useFoodStations } from '@/hooks/useFood';
import { FoodStationSelector } from '@/components/food/FoodStationSelector';
import { FoodOrderHistory } from '@/components/food/FoodOrderHistory';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils/cn';

function FoodDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainQuery = searchParams.get('trainNumber') || '';

  const [trainNumber, setTrainNumber] = useState(trainQuery);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  // Hook for stations list
  const { stations, mode, loading: stationsLoading, error: stationsError } = useFoodStations(trainQuery);

  // Hook for past orders list from API
  const { data: pastOrdersJson, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['pastFoodOrders'],
    queryFn: async () => {
      const res = await fetch('/api/food/orders');
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const activeOrders = (pastOrdersJson || []).filter(
    (o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'FAILED'
  );
  const completedOrders = (pastOrdersJson || []).filter(
    (o: any) => o.status === 'DELIVERED' || o.status === 'CANCELLED' || o.status === 'FAILED'
  );

  useEffect(() => {
    if (trainQuery) {
      setTrainNumber(trainQuery);
    }
  }, [trainQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber.trim()) return;
    router.push(`/food?trainNumber=${trainNumber.trim()}`);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4 select-none">
      {/* Back Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
        <Link
          href={trainQuery ? `/train/${trainQuery}` : '/'}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Train</span>
        </Link>
        <h1 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Smart Food Delivery
        </h1>
      </div>

      {/* Train Number Finder (If not in query or searching for another) */}
      <form onSubmit={handleSearch} className="premium-glass-card p-5 border border-slate-250/60 dark:border-slate-800 rounded-3xl space-y-3.5">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest leading-none">
            Find Food stops
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Train Number (e.g. 12951, 12013)"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              className="w-full text-xs font-bold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-2xl outline-none focus:border-rail-blue text-slate-950 dark:text-white"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white px-5 shadow-glow transition-all active:scale-95"
          >
            Search
          </button>
        </div>
      </form>

      {/* Main Flow Grid */}
      {trainQuery ? (
        <div className="space-y-4">
          <FoodStationSelector
            stations={stations}
            onSelect={(st) => {
              // Direct route to list of restaurants for selected station
              router.push(`/food/restaurants/rest_gaurav?stationCode=${st.code}&stationName=${st.name}&trainNumber=${trainQuery}`);
            }}
            loading={stationsLoading}
            error={stationsError}
            mode={mode}
          />
        </div>
      ) : (
        /* History & Default Listing */
        <div className="space-y-6">
          {/* Active Orders first */}
          {activeOrders.length > 0 && (
            <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-4.5 animate-pulse">
              <h3 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Active Deliveries
              </h3>
              <FoodOrderHistory orders={activeOrders} loading={ordersLoading} />
            </div>
          )}

          {/* All historical listings */}
          <FoodOrderHistory orders={completedOrders} loading={ordersLoading} />
        </div>
      )}
    </div>
  );
}

export default function FoodDashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto space-y-6 py-6 px-4 animate-pulse">
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    }>
      <FoodDashboardContent />
    </Suspense>
  );
}

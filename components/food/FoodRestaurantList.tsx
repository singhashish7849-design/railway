import React, { useState, useMemo } from 'react';
import { Star, Clock, Filter, Check } from 'lucide-react';
import { FoodRestaurant } from '@/types/food';
import { cn } from '@/utils/cn';

interface FoodRestaurantListProps {
  restaurants: FoodRestaurant[];
  onSelect: (restaurant: FoodRestaurant) => void;
  loading: boolean;
  stationName: string;
}

export function FoodRestaurantList({
  restaurants,
  onSelect,
  loading,
  stationName,
}: FoodRestaurantListProps) {
  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  // Extract all cuisines dynamically for filtering
  const allCuisines = useMemo(() => {
    const cuisinesSet = new Set<string>();
    restaurants.forEach((r) => r.cuisines.forEach((c) => cuisinesSet.add(c)));
    return Array.from(cuisinesSet);
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (filterVegOnly && !r.isVeg) return false;
      if (selectedCuisine && !r.cuisines.includes(selectedCuisine)) return false;
      return true;
    });
  }, [restaurants, filterVegOnly, selectedCuisine]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-44 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">
      {/* Title Header */}
      <div>
        <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
          Food Partners at {stationName}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
          Select a restaurant to browse menus and add items to your cart
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-2.5 flex-wrap items-center">
        {/* Veg Only Filter Toggle */}
        <button
          onClick={() => setFilterVegOnly(!filterVegOnly)}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black transition-all border outline-none active:scale-95',
            filterVegOnly
              ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
          )}
        >
          {filterVegOnly && <Check className="h-3 w-3 stroke-[3]" />}
          <span>Pure Veg</span>
        </button>

        {/* Cuisine Filters Dropdown/List */}
        {allCuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black transition-all border outline-none active:scale-95',
              selectedCuisine === cuisine
                ? 'bg-rail-blue/10 border-rail-blue/35 text-rail-blue'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
            )}
          >
            <span>{cuisine}</span>
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
          <p className="text-xs font-black text-slate-500">No food partners fit this filter.</p>
          <button
            onClick={() => {
              setFilterVegOnly(false);
              setSelectedCuisine(null);
            }}
            className="text-[10px] text-rail-blue font-extrabold uppercase tracking-wider mt-2.5 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRestaurants.map((rest) => (
            <div
              key={rest.id}
              onClick={() => onSelect(rest)}
              className="group cursor-pointer p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-rail-blue/40 dark:hover:border-rail-blue/40 hover:shadow-md transition-all duration-200 flex gap-4 items-center active:scale-99"
            >
              {rest.imageUrl && (
                <img
                  src={rest.imageUrl}
                  alt={rest.name}
                  className="h-16 w-16 rounded-2xl object-cover flex-shrink-0 border border-slate-200/40 dark:border-slate-800/40"
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-rail-blue transition-colors">
                    {rest.name}
                  </h4>
                  {rest.isVeg && (
                    <span className="h-3 w-3 border border-emerald-500 flex items-center justify-center rounded-[3px] text-[6px] font-bold text-emerald-500 flex-shrink-0" title="Veg Only">
                      🟢
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold truncate mt-0.5">
                  {rest.cuisines.join(' · ')}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[10px] font-extrabold text-slate-500">
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{rest.rating}</span>
                  </span>
                  
                  <span className="flex items-center gap-0.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{rest.deliveryTimeMinutes} min delivery</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

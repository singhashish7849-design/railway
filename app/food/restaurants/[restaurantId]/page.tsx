'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Store } from 'lucide-react';
import { useFoodRestaurants, useFoodMenu, useFoodCart } from '@/hooks/useFood';
import { FoodRestaurantList } from '@/components/food/FoodRestaurantList';
import { FoodMenu } from '@/components/food/FoodMenu';
import { FoodItemModal } from '@/components/food/FoodItemModal';
import { FoodCartDrawer } from '@/components/food/FoodCartDrawer';
import { FoodMenuItem } from '@/types/food';

export default function RestaurantMenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const stationCode = searchParams.get('stationCode') || '';
  const stationName = searchParams.get('stationName') || '';
  const trainNumber = searchParams.get('trainNumber') || '';

  const [activeRestaurantId, setActiveRestaurantId] = useState(params.restaurantId);
  const [customizingItem, setCustomizingItem] = useState<FoodMenuItem | null>(null);

  // Hook for restaurants list
  const { restaurants, loading: restaurantsLoading } = useFoodRestaurants(stationCode);

  // Active restaurant object details
  const activeRestaurant = restaurants.find((r) => r.id === activeRestaurantId) || restaurants[0];

  // Hook for menu items list
  const { menu, loading: menuLoading } = useFoodMenu(activeRestaurant?.id || activeRestaurantId);

  // Clear cart if transitioning from a different train (prevent ordering from 2 different trains)
  // For demo, we just keep the cart local, but we can verify it simply.

  const handleCheckout = () => {
    router.push(
      `/food/checkout?trainNumber=${trainNumber}&stationCode=${stationCode}&stationName=${stationName}`
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4 pb-24 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
        <Link
          href={`/food?trainNumber=${trainNumber}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Stations</span>
        </Link>
        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          📍 {stationName} ({stationCode})
        </span>
      </div>

      {/* Switch Restaurant Grid (Toggle list of restaurants) */}
      {restaurants.length > 1 && (
        <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-[9px] uppercase tracking-widest px-1">
            <Store className="h-3.5 w-3.5" />
            <span>Switch Restaurant partner</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {restaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRestaurantId(r.id)}
                className={`flex h-8.5 items-center rounded-full px-3.5 text-xs font-black transition-all border outline-none active:scale-95 whitespace-nowrap ${
                  activeRestaurantId === r.id
                    ? 'bg-rail-blue border-rail-blue text-white shadow-glow'
                    : 'border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu List */}
      {activeRestaurant && (
        <FoodMenu
          menu={menu}
          restaurantName={activeRestaurant.name}
          cuisineList={activeRestaurant.cuisines}
          rating={activeRestaurant.rating}
          deliveryTime={activeRestaurant.deliveryTimeMinutes}
          onOpenCustomizer={(item) => setCustomizingItem(item)}
          loading={menuLoading || restaurantsLoading}
        />
      )}

      {/* Customizer Modal */}
      <FoodItemModal
        isOpen={Boolean(customizingItem)}
        onClose={() => setCustomizingItem(null)}
        item={customizingItem}
      />

      {/* Sticky Cart Drawer */}
      <FoodCartDrawer onContinue={handleCheckout} />
    </div>
  );
}

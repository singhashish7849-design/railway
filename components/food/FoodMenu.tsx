import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, Star, ShoppingBag, Plus, Minus, Utensils } from 'lucide-react';
import { FoodMenuItem } from '@/types/food';
import { useFoodCart, CartItem } from '@/hooks/useFood';
import { cn } from '@/utils/cn';

interface FoodMenuProps {
  menu: FoodMenuItem[];
  restaurantName: string;
  cuisineList: string[];
  rating: number;
  deliveryTime: number;
  onOpenCustomizer: (item: FoodMenuItem) => void;
  loading: boolean;
}

export function FoodMenu({
  menu,
  restaurantName,
  cuisineList,
  rating,
  deliveryTime,
  onOpenCustomizer,
  loading,
}: FoodMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');
  const cartItems = useFoodCart((state) => state.items);
  const addItem = useFoodCart((state) => state.addItem);
  const updateQuantity = useFoodCart((state) => state.updateQuantity);

  // Group menu by categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('Popular'); // Always show Popular first
    menu.forEach((item) => cats.add(item.category));
    return Array.from(cats);
  }, [menu]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'Popular') {
      // For mock demonstration, show first 3 items in popular
      return menu.slice(0, 3);
    }
    return menu.filter((item) => item.category === selectedCategory);
  }, [menu, selectedCategory]);

  const getItemQuantity = useCallback((menuItemId: string) => {
    const item = cartItems.find((i) => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-none">
      {/* Restaurant Header Badge Info */}
      <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
            {restaurantName}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-450 font-bold uppercase mt-1">
            {cuisineList.join(' · ')}
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col text-center">
            <span className="text-amber-500 font-black text-sm flex items-center gap-0.5 justify-center leading-none">
              <Star className="h-4.5 w-4.5 fill-current" />
              {rating}
            </span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">Rating</span>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

          <div className="flex flex-col text-center">
            <span className="text-slate-900 dark:text-white font-black text-sm leading-none">
              {deliveryTime}m
            </span>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase mt-1 tracking-wider">Delivery</span>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'flex h-8.5 items-center rounded-full px-4 text-xs font-black transition-all border outline-none active:scale-95 whitespace-nowrap',
              selectedCategory === cat
                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Categorized Menu Listing */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 font-semibold">
            No items available in this category.
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = getItemQuantity(item.id);

            return (
              <div
                key={item.id}
                className="p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4 items-center transition-all hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        'h-3.5 w-3.5 border flex items-center justify-center rounded-[3px] text-[7px] font-bold flex-shrink-0',
                        item.isVeg ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'
                      )}
                    >
                      {item.isVeg ? '🟢' : '🔴'}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {item.name}
                    </h3>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-450 font-medium mt-1 leading-relaxed max-w-xl">
                    {item.description}
                  </p>

                  <p className="text-xs font-black text-slate-900 dark:text-white mt-2.5">
                    ₹{item.price}
                  </p>
                </div>

                {/* Right Side: Image + Quantity Trigger Button */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-slate-200/30 dark:border-slate-800/30"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.fallback-placeholder');
                          if (fallback) {
                            fallback.classList.remove('hidden');
                            fallback.classList.add('flex');
                          }
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200/30 dark:border-slate-800/30 fallback-placeholder",
                      item.imageUrl ? "hidden" : "flex"
                    )}
                  >
                    <Utensils className="h-6 w-6" />
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full h-8 px-2 border border-slate-200/50 dark:border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.id, qty - 1)}
                        className="p-1 text-slate-500 hover:text-slate-750 outline-none"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="px-2 text-xs font-black text-slate-850 dark:text-white min-w-[16px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, qty + 1)}
                        className="p-1 text-slate-500 hover:text-slate-750 outline-none"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        // If category is customizable or needs instructions, open customization modal.
                        // For demo: popular and meals thalis open customization modal!
                        if (item.category === 'Meals' || item.id.includes('peppy')) {
                          onOpenCustomizer(item);
                        } else {
                          addItem({
                            menuItemId: item.id,
                            name: item.name,
                            price: item.price,
                            isVeg: item.isVeg,
                          });
                        }
                      }}
                      className="inline-flex h-8 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-[10.5px] font-black text-white px-4.5 shadow-sm transition-all active:scale-95"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

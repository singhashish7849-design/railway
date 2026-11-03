import React, { useState } from 'react';
import { ShoppingBag, ChevronRight, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useFoodCart } from '@/hooks/useFood';
import { cn } from '@/utils/cn';

interface FoodCartDrawerProps {
  onContinue: () => void;
}

export function FoodCartDrawer({ onContinue }: FoodCartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useFoodCart((state) => state.items);
  const updateQuantity = useFoodCart((state) => state.updateQuantity);
  const removeItem = useFoodCart((state) => state.removeItem);
  const subtotal = useFoodCart((state) => state.subtotal());
  const deliveryFee = useFoodCart((state) => state.deliveryFee);
  const tax = useFoodCart((state) => state.tax());
  const total = useFoodCart((state) => state.total());

  const totalItemsCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  if (totalItemsCount === 0) return null;

  return (
    <>
      {/* Sticky Bottom Bar Trigger */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/60 dark:border-slate-800/60 shadow-glass px-4.5 py-4 flex items-center justify-between backdrop-blur-md max-w-lg mx-auto sm:rounded-t-3xl sm:border-x">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 text-left outline-none"
        >
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 animate-pulse">
            <ShoppingBag className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold uppercase mt-1">
              ₹{subtotal} Subtotal
            </p>
          </div>
        </button>

        <button
          onClick={onContinue}
          className="inline-flex h-9.5 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white px-5 shadow-glow transition-all active:scale-95"
        >
          <span>Continue Checkout</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Cart Items Slide-up Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none">
          {/* Overlay Backdrop */}
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200/50 dark:border-slate-800 p-6 shadow-2xl animate-in slide-in-from-bottom duration-250 flex flex-col max-h-[85vh]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="pb-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Your Order Cart</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 uppercase">
                  {totalItemsCount} Items
                </span>
              </h3>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1" style={{ scrollbarWidth: 'none' }}>
              {cartItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200/30 dark:border-slate-800/30"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      {item.name}
                    </h4>
                    {item.specialInstructions && (
                      <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-1 truncate">
                        {item.specialInstructions}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">
                      ₹{item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded-full h-8 px-2 border border-slate-200/50 dark:border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 outline-none"
                      >
                        <Minus className="h-3 w-3 stroke-[3]" />
                      </button>
                      <span className="px-2 text-xs font-black text-slate-850 dark:text-white min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 outline-none"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="p-2 text-slate-450 hover:text-rose-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total details summary */}
            <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 mt-2 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>Station Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onContinue();
              }}
              className="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95 mt-5"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

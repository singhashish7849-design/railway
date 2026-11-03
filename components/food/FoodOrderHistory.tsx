import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import { FoodOrder } from '@/types/food';
import { cn } from '@/utils/cn';

interface FoodOrderHistoryProps {
  orders: FoodOrder[];
  loading: boolean;
}

export function FoodOrderHistory({ orders, loading }: FoodOrderHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
        Your Order History
      </h3>

      {orders.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 p-6">
          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <p className="text-xs font-black text-slate-550 dark:text-slate-400">
            No active or past orders found.
          </p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
            Choose a train and search delivery stops to order food for your journey!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="p-4.5 rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center transition-all hover:shadow-sm"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                      Order #{order.id}
                    </span>
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider',
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : order.status === 'CANCELLED' || order.status === 'FAILED'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-rail-blue/10 text-rail-blue animate-pulse'
                      )}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-bold leading-none">
                    Delivery stop: {order.stationName} ({order.stationCode})
                  </p>

                  <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 font-extrabold pt-1">
                    <Clock className="h-3 w-3" />
                    <span>{dateStr}</span>
                    <span>·</span>
                    <span>₹{order.total} total</span>
                  </div>
                </div>

                <Link
                  href={`/food/orders/${order.id}`}
                  className="inline-flex h-8.5 items-center justify-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10.5px] font-black text-slate-700 dark:text-slate-250 px-3.5 border border-slate-200 dark:border-slate-700 transition-all outline-none"
                >
                  <span>Track</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

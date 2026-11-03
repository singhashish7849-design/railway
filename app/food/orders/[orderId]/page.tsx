'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, ShoppingBag, XCircle, RefreshCw } from 'lucide-react';
import { useFoodOrderTracking } from '@/hooks/useFood';
import { FoodOrderTracker } from '@/components/food/FoodOrderTracker';
import { FoodOrderStatus } from '@/components/food/FoodOrderStatus';

export default function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const orderId = params.orderId;

  // Real-time tracking hook (polls status automatically every 6 seconds)
  const {
    order,
    trainDistanceKm,
    trainEtaText,
    loading,
    error,
    isCancelLoading,
    cancelOrder,
  } = useFoodOrderTracking(orderId);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6 px-4 animate-pulse select-none">
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-44 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6 px-4 text-center select-none">
        <div className="bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 rounded-3xl p-6">
          <p>Could not retrieve details for Order #{orderId}.</p>
          <p className="text-[10px] text-rose-450 mt-1">{error || 'Order not found.'}</p>
        </div>
        <Link
          href="/food"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-slate-250 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to Food Dashboard</span>
        </Link>
      </div>
    );
  }

  // Check if order is eligible for cancellation
  const isCancellable =
    order.status !== 'DELIVERED' &&
    order.status !== 'OUT_FOR_DELIVERY' &&
    order.status !== 'CANCELLED' &&
    order.status !== 'FAILED';

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
        <Link
          href={`/food?trainNumber=${order.trainNumber}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full animate-pulse">
          Order ID: {order.id}
        </span>
      </div>

      {/* Confirmation Card banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 space-y-2 flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xs font-black text-slate-900 dark:text-white leading-none">
            ✓ Food Order Confirmed
          </h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1.5">
            Your payment was processed successfully. The order is being prepared by the restaurant partner.
          </p>
        </div>
      </div>

      {/* Train Live status HUD (Train-Aware Order Tracking) */}
      <FoodOrderStatus
        stationName={order.stationName}
        stationCode={order.stationCode}
        distanceKm={trainDistanceKm}
        etaText={trainEtaText}
        foodStatus={order.status}
      />

      {/* Timeline steps */}
      <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl">
        <FoodOrderTracker status={order.status} />
      </div>

      {/* Delivery Slot info */}
      <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl space-y-3.5">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
          Delivery Details
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs font-bold">
          <div className="space-y-0.5">
            <p className="text-[9.5px] text-slate-400 font-bold uppercase">Passenger</p>
            <p className="text-slate-850 dark:text-white">{order.passengerName}</p>
            <p className="text-[10px] text-slate-450 font-semibold">{order.passengerPhone}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9.5px] text-slate-400 font-bold uppercase">Seat Berth</p>
            <p className="text-slate-850 dark:text-white">
              Coach {order.coach} · Seat {order.seat}
            </p>
          </div>
        </div>

        <div className="h-[1px] bg-slate-150 dark:bg-slate-850" />

        <div className="space-y-2">
          <p className="text-[9.5px] text-slate-400 font-bold uppercase">Items Ordered</p>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-650 dark:text-slate-400">
                {item.name} <span className="text-[10px] text-slate-400">×{item.quantity}</span>
              </span>
              <span className="text-slate-900 dark:text-white">₹{item.totalPrice}</span>
            </div>
          ))}
          <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
            <span>Total Paid (Demo)</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>

      {/* Cancellation Action */}
      {isCancellable && (
        <button
          onClick={cancelOrder}
          disabled={isCancelLoading}
          className="w-full inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 transition-all outline-none active:scale-97 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          <span>{isCancelLoading ? 'Processing Cancellation...' : 'Cancel Order'}</span>
        </button>
      )}
    </div>
  );
}

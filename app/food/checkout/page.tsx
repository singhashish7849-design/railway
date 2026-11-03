'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, User, Phone, CheckCircle, CreditCard, Shield } from 'lucide-react';
import { useFoodCheckout, useFoodCart } from '@/hooks/useFood';
import { cn } from '@/utils/cn';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stationCode = searchParams.get('stationCode') || '';
  const stationName = searchParams.get('stationName') || '';
  const trainNumber = searchParams.get('trainNumber') || '';

  const cartItems = useFoodCart((state) => state.items);
  const subtotal = useFoodCart((state) => state.subtotal());
  const deliveryFee = useFoodCart((state) => state.deliveryFee);
  const tax = useFoodCart((state) => state.tax());
  const total = useFoodCart((state) => state.total());

  const {
    passengerName,
    setPassengerName,
    passengerPhone,
    setPassengerPhone,
    coach,
    setCoach,
    seat,
    setSeat,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    checkoutError,
    placeOrder,
  } = useFoodCheckout(trainNumber);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Simple validations
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setValidationError('Please enter passenger contact details.');
      return;
    }
    if (!coach.trim() || !seat.trim()) {
      setValidationError('Please specify Coach and Seat number for delivery.');
      return;
    }
    if (cartItems.length === 0) {
      setValidationError('Cart is empty. Please add menu items.');
      return;
    }

    try {
      const order = await placeOrder(stationCode, stationName, cartItems);
      router.push(`/food/orders/${order.id}`);
    } catch (err: any) {
      // handled inside hook
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 px-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Menu</span>
        </button>
        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          Confirm Details
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Passenger Information Form */}
        <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-150/40 dark:border-slate-850 pb-2">
            <User className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
              Passenger Information
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Passenger Full Name
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="E.g., Ashish Sharma"
                className="w-full text-xs font-bold p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-rail-blue text-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Mobile Number (for delivery SMS)
              </label>
              <input
                type="tel"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="E.g., +91 9876543210"
                className="w-full text-xs font-bold p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-rail-blue text-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Berth Seat Selection */}
        <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-150/40 dark:border-slate-850 pb-2">
            <Shield className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
              Berth / Seat Selection
            </h3>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            Orders are delivered directly to your coach berth. Please ensure details are correct.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Coach (e.g. B2)
              </label>
              <input
                type="text"
                value={coach}
                onChange={(e) => setCoach(e.target.value.toUpperCase())}
                placeholder="Coach (e.g. B2)"
                className="w-full text-xs font-bold p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-rail-blue text-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                Seat Number (e.g. 36)
              </label>
              <input
                type="text"
                value={seat}
                onChange={(e) => setSeat(e.target.value)}
                placeholder="Seat (e.g. 36)"
                className="w-full text-xs font-bold p-3.5 border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-850 rounded-2xl outline-none focus:border-rail-blue text-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Demo Payment Selector */}
        <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-150/40 dark:border-slate-850 pb-2">
            <CreditCard className="h-4.5 w-4.5 text-emerald-500" />
            <h3 className="text-xs font-extrabold text-slate-450 uppercase tracking-widest">
              Select Payment Method
            </h3>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 text-[10.5px] text-emerald-600 dark:text-emerald-400 rounded-2xl p-3.5 leading-normal">
            <p className="font-extrabold">Demo Payment Mode Active</p>
            <p className="text-[9.5px] mt-0.5 font-semibold opacity-90">
              Payments are simulated. No real cards or wallets will be billed.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { key: 'DEMO_PAY', label: 'Simulated Demo Pay (Auto-approve)', desc: 'Instantly pays and flags order as PAID.' },
              { key: 'UPI', label: 'UPI / Scan QR (Demo)', desc: 'Generates a mock UPI payment gateway request.' },
              { key: 'CARD', label: 'Credit/Debit Card (Demo)', desc: 'Simulates typing card details on sandbox.' }
            ].map((method) => (
              <label
                key={method.key}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors',
                  paymentMethod === method.key
                    ? 'border-rail-blue/45 bg-rail-blue/5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method.key}
                  onChange={() => setPaymentMethod(method.key as any)}
                  className="mt-1"
                />
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {method.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 leading-normal">
                    {method.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Summary & Checkout Actions */}
        <div className="premium-glass-card p-5 border border-slate-250/50 dark:border-slate-800 rounded-3xl space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
            Pricing Summary
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>Station Delivery Charge</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span>GST (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2.5 border-t border-slate-150/40 dark:border-slate-850">
              <span>Total Price</span>
              <span>₹{total}</span>
            </div>
          </div>

          {(validationError || checkoutError) && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-[10.5px] font-bold text-rose-550 rounded-2xl p-3.5 text-center">
              {validationError || checkoutError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Placing Demo Order...' : `Pay & Place Order · ₹${total}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto space-y-6 py-6 px-4 animate-pulse">
        <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

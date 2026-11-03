'use client';

import React, { useState } from 'react';
import { Plus, Ticket, RefreshCw } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { BookingList } from '@/components/bookings/BookingList';
import { BookingSkeleton } from '@/components/bookings/BookingSkeleton';
import { AddBookingModal } from '@/components/bookings/AddBookingModal';

export default function BookingsPage() {
  const { bookings, loading, error, refetchBookings, addBooking, removeBooking } = useBookings();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-left w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rail-blue text-white shadow-glow">
              <Ticket className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              My Bookings
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Your journeys, tickets and travel details in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetchBookings}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 px-4 text-xs font-bold text-white shadow-glow transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Booking</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <BookingSkeleton />
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center space-y-3">
          <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
            Error Loading Bookings
          </p>
          <p className="text-xs text-slate-500 font-medium">{error}</p>
          <button
            onClick={refetchBookings}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-rose-500 text-xs font-bold text-white px-4"
          >
            Try Again
          </button>
        </div>
      ) : (
        <BookingList
          bookings={bookings}
          onAddBooking={() => setIsAddModalOpen(true)}
          onRemoveBooking={removeBooking}
        />
      )}

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBooking={addBooking}
      />
    </div>
  );
}

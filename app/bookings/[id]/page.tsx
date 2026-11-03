'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBooking, useBookings } from '@/hooks/useBookings';
import { BookingDetails } from '@/components/bookings/BookingDetails';
import { BookingSkeleton } from '@/components/bookings/BookingSkeleton';
import { RemoveBookingDialog } from '@/components/bookings/RemoveBookingDialog';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const { booking, loading, error } = useBooking(bookingId);
  const { removeBooking } = useBookings();
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);

  const handleConfirmRemove = async (id: string) => {
    await removeBooking(id);
    router.push('/bookings');
  };

  return (
    <div className="space-y-6 text-left w-full">
      {loading ? (
        <BookingSkeleton />
      ) : error || !booking ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Booking Not Found
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            This booking may have been removed or does not belong to your account.
          </p>
          <button
            onClick={() => router.push('/bookings')}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-rail-blue text-xs font-bold text-white px-4"
          >
            Back to My Bookings
          </button>
        </div>
      ) : (
        <BookingDetails
          booking={booking}
          onRemoveRequest={setSelectedForDelete}
        />
      )}

      <RemoveBookingDialog
        booking={selectedForDelete}
        isOpen={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Booking, BookingCategoryTab } from '@/lib/bookings/types';
import { categorizeBooking } from '@/lib/bookings/service';
import { BookingCard } from './BookingCard';
import { ActiveJourneyCard } from './ActiveJourneyCard';
import { BookingTabs } from './BookingTabs';
import { EmptyBookings } from './EmptyBookings';
import { RemoveBookingDialog } from './RemoveBookingDialog';

interface BookingListProps {
  bookings: Booking[];
  onAddBooking: () => void;
  onRemoveBooking: (id: string) => Promise<void>;
}

export function BookingList({ bookings, onAddBooking, onRemoveBooking }: BookingListProps) {
  const [activeTab, setActiveTab] = useState<BookingCategoryTab>('upcoming');
  const [selectedBookingForDelete, setSelectedBookingForDelete] = useState<Booking | null>(null);

  // Group bookings by category
  const categorized = useMemo(() => {
    const map: Record<BookingCategoryTab, Booking[]> = {
      upcoming: [],
      active: [],
      completed: [],
      cancelled: [],
    };

    bookings.forEach((b) => {
      const cat = categorizeBooking(b);
      map[cat].push(b);
    });

    return map;
  }, [bookings]);

  const counts = useMemo(() => {
    return {
      upcoming: categorized.upcoming.length,
      active: categorized.active.length,
      completed: categorized.completed.length,
      cancelled: categorized.cancelled.length,
    };
  }, [categorized]);

  const currentList = categorized[activeTab];

  if (bookings.length === 0) {
    return <EmptyBookings onAddBooking={onAddBooking} />;
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Category Tabs */}
      <BookingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />

      {/* Active Tab Special Banner */}
      {activeTab === 'active' && currentList.length > 0 && (
        <div className="space-y-4">
          {currentList.map((b) => (
            <ActiveJourneyCard key={b.id} booking={b} />
          ))}
        </div>
      )}

      {/* Bookings List */}
      {currentList.length > 0 ? (
        <div className="space-y-4">
          {currentList.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onRemoveRequest={setSelectedBookingForDelete}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            No {activeTab} bookings found
          </p>
          <p className="text-xs text-slate-500 font-medium">
            You don't have any journeys in this category right now.
          </p>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <RemoveBookingDialog
        booking={selectedBookingForDelete}
        isOpen={!!selectedBookingForDelete}
        onClose={() => setSelectedBookingForDelete(null)}
        onConfirm={onRemoveBooking}
      />
    </div>
  );
}

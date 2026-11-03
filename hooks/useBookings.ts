'use client';

import { useState, useEffect, useCallback } from 'react';
import { Booking, AddBookingInput } from '@/lib/bookings/types';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bookings');
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to view your bookings.');
        } else if (res.status === 403) {
          setError('Access denied. You do not have permission to view these bookings.');
        } else if (res.status === 404) {
          setError('Bookings service endpoint not found.');
        } else if (res.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else {
          const msg = json.error?.message || json.error || 'We couldn\'t load your bookings. Please try again.';
          setError(msg);
        }
        setLoading(false);
        return;
      }

      if (json.success) {
        setBookings(json.bookings || []);
        setError(null);
      } else {
        const msg = json.error?.message || json.error || 'Unable to load bookings.';
        setError(msg);
      }
    } catch (err: any) {
      setError('Unable to connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const addBooking = async (input: AddBookingInput): Promise<Booking> => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to save booking');
    }

    setBookings((prev) => [json.booking, ...prev]);
    return json.booking;
  };

  const removeBooking = async (id: string): Promise<void> => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to remove booking');
    }

    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  return {
    bookings,
    loading,
    error,
    refetchBookings: fetchBookings,
    addBooking,
    removeBooking,
  };
}

export function useBooking(id: string) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function fetchBooking() {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (!res.ok) throw new Error('Booking not found');
        const json = await res.json();
        if (isMounted && json.success) {
          setBooking(json.booking);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading booking');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBooking();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { booking, loading, error };
}

export function useBookingStatus(id: string) {
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/status`);
      const json = await res.json();
      if (res.ok && json.success) {
        setLiveStatus(json.liveStatus);
      } else {
        setError(json.error || 'Railway status unavailable');
      }
    } catch (err: any) {
      setError('Railway information is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { liveStatus, loading, error, refreshStatus: fetchStatus };
}

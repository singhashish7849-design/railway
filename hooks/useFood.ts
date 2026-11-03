'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { useLiveJourney } from './useLiveJourney';
import { calculateGeodesicDistance } from '@/services/stationAlert/stationDistanceService';
import { calculateStationETA } from '@/services/stationAlert/stationEtaService';
import {
  FoodStation,
  FoodRestaurant,
  FoodMenuItem,
  FoodOrder,
  CreateFoodOrderRequest
} from '@/types/food';

/**
 * 1. Zustand Store: useFoodCart
 * Manages global cart state, item quantities, and special instructions.
 */
export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  specialInstructions?: string;
}

interface FoodCartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateInstructions: (menuItemId: string, instructions: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: number;
  tax: () => number;
  total: () => number;
}

export const useFoodCart = create<FoodCartState>((set, get) => ({
  items: [],
  deliveryFee: 30,

  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),

  removeItem: (menuItemId) => set((state) => ({
    items: state.items.filter((i) => i.menuItemId !== menuItemId),
  })),

  updateQuantity: (menuItemId, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter((i) => i.menuItemId !== menuItemId)
      : state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
  })),

  updateInstructions: (menuItemId, instructions) => set((state) => ({
    items: state.items.map((i) =>
      i.menuItemId === menuItemId ? { ...i, specialInstructions: instructions } : i
    ),
  })),

  clearCart: () => set({ items: [] }),

  subtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  tax: () => {
    return Math.round(get().subtotal() * 0.05); // 5% GST
  },

  total: () => {
    const sub = get().subtotal();
    if (sub === 0) return 0;
    return sub + get().deliveryFee + get().tax();
  },
}));

/**
 * 2. Hook: useFoodStations
 * Fetches available food stops along the train route.
 */
export function useFoodStations(trainNumber: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['foodStations', trainNumber],
    queryFn: async () => {
      const res = await fetch(`/api/food/stations?trainNumber=${trainNumber}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch food stations');
      return json.data as { stations: FoodStation[]; mode: string };
    },
    enabled: Boolean(trainNumber),
  });

  return {
    stations: data?.stations || [],
    mode: data?.mode || 'Demo Ordering',
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * 3. Hook: useFoodRestaurants
 * Fetches restaurants servicing a selected delivery station.
 */
export function useFoodRestaurants(stationCode: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['foodRestaurants', stationCode],
    queryFn: async () => {
      const res = await fetch(`/api/food/restaurants?stationCode=${stationCode}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch restaurants');
      return json.data as { restaurants: FoodRestaurant[]; mode: string };
    },
    enabled: Boolean(stationCode),
  });

  return {
    restaurants: data?.restaurants || [],
    mode: data?.mode || 'Demo Ordering',
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * 4. Hook: useFoodMenu
 * Fetches menu items for a selected restaurant.
 */
export function useFoodMenu(restaurantId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['foodMenu', restaurantId],
    queryFn: async () => {
      const res = await fetch(`/api/food/restaurants/${restaurantId}/menu`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to fetch menu');
      return json.data as FoodMenuItem[];
    },
    enabled: Boolean(restaurantId),
  });

  return {
    menu: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}

/**
 * 5. Hook: useFoodCheckout
 * Pre-fills passenger details (including Seat integration) and places order.
 */
export function useFoodCheckout(trainNumber: string) {
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [coach, setCoach] = useState('');
  const [seat, setSeat] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'DEMO_PAY' | 'UPI' | 'CARD'>('DEMO_PAY');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Auto pre-fill Seat Details if available in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSeat = localStorage.getItem(`rail_selected_seat_${trainNumber}`);
    if (savedSeat) {
      try {
        const parsed = JSON.parse(savedSeat);
        if (parsed.coachNumber) setCoach(parsed.coachNumber);
        if (parsed.seatNumber) setSeat(parsed.seatNumber);
      } catch {
        // ignore
      }
    }
  }, [trainNumber]);

  const placeOrder = useCallback(async (
    stationCode: string,
    stationName: string,
    cartItems: CartItem[]
  ): Promise<FoodOrder> => {
    if (!passengerName.trim() || !passengerPhone.trim()) {
      throw new Error('Please fill in passenger contact details.');
    }
    if (!coach.trim() || !seat.trim()) {
      throw new Error('Please select your coach and seat number for delivery.');
    }
    if (cartItems.length === 0) {
      throw new Error('Your cart is empty.');
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const reqBody: CreateFoodOrderRequest = {
        trainNumber,
        stationCode,
        stationName,
        passengerName,
        passengerPhone,
        coach,
        seat,
        paymentMethod,
        items: cartItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          specialInstructions: i.specialInstructions,
        })),
      };

      const res = await fetch('/api/food/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqBody),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to place food order.');
      }

      // Clear cart on success
      useFoodCart.getState().clearCart();

      return json.data as FoodOrder;
    } catch (err: any) {
      setCheckoutError(err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [trainNumber, passengerName, passengerPhone, coach, seat, paymentMethod]);

  return {
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
  };
}

/**
 * 6. Hook: useFoodOrderTracking
 * Real-time order tracking connected with live train telemetry (distance + ETA).
 */
export function useFoodOrderTracking(orderId: string) {
  const [order, setOrder] = useState<FoodOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  // Poll order status every 6 seconds
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/food/orders/${orderId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch status');
      setOrder(json.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 6000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Hook into live train tracking
  const trainNumber = order?.trainNumber || '';
  const { data: journey } = useLiveJourney(trainNumber);

  // Calculate live distance and ETA to delivery station
  const trainProgress = useMemo(() => {
    if (!journey || !order?.stationCode) {
      return { distanceKm: null, etaText: 'ETA unavailable' };
    }

    const station = journey.stations.find((s) => s.code === order.stationCode);
    if (!station) {
      return { distanceKm: null, etaText: 'ETA unavailable' };
    }

    const dist = calculateGeodesicDistance(
      journey.currentLocation?.lat,
      journey.currentLocation?.lng,
      station.lat,
      station.lng
    );

    const etaText = calculateStationETA(journey, order.stationCode, dist || 0).text;

    return {
      distanceKm: dist,
      etaText,
    };
  }, [journey, order?.stationCode]);

  const cancelOrder = useCallback(async () => {
    setIsCancelLoading(true);
    try {
      const res = await fetch(`/api/food/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to cancel order');
      await fetchStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelLoading(false);
    }
  }, [orderId, fetchStatus]);

  return {
    order,
    trainDistanceKm: trainProgress.distanceKm,
    trainEtaText: trainProgress.etaText,
    loading,
    error,
    isCancelLoading,
    cancelOrder,
  };
}

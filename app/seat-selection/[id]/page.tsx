'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
  Check,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Seat, SeatAvailabilityStatus, BerthType } from '@/types/seat';
import { cn } from '@/utils/cn';

interface SeatSelectionData {
  train: {
    number: string;
    name: string;
  };
  journeyDate: string;
  coach: {
    number: string;
    classCode: string;
  };
  seats: Seat[];
  source: {
    provider: string;
    fetchedAt: string;
  };
  availableClasses: { code: string; name: string }[];
  coaches: { number: string; position: number; classCode: string }[];
  layout: {
    rows: number;
    columns: number;
  };
}

export default function SeatSelectionPage({ params }: { params: { id: string } }) {
  const trainNumber = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get('date');

  // Parameters State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [simulateFail, setSimulateFail] = useState<string>('none'); // 'none' | 'primary' | 'all'

  // Fetch States
  const [data, setData] = useState<SeatSelectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedSec, setLastUpdatedSec] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Reservation States
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [passengerName, setPassengerName] = useState<string>('');
  const [passengerAge, setPassengerAge] = useState<string>('');
  const [passengerGender, setPassengerGender] = useState<string>('M');
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Changed seats for flash animations
  const [changedSeats, setChangedSeats] = useState<Record<string, boolean>>({});

  // Refs for tracking changes
  const prevSeatsRef = useRef<Seat[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse error parameters or validate date
  const dateStr = date || '';

  // 1. Initial Fetch and State Setup
  useEffect(() => {
    if (!dateStr) {
      setError('Journey date is required to view seat availability.');
      setLoading(false);
      return;
    }
    fetchSeatData(true);
  }, [trainNumber, dateStr]);

  // 2. Fetch seat data when class/coach/fail simulation changes
  useEffect(() => {
    if (selectedClass && dateStr) {
      fetchSeatData(false);
    }
  }, [selectedClass, selectedCoach, simulateFail]);

  // 3. Set up active polling (every 8 seconds) and ticking timer (every 1 second)
  useEffect(() => {
    if (!dateStr || error || loading) return;

    // Polling Interval
    intervalRef.current = setInterval(() => {
      fetchSeatData(false, true);
    }, 8000);

    // Ticking Timer
    timerRef.current = setInterval(() => {
      setLastUpdatedSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedClass, selectedCoach, simulateFail, error, loading]);

  const fetchSeatData = async (initial = false, polling = false) => {
    if (initial) setLoading(true);
    if (polling) setIsRefreshing(true);

    try {
      let url = `/api/seat-selection?trainNumber=${trainNumber}&date=${dateStr}`;
      if (selectedClass && !initial) {
        url += `&classCode=${selectedClass}`;
      }
      if (selectedCoach && !initial) {
        url += `&coachNumber=${selectedCoach}`;
      }
      if (simulateFail !== 'none') {
        url += `&simulateFail=${simulateFail}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch seat layouts.');
      }

      const freshData = json.data as SeatSelectionData;

      // Detect status changes for seat animation
      if (prevSeatsRef.current.length > 0 && freshData.seats) {
        const changes: Record<string, boolean> = {};
        let hasChanges = false;

        const prevMap = new Map(prevSeatsRef.current.map((s) => [s.number, s.status]));

        freshData.seats.forEach((seat) => {
          const prevStatus = prevMap.get(seat.number);
          if (prevStatus && prevStatus !== seat.status) {
            changes[seat.id] = true;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          setChangedSeats(changes);
          // Clear flash animation after 2.5s
          setTimeout(() => setChangedSeats({}), 2500);
        }
      }

      // Update refs and states
      prevSeatsRef.current = freshData.seats || [];
      setData(freshData);
      setLastUpdatedSec(0);
      setError(null);

      // Auto-select class & coach if not already set
      if (initial) {
        setSelectedClass(freshData.coach.classCode);
        setSelectedCoach(freshData.coach.number);
      }
    } catch (err: any) {
      console.error(err);
      if (initial) {
        setError(err.message || 'We could not retrieve the verified coach configuration for this journey.');
      } else {
        // Log in UI but keep displaying stale data
        setBookingError(`Update failed: ${err.message}`);
        setTimeout(() => setBookingError(null), 3000);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (['OCCUPIED', 'BLOCKED', 'RESERVED'].includes(seat.status)) return;
    if (selectedSeat?.id === seat.id) {
      setSelectedSeat(null);
    } else {
      setSelectedSeat(seat);
      setBookingSuccess(false);
      setBookingError(null);
    }
  };

  const handleLockSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat || !data) return;
    if (!passengerName.trim() || !passengerAge.trim()) {
      setBookingError('Please enter passenger details.');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/seat-selection/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber: data.train.number,
          journeyDate: data.journeyDate,
          coachNumber: data.coach.number,
          seatNumber: parseInt(selectedSeat.number),
          passengerName,
          passengerAge: parseInt(passengerAge),
          passengerGender,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Concurrency Conflict 409
        if (res.status === 409) {
          throw new Error(json.error || 'Seat was just reserved by another passenger.');
        }
        throw new Error(json.error || 'Reservation failed.');
      }

      // Save seat info to localStorage on success
      localStorage.setItem(`rail_selected_seat_${data.train.number}`, JSON.stringify({
        coachNumber: data.coach.number,
        seatNumber: selectedSeat.number,
        type: selectedSeat.type
      }));

      // Automatically save journey to public.bookings database for authenticated user
      try {
        const generatedPnr = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pnr: generatedPnr,
            trainNumber: data.train.number,
            trainName: data.train.name,
            journeyDate: data.journeyDate,
            classCode: data.coach.classCode || selectedClass || '2A',
          }),
        });
      } catch (saveErr) {
        console.warn('[AUTOMATIC BOOKING SAVE] Non-critical error auto-saving booking:', saveErr);
      }

      setBookingSuccess(true);
      // Immediately refresh seats to show occupied/reserved state
      fetchSeatData(false);
    } catch (err: any) {
      setBookingError(err.message);
      // Immediately refresh seats to sync status
      fetchSeatData(false);
    } finally {
      setIsBooking(false);
    }
  };

  // Helper to trigger a mock race condition
  const triggerRaceCondition = async () => {
    if (!selectedSeat || !data) return;
    setBookingError(null);
    setIsBooking(true);

    try {
      // 1. Simulating another user booking this seat first
      const lockRes = await fetch('/api/seat-selection/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber: data.train.number,
          journeyDate: data.journeyDate,
          coachNumber: data.coach.number,
          seatNumber: parseInt(selectedSeat.number),
          passengerName: 'Simulated Parallel User',
          passengerAge: 29,
          passengerGender: 'F',
        }),
      });

      // 2. Try to book it ourselves, which should now conflict
      const res = await fetch('/api/seat-selection/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainNumber: data.train.number,
          journeyDate: data.journeyDate,
          coachNumber: data.coach.number,
          seatNumber: parseInt(selectedSeat.number),
          passengerName,
          passengerAge: parseInt(passengerAge) || 30,
          passengerGender,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Conflict detected.');
      }
    } catch (err: any) {
      setBookingError(err.message);
      // Sync layout
      fetchSeatData(false);
    } finally {
      setIsBooking(false);
    }
  };

  const getBerthTypeAbbreviation = (type: BerthType) => {
    switch (type) {
      case 'LOWER': return 'LB';
      case 'MIDDLE': return 'MB';
      case 'UPPER': return 'UB';
      case 'SIDE_LOWER': return 'SL';
      case 'SIDE_UPPER': return 'SU';
      case 'SIDE_MIDDLE': return 'SM';
      case 'WINDOW': return 'WS';
      case 'MIDDLE_SEAT': return 'MS';
      case 'AISLE': return 'AS';
      default: return 'UB';
    }
  };

  const getBerthTypeName = (type: BerthType) => {
    switch (type) {
      case 'LOWER': return 'Lower Berth';
      case 'MIDDLE': return 'Middle Berth';
      case 'UPPER': return 'Upper Berth';
      case 'SIDE_LOWER': return 'Side Lower';
      case 'SIDE_UPPER': return 'Side Upper';
      case 'SIDE_MIDDLE': return 'Side Middle';
      case 'WINDOW': return 'Window Seat';
      case 'MIDDLE_SEAT': return 'Middle Seat';
      case 'AISLE': return 'Aisle Seat';
      default: return 'Berth';
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'authorized-railway-provider':
        return '✓ Railway Live API (Primary)';
      case 'secondary-railway-provider':
        return '○ Secondary Authorized API';
      case 'verified-local-cache':
        return '⚠ Offline Cached Layout';
      default:
        return 'Offline Snapshot';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-4 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[600px] rounded-3xl" />
          <Skeleton className="lg:col-span-4 h-[600px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-4">
        <Link
          href={data ? `/train/${trainNumber}` : '/'}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rail-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Details
        </Link>
        <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-rose-500/20">
          <div className="text-4xl text-rose-500">💺</div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Seat Layout Unavailable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {error || "We couldn't retrieve the verified coach configuration for this journey."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchSeatData(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-rail-blue px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:bg-sky-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 max-w-7xl mx-auto">
      {/* ─── Top navigation & header ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={`/train/${trainNumber}?date=${dateStr}`}
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Live Tracking
        </Link>

        {/* Polling Tick & Provider Source */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border',
            data.source.provider === 'authorized-railway-provider'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : data.source.provider === 'secondary-railway-provider'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
          )}>
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              data.source.provider === 'authorized-railway-provider'
                ? 'bg-emerald-500 animate-pulse'
                : data.source.provider === 'secondary-railway-provider'
                ? 'bg-amber-400'
                : 'bg-rose-500'
            )} />
            <span>{getProviderLabel(data.source.provider)}</span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            <span>Updated {lastUpdatedSec}s ago</span>
          </div>
        </div>
      </div>

      {/* ─── Journey Info Bar ─── */}
      <div className="glass-panel rounded-3xl p-5 border border-sky-500/10 shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-lg bg-rail-blue/10 px-2 py-0.5 font-mono text-xs font-extrabold text-rail-blue">
              {data.train.number}
            </span>
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {data.train.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Journey Date: <strong>{data.journeyDate}</strong></span>
          </p>
        </div>

        {/* Dynamic Class & Coach Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedCoach(''); // Let API auto-resolve first coach
                setSelectedSeat(null);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer outline-none focus:border-rail-blue"
            >
              {data.availableClasses.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Coach</label>
            <select
              value={selectedCoach}
              onChange={(e) => {
                setSelectedCoach(e.target.value);
                setSelectedSeat(null);
              }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer outline-none focus:border-rail-blue"
            >
              {data.coaches.map((c) => (
                <option key={c.number} value={c.number}>{c.number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Legend Indicator ─── */}
      <div className="flex flex-wrap gap-3 items-center text-xs font-bold bg-slate-100 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest mr-1">Seat Status:</span>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-emerald-500 bg-emerald-500/10" />
          <span className="text-slate-600 dark:text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-rose-500/30 bg-rose-500/10" />
          <span className="text-slate-400">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-amber-500/50 bg-amber-500/10" />
          <span className="text-slate-500">Reserved / Held</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-indigo-500/50 bg-indigo-500/10" />
          <span className="text-slate-500">RAC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-yellow-500/50 bg-yellow-500/10" />
          <span className="text-slate-500">Waitlist</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-slate-500/30 bg-slate-500/10" />
          <span className="text-slate-500">Blocked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded border border-rail-blue bg-rail-blue" />
          <span className="text-rail-blue">Your Choice</span>
        </div>
      </div>

      {/* ─── Main Work Area ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Coach seat grid (Layout Engine) */}
        <div className="lg:col-span-8 flex flex-col items-center glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Coach {data.coach.number} Layout
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Engine: Grid-coordinate mapping · Column 3 represents central aisle
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <span>◄ Engine</span>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span>Guard Cabin ►</span>
            </div>
          </div>

          {/* Coach Blueprint Wrapper */}
          <div className="w-full overflow-x-auto py-4 flex justify-start md:justify-center items-center bg-slate-900/10 dark:bg-slate-950/40 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            {/* The Coach body representation */}
            <div className="relative border-y-4 border-x-[12px] border-slate-400 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-4 sm:px-8 py-6 rounded-[2.5rem] flex items-center justify-center min-w-0 max-w-full sm:min-w-[500px]">
              {/* Windows decoration top & bottom */}
              <div className="absolute top-1 left-16 right-16 flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-1 w-6 bg-slate-300 dark:bg-slate-800 rounded-sm" />
                ))}
              </div>
              <div className="absolute bottom-1 left-16 right-16 flex justify-between">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="h-1 w-6 bg-slate-300 dark:bg-slate-800 rounded-sm" />
                ))}
              </div>

              {/* Layout Grid Container */}
              <div
                className="grid gap-2 relative"
                style={{
                  gridTemplateRows: `repeat(${data.layout.rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${data.layout.columns}, minmax(0, 1fr))`,
                  width: `${data.layout.columns * 62}px`,
                }}
              >
                {data.seats.map((seat) => {
                  const isSelected = selectedSeat?.id === seat.id;
                  const isOccupied = seat.status === 'OCCUPIED';
                  const isBlocked = seat.status === 'BLOCKED';
                  const isReserved = seat.status === 'RESERVED';
                  const isRac = seat.status === 'RAC';
                  const isWaitlisted = seat.status === 'WAITLISTED';
                  const isUnknown = seat.status === 'UNKNOWN';

                  const isChanged = changedSeats[seat.id];

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isOccupied || isBlocked || isReserved}
                      style={{
                        gridRowStart: seat.position.row + 1,
                        gridColumnStart: seat.position.column + 1,
                      }}
                      className={cn(
                        'relative flex flex-col items-center justify-center h-12 w-12 rounded-xl text-[10px] font-bold border transition-all duration-300 active:scale-90',
                        // Availability States Styling
                        isSelected
                          ? 'bg-rail-blue border-rail-blue text-white shadow-glow animate-pulse-glow z-10 scale-105'
                          : isOccupied
                          ? 'bg-rose-500/10 border-rose-500/15 text-rose-500/40 dark:text-rose-500/30 cursor-not-allowed'
                          : isBlocked
                          ? 'bg-slate-500/5 border-slate-500/10 text-slate-400/40 cursor-not-allowed'
                          : isReserved
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500/80 cursor-not-allowed'
                          : isRac
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400/90 hover:bg-indigo-500/20'
                          : isWaitlisted
                          ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400/90 hover:bg-yellow-500/20'
                          : isUnknown
                          ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20 hover:scale-102 hover:shadow-sm',
                        // Live Change Pulse Flashing
                        isChanged && 'ring-4 ring-rail-cyan duration-500 scale-110 rotate-3 z-20'
                      )}
                      title={`${getBerthTypeName(seat.type)} - ${seat.status}`}
                    >
                      {/* Seat Number */}
                      <span className="text-xs leading-none">{seat.number}</span>
                      {/* Type abbreviation (LB, MB, UB...) */}
                      <span className={cn(
                        'text-[8px] font-semibold opacity-60 mt-0.5',
                        isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
                      )}>
                        {getBerthTypeAbbreviation(seat.type)}
                      </span>

                      {/* Small visual change notifier */}
                      {isChanged && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rail-cyan opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rail-cyan"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Passenger details and Seat reservation action */}
        <div className="lg:col-span-4 space-y-6">
          {/* Passenger Input Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-rail-blue" />
              Passenger Information
            </h3>

            {bookingSuccess ? (
              <div className="space-y-4 text-center py-4 animate-in fade-in zoom-in-95">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Seat Selection Preferred!</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Seat <strong>{selectedSeat?.number} ({selectedSeat?.type})</strong> in Coach <strong>{data.coach.number}</strong> has been saved as preferred.
                  </p>
                </div>

                {/* Local Booking Warning Disclaimer */}
                <div className="bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 rounded-xl p-3 text-left leading-normal">
                  <div className="flex gap-2 items-start">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Important Notice:</strong> Selection of preferred seats is for layout allocation preferences only. To finalize your actual ticket booking, please proceed to confirm through the authorized reservation system.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/bookings"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-rail-blue hover:bg-sky-600 font-bold text-xs text-white px-4 py-2 shadow-glow transition-all"
                  >
                    View Saved Booking in My Bookings →
                  </Link>
                  <a
                    href="https://www.irctc.co.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold text-xs text-slate-700 dark:text-slate-200 px-4 py-2 transition-all"
                  >
                    Proceed to Official IRCTC Portal
                  </a>
                  <button
                    onClick={() => {
                      setSelectedSeat(null);
                      setPassengerName('');
                      setPassengerAge('');
                      setBookingSuccess(false);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-xs text-slate-600 dark:text-slate-300 px-4 py-2 transition-all"
                  >
                    Choose Another Seat
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLockSeat} className="space-y-4">
                {selectedSeat ? (
                  <div className="bg-rail-blue/5 border border-rail-blue/15 rounded-2xl p-4 flex items-center justify-between text-xs animate-in slide-in-from-top-2">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Selected Berth</p>
                      <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">
                        Berth {selectedSeat.number} ({getBerthTypeName(selectedSeat.type)})
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Coach {data.coach.number} · Class {data.coach.classCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSeat(null)}
                      className="text-xs font-semibold text-rail-blue hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center text-xs text-slate-500">
                    <p>No seat selected</p>
                    <p className="text-[10px] text-slate-400 mt-1">Please select an available green berth from the layout grid.</p>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passenger Full Name</label>
                  <input
                    type="text"
                    disabled={!selectedSeat}
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue disabled:opacity-50"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</label>
                    <input
                      type="number"
                      disabled={!selectedSeat}
                      value={passengerAge}
                      onChange={(e) => setPassengerAge(e.target.value)}
                      placeholder="e.g. 28"
                      min="1"
                      max="120"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                    <select
                      disabled={!selectedSeat}
                      value={passengerGender}
                      onChange={(e) => setPassengerGender(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-rail-blue disabled:opacity-50 cursor-pointer"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>

                {/* Error Banner */}
                {bookingError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-500 rounded-xl p-3 flex gap-2 items-start animate-shake">
                    <AlertTriangle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={!selectedSeat || isBooking}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 disabled:opacity-50 font-bold text-xs text-white px-4 py-2 shadow-glow transition-all"
                  >
                    {isBooking ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Locking Seat...</span>
                      </>
                    ) : (
                      <span>Select Preferred Seat</span>
                    )}
                  </button>

                  {/* Race Condition Simulator Trigger */}
                  {selectedSeat && (
                    <button
                      type="button"
                      disabled={isBooking}
                      onClick={triggerRaceCondition}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 font-bold text-xs text-rose-500 px-4 py-2 transition-all"
                      title="Simulates a parallel user booking this seat split-seconds before you, testing conflict resolution."
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Simulate Lock Race (409 Conflict)</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Guidelines Sidebar Card */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rail-blue" />
              Verified Seat Allocation Rules
            </h4>
            <ul className="list-disc pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Berths are allocated based on dynamic availability from authorized railway reserves.</li>
              <li>Aisle column spacing is visually kept clear to match actual coach floor plans.</li>
              <li>Sleeper compartments feature side berths matching standard 3A/2A Indian Railway coaches.</li>
              <li>Real-time seat locks expire after 5 minutes if not completed on official booking portals.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Debug Simulation Panel at bottom ─── */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5 mt-6">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-amber-500" />
          Provider Fallback Debug Console (15. Fallback Architecture)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-normal">
          Toggle simulation flags below to test the provider fallback sequence in the NextJS api routes. Look at the data source indicator in the top right to verify which channel serves the seat map.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSimulateFail('none')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
              simulateFail === 'none'
                ? 'bg-rail-blue text-white border-rail-blue shadow-glow'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            1. Primary Live Provider (Default)
          </button>
          <button
            onClick={() => setSimulateFail('primary')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
              simulateFail === 'primary'
                ? 'bg-amber-500 text-white border-amber-500 shadow-glow'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            2. Fail Primary (Fallback to Secondary Provider)
          </button>
          <button
            onClick={() => setSimulateFail('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all border',
              simulateFail === 'all'
                ? 'bg-rose-500 text-white border-rose-500 shadow-glow'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            3. Fail All Providers (Fallback to Cached snapshots)
          </button>
        </div>
      </div>
    </div>
  );
}

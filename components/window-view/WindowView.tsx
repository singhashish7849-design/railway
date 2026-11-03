'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle } from 'lucide-react';
import { useWindowView } from '@/hooks/useWindowView';
import { useLiveJourney } from '@/hooks/useLiveJourney';
import { WindowHeader } from './WindowHeader';
import { WindowControls } from './WindowControls';
import { WindowFeatureCard } from './WindowFeatureCard';
import { ComingUpCard } from './ComingUpCard';
import { WindowTimeline } from './WindowTimeline';
import { WindowSceneRenderer } from './WindowSceneRenderer';
import { Skeleton } from '@/components/ui/Skeleton';
import { WindowFeature } from '@/types/windowView';
import { useQuery } from '@tanstack/react-query';
import { calculateGeodesicDistance } from '@/services/stationAlert/stationDistanceService';

// Dynamic import of MapView to avoid SSR window errors
const MapView = dynamic(() => import('@/features/maps/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[350px] w-full items-center justify-center rounded-3xl bg-slate-900/30">
      <Loader2 className="h-8 w-8 animate-spin text-rail-blue" />
    </div>
  ),
});

interface WindowViewProps {
  trainNumber: string;
}

export function WindowView({ trainNumber }: WindowViewProps) {
  const { data: windowData, isLoading, isError, error, refetch, isRefetching } = useWindowView(trainNumber);
  const { data: journey } = useLiveJourney(trainNumber);

  // States
  const [activeTab, setActiveTab] = useState<'window' | 'map'>('window');
  const [autoView, setAutoView] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<WindowFeature | null>(null);
  const [isNightOverride, setIsNightOverride] = useState<boolean | null>(null);

  // Query food orders to connect with Window View stop notices
  const { data: pastOrdersJson } = useQuery({
    queryKey: ['pastFoodOrders'],
    queryFn: async () => {
      const res = await fetch('/api/food/orders');
      const json = await res.json();
      return json.success ? json.data : [];
    }
  });

  const activeFoodOrder = useMemo(() => {
    return (pastOrdersJson || []).find(
      (o: any) =>
        o.trainNumber === trainNumber &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED' &&
        o.status !== 'FAILED'
    );
  }, [pastOrdersJson, trainNumber]);

  const foodAlert = useMemo(() => {
    if (!activeFoodOrder || !journey) return null;
    const station = journey.stations.find((s) => s.code === activeFoodOrder.stationCode);
    if (!station) return null;

    const dist = calculateGeodesicDistance(
      journey.currentLocation?.lat,
      journey.currentLocation?.lng,
      station.lat,
      station.lng
    );

    // If within 15km, trigger Window View alert stops
    if (dist !== null && dist <= 15) {
      return {
        stationName: activeFoodOrder.stationName,
        seat: `${activeFoodOrder.coach}-${activeFoodOrder.seat}`
      };
    }
    return null;
  }, [activeFoodOrder, journey]);

  // Automatically update the selected feature if Auto-View is enabled
  useEffect(() => {
    if (autoView && windowData?.currentFeature) {
      setSelectedFeature(windowData.currentFeature);
    } else if (autoView && !windowData?.currentFeature) {
      setSelectedFeature(null);
    }
  }, [autoView, windowData?.currentFeature]);

  // Loading / Skeleton state
  if (isLoading) {
    return (
      <div className="space-y-6 py-4 max-w-7xl mx-auto">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-12 w-[350px] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[450px] rounded-3xl" />
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-[200px] rounded-3xl" />
            <Skeleton className="h-[180px] rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !windowData) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-4 text-center">
        <div className="glass-panel rounded-3xl p-8 border border-rose-500/20 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Live Tracking Unavailable</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            { (error as Error)?.message || 'We could not fetch the Window View intelligence telemetry for this train.' }
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-rail-blue px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-sky-600 transition-all"
            >
              Retry Telemetry Link
            </button>
            <a
              href={`/train/${trainNumber}`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              Back to Train Info
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle manual selection on the timeline
  const handleFeatureSelect = (feat: WindowFeature) => {
    setAutoView(false); // turn off auto view when selecting manually
    setSelectedFeature(feat);
  };

  const weather = windowData.weather;
  const location = windowData.location;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* 1. Header component */}
      <WindowHeader
        trainNumber={trainNumber}
        trainName={windowData.train.name}
        speedKmh={location.speedKmh}
        isMoving={location.isMoving}
        elevation={windowData.elevation}
        weatherTemp={weather?.tempC}
        weatherCondition={weather?.condition}
        isRefreshing={isRefetching}
        onRefresh={() => refetch()}
      />

      {/* 2. Controls component */}
      <WindowControls
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        autoView={autoView}
        setAutoView={setAutoView}
        isNightOverride={isNightOverride}
        setIsNightOverride={setIsNightOverride}
      />

      {/* 3. Main Work Layout (Responsive side-by-side or stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Active Visual Canvas */}
        <div className="lg:col-span-8 relative">
          {/* Floating approaching notifications overlay */}
          <ComingUpCard upcomingFeatures={windowData.upcomingFeatures} />

          {/* Subtle Food Delivery stops banner indicator */}
          {foodAlert && (
            <div className="absolute bottom-4 left-4 z-40 bg-emerald-600/90 text-white backdrop-blur-md rounded-2xl px-4 py-2 border border-emerald-500/30 flex gap-2 items-center shadow-lg animate-in slide-in-from-bottom-2 text-xs font-bold font-sans">
              <span className="animate-pulse">🍱</span>
              <span>Food Stop Ahead: {foodAlert.stationName} (Seat {foodAlert.seat})</span>
            </div>
          )}

          {activeTab === 'window' ? (
            <div className="w-full aspect-[16/10] md:h-[450px]">
              <WindowSceneRenderer
                currentFeature={selectedFeature}
                weatherCondition={weather?.condition}
                isNightOverride={isNightOverride}
                elevation={windowData.elevation}
              />
            </div>
          ) : (
            <div className="w-full aspect-[16/10] md:h-[450px] overflow-hidden rounded-3xl shadow-glass border border-slate-200/20 dark:border-slate-800/40 bg-slate-900">
              {journey ? (
                <MapView journey={journey} className="h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-rail-blue" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right / Bottom: Informational Panels */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active geographic POI details card */}
          <WindowFeatureCard
            feature={selectedFeature}
            trainNumber={trainNumber}
            trainName={windowData.train.name}
          />

          {/* Timeline of upcoming landmarks along journey */}
          <WindowTimeline
            upcomingFeatures={windowData.upcomingFeatures}
            activeFeature={selectedFeature}
            onFeatureSelect={handleFeatureSelect}
          />
        </div>
      </div>
    </div>
  );
}

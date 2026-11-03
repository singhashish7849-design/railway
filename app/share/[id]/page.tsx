'use client';

import React from 'react';
import Link from 'next/link';
import { Train, ShieldCheck } from 'lucide-react';
import { useLiveJourney } from '@/hooks/useLiveJourney';
import { JourneyCard } from '@/components/journey/JourneyCard';
import { Timeline } from '@/components/journey/Timeline';
import { Skeleton } from '@/components/ui/Skeleton';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/features/maps/MapView'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-3xl" />,
});

export default function ShareJourneyPage({ params }: { params: { id: string } }) {
  const { data: journey, isLoading } = useLiveJourney(params.id);

  if (isLoading) {
    return (
      <div className="py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="py-12 max-w-md mx-auto text-center space-y-4">
        <div className="glass-panel rounded-3xl p-8 space-y-3">
          <Train className="h-10 w-10 text-rail-blue mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Shared Journey Unavailable</h2>
          <p className="text-xs text-slate-500">Live journey stream for train #{params.id} is currently unavailable or inactive.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-rail-blue px-4 py-2 text-xs font-bold text-white shadow-glow hover:bg-sky-600 transition-colors mt-2"
          >
            Track Any Train
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Banner */}
      <div className="glass-panel flex items-center justify-between rounded-2xl px-6 py-3 border border-rail-blue/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-rail-blue">
          <ShieldCheck className="h-4 w-4" />
          <span>Public Shared Live Journey Stream</span>
        </div>
        <Link
          href="/"
          className="text-xs font-bold text-slate-800 dark:text-white hover:text-rail-blue transition-colors"
        >
          Track another train →
        </Link>
      </div>

      <JourneyCard journey={journey} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MapView journey={journey} className="h-[420px] w-full" />
        </div>
        <div className="lg:col-span-5">
          <Timeline stations={journey.stations} />
        </div>
      </div>
    </div>
  );
}

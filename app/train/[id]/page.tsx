'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Share2, Check, MapPin, CloudSun, Mountain, AlertCircle } from 'lucide-react';
import { useLiveJourney } from '@/hooks/useLiveJourney';
import { JourneyCard } from '@/components/journey/JourneyCard';
import { Timeline } from '@/components/journey/Timeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { WeatherPanel } from '@/features/weather/WeatherPanel';
import { AnalyticsDashboard } from '@/features/analytics/AnalyticsDashboard';
import { TerrainPanel } from '@/features/terrain/TerrainPanel';
import { MobileJourneySummary } from '@/components/layout/MobileJourneySummary';
import { useJourneyStore } from '@/store/journey';
import { cn } from '@/utils/cn';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';

import { FoodJourneyCard } from '@/components/food/FoodJourneyCard';
import { FoodButton } from '@/components/food/FoodButton';
import { EmergencyButton } from '@/components/emergency/EmergencyButton';
import { useEmergency } from '@/hooks/useEmergency';
import { EmergencyOfflineBanner } from '@/components/emergency/EmergencyOfflineBanner';
import { emergencyStorageService } from '@/services/emergency/emergencyStorageService';

import { useStationAlert } from '@/hooks/useStationAlert';
import { StationAlertButton } from '@/components/station-alert/StationAlertButton';
import { StationAlertModal } from '@/components/station-alert/StationAlertModal';
import { StationAlertCard } from '@/components/station-alert/StationAlertCard';
import { StationAlertProgress } from '@/components/station-alert/StationAlertProgress';
import { StationAlertSettings } from '@/components/station-alert/StationAlertSettings';
import { StationAlertNotification } from '@/components/station-alert/StationAlertNotification';

const MapView = dynamic(() => import('@/features/maps/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full items-center justify-center rounded-3xl bg-slate-900/30">
      <Skeleton className="h-full w-full rounded-3xl" />
    </div>
  ),
});

const TABS = [
  { id: 'map', label: 'Live Map', icon: MapPin },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'analytics', label: 'Terrain & Analytics', icon: Mountain },
] as const;

type TabId = typeof TABS[number]['id'];

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  running: {
    label: 'Running',
    color: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
    dot: 'bg-emerald-500 animate-pulse',
  },
  not_started: {
    label: 'Not Started',
    color: 'bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  completed: {
    label: 'Journey Complete',
    color: 'bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
};

export default function TrainJourneyPage({ params }: { params: { id: string } }) {
  const trainId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const country = searchParams.get('country') || undefined;

  const { data: journey, isLoading, isError, error, refetch, isRefetching } = useLiveJourney(trainId, country);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [travelDate, setTravelDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const setActiveTrainId = useJourneyStore((state) => state.setActiveTrainId);

  // Station Alerts States & Hooks
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetAlertStation, setTargetAlertStation] = useState<any>(null);

  const {
    selectedStation,
    distanceKm,
    eta,
    isEnabled,
    enableAlert,
    disableAlert,
    seatInfo,
    selectedStationCode
  } = useStationAlert(journey?.number || trainId);

  const { activateEmergencyMode } = useEmergency();
  const [isJourneyCached, setIsJourneyCached] = useState(false);

  const handleEmergencyTrigger = () => {
    if (!journey) return;
    const activeCoach = seatInfo?.coachNumber || 'B2';
    const activeSeat = seatInfo?.seatNumber || '36';
    
    activateEmergencyMode({
      trainNumber: journey.number,
      trainName: journey.name,
      coach: activeCoach,
      seat: activeSeat,
      currentStation: journey.currentStation?.name || journey.previousStation?.name || 'In Transit',
      nextStation: journey.nextStation?.name || 'N/A',
      destination: journey.destination.name,
      journeyDate: travelDate
    });
  };

  // Cache journey details on active load if online
  useEffect(() => {
    if (journey && typeof window !== 'undefined') {
      const isOnline = navigator.onLine;
      if (isOnline) {
        const stationCoords: Record<string, { lat: number; lng: number }> = {};
        journey.stations.forEach((st) => {
          stationCoords[st.code] = { lat: st.lat, lng: st.lng };
        });

        emergencyStorageService.cacheJourney({
          trainNumber: journey.number,
          trainName: journey.name,
          route: `${journey.origin.code}-${journey.destination.code}`,
          stationList: journey.stations,
          stationCoordinates: stationCoords,
          destination: journey.destination.name,
          coach: seatInfo?.coachNumber || 'B2',
          seat: seatInfo?.seatNumber || '36',
          emergencyContacts: [],
          lastKnownPosition: journey.currentLocation ? { lat: journey.currentLocation.lat, lng: journey.currentLocation.lng } : undefined,
          lastUpdateTimestamp: new Date().toISOString()
        })
        .then(() => setIsJourneyCached(true))
        .catch((err) => console.error('Failed to cache journey details offline:', err));
      } else {
        // Offline: check if cache exists
        emergencyStorageService.getCachedJourney(journey.number).then((cached) => {
          setIsJourneyCached(Boolean(cached));
        });
      }
    }
  }, [journey, seatInfo]);

  useEffect(() => {
    setActiveTrainId(trainId);
  }, [trainId, setActiveTrainId]);

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    if (typeof navigator.share === 'function') {
      navigator
        .share({ title: `RailGaadi – ${journey?.name || `Train #${trainId}`}`, url: shareUrl })
        .catch(() => {
          navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-12 w-80 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-[480px] rounded-3xl" />
          <Skeleton className="lg:col-span-5 h-[480px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !journey) {
    const errMsg = (error as Error)?.message || '';
    const isQuotaError = errMsg.includes('QUOTA_EXCEEDED') || errMsg.includes('TOO_MANY_REQUESTS') || errMsg.includes('Daily quota');
    const is404 = errMsg.includes('404') || errMsg.includes('not found');

    return (
      <div className="py-12 max-w-xl mx-auto space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rail-blue transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Search
        </Link>

        {isQuotaError ? (
          <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-amber-500/20">
            <div className="text-4xl">⏳</div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">API Quota Reached</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              The RailRadar free tier allows <strong>50 requests/day</strong>. Today's quota has been exhausted.
              Live tracking will resume tomorrow, or you can upgrade your RailRadar plan.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="https://railradar.in/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-rail-blue px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-sky-600 transition-colors"
              >
                Upgrade API Plan
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Search
              </Link>
            </div>
          </div>
        ) : (
          <ErrorCard
            title={is404 ? 'Train Not Found' : 'Live Data Unavailable'}
            message={
              is404
                ? `Train #${trainId} not found. Please check the train number.`
                : `Could not load live data for train #${trainId}. The train may not be running today or the service is temporarily unavailable.`
            }
            onRetry={() => refetch()}
          />
        )}
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[journey.status] || STATUS_CONFIG.running;

  // Build a lean SearchResult-compatible object for FavoriteButton
  const trainForFavorite = {
    id: journey.trainId,
    number: journey.number,
    name: journey.name,
    origin: journey.origin,
    destination: journey.destination,
  };

  return (
    <div className="space-y-6 py-2">
      {/* ─── Top Bar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>

        <div className="flex items-center gap-2 flex-wrap max-w-full min-w-0">
          {/* Emergency Trigger */}
          {journey && (
            <EmergencyButton onClick={handleEmergencyTrigger} />
          )}

          {/* Food Order Button */}
          {journey && (
            <FoodButton
              label="Food"
              onClick={() => router.push(`/food?trainNumber=${journey.number}`)}
            />
          )}

          {/* Station Alert Setup Trigger */}
          {journey && (
            <StationAlertButton
              onClick={() => setIsAlertModalOpen(true)}
              isActive={isEnabled}
            />
          )}

          {/* Status badge */}
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold flex-shrink-0', statusCfg.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusCfg.dot)} />
            {statusCfg.label}
          </span>

          {/* Share */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-rail-blue px-3.5 sm:px-4.5 py-2 text-xs font-bold text-white shadow-glow transition-all hover:bg-sky-600 active:scale-95 flex-shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share Live Tracking'}</span>
            <span className="sm:hidden">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Offline Cache available status banner */}
      {journey && (
        <EmergencyOfflineBanner isCached={isJourneyCached} />
      )}

      {/* ─── Mobile Journey Summary ─── */}
      <MobileJourneySummary journey={journey} />

      {/* ─── Hero Journey Card (desktop) ─── */}
      <div className="hidden md:block">
        <JourneyCard journey={journey} onRefresh={() => refetch()} isRefreshing={isRefetching} />
      </div>

      {/* ─── Seat Selection & Preferences Card ─── */}
      <div className="glass-panel rounded-3xl p-6 border border-sky-500/20 shadow-glass flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rail-blue/10 text-rail-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 6h18m-18-6v6a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 19.5 14.25v-6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 8.25ZM9 12v3m6-3v3M12 8.25v6" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Seat Selection & Coach Layouts</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Explore verified coach maps, check real-time berth availability, and choose your preferred seats based on actual train configurations.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Journey Date</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-rail-blue"
            />
          </div>
          <Link
            href={`/seat-selection/${journey.number}?date=${travelDate}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 active:scale-95 text-xs font-bold text-white px-5 py-2 shadow-glow transition-all whitespace-nowrap self-end w-full sm:w-auto"
          >
            <span>Select Preferred Seat</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ─── Food Discovery Card ─── */}
      {journey && (
        <FoodJourneyCard trainNumber={journey.number} />
      )}

      {/* ─── Window View Mode Premium Card ─── */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/20 shadow-glass flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Window View Mode
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Premium</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Immerse yourself in a real-data-driven digital train window. Discover nearby rivers, hills, bridges, and weather conditions in real-time as your train moves.
            </p>
          </div>
        </div>
        <Link
          href={`/train/${journey.number}/window-view`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white px-5 py-2 shadow-glow transition-all whitespace-nowrap self-end md:self-center w-full sm:w-auto"
        >
          <span>Enter Window View</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ─── Not-Started / Cancelled Banner ─── */}
      {(journey.status === 'not_started' || journey.status === 'cancelled') && (
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-4 border border-amber-500/20">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {journey.status === 'not_started'
              ? `Train #${journey.number} hasn't departed yet. Live tracking activates once the journey begins (scheduled departure: ${journey.stations[0]?.scheduledDeparture || 'check timetable'}).`
              : `Train #${journey.number} has been cancelled. Please check NTES for alternate arrangements.`}
          </p>
        </div>
      )}

      {/* ─── Main Content Layout (Map & Timeline side-by-side) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Map */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Live Map View
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              MapTiler Vector Dark
            </span>
          </div>
          <MapView journey={journey} className="h-[520px] w-full" />
        </div>

        {/* Right Column: Route Timeline & Alerts */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          {isEnabled && selectedStation && (
            <div className="space-y-4 animate-in slide-in-from-right-3 duration-300">
              <StationAlertCard
                stationName={selectedStation.name}
                stationCode={selectedStation.code}
                distanceKm={distanceKm}
                eta={eta}
                seatInfo={seatInfo}
                onDisable={disableAlert}
              />
              <StationAlertProgress
                journey={journey}
                stationCode={selectedStationCode}
              />
              <StationAlertSettings />
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight pt-2">
            Station Route Timeline
          </h3>
          <Timeline
            stations={journey.stations}
            currentStationCode={journey.currentStation?.code}
            className="h-[520px] overflow-y-auto"
          />
        </div>
      </div>

      {/* ─── Secondary Insights (Weather & Analytics) ─── */}
      <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <CloudSun className="h-5 w-5 text-rail-blue" />
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weather & Route Intelligence
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <WeatherPanel journey={journey} />
          </div>
          <div className="lg:col-span-6 space-y-6">
            <AnalyticsDashboard journey={journey} />
            <TerrainPanel trainId={journey.trainId} />
          </div>
        </div>
      </div>
      {/* Station Alerts Modal & Portal Overlay */}
      {journey && (
        <StationAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          stations={journey.stations}
          selectedStationCode={targetAlertStation?.code || selectedStationCode}
          onSelect={(station) => setTargetAlertStation(station)}
          onEnableAlert={() => {
            if (targetAlertStation) {
              enableAlert(targetAlertStation);
            }
          }}
        />
      )}

      <StationAlertNotification />
    </div>
  );
}

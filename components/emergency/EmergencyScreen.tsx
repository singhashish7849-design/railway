'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ShieldAlert, AlertTriangle, X, RefreshCw, Smartphone, Phone } from 'lucide-react';
import { useEmergency } from '@/hooks/useEmergency';
import { useEmergencySync } from '@/hooks/useEmergencySync';
import { EmergencyStatus } from './EmergencyStatus';
import { EmergencyLocationCard } from './EmergencyLocationCard';
import { EmergencyJourneyCard } from './EmergencyJourneyCard';
import { EmergencyContactCard } from './EmergencyContactCard';
import { EmergencyParentAlert } from './EmergencyParentAlert';
import { EmergencySecurityAlert } from './EmergencySecurityAlert';
import { EmergencyShareLocation } from './EmergencyShareLocation';
import { EmergencyTimeline } from './EmergencyTimeline';
import { cn } from '@/utils/cn';

interface EmergencyScreenProps {
  children?: React.ReactNode;
}

export function EmergencyScreen({ children }: EmergencyScreenProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('Emergency PWA Service Worker registered:', reg.scope),
        (err) => console.error('Emergency PWA Service Worker registration failed:', err)
      );
    }
  }, []);

  const {
    isEmergencyActive,
    activeEvent,
    timelineSteps,
    resolveEmergencyMode
  } = useEmergency();
  
  // Register sync listeners to automatically push offline queued events when network returns
  useEmergencySync();

  const [activeSubTab, setActiveSubTab] = useState<'status' | 'parents' | 'security' | 'sharing' | 'helplines'>('status');

  const pathname = usePathname();
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);

  if (isAuthPage || !isEmergencyActive) {
    return <>{children}</>;
  }

  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  // Render Emergency Mode active screen dashboard layout
  return (
    <div className="fixed inset-0 z-[80] bg-slate-50 dark:bg-slate-950 overflow-y-auto select-none pb-12">
      {/* Top Banner Warning Header */}
      <div className="bg-rose-600 px-4.5 py-4 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-8.5 w-8.5 rounded-lg bg-white/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider uppercase leading-none">
              🚨 EMERGENCY MODE ACTIVE
            </h2>
            <p className="text-[10px] opacity-85 font-extrabold mt-1 uppercase tracking-wide">
              RailGaadi Offline Safety Support
            </p>
          </div>
        </div>

        <button
          onClick={resolveEmergencyMode}
          className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all outline-none"
          title="Resolve Emergency & Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="max-w-xl mx-auto py-5 px-4.5 space-y-5">
        {/* Core Checklist Indicators */}
        {activeEvent && (
          <div className="p-4 bg-rose-600/5 dark:bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-2">
            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest leading-none">
              Safety Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-black text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5">
                <span>{activeEvent.latitude !== undefined ? '✓' : '✕'}</span>
                <span>Location captured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Train info loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>✓</span>
                <span>Emergency saved</span>
              </div>
            </div>
          </div>
        )}

        {/* Info Grid (GPS / Journey Cards) */}
        {activeEvent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmergencyLocationCard event={activeEvent} />
            <EmergencyJourneyCard event={activeEvent} />
          </div>
        )}

        {/* Network & Save Status Banner */}
        <div className="premium-glass-card border border-slate-250 dark:border-slate-800 p-4.5 rounded-3xl flex items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Database Status</span>
            <p className="text-xs font-black text-slate-900 dark:text-white leading-none">
              {activeEvent?.syncStatus === 'SYNCED'
                ? 'Emergency synchronized with server.'
                : 'Emergency saved locally in IndexedDB.'}
            </p>
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase mt-1 leading-none">
              {activeEvent?.syncStatus === 'SYNCED'
                ? 'Server Alert Acknowledged'
                : 'Waiting for network to synchronize...'}
            </p>
          </div>
          <EmergencyStatus />
        </div>

        {/* Action Button Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'status', label: 'Timeline log' },
            { id: 'parents', label: 'Alert Parents' },
            { id: 'security', label: 'Alert Security' },
            { id: 'sharing', label: 'Share Link' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                'inline-flex h-9.5 items-center justify-center rounded-2xl border text-[11px] font-black transition-all active:scale-95 outline-none',
                activeSubTab === tab.id
                  ? 'bg-rose-600 border-rose-500 text-white shadow-glow shadow-rose-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-550 hover:bg-slate-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub panels */}
        {activeSubTab === 'status' && (
          <EmergencyTimeline steps={timelineSteps} />
        )}

        {activeSubTab === 'parents' && (
          <EmergencyParentAlert event={activeEvent} />
        )}

        {activeSubTab === 'security' && (
          <EmergencySecurityAlert event={activeEvent} />
        )}

        {activeSubTab === 'sharing' && activeEvent && (
          <EmergencyShareLocation event={activeEvent} />
        )}

        {/* Helpline Contact Card (Always visible or under a category) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1 px-1">
            <Smartphone className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Emergency Helplines
            </h4>
          </div>
          <EmergencyContactCard countryCode={activeEvent?.trainNumber.includes('.') || activeEvent?.trainNumber.startsWith('BE.') ? 'BE' : 'IN'} />
        </div>

        {/* Resolve Safety Trigger */}
        <div className="pt-4 border-t border-slate-250/20 dark:border-slate-800/40 text-center">
          <button
            onClick={resolveEmergencyMode}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-slate-250 dark:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-850 dark:hover:text-white px-6 bg-slate-50/50 dark:bg-slate-900/30 transition-all outline-none"
          >
            <span>Resolve & Deactivate Emergency</span>
          </button>
        </div>
      </div>
    </div>
  );
}

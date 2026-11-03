'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useEmergencyStore } from '@/store/emergency';
import { emergencySecurityService } from '@/services/emergency/emergencySecurityService';
import { emergencyCommunicationService } from '@/services/emergency/emergencyCommunicationService';
import { EmergencyEvent } from '@/types/emergency';

interface EmergencySecurityAlertProps {
  event: EmergencyEvent | null;
}

export function EmergencySecurityAlert({ event }: EmergencySecurityAlertProps) {
  const securityPersonnel = useEmergencyStore((state) => state.securityPersonnel);
  const setSecurityPersonnel = useEmergencyStore((state) => state.setSecurityPersonnel);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      // Find Same-train verified security guards
      const security = emergencySecurityService.getSecurityPersonnelForTrain(event.trainNumber, event.coach);
      setSecurityPersonnel(security);
    }
  }, [event, setSecurityPersonnel]);

  const handleAlertSecurity = async () => {
    if (!event || securityPersonnel.length === 0) return;

    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    if (isOnline) {
      setAlertStatus('Initiating alert to security personnel... (Disabled: Authorized security provider not connected)');
      // Trigger api endpoint mock / fallback
      try {
        const response = await fetch('/api/emergency/security/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: event.id })
        });
        
        if (response.ok) {
          setAlertStatus('Onboard security personnel notified successfully.');
        } else {
          // Direct API is disabled (501)
          setAlertStatus('Security alert dispatch is currently disabled (No authorized security provider connected).');
        }
      } catch (err) {
        setAlertStatus('Error contacting security provider.');
      }
    } else {
      // Offline: save locally in queue
      for (const guard of securityPersonnel) {
        await emergencyCommunicationService.sendSecurityAlert(event, guard.securityId);
      }
      setAlertStatus('Security alert saved locally. Will synchronize when communication becomes available.');
    }
  };

  const hasSecurity = securityPersonnel.length > 0;

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
        <Shield className="h-4 w-4 text-rose-500" />
        <span>Same-Train Verified Security</span>
      </div>

      {hasSecurity ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 rounded-2xl">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldCheckIcon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                👮 Verified Railway Security Nearby
              </span>
              <p className="text-xs font-black text-slate-900 dark:text-white mt-1 leading-none">
                {securityPersonnel[0].name}
              </p>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold mt-1">
                {securityPersonnel[0].role} · Coach {securityPersonnel[0].coach}
              </p>
            </div>
          </div>

          {event && (
            <div className="space-y-3 pt-1 border-t border-slate-200/30 dark:border-slate-800/30">
              <button
                onClick={handleAlertSecurity}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-black text-white shadow-glow shadow-rose-500/20 transition-all outline-none"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Alert Railway Security</span>
              </button>

              {alertStatus && (
                <div className="flex items-start gap-2 p-3 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-250 dark:border-slate-800/50 rounded-2xl animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-650 dark:text-slate-350 font-bold leading-normal">
                    {alertStatus}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-2 space-y-1">
          <p className="text-xs font-black text-slate-500">
            No verified onboard security personnel available
          </p>
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            There are no RPF/Securail officers registered on train route logs for this journey. You can use the helplines below to contact general security.
          </p>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
      />
    </svg>
  );
}

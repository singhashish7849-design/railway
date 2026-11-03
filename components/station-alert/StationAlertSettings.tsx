import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, BellRing } from 'lucide-react';
import { stationNotificationService } from '@/services/stationAlert/stationNotificationService';
import { cn } from '@/utils/cn';

export function StationAlertSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(stationNotificationService.isSupported());
    setPermission(stationNotificationService.getPermission());
  }, []);

  const handleRequestPermission = async () => {
    const result = await stationNotificationService.requestPermission();
    setPermission(result);
  };

  if (!isSupported) {
    return (
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 text-[10.5px] text-slate-500 flex gap-2 items-start leading-normal">
        <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 text-slate-400 mt-0.5" />
        <span>
          Browser alerts are not supported by this browser. You can still receive full in-app travel alerts.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-slate-100/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/60 space-y-3">
      <div className="flex items-center justify-between gap-3.5 flex-wrap">
        <div className="flex items-center gap-2">
          <BellRing className="h-4.5 w-4.5 text-rail-blue" />
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Browser Notifications
          </span>
        </div>

        {permission === 'granted' ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Active</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Disabled</span>
          </span>
        )}
      </div>

      {permission !== 'granted' ? (
        <div className="space-y-3">
          <p className="text-[10.5px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
            Enable browser permissions to receive station alerts even when RailGaadi is running in the background.
          </p>
          <button
            onClick={handleRequestPermission}
            className="w-full inline-flex h-9 items-center justify-center rounded-xl bg-rail-blue hover:bg-sky-600 font-bold text-xs text-white shadow-glow transition-all active:scale-97"
          >
            Allow Browser Notifications
          </button>
        </div>
      ) : (
        <p className="text-[10.5px] text-slate-450 dark:text-slate-500 leading-normal font-semibold">
          Permission granted. RailGaadi will alert you automatically as you approach selected stations.
        </p>
      )}
    </div>
  );
}

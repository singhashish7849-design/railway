import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle } from 'lucide-react';
import { useStationAlertStore } from '@/store/stationAlert';
import { cn } from '@/utils/cn';

export function StationAlertNotification() {
  const { notifications, removeNotification } = useStationAlertStore((state) => ({
    notifications: state.notifications,
    removeNotification: state.removeNotification
  }));

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 w-full max-w-sm pointer-events-none select-none px-4 sm:px-0">
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationToast
            key={n.id}
            id={n.id}
            title={n.title}
            body={n.body}
            isDelayWarning={n.isDelayWarning}
            onDismiss={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface NotificationToastProps {
  id: string;
  title: string;
  body: string;
  isDelayWarning?: boolean;
  onDismiss: (id: string) => void;
}

function NotificationToast({ id, title, body, isDelayWarning, onDismiss }: NotificationToastProps) {
  // Auto dismiss after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        'w-full pointer-events-auto premium-glass-card rounded-[1.5rem] border p-4.5 shadow-glass flex gap-3.5 items-start',
        isDelayWarning
          ? 'border-amber-500/30 dark:border-amber-500/20 shadow-[0_8px_30px_rgba(245,158,11,0.06)]'
          : 'border-emerald-500/25 dark:border-emerald-500/15 shadow-[0_8px_30px_rgba(16,185,129,0.06)]'
      )}
    >
      {/* Icon Badge */}
      <div className={cn(
        'h-8.5 w-8.5 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5',
        isDelayWarning
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
      )}>
        {isDelayWarning ? <AlertTriangle className="h-4 w-4" /> : <Bell className="h-4 w-4 animate-swing" />}
      </div>

      {/* Message Info */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
          {title}
        </h4>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-semibold">
          {body}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors h-6.5 w-6.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

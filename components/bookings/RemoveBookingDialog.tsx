import React from 'react';
import { ShieldAlert, Trash2, X } from 'lucide-react';
import { Booking } from '@/lib/bookings/types';

interface RemoveBookingDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function RemoveBookingDialog({ booking, isOpen, onClose, onConfirm }: RemoveBookingDialogProps) {
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !booking) return null;

  const handleRemove = async () => {
    setLoading(true);
    try {
      await onConfirm(booking.id);
      onClose();
    } catch {
      // Error handled upstream
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Remove Booking
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-left">
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Are you sure you want to remove booking for <strong className="text-slate-900 dark:text-white">{booking.train_name} ({booking.train_number})</strong> (PNR: <span className="font-mono">{booking.pnr}</span>)?
          </p>
          
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400 leading-normal">
            ⚠️ <strong>Important Note:</strong> This ONLY removes the booking from your RailGaadi account. It does <u>NOT</u> cancel your official railway ticket with Indian Railways / IRCTC.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{loading ? 'Removing...' : 'Remove Booking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

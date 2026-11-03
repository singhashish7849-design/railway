import React, { useState } from 'react';
import { X, Plus, Loader2, Calendar, Train, MapPin } from 'lucide-react';
import { PNRInput } from './PNRInput';
import { AddBookingInput } from '@/lib/bookings/types';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooking: (input: AddBookingInput) => Promise<any>;
}

export function AddBookingModal({ isOpen, onClose, onAddBooking }: AddBookingModalProps) {
  const [pnr, setPnr] = useState('');
  const [trainNumber, setTrainNumber] = useState('');
  const [journeyDate, setJourneyDate] = useState(new Date().toISOString().split('T')[0]);
  const [classCode, setClassCode] = useState('2A');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPnr = pnr.replace(/[^0-9]/g, '');
    if (cleanPnr.length !== 10) {
      setErrorMsg('PNR must be exactly 10 numeric digits.');
      return;
    }

    setLoading(true);
    try {
      await onAddBooking({
        pnr: cleanPnr,
        trainNumber: trainNumber.trim(),
        journeyDate,
        classCode,
      });
      setPnr('');
      setTrainNumber('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add booking. Please check PNR details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 text-left">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rail-blue/10 text-rail-blue">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Add Booking
              </h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Save & Track Railway Journey
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-semibold text-rose-500 leading-normal">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          
          {/* PNR Input */}
          <PNRInput value={pnr} onChange={setPnr} disabled={loading} />

          {/* Train Number Input */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="train-no" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
              Train Number (Optional)
            </label>
            <div className="relative flex items-center">
              <Train className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="train-no"
                type="text"
                placeholder="e.g. 12952 or Rajdhani Express"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue transition-all text-left"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Journey Date */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="journey-date" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                Journey Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="journey-date"
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-rail-blue transition-all text-left"
                />
              </div>
            </div>

            {/* Travel Class */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="travel-class" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                Class Code
              </label>
              <select
                id="travel-class"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rail-blue transition-all text-left"
              >
                <option value="1A">1A · First AC</option>
                <option value="2A">2A · Second AC</option>
                <option value="3A">3A · Third AC</option>
                <option value="3E">3E · 3 AC Economy</option>
                <option value="SL">SL · Sleeper</option>
                <option value="CC">CC · Chair Car</option>
                <option value="EC">EC · Exec Chair Car</option>
                <option value="2S">2S · Second Seating</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2 text-left">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || pnr.replace(/[^0-9]/g, '').length !== 10}
              className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 disabled:opacity-50 text-xs font-bold text-white shadow-glow transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Save Booking</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

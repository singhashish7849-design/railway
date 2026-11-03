import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BellRing } from 'lucide-react';
import { Station } from '@/types/train';
import { StationSelector } from './StationSelector';

interface StationAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: Station[];
  selectedStationCode: string;
  onSelect: (station: Station) => void;
  onEnableAlert: () => void;
}

export function StationAlertModal({
  isOpen,
  onClose,
  stations,
  selectedStationCode,
  onSelect,
  onEnableAlert,
}: StationAlertModalProps) {
  const chosenStation = stations.find((s) => s.code === selectedStationCode);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal / Bottom Sheet Body */}
          <motion.div
            initial={{ y: '100%', scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-glass p-6 overflow-hidden flex flex-col z-10"
          >
            {/* Header drag bar for mobile visual cue */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 sm:hidden" />

            {/* Modal Title bar */}
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-rail-blue/10 border border-rail-blue/20 text-rail-blue flex items-center justify-center">
                  <BellRing className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Set Station Alert
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    RailGaadi Personal Companion
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="h-8.5 w-8.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Route Stations List */}
            <StationSelector
              stations={stations}
              selectedStationCode={selectedStationCode}
              onSelect={onSelect}
            />

            {/* Action Area */}
            <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-2xl border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-semibold text-xs text-slate-700 dark:text-slate-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedStationCode}
                onClick={() => {
                  onEnableAlert();
                  onClose();
                }}
                className="flex-1 inline-flex h-11 items-center justify-center rounded-2xl bg-rail-blue hover:bg-sky-600 disabled:opacity-50 font-bold text-xs text-white shadow-glow transition-all active:scale-95"
              >
                Enable Alert {chosenStation ? `for ${chosenStation.code}` : ''}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

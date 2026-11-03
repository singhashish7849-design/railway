'use client';

import React from 'react';
import { X, PhoneCall } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmergencyConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isSensitive?: boolean;
}

export function EmergencyConfirmation({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Call',
  cancelText = 'Cancel',
  isSensitive = true
}: EmergencyConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4.5 right-4.5 h-7 w-7 rounded-full border border-slate-250 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-850 dark:hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center",
              isSensitive ? "bg-rose-500/10 text-rose-500" : "bg-sky-500/10 text-rail-blue"
            )}>
              <PhoneCall className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
              {title}
            </h4>
          </div>

          {message && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {message}
            </p>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-250 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-100 transition-all outline-none"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={cn(
                "flex-1 inline-flex h-9.5 items-center justify-center rounded-xl text-xs font-bold text-white shadow-glow transition-all active:scale-95 outline-none",
                isSensitive ? "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

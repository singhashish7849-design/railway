import React from 'react';
import { Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PNRInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function PNRInput({ value, onChange, disabled }: PNRInputProps) {
  const clean = value.replace(/[^0-9]/g, '').slice(0, 10);
  const isValid = clean.length === 10;
  const isInvalid = clean.length > 0 && clean.length !== 10;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    onChange(raw);
  };

  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor="pnr-input" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
        10-Digit PNR Number
      </label>
      <div className="relative flex items-center">
        <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          id="pnr-input"
          type="text"
          maxLength={10}
          placeholder="e.g. 1234567890"
          value={clean}
          onChange={handleChange}
          disabled={disabled}
          required
          className={cn(
            "w-full rounded-xl border bg-white dark:bg-slate-900 py-3 pl-10 pr-10 font-mono text-sm font-bold tracking-wider text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all text-left",
            isValid && "border-emerald-500/50 focus:border-emerald-500",
            isInvalid && "border-rose-500/50 focus:border-rose-500",
            !clean && "border-slate-200 dark:border-slate-800 focus:border-rail-blue"
          )}
        />
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {isValid && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {isInvalid && <AlertCircle className="h-4 w-4 text-rose-500" />}
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Enter your 10-digit PNR to save your journey in RailGaadi.
      </p>
    </div>
  );
}

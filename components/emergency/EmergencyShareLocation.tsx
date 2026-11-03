'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Info } from 'lucide-react';
import { useEmergencyShare } from '@/hooks/useEmergencyShare';
import { EmergencyEvent } from '@/types/emergency';
import { cn } from '@/utils/cn';

interface EmergencyShareLocationProps {
  event: EmergencyEvent;
}

export function EmergencyShareLocation({ event }: EmergencyShareLocationProps) {
  const { shareLink, loading, getEmergencySummary, generateShareLink } = useEmergencyShare();
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

  const handleCopySummary = () => {
    const summary = getEmergencySummary(event);
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateLink = async () => {
    const link = await generateShareLink(event);
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
        <Share2 className="h-4 w-4 text-rail-blue" />
        <span>Share Emergency Details</span>
      </div>

      <div className="space-y-3.5">
        {isOnline ? (
          <div className="space-y-3">
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              Generate a secure, expiring location share link. It resolves only your immediate position and auto-expires after 30 minutes.
            </p>
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-rail-blue hover:bg-sky-650 active:scale-95 text-xs font-black text-white shadow-glow transition-all outline-none"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Generate Expiring Location Link'}</span>
            </button>
            
            {shareLink && (
              <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 rounded-2xl text-[10px] font-mono text-rail-blue select-all truncate">
                {shareLink}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 p-3 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
              <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-650 dark:text-slate-400 font-bold leading-normal">
                You are offline. Live tracking URLs cannot be generated. You can copy the emergency summary to clipboard.
              </p>
            </div>
            
            <button
              onClick={handleCopySummary}
              className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-900 active:scale-95 text-xs font-black transition-all outline-none"
            >
              {copiedText ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedText ? 'Summary Copied!' : 'Copy Emergency Summary'}</span>
            </button>
          </div>
        )}

        {/* Local Summary Preview */}
        <div className="border-t border-slate-250/20 dark:border-slate-800/30 pt-3">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="text-[10.5px] font-black text-slate-400 hover:text-rail-blue transition-colors flex items-center gap-1 uppercase outline-none"
          >
            <span>{showSummary ? 'Hide' : 'Show'} Local Summary Draft</span>
          </button>
          
          {showSummary && (
            <pre className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-250 dark:border-slate-850 rounded-2xl text-[10.5px] font-mono text-slate-650 dark:text-slate-350 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {getEmergencySummary(event)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

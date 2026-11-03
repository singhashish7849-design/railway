'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Train, Calendar, ArrowRight, Heart, History, Sparkles } from 'lucide-react';
import { useFavoritesStore } from '@/store/favorites';
import { useSearchStore } from '@/store/search';

export default function SeatSelectionDashboard() {
  const router = useRouter();
  const { favorites } = useFavoritesStore();
  const { recentSearches } = useSearchStore();

  const [trainNumber, setTrainNumber] = useState('');
  const [journeyDate, setJourneyDate] = useState('');

  // Default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    setJourneyDate(dateString);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber.trim() || !journeyDate) return;
    router.push(`/seat-selection/${trainNumber.trim()}?date=${journeyDate}`);
  };

  const handleSelectTrain = (num: string) => {
    setTrainNumber(num);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-6">
      
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-rail-blue backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Coach Layouts & Real-time Bookings</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Seat Availability <span className="text-rail-blue">Map</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-normal">
          Select your train and date of travel to inspect the live berth configuration and book unoccupied seats.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Train Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest block">
                Train Number
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3.5 py-2.5 text-sm transition-all focus-within:border-rail-blue/50 focus-within:ring-1 focus-within:ring-rail-blue/20">
                <Train className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  required
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="Enter train # (e.g. 12951)"
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium"
                />
              </div>
            </div>

            {/* Journey Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest block">
                Journey Date
              </label>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3.5 py-2.5 text-sm transition-all focus-within:border-rail-blue/50 focus-within:ring-1 focus-within:ring-rail-blue/20">
                <Calendar className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                <input
                  type="date"
                  required
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium font-sans"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={!trainNumber.trim()}
            className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 disabled:opacity-40 text-xs font-bold text-white shadow-glow transition-all outline-none"
          >
            <span>Inspect Coach Layout</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>
      </div>

      {/* Quick Select Quick Chips (Favorites / Searches) */}
      {(favorites.length > 0 || recentSearches.length > 0) && (
        <div className="space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">
            Quick Select Train
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Favorites */}
            {favorites.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
                  <span className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest">Favorites</span>
                </div>
                <div className="space-y-1.5">
                  {favorites.slice(0, 3).map((f) => (
                    <button
                      key={f.id || f.number}
                      onClick={() => handleSelectTrain(f.number)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:bg-rail-blue/5 hover:border-rail-blue/30 text-left transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-[10px] font-bold text-rail-blue block">#{f.number}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">{f.name}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 px-1">
                  <History className="h-3.5 w-3.5 text-rail-blue" />
                  <span className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest">Recent Searches</span>
                </div>
                <div className="space-y-1.5">
                  {recentSearches.slice(0, 3).map((s) => (
                    <button
                      key={s.id || s.number}
                      onClick={() => handleSelectTrain(s.number)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 hover:bg-rail-blue/5 hover:border-rail-blue/30 text-left transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-mono text-[10px] font-bold text-rail-blue block">#{s.number}</span>
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">{s.name}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

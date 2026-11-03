'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Compass, MapPin, Sparkles } from 'lucide-react';
import { WindowFeature } from '@/types/windowView';
import { cn } from '@/utils/cn';

interface WindowFeatureCardProps {
  feature: WindowFeature | null;
  trainNumber: string;
  trainName: string;
}

export function WindowFeatureCard({ feature, trainNumber, trainName }: WindowFeatureCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!feature) return;
    const saved = localStorage.getItem('rail_saved_discoveries');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        setIsSaved(parsed.some((x) => x.id === feature.id));
      } catch {
        // ignore
      }
    } else {
      setIsSaved(false);
    }
  }, [feature]);

  const handleSave = () => {
    if (!feature) return;
    const saved = localStorage.getItem('rail_saved_discoveries');
    let list: any[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        // ignore
      }
    }

    if (isSaved) {
      list = list.filter((x) => x.id !== feature.id);
      setIsSaved(false);
    } else {
      list.push({
        id: feature.id,
        name: feature.name,
        type: feature.type,
        latitude: feature.latitude,
        longitude: feature.longitude,
        distanceKm: feature.distanceKm,
        trainNumber,
        trainName,
        createdAt: new Date().toISOString(),
      });
      setIsSaved(true);
    }
    localStorage.setItem('rail_saved_discoveries', JSON.stringify(list));
  };

  const getEmoji = (type: string) => {
    switch (type) {
      case 'RIVER': return '🌊';
      case 'LAKE': return 'lake 🌊';
      case 'MOUNTAIN': return '🏔️';
      case 'HILL': return '⛰️';
      case 'BRIDGE': return '🌉';
      case 'TUNNEL': return '🚇';
      case 'CITY': return '🏙️';
      case 'DISTRICT': return '🏘️';
      case 'ATTRACTION': return '🏛️';
      case 'LANDMARK': return '📍';
      default: return '📍';
    }
  };

  if (!feature) {
    return (
      <div className="premium-glass-card rounded-3xl p-6 flex flex-col justify-center items-center text-center h-[210px] space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/50 dark:bg-slate-900/60 text-slate-400">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-250">Nothing Notable Nearby</h4>
          <p className="text-[11px] text-slate-400 max-w-[240px] mt-1 leading-normal">
            Keep watching the window. Notable landmarks will appear as the train moves.
          </p>
        </div>
      </div>
    );
  }

  const getBorderClass = (type: string) => {
    switch (type) {
      case 'RIVER':
      case 'LAKE':
        return 'border-blue-500/30 dark:border-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.04)]';
      case 'MOUNTAIN':
      case 'HILL':
        return 'border-amber-700/30 dark:border-amber-600/15 shadow-[0_8px_30px_rgba(217,119,6,0.04)]';
      case 'BRIDGE':
        return 'border-slate-500/25 dark:border-slate-500/15';
      case 'TUNNEL':
        return 'border-slate-800/40 dark:border-slate-950/20';
      case 'CITY':
      case 'DISTRICT':
        return 'border-sky-500/25 dark:border-sky-500/15';
      case 'ATTRACTION':
      case 'LANDMARK':
        return 'border-rose-500/25 dark:border-rose-500/15 shadow-[0_8px_30px_rgba(244,63,94,0.04)]';
      default:
        return 'border-slate-200/50 dark:border-slate-800/60';
    }
  };

  return (
    <div className={cn(
      "premium-glass-card rounded-3xl p-5.5 space-y-4 transition-all duration-500 border",
      getBorderClass(feature.type)
    )}>
      {/* Title section */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{getEmoji(feature.type)}</span>
            <span className="text-[9.5px] font-extrabold text-rail-blue dark:text-sky-400 uppercase tracking-widest">
              {feature.type}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-tight tracking-tight">
            {feature.name}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">
            Near Journey Path
          </p>
        </div>

        {/* Favorite Discovery */}
        <button
          onClick={handleSave}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full transition-all border outline-none active:scale-90',
            isSaved
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
          title={isSaved ? 'Remove from Saved Discoveries' : 'Save Discovery'}
        >
          <Heart className="h-4.5 w-4.5" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Geometry / Distance Details */}
      <div className="grid grid-cols-2 gap-3 bg-white/20 dark:bg-slate-900/30 p-3.5 rounded-2xl border border-white/30 dark:border-white/5">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Distance</p>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
            {feature.distanceKm} km
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Direction</p>
          <p className={cn(
            'text-sm font-black mt-0.5 flex items-center gap-1',
            feature.direction === 'AHEAD' ? 'text-emerald-500' : 'text-amber-500'
          )}>
            <MapPin className="h-3.5 w-3.5" />
            <span>{feature.direction}</span>
          </p>
        </div>
      </div>

      {/* Relevance Tag */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
        <span>Discovery Score: <strong>{feature.relevanceScore}%</strong></span>
      </div>
    </div>
  );
}

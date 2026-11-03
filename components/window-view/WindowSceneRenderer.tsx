'use client';

import React from 'react';
import { WindowFeature } from '@/types/windowView';
import {
  RiverScene,
  MountainScene,
  BridgeScene,
  TunnelScene,
  CityScene,
  AttractionScene,
  WeatherScene,
} from './scenes/Scenes';
import { SVGCloud } from './scenes/ScenicElements';

interface WindowSceneRendererProps {
  currentFeature: WindowFeature | null;
  weatherCondition?: string;
  isNightOverride?: boolean | null;
  elevation?: number;
}

export function WindowSceneRenderer({
  currentFeature,
  weatherCondition = 'Clear',
  isNightOverride,
  elevation,
}: WindowSceneRendererProps) {
  // Determine time-of-day based on local system clock
  const getAtmosphere = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    if (isNightOverride !== undefined) {
      return isNightOverride ? 'night' : 'afternoon';
    }
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 19) return 'evening';
    return 'night';
  };

  const timeOfDay = getAtmosphere();
  const isNight = timeOfDay === 'night';
  const lowercaseCondition = weatherCondition.toLowerCase();
  const isRaining = lowercaseCondition.includes('rain') || lowercaseCondition.includes('drizzle') || lowercaseCondition.includes('thunderstorm') || lowercaseCondition.includes('shower');
  const isCloudy = lowercaseCondition.includes('cloud') || lowercaseCondition.includes('mist') || lowercaseCondition.includes('haze') || lowercaseCondition.includes('fog') || lowercaseCondition.includes('overcast');

  // Select the appropriate scene based on the active feature
  const renderScene = () => {
    if (!currentFeature) {
      return <WeatherScene feature={null} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
    }

    switch (currentFeature.type) {
      case 'RIVER':
      case 'LAKE':
        return <RiverScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      case 'MOUNTAIN':
      case 'HILL':
        return <MountainScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      case 'BRIDGE':
        return <BridgeScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      case 'TUNNEL':
        return <TunnelScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      case 'CITY':
      case 'DISTRICT':
        return <CityScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      case 'ATTRACTION':
      case 'LANDMARK':
        return <AttractionScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
      default:
        return <WeatherScene feature={currentFeature} weatherCondition={weatherCondition} isNight={isNight} elevation={elevation} />;
    }
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-3xl shadow-glass border border-slate-200/20 dark:border-slate-800/40">
      {/* 1. Base Scene Render */}
      {renderScene()}

      {/* 2. Atmospheric Filter Gradients (Soft sunrises/sunsets) */}
      {timeOfDay === 'morning' && (
        <div className="absolute inset-0 bg-gradient-to-t from-orange-400/10 via-pink-400/5 to-transparent pointer-events-none mix-blend-overlay" />
      )}
      {timeOfDay === 'evening' && (
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-red-500/10 to-transparent pointer-events-none mix-blend-color-burn" />
      )}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 bg-[#090d16]/20 pointer-events-none mix-blend-multiply" />
      )}

      {/* 3. Weather Overlay: Clouds */}
      {isCloudy && (
        <div className="absolute top-2 left-0 right-0 h-16 pointer-events-none opacity-40">
          <div className="absolute top-0 w-32 h-10 animate-float-cloud-slow">
            <SVGCloud className="w-full h-full text-slate-100 dark:text-slate-700" />
          </div>
          <div className="absolute top-4 left-1/2 w-24 h-8 animate-float-cloud-fast">
            <SVGCloud className="w-full h-full text-slate-200 dark:text-slate-600" />
          </div>
        </div>
      )}

      {/* 4. Weather Overlay: Rain Particles */}
      {isRaining && (
        <div className="absolute inset-0 pointer-events-none z-30 opacity-40 overflow-hidden">
          <div className="w-full h-full flex justify-around">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-[1.5px] h-10 bg-slate-200 rounded-full animate-rain"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.6 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4b. Wet Rails Shine Reflection Overlay (For rain realism) */}
      {isRaining && (
        <div className="absolute bottom-6 left-0 right-0 h-4 bg-sky-300/5 pointer-events-none mix-blend-screen overflow-hidden z-25">
          <div className="absolute top-[2px] w-48 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-wet-shine" />
          <div className="absolute bottom-[2px] w-48 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-wet-shine" style={{ animationDelay: '1.2s' }} />
        </div>
      )}

      {/* 5. Window Frame Overlay (The digital train window border) */}
      <div className="absolute inset-0 border-[10px] border-slate-900/90 dark:border-slate-950/95 pointer-events-none rounded-3xl" />
      <div className="absolute inset-0 border border-slate-400/20 dark:border-white/5 pointer-events-none rounded-2xl" />
      
      {/* Glare effect on glass */}
      <div className="absolute top-0 right-0 left-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none -skew-y-12 origin-top-left opacity-30 dark:opacity-5" />
    </div>
  );
}

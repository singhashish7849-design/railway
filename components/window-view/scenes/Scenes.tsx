import React from 'react';
import {
  SVGCloud,
  SVGPineTree,
  SVGDeciduousTree,
  SVGMountain,
  SVGMountainSnowCap,
  SVGBridge,
  SVGTunnel,
  SVGCityLine,
  SVGTrainCarriage,
  SVGStar,
  SVGCatenaryPole,
} from './ScenicElements';
import { WindowFeature } from '@/types/windowView';

interface SceneProps {
  feature: WindowFeature | null;
  weatherCondition?: string;
  isNight?: boolean;
  elevation?: number;
}

// Parallax scrolling layer helper
function ParallaxLayer({
  speedClass,
  children,
  className = '',
}: {
  speedClass: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`absolute inset-y-0 left-0 flex w-[200%] ${speedClass} ${className}`}>
      <div className="w-1/2 h-full relative select-none">{children}</div>
      <div className="w-1/2 h-full relative select-none">{children}</div>
    </div>
  );
}

// Common Catenary electric poles foreground layer
function ForegroundCatenary() {
  return (
    <ParallaxLayer speedClass="animate-scroll-bg-hyper" className="z-30 pointer-events-none speed-blur-sm">
      <SVGCatenaryPole className="absolute bottom-[28px] left-[50px] w-6 h-[105px] text-slate-800 dark:text-slate-650 opacity-90" />
      <SVGCatenaryPole className="absolute bottom-[28px] left-[250px] w-6 h-[105px] text-slate-800 dark:text-slate-650 opacity-90" />
      <SVGCatenaryPole className="absolute bottom-[28px] left-[450px] w-6 h-[105px] text-slate-800 dark:text-slate-650 opacity-90" />
    </ParallaxLayer>
  );
}

// Common electrified railway track bed foreground
function ForegroundTrackbed() {
  return (
    <div className="absolute bottom-6 left-0 right-0 h-4 bg-slate-800 dark:bg-slate-900 border-y border-slate-700 z-20">
      {/* Ballast & Sleepers */}
      <ParallaxLayer speedClass="animate-scroll-bg-hyper">
        <div className="absolute inset-0 flex justify-around">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-[3px] h-full bg-slate-500/30 dark:bg-slate-700/60" />
          ))}
        </div>
      </ParallaxLayer>
      {/* Shiny Steel Rails */}
      <div className="absolute top-[2px] left-0 right-0 h-[1.5px] bg-slate-300 dark:bg-slate-400 opacity-80" />
      <div className="absolute bottom-[2px] left-0 right-0 h-[1.5px] bg-slate-300 dark:bg-slate-400 opacity-80" />
    </div>
  );
}

// Helper to determine mountain height scale based on actual elevation (OpenTopography connection)
function getMountainHeightClass(elevation?: number): string {
  if (!elevation) return 'h-28';
  if (elevation > 750) return 'h-52'; // high peaks
  if (elevation > 450) return 'h-40'; // moderate hills
  return 'h-28'; // low ridges
}

// ─── 1. RIVER SCENE ──────────────────────────────────────────────────────────
export function RiverScene({ feature, isNight, elevation }: SceneProps) {
  const mountainHeight = getMountainHeightClass(elevation);
  
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-1000">
      {/* Glowing sun/moon */}
      <div className={`absolute right-20 top-12 w-16 h-16 rounded-full transition-colors duration-1000 ${
        isNight ? 'bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.45)]' : 'bg-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.45)]'
      }`} />

      {/* Layer 3: Background mountain ranges (Shaded atmospheric perspective) */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow" className="opacity-40">
        <SVGMountain className={`absolute bottom-20 left-10 w-[350px] text-sky-700 dark:text-slate-700 ${mountainHeight}`} />
        <SVGMountain className={`absolute bottom-20 left-[260px] w-[450px] text-sky-800 dark:text-slate-850 ${mountainHeight}`} />
      </ParallaxLayer>

      {/* Layer 2: Middle ground - River body */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-sky-500 to-sky-700 dark:from-sky-950 dark:to-slate-900 border-t border-sky-400/20">
        {/* River waves flow */}
        <ParallaxLayer speedClass="animate-ripple" className="opacity-25">
          <div className="absolute top-4 left-1/4 w-48 h-[2px] bg-white rounded-full" />
          <div className="absolute top-10 left-10 w-64 h-[2px] bg-white rounded-full" />
          <div className="absolute top-18 left-[60%] w-32 h-[2px] bg-white rounded-full" />
        </ParallaxLayer>
      </div>

      {/* Trackbed */}
      <ForegroundTrackbed />

      {/* Modern Indian Train silhouette moving smoothly */}
      <div className="absolute bottom-[23px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        {/* Sleek LHB/Vande Bharat train carriage */}
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        
        {/* Subtle dynamic passenger windows glow at night */}
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Foreground fast electric posts (OHE Catenary) */}
      <ForegroundCatenary />

      {/* Scrolling shoreline vegetation */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="pointer-events-none">
        <SVGDeciduousTree className="absolute bottom-[28px] left-8 w-6 h-8 text-emerald-700 dark:text-emerald-950 opacity-90" />
        <SVGDeciduousTree className="absolute bottom-[28px] left-96 w-7 h-9 text-teal-700 dark:text-teal-950 opacity-90" />
      </ParallaxLayer>
    </div>
  );
}

// ─── 2. MOUNTAIN SCENE ──────────────────────────────────────────────────────
export function MountainScene({ feature, isNight, elevation }: SceneProps) {
  const mountainHeight = getMountainHeightClass(elevation);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-350 to-sky-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-1000">
      {/* Stars if night */}
      {isNight && (
        <div className="absolute inset-0 opacity-80">
          <SVGStar className="absolute top-10 left-12 w-2.5 h-2.5 text-white/80 animate-twinkle" />
          <SVGStar className="absolute top-24 left-1/4 w-1.5 h-1.5 text-white/60 animate-twinkle" />
          <SVGStar className="absolute top-14 left-2/3 w-2 h-2 text-white/70 animate-twinkle" />
          <SVGStar className="absolute top-8 left-[80%] w-3 h-3 text-white/85 animate-twinkle" />
        </div>
      )}

      {/* Sun/Moon */}
      <div className={`absolute left-1/3 top-10 w-16 h-16 rounded-full transition-colors duration-1000 ${
        isNight ? 'bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.4)]'
      }`} />

      {/* Layer 3: Layered mountain ridges */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow">
        <div className="relative w-full h-full opacity-60 dark:opacity-40">
          <SVGMountain className={`absolute bottom-16 left-0 w-full text-slate-500 dark:text-slate-800 ${mountainHeight}`} />
          <SVGMountainSnowCap className={`absolute bottom-16 left-0 w-full text-white/70 dark:text-slate-200/50 ${mountainHeight}`} />
        </div>
      </ParallaxLayer>

      {/* Layer 2: Midground Foothills / valley meadows */}
      <ParallaxLayer speedClass="animate-scroll-bg-medium" className="opacity-95">
        <SVGMountain className="absolute bottom-14 left-0 w-full h-24 text-emerald-800 dark:text-emerald-950" />
      </ParallaxLayer>

      {/* Trackbed */}
      <ForegroundTrackbed />

      {/* Vande Bharat train silhouette */}
      <div className="absolute bottom-[23px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Foreground electric posts (OHE Catenary) */}
      <ForegroundCatenary />

      {/* Coniferous pine trees scrolling in midground */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="pointer-events-none">
        <SVGPineTree className="absolute bottom-14 left-8 w-5 h-10 text-emerald-900 dark:text-emerald-950" />
        <SVGPineTree className="absolute bottom-14 left-44 w-4 h-8 text-emerald-850 dark:text-emerald-900" />
        <SVGPineTree className="absolute bottom-14 left-[300px] w-5 h-11 text-emerald-900 dark:text-emerald-950" />
      </ParallaxLayer>
    </div>
  );
}

// ─── 3. BRIDGE SCENE ────────────────────────────────────────────────────────
export function BridgeScene({ feature, isNight, elevation }: SceneProps) {
  const mountainHeight = getMountainHeightClass(elevation);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-slate-400 via-slate-350 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-1000">
      {/* Deep gorge/river under the suspension bridge */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-sky-700 to-sky-900 dark:from-sky-950 dark:to-slate-900">
        <ParallaxLayer speedClass="animate-ripple" className="opacity-20">
          <div className="absolute top-4 left-10 w-24 h-0.5 bg-white/20 rounded-full" />
          <div className="absolute top-8 left-1/2 w-32 h-0.5 bg-white/20 rounded-full" />
        </ParallaxLayer>
      </div>

      {/* Gorge Cliffs */}
      <div className="absolute bottom-16 left-0 w-20 h-12 bg-slate-650 dark:bg-slate-800 rounded-tr-3xl" />
      <div className="absolute bottom-16 right-0 w-20 h-12 bg-slate-650 dark:bg-slate-800 rounded-tl-3xl" />

      {/* Far Background Gorge Ridge */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow" className="opacity-30">
        <SVGMountain className={`absolute bottom-16 left-28 w-80 text-slate-500 dark:text-slate-850 ${mountainHeight}`} />
      </ParallaxLayer>

      {/* The Railway Track bed */}
      <div className="absolute bottom-16 left-0 right-0 h-[2.5px] bg-slate-600 dark:bg-slate-700 z-15" />

      {/* Train carriage inside bridge trusses */}
      <div className="absolute bottom-[17px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Heavy Steel Bridge Truss overlay */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="z-20">
        <SVGBridge className="absolute bottom-12 left-0 w-[400px] h-20 text-slate-600 dark:text-slate-500 drop-shadow-md" />
        <SVGBridge className="absolute bottom-12 left-[400px] w-[400px] h-20 text-slate-600 dark:text-slate-500 drop-shadow-md" />
      </ParallaxLayer>

      {/* Bridge structural pillars */}
      <div className="absolute bottom-0 left-[20%] w-10 h-16 bg-slate-600 dark:bg-slate-800 border-x border-slate-500/20" />
      <div className="absolute bottom-0 right-[20%] w-10 h-16 bg-slate-600 dark:bg-slate-800 border-x border-slate-500/20" />
    </div>
  );
}

// ─── 4. TUNNEL SCENE ────────────────────────────────────────────────────────
export function TunnelScene({ feature, isNight }: SceneProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#04060f]">
      {/* Dark perspective vault of tunnel */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-full h-full relative">
          <svg viewBox="0 0 200 100" className="w-full h-full text-slate-700" fill="none" stroke="currentColor" strokeWidth="0.8">
            <line x1="0" y1="0" x2="60" y2="35" />
            <line x1="200" y1="0" x2="140" y2="35" />
            <line x1="0" y1="100" x2="60" y2="65" />
            <line x1="200" y1="100" x2="140" y2="65" />
            <rect x="60" y="35" width="80" height="30" rx="4" />
          </svg>
        </div>
      </div>

      {/* Moving tunnel wall lights (fast blur streaks) */}
      <ParallaxLayer speedClass="animate-scroll-bg-hyper" className="opacity-80">
        <div className="absolute top-1/4 left-10 w-20 h-1 bg-amber-400/90 rounded-full blur-[2px]" />
        <div className="absolute top-1/3 left-[280px] w-24 h-1 bg-amber-400/95 rounded-full blur-[2px]" />
        <div className="absolute bottom-1/3 left-48 w-16 h-1.5 bg-amber-400/90 rounded-full blur-[2px]" />
        <div className="absolute bottom-1/4 left-[420px] w-28 h-1 bg-amber-400/95 rounded-full blur-[2px]" />
      </ParallaxLayer>

      {/* Red rear lantern glow */}
      <div className="absolute bottom-16 right-16 w-3 h-3 rounded-full bg-rose-600 blur-[3px] animate-pulse" />

      {/* Sleek LHB Train inside tunnel with lit windows */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-slate-900 drop-shadow-[0_0_12px_rgba(2,132,199,0.2)]" />
        
        {/* Glow windows in dark */}
        <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-yellow-200/95 shadow-[0_0_12px_rgba(253,224,71,0.85)] rounded-sm" />
      </div>

      {/* Track rails */}
      <div className="absolute bottom-12 left-0 right-0 h-2 bg-slate-950 border-y border-slate-800" />
    </div>
  );
}

// ─── 5. CITY SCENE ──────────────────────────────────────────────────────────
export function CityScene({ feature, isNight }: SceneProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-blue-300 via-amber-100 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-850 transition-colors duration-1000">
      {/* Sun/Moon */}
      <div className={`absolute right-20 top-12 w-14 h-14 rounded-full transition-colors duration-1000 ${
        isNight ? 'bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
      }`} />

      {/* City skyline background (shaded and hazy) */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow" className="opacity-70">
        <SVGCityLine className="absolute bottom-16 left-0 w-[450px] h-36 text-slate-500 dark:text-slate-800" />
        <SVGCityLine className="absolute bottom-16 left-[450px] w-[450px] h-36 text-slate-550 dark:text-slate-850" />
      </ParallaxLayer>

      {/* Fences / platforms */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-300 dark:bg-slate-900 border-t border-slate-400/20" />

      {/* Foreground track */}
      <ForegroundTrackbed />

      {/* Sleek Vande Bharat Train */}
      <div className="absolute bottom-[23px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Foreground electric posts (OHE Catenary) */}
      <ForegroundCatenary />

      {/* Scrolling utility line poles in midground */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="pointer-events-none z-25 opacity-70">
        <div className="absolute bottom-16 left-28 w-[2px] h-16 bg-slate-700 dark:bg-slate-600">
          <div className="absolute -top-1 -left-1.5 w-4 h-1.5 bg-yellow-100/90 rounded-full shadow-[0_0_4px_rgba(253,224,71,0.6)]" />
        </div>
        <div className="absolute bottom-16 left-[320px] w-[2px] h-16 bg-slate-700 dark:bg-slate-600">
          <div className="absolute -top-1 -left-1.5 w-4 h-1.5 bg-yellow-100/90 rounded-full shadow-[0_0_4px_rgba(253,224,71,0.6)]" />
        </div>
      </ParallaxLayer>
    </div>
  );
}

// ─── 6. ATTRACTION SCENE ────────────────────────────────────────────────────
export function AttractionScene({ feature, isNight, elevation }: SceneProps) {
  const mountainHeight = getMountainHeightClass(elevation);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-orange-200 via-rose-100 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-1000">
      {/* Sun/Moon */}
      <div className={`absolute right-16 top-10 w-16 h-16 rounded-full transition-colors duration-1000 ${
        isNight ? 'bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.45)]' : 'bg-rose-350 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
      }`} />

      {/* Far Background: Fort monument silhouette */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow" className="opacity-70">
        <div className="absolute bottom-16 left-32 w-48 h-36 text-slate-550 dark:text-slate-800">
          <svg viewBox="0 0 100 80" fill="currentColor" className="w-full h-full">
            {/* Monument details */}
            <path d="M15,62 L85,62 L85,32 L15,32 Z" />
            <path d="M32,32 A18,18 0 0,1 68,32 Z" />
            <rect x="5" y="8" width="8" height="54" />
            <circle cx="9" cy="5" r="4.5" />
            <rect x="87" y="8" width="8" height="54" />
            <circle cx="91" cy="5" r="4.5" />
          </svg>
        </div>
      </ParallaxLayer>

      {/* Mid Ground: Cliffs and ridges */}
      <ParallaxLayer speedClass="animate-scroll-bg-medium" className="opacity-45">
        <SVGMountain className={`absolute bottom-16 left-72 w-80 text-slate-500 dark:text-slate-800 ${mountainHeight}`} />
      </ParallaxLayer>

      {/* Ground plains */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-800 dark:bg-emerald-950 border-t border-emerald-700/20" />

      {/* Trackbed */}
      <ForegroundTrackbed />

      {/* Sleek LHB Train */}
      <div className="absolute bottom-[23px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Foreground electric posts (OHE Catenary) */}
      <ForegroundCatenary />

      {/* Deciduous trees midground */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="pointer-events-none opacity-85">
        <SVGDeciduousTree className="absolute bottom-16 left-12 w-6 h-8 text-emerald-900 dark:text-emerald-950" />
        <SVGPineTree className="absolute bottom-16 left-[260px] w-5 h-10 text-emerald-900 dark:text-emerald-950" />
      </ParallaxLayer>
    </div>
  );
}

// ─── 7. WEATHER SCENE (DEFAULT / FLAT PLAINS) ───────────────────────────────
export function WeatherScene({ feature, isNight, elevation }: SceneProps) {
  const mountainHeight = getMountainHeightClass(elevation);

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-350 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-1000">
      {/* Sun/Moon */}
      <div className={`absolute right-20 top-12 w-14 h-14 rounded-full transition-colors duration-1000 ${
        isNight ? 'bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
      }`} />

      {/* Far Background: Gentle plains ridges (Only if slightly elevated, otherwise empty flats) */}
      <ParallaxLayer speedClass="animate-scroll-bg-slow" className="opacity-35">
        {elevation && elevation > 180 ? (
          <>
            <SVGMountain className={`absolute bottom-16 left-0 w-[300px] text-slate-400 dark:text-slate-800 ${mountainHeight}`} />
            <SVGMountain className={`absolute bottom-16 left-[280px] w-[400px] text-slate-400 dark:text-slate-800 ${mountainHeight}`} />
          </>
        ) : (
          // Far-away flat tree belt skyline representation
          <div className="absolute bottom-16 left-0 right-0 h-10 flex gap-1 items-end opacity-20">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-16 h-8 bg-emerald-900 dark:bg-emerald-950 rounded-t-full" />
            ))}
          </div>
        )}
      </ParallaxLayer>

      {/* Agricultural field floor */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-700 dark:bg-emerald-950 border-t border-emerald-600/30" />

      {/* Trackbed */}
      <ForegroundTrackbed />

      {/* Sleek LHB passenger train silhouette */}
      <div className="absolute bottom-[23px] left-1/2 -translate-x-1/2 w-64 animate-train-bounce z-10">
        <SVGTrainCarriage className="w-full text-rail-dark dark:text-slate-200 drop-shadow-[0_4px_12px_rgba(15,23,42,0.4)]" />
        {isNight && (
          <div className="absolute top-[8px] left-[35px] right-[8px] h-[3.5px] bg-amber-200/90 shadow-[0_0_8px_rgba(253,224,71,0.65)] rounded-sm pointer-events-none" />
        )}
      </div>

      {/* Foreground electric posts (OHE Catenary) */}
      <ForegroundCatenary />

      {/* Parallax trees & foliage along the fields */}
      <ParallaxLayer speedClass="animate-scroll-bg-fast" className="pointer-events-none opacity-90">
        <SVGDeciduousTree className="absolute bottom-16 left-16 w-6 h-8 text-emerald-600 dark:text-emerald-800" />
        <SVGPineTree className="absolute bottom-16 left-[220px] w-5 h-11 text-teal-800 dark:text-teal-900" />
        <SVGDeciduousTree className="absolute bottom-16 left-[360px] w-6 h-9 text-emerald-500 dark:text-emerald-700" />
      </ParallaxLayer>
    </div>
  );
}

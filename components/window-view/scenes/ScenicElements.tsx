import React from 'react';

// Fluffy atmospheric cloud layer
export function SVGCloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 45" className={className} fill="currentColor">
      <path d="M 15,35 
               A 14,12 0 0,1 38,18 
               A 20,16 0 0,1 78,16 
               A 16,13 0 0,1 106,28 
               A 8,7 0 0,1 104,38 
               L 15,38 Z" 
            opacity="0.85" />
    </svg>
  );
}

// Sophisticated silhouette of pine trees with fine leaf layers
export function SVGPineTree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 90" className={className} fill="currentColor">
      {/* Realistic overlapping needle branches */}
      <path d="M 25,5 L 18,18 L 22,18 L 14,32 L 20,32 L 10,48 L 18,48 L 5,66 L 22,66 L 0,82 L 50,82 L 28,66 L 45,66 L 32,48 L 40,48 L 30,32 L 36,32 L 28,18 L 32,18 Z" />
      {/* Trunk */}
      <rect x="22" y="82" width="6" height="8" />
    </svg>
  );
}

// Detailed deciduous oak tree silhouette
export function SVGDeciduousTree({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 90" className={className} fill="currentColor">
      {/* Organic detailed foliage canopy */}
      <path d="M 30,5 
               C 18,5 12,14 12,24 
               C 6,24 2,32 2,42 
               C 2,52 8,58 16,58 
               C 16,64 22,70 30,70 
               C 38,70 44,64 44,58 
               C 52,58 58,52 58,42 
               C 58,32 54,24 48,24 
               C 48,14 42,5 30,5 Z" />
      {/* Branch supports */}
      <path d="M 26,70 L 26,90 L 34,90 L 34,70 M 27,65 L 21,50 M 33,65 L 39,52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// Multi-layered mountain peaks with gradient shading definitions
export function SVGMountain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 120" className={className} preserveAspectRatio="none">
      {/* Layer 1: Far Mountain ridge */}
      <path d="M 0,120 L 50,70 L 95,95 L 165,35 L 215,80 L 255,55 L 300,120 Z" fill="url(#mountainGradFar)" opacity="0.4" />
      {/* Layer 2: Mid Mountain ridge */}
      <path d="M 0,120 L 30,90 L 80,60 L 130,95 L 190,50 L 240,85 L 300,120 Z" fill="url(#mountainGradMid)" opacity="0.6" />
      
      <defs>
        <linearGradient id="mountainGradFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="mountainGradMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Snow cap for mountains
export function SVGMountainSnowCap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 120" className={className} preserveAspectRatio="none" fill="currentColor">
      {/* Snow caps on highest peaks */}
      <polygon points="165,35 152,50 159,48 165,54 171,48 178,50" />
      <polygon points="190,50 182,62 187,60 190,66 194,60 199,62" />
    </svg>
  );
}

// Truss/Suspension Bridge Segment (Heavy Iron Design)
export function SVGBridge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 80" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" preserveAspectRatio="none">
      {/* Main roadbed */}
      <line x1="0" y1="55" x2="300" y2="55" strokeWidth="4" />
      {/* Bottom girder */}
      <line x1="0" y1="68" x2="300" y2="68" strokeWidth="2" />
      {/* Truss diagonals */}
      <polyline points="0,55 25,10 50,55 75,10 100,55 125,10 150,55 175,10 200,55 225,10 250,55 275,10 300,55" />
      {/* Top girder */}
      <line x1="0" y1="10" x2="300" y2="10" strokeWidth="3" />
      {/* Vertical supports */}
      <line x1="25" y1="10" x2="25" y2="55" />
      <line x1="75" y1="10" x2="75" y2="55" />
      <line x1="125" y1="10" x2="125" y2="55" />
      <line x1="175" y1="10" x2="175" y2="55" />
      <line x1="225" y1="10" x2="225" y2="55" />
      <line x1="275" y1="10" x2="275" y2="55" />
    </svg>
  );
}

// Tunnel arch shape with realistic block lines
export function SVGTunnel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} fill="currentColor">
      {/* Outer masonry face */}
      <path d="M 0,160 L 0,75 A 80,80 0 0,1 160,75 L 160,160 Z" />
      {/* Stones border layout */}
      <path d="M 0,75 A 80,80 0 0,1 160,75" stroke="#475569" strokeWidth="8" fill="none" strokeDasharray="16,4" />
      {/* Tunnel portal hole */}
      <path d="M 22,160 L 22,82 A 58,58 0 0,1 138,82 L 138,160 Z" fill="#030712" />
    </svg>
  );
}

// City Skyscrapers Silhouette (Layered details)
export function SVGCityLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 150" className={className} fill="currentColor" preserveAspectRatio="none">
      <path d="M 0,150 
               L 0,80 L 15,80 L 15,150 
               L 25,150 L 25,50 L 50,50 L 50,150 
               L 60,150 L 60,30 L 70,30 L 70,15 L 75,15 L 75,30 L 85,30 L 85,150 
               L 95,150 L 95,95 L 120,95 L 120,150 
               L 130,150 L 130,40 L 160,40 L 160,25 L 165,25 L 165,40 L 170,40 L 170,150 
               L 180,150 L 180,75 L 205,75 L 205,150 
               L 215,150 L 215,60 L 245,60 L 245,150 
               L 255,150 L 255,85 L 285,85 L 285,150 
               L 295,150 L 295,35 L 320,35 L 320,150 
               L 330,150 L 330,90 L 360,90 L 360,150 
               L 370,150 L 370,55 L 390,55 L 390,150 
               L 400,150 Z" />
    </svg>
  );
}

// Electrified railway OHE catenary pole (foreground speed element)
export function SVGCatenaryPole({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 125" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      {/* Main H-beam structure */}
      <line x1="16" y1="125" x2="16" y2="0" strokeWidth="4" />
      <line x1="20" y1="125" x2="20" y2="0" strokeWidth="1" opacity="0.3" />
      
      {/* Diagonal structural bracing on column */}
      <line x1="16" y1="110" x2="20" y2="100" strokeWidth="0.8" opacity="0.6" />
      <line x1="16" y1="80" x2="20" y2="70" strokeWidth="0.8" opacity="0.6" />
      <line x1="16" y1="50" x2="20" y2="40" strokeWidth="0.8" opacity="0.6" />
      
      {/* Cantilever support arm for OHE wires */}
      <line x1="16" y1="18" x2="38" y2="24" strokeWidth="2.5" />
      <line x1="16" y1="26" x2="38" y2="24" />
      <line x1="16" y1="38" x2="35" y2="38" />
      
      {/* Insulators */}
      <rect x="24" y="19" width="6" height="4" fill="currentColor" stroke="none" rx="0.5" />
      <rect x="23" y="35" width="6" height="4" fill="currentColor" stroke="none" rx="0.5" />
      
      {/* Wire attachments */}
      <circle cx="38" cy="24" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="35" cy="38" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Detailed modern Indian Train (Vande Bharat / LHB Rajdhani Express style)
export function SVGTrainCarriage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 350 28" className={className} fill="currentColor">
      {/* Modern aerodynamic high-speed train silhouette */}
      <g fill="currentColor">
        {/* COACH 1: Aerodynamic nose coach (front) */}
        {/* Undercarriage bogies */}
        <rect x="12" y="21" width="80" height="3" opacity="0.8" />
        <circle cx="24" cy="24" r="3.2" />
        <circle cx="36" cy="24" r="3.2" />
        <circle cx="72" cy="24" r="3.2" />
        <circle cx="84" cy="24" r="3.2" />
        
        {/* Aerodynamic windshield and continuous window band */}
        <path d="M 6,21 L 6,10 C 6,10 22,6 36,6 L 94,6 L 94,21 Z" />
        {/* Cabin glass reflection window */}
        <path d="M 12,17 L 17,9 C 19,8 24,8 27,9 L 40,9 L 40,17 Z" fill="#f8fafc" opacity="0.3" />
        {/* Passenger continuous window slot LHB wrap */}
        <rect x="48" y="10" width="40" height="5" rx="1" fill="#0f172a" />
        {/* Doors */}
        <rect x="90" y="7.5" width="3" height="13.5" fill="#334155" />
        
        {/* Coach connector corridor gangway */}
        <rect x="94" y="9" width="3" height="11" opacity="0.7" />

        {/* COACH 2: Center passenger coach */}
        <rect x="99" y="21" width="112" height="3" opacity="0.8" />
        <circle cx="110" cy="24" r="3.2" />
        <circle cx="122" cy="24" r="3.2" />
        <circle cx="188" cy="24" r="3.2" />
        <circle cx="200" cy="24" r="3.2" />
        
        <rect x="97" y="6" width="116" height="15" rx="1.5" />
        {/* Continuous windows banner */}
        <rect x="104" y="10" width="102" height="5" rx="1" fill="#0f172a" />
        {/* Segmented window dividers */}
        <g fill="#475569">
          <rect x="120" y="10" width="1.5" height="5" />
          <rect x="138" y="10" width="1.5" height="5" />
          <rect x="156" y="10" width="1.5" height="5" />
          <rect x="174" y="10" width="1.5" height="5" />
          <rect x="192" y="10" width="1.5" height="5" />
        </g>
        {/* Underbody vents */}
        <rect x="138" y="21" width="12" height="2" opacity="0.5" />
        
        <rect x="213" y="9" width="3" height="11" opacity="0.7" />

        {/* COACH 3: Rear passenger coach */}
        <rect x="218" y="21" width="112" height="3" opacity="0.8" />
        <circle cx="228" cy="24" r="3.2" />
        <circle cx="240" cy="24" r="3.2" />
        <circle cx="306" cy="24" r="3.2" />
        <circle cx="318" cy="24" r="3.2" />
        
        <rect x="216" y="6" width="116" height="15" rx="1.5" />
        <rect x="223" y="10" width="102" height="5" rx="1" fill="#0f172a" />
        <g fill="#475569">
          <rect x="239" y="10" width="1.5" height="5" />
          <rect x="257" y="10" width="1.5" height="5" />
          <rect x="275" y="10" width="1.5" height="5" />
          <rect x="293" y="10" width="1.5" height="5" />
          <rect x="311" y="10" width="1.5" height="5" />
        </g>
      </g>
    </svg>
  );
}

// Twinkling Star for night atmospheres
export function SVGStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12,2 L14.5,9 L22,9 L16,13.5 L18.5,20.5 L12,16 L5.5,20.5 L8,13.5 L2,9 L9.5,9 Z" />
    </svg>
  );
}

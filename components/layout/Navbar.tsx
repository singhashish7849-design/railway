'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Train, Search, Map, User, Heart, LogOut, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useJourneyStore } from '@/store/journey';
import { useSearchStore } from '@/store/search';
import { useAuth } from '@/hooks/useAuth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  const activeTrainId = useJourneyStore((state) => state.activeTrainId);
  const recentSearches = useSearchStore((state) => state.recentSearches);

  // Target train for Live Tracking navigation
  const targetTrain = activeTrainId || recentSearches[0]?.number || '12951';
  const liveTrackingHref = `/train/${targetTrain}`;

  const navLinks = [
    { href: '/', label: 'Home', icon: Train },
    { href: '/bookings', label: 'My Bookings', icon: TicketIcon },
    { href: liveTrackingHref, label: 'Live Tracking', icon: Map },
    { href: '/seat-selection', label: 'Seat Selection', icon: GridIcon },
    { href: '/food', label: 'Food Order', icon: FoodIcon },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
      <div className="glass-panel mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-6 py-3 shadow-glass">
        
        {/* Left Side: Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rail-blue text-white shadow-glow transition-transform group-hover:scale-105">
            <Train className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Rail<span className="text-rail-blue">Gaadi</span>
            </span>
            <span className="hidden sm:inline-block ml-2 rounded-full bg-rail-blue/10 px-2 py-0.5 font-mono text-[10px] font-bold text-rail-blue">
              LIVE
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href.split('?')[0]);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-[11px] font-black tracking-wide uppercase transition-colors rounded-xl',
                  isActive
                    ? 'text-rail-blue bg-rail-blue/5'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                )}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Quick Search & Profile / Auth Links */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search Trigger Icon */}
          <Link
            href="/?focus=true"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/50 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-500 hover:text-slate-950 dark:hover:text-white transition-all outline-none"
            title="Search trains (Cmd+K)"
          >
            <Search className="h-4.5 w-4.5" />
          </Link>

          {isAuthenticated ? (
            <>
              {/* Profile Link */}
              <Link
                href="/profile"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all outline-none",
                  pathname === '/profile'
                    ? "border-rail-blue bg-rail-blue/10 text-rail-blue"
                    : "border-slate-200/50 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 hover:text-rail-blue"
                )}
                title="My Profile"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all outline-none"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-rail-blue hover:bg-sky-600 px-3.5 text-xs font-bold text-white shadow-glow transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </Link>
            </>
          )}

        </div>
      </div>
    </header>
  );
}

// Inline SVG Icons
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function FoodIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function TicketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M13 5v2" />
      <path d="M13 11v2" />
      <path d="M13 17v2" />
    </svg>
  );
}

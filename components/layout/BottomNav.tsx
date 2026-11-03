'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Train, User, Coffee, Ticket } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFavoritesStore } from '@/store/favorites';
import { useJourneyStore } from '@/store/journey';
import { useSearchStore } from '@/store/search';

export function BottomNav() {
  const pathname = usePathname();
  const { favorites } = useFavoritesStore();
  const activeTrainId = useJourneyStore((state) => state.activeTrainId);
  const recentSearches = useSearchStore((state) => state.recentSearches);

  // Hide BottomNav on auth pages
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(pathname);
  if (isAuthPage) return null;

  const targetTrain = activeTrainId || recentSearches[0]?.number || '12951';
  const liveTrackingHref = `/train/${targetTrain}`;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/bookings', label: 'Bookings', icon: Ticket },
    { href: liveTrackingHref, label: 'Track', icon: Train },
    { href: '/favorites', label: 'Favorites', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-panel mx-3 mb-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass overflow-hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/'
                ? pathname === '/'
                : pathname.startsWith(href.split('?')[0]);
            
            const isFavoritesTab = label === 'Favorites';

            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200',
                  isActive
                    ? 'text-rail-blue font-bold'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                <div className="relative">
                  <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                  {isFavoritesTab && favorites.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white border border-white dark:border-slate-950">
                      {favorites.length > 9 ? '9+' : favorites.length}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-semibold tracking-wide uppercase mt-0.5">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rail-blue" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

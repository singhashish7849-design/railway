import React from 'react';
import { BookingCategoryTab } from '@/lib/bookings/types';
import { cn } from '@/utils/cn';

interface BookingTabsProps {
  activeTab: BookingCategoryTab;
  onTabChange: (tab: BookingCategoryTab) => void;
  counts: Record<BookingCategoryTab, number>;
}

export function BookingTabs({ activeTab, onTabChange, counts }: BookingTabsProps) {
  const tabs: { id: BookingCategoryTab; label: string }[] = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 p-1.5 border border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap outline-none",
              isActive
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold",
                isActive
                  ? "bg-rail-blue text-white"
                  : "bg-slate-300/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

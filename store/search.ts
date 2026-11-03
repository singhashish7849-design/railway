import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResult } from '@/types/train';

interface SearchState {
  recentSearches: SearchResult[];
  addRecentSearch: (train: SearchResult) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      addRecentSearch: (train) => {
        const current = get().recentSearches;
        // Filter out existing and keep max 6
        const filtered = current.filter((t) => t.number !== train.number);
        const updated = [train, ...filtered].slice(0, 6);
        set({ recentSearches: updated });
      },
      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },
    }),
    {
      name: 'railgaadi-searches',
    }
  )
);

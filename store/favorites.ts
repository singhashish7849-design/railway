import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResult } from '@/types/train';

interface FavoritesState {
  favorites: SearchResult[];
  toggleFavorite: (train: SearchResult) => void;
  isFavorite: (trainIdOrNumber: string) => boolean;
  removeFavorite: (trainNumber: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (train) => {
        const current = get().favorites;
        const trainId = train.id || train.number;
        const exists = current.some((f) => (f.id || f.number) === trainId);
        
        if (exists) {
          set({
            favorites: current.filter((f) => (f.id || f.number) !== trainId),
          });
        } else {
          set({
            favorites: [...current, train],
          });
        }
      },
      isFavorite: (trainIdOrNumber) => {
        return get().favorites.some((f) => (f.id || f.number) === trainIdOrNumber);
      },
      removeFavorite: (trainNumber) => {
        set({
          favorites: get().favorites.filter((f) => f.number !== trainNumber),
        });
      },
    }),
    {
      name: 'railgaadi-favorites',
    }
  )
);

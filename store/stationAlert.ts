import { create } from 'zustand';

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  isDelayWarning?: boolean;
  timestamp: number;
}

interface StationAlertStoreState {
  notifications: InAppNotification[];
  addNotification: (notification: Omit<InAppNotification, 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useStationAlertStore = create<StationAlertStoreState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications.filter((n) => n.id !== notification.id),
        { ...notification, timestamp: Date.now() }
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearNotifications: () => set({ notifications: [] })
}));

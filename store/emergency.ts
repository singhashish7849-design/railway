import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  EmergencyEvent,
  ParentContact,
  OfflineJourneyCache,
  SecurityPersonnel,
  NetworkStatusType
} from '@/types/emergency';

interface TimelineStep {
  time: string;
  text: string;
  status: 'completed' | 'waiting' | 'failed' | 'info';
}

interface EmergencyState {
  isEmergencyActive: boolean;
  activeEvent: EmergencyEvent | null;
  timelineSteps: TimelineStep[];
  parentContacts: ParentContact[];
  cachedJourney: OfflineJourneyCache | null;
  securityPersonnel: SecurityPersonnel[];
  networkStatus: NetworkStatusType;
  syncStatus: 'syncing' | 'synced' | 'failed' | 'idle';
  
  // Setters/Actions
  setEmergencyActive: (active: boolean) => void;
  setActiveEvent: (event: EmergencyEvent | null) => void;
  setTimelineSteps: (steps: TimelineStep[]) => void;
  addTimelineStep: (text: string, status: TimelineStep['status']) => void;
  setParentContacts: (contacts: ParentContact[]) => void;
  setCachedJourney: (cache: OfflineJourneyCache | null) => void;
  setSecurityPersonnel: (personnel: SecurityPersonnel[]) => void;
  setNetworkStatus: (status: NetworkStatusType) => void;
  setSyncStatus: (status: 'syncing' | 'synced' | 'failed' | 'idle') => void;
  resetEmergencyState: () => void;
}

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set) => ({
      isEmergencyActive: false,
      activeEvent: null,
      timelineSteps: [],
      parentContacts: [],
      cachedJourney: null,
      securityPersonnel: [],
      networkStatus: 'CONNECTED',
      syncStatus: 'idle',

      setEmergencyActive: (active) => set({ isEmergencyActive: active }),
      setActiveEvent: (event) => set({ activeEvent: event }),
      setTimelineSteps: (steps) => set({ timelineSteps: steps }),
      addTimelineStep: (text, status) =>
        set((state) => {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            timelineSteps: [...state.timelineSteps, { time, text, status }]
          };
        }),
      setParentContacts: (contacts) => set({ parentContacts: contacts }),
      setCachedJourney: (cache) => set({ cachedJourney: cache }),
      setSecurityPersonnel: (personnel) => set({ securityPersonnel: personnel }),
      setNetworkStatus: (status) => set({ networkStatus: status }),
      setSyncStatus: (status) => set({ syncStatus: status }),
      resetEmergencyState: () =>
        set({
          isEmergencyActive: false,
          activeEvent: null,
          timelineSteps: [],
          securityPersonnel: [],
          syncStatus: 'idle'
        })
    }),
    {
      name: 'railgaadi-emergency',
      partialize: (state) => ({
        isEmergencyActive: state.isEmergencyActive,
        activeEvent: state.activeEvent,
        timelineSteps: state.timelineSteps,
        parentContacts: state.parentContacts,
        cachedJourney: state.cachedJourney
      })
    }
  )
);

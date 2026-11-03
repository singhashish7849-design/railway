import { useEffect } from 'react';
import { useEmergencyStore } from '@/store/emergency';
import { emergencySyncService } from '@/services/emergency/emergencySyncService';

export function useEmergencySync() {
  const syncStatus = useEmergencyStore((state) => state.syncStatus);
  const setSyncStatus = useEmergencyStore((state) => state.setSyncStatus);
  const addTimelineStep = useEmergencyStore((state) => state.addTimelineStep);
  const activeEvent = useEmergencyStore((state) => state.activeEvent);

  useEffect(() => {
    // Register sync event listeners from sync service
    const unsubscribe = emergencySyncService.registerListener((status, message) => {
      setSyncStatus(status);
      if (status === 'syncing' && message) {
        addTimelineStep(message, 'waiting');
      } else if (status === 'synced' && message) {
        addTimelineStep(message, 'completed');
        // If an event synced, update syncStatus in local state if activeEvent is present
        if (activeEvent) {
          activeEvent.syncStatus = 'SYNCED';
        }
      } else if (status === 'failed' && message) {
        addTimelineStep(message, 'failed');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setSyncStatus, addTimelineStep, activeEvent]);

  return {
    syncStatus
  };
}

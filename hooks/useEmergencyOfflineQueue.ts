import { useState, useEffect, useCallback } from 'react';
import { EmergencyEvent, EmergencyCommunication } from '@/types/emergency';
import { emergencyStorageService } from '@/services/emergency/emergencyStorageService';

export function useEmergencyOfflineQueue() {
  const [pendingEvents, setPendingEvents] = useState<EmergencyEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshQueue = useCallback(async () => {
    setLoading(true);
    try {
      const list = await emergencyStorageService.getPendingEvents();
      setPendingEvents(list);
    } catch (err) {
      console.error('Failed to load pending emergency events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQueuedEvent = useCallback(async (id: string) => {
    try {
      await emergencyStorageService.deleteEvent(id);
      await refreshQueue();
    } catch (err) {
      console.error(`Failed to delete queued event ${id}:`, err);
    }
  }, [refreshQueue]);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  return {
    pendingEvents,
    loading,
    refreshQueue,
    deleteQueuedEvent
  };
}

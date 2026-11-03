import { EmergencyEvent, SyncStatusType, NetworkStatusType } from '@/types/emergency';
import { emergencyStorageService } from './emergencyStorageService';
import { emergencyLocationService } from './emergencyLocationService';

export const emergencyService = {
  async activateEmergency(params: {
    trainNumber: string;
    trainName: string;
    coach: string;
    seat: string;
    currentStation: string;
    nextStation: string;
    destination: string;
  }): Promise<{ event: EmergencyEvent; locationSuccess: boolean }> {
    const eventId = `event_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    // 1. Get GPS coordinates if possible
    let latitude: number | undefined;
    let longitude: number | undefined;
    let accuracy: number | undefined;
    let locationSuccess = false;

    try {
      const position = await emergencyLocationService.getCurrentLocation();
      latitude = position.latitude;
      longitude = position.longitude;
      accuracy = position.accuracy;
      locationSuccess = true;
    } catch (err) {
      console.warn('Geolocation failed during emergency activation:', err);
    }

    // 2. Create the emergency event data packet
    const event: EmergencyEvent = {
      id: eventId,
      userId: 'anonymous_user',
      trainNumber: params.trainNumber,
      trainName: params.trainName,
      coach: params.coach,
      seat: params.seat,
      currentStation: params.currentStation,
      nextStation: params.nextStation,
      destination: params.destination,
      latitude,
      longitude,
      accuracy,
      status: 'ACTIVE',
      syncStatus: 'PENDING',
      networkStatus: typeof navigator !== 'undefined' && navigator.onLine ? 'CONNECTED' : 'OFFLINE',
      createdAt: timestamp,
      updatedAt: timestamp,
      timestamp
    };

    // 3. Save to local storage (IndexedDB)
    await emergencyStorageService.createEvent(event);

    // 4. Try to sync with server if online
    if (event.networkStatus === 'CONNECTED') {
      try {
        const response = await fetch('/api/emergency/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });

        if (response.ok) {
          event.syncStatus = 'SYNCED';
          await emergencyStorageService.createEvent(event); // Update status to synced
        }
      } catch (err) {
        console.warn('Initial server sync failed, queued for background sync:', err);
      }
    }

    return { event, locationSuccess };
  },

  async getActiveEvent(): Promise<EmergencyEvent | null> {
    const events = await emergencyStorageService.getEvents();
    return events.find(e => e.status === 'ACTIVE') || null;
  },

  async deactivateEmergency(eventId: string): Promise<void> {
    const event = await emergencyStorageService.getEvent(eventId);
    if (!event) return;

    const timestamp = new Date().toISOString();
    event.status = 'RESOLVED';
    event.updatedAt = timestamp;
    event.syncStatus = 'PENDING';

    await emergencyStorageService.createEvent(event);

    // Sync state to server if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        const response = await fetch(`/api/emergency/events/${eventId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });

        if (response.ok) {
          event.syncStatus = 'SYNCED';
          await emergencyStorageService.createEvent(event);
        }
      } catch (err) {
        console.warn('Deactivation sync failed, queued for background sync:', err);
      }
    }
  }
};

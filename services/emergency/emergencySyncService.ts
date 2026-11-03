import { emergencyStorageService } from './emergencyStorageService';

type SyncCallback = (status: 'syncing' | 'synced' | 'failed', message?: string) => void;

class EmergencySyncService {
  private listeners: Set<SyncCallback> = new Set();
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkReturn());
      window.addEventListener('offline', () => this.notifyStatus('failed', 'Network offline'));
    }
  }

  registerListener(callback: SyncCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyStatus(status: 'syncing' | 'synced' | 'failed', message?: string) {
    this.listeners.forEach((listener) => {
      try {
        listener(status, message);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  async handleNetworkReturn() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.notifyStatus('syncing', 'Connection restored. Syncing emergency events...');

    try {
      const pendingEvents = await emergencyStorageService.getPendingEvents();
      if (pendingEvents.length === 0) {
        this.isSyncing = false;
        this.notifyStatus('synced', 'Connection restored. All events are up to date.');
        return;
      }

      for (const event of pendingEvents) {
        const response = await fetch(`/api/emergency/events/${event.id}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });

        if (response.ok) {
          await emergencyStorageService.markAsSynced(event.id);
          
          // Also sync any communications associated with it
          const comms = await emergencyStorageService.getCommunicationsForEvent(event.id);
          for (const comm of comms) {
            if (comm.status === 'PREPARED') {
              await emergencyStorageService.updateCommunicationStatus(comm.id, 'SYNCED');
            }
          }
        } else {
          throw new Error(`Sync failed with status: ${response.status}`);
        }
      }

      this.notifyStatus('synced', 'Connection restored. Emergency information synchronized.');
    } catch (err) {
      console.error('Sync failed:', err);
      this.notifyStatus('failed', 'Synchronization failed. Will retry when connection stabilizes.');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const emergencySyncService = new EmergencySyncService();

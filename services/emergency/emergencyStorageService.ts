import {
  EmergencyEvent,
  EmergencyCommunication,
  ParentContact,
  OfflineJourneyCache,
  CommunicationStatus
} from '@/types/emergency';

const DB_NAME = 'RailGaadiEmergencyDB';
const DB_VERSION = 1;
const EVENTS_STORE = 'EmergencyEventStore';
const COMMS_STORE = 'EmergencyCommunicationStore';
const CONTACTS_STORE = 'ParentContactsStore';
const CACHE_STORE = 'OfflineJourneyCacheStore';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        db.createObjectStore(EVENTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(COMMS_STORE)) {
        db.createObjectStore(COMMS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CONTACTS_STORE)) {
        db.createObjectStore(CONTACTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'trainNumber' });
      }
    };
  });
}

export const emergencyStorageService = {
  // ─── Emergency Events ───
  async createEvent(event: EmergencyEvent): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.put(event);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getEvents(): Promise<EmergencyEvent[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async getEvent(id: string): Promise<EmergencyEvent | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getPendingEvents(): Promise<EmergencyEvent[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const events: EmergencyEvent[] = request.result || [];
        resolve(events.filter((e) => e.syncStatus === 'PENDING'));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async markAsSynced(id: string): Promise<void> {
    const event = await this.getEvent(id);
    if (!event) return;
    event.syncStatus = 'SYNCED';
    event.updatedAt = new Date().toISOString();
    await this.createEvent(event);
  },

  async deleteEvent(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(EVENTS_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // ─── Parent Contacts ───
  async saveParentContacts(contacts: ParentContact[]): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTACTS_STORE], 'readwrite');
      const store = transaction.objectStore(CONTACTS_STORE);
      
      // Clear existing first
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        if (contacts.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        let hasError = false;
        contacts.forEach((contact) => {
          const putReq = store.put(contact);
          putReq.onsuccess = () => {
            completed++;
            if (completed === contacts.length && !hasError) {
              resolve();
            }
          };
          putReq.onerror = () => {
            hasError = true;
            reject(putReq.error);
          };
        });
      };
      clearReq.onerror = () => reject(clearReq.error);
    });
  },

  async getParentContacts(): Promise<ParentContact[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CONTACTS_STORE], 'readonly');
      const store = transaction.objectStore(CONTACTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  // ─── Journey Cache ───
  async cacheJourney(cache: OfflineJourneyCache): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.put(cache);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getCachedJourney(trainNumber: string): Promise<OfflineJourneyCache | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.get(trainNumber);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getLatestCachedJourney(): Promise<OfflineJourneyCache | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([CACHE_STORE], 'readonly');
      const store = transaction.objectStore(CACHE_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const caches: OfflineJourneyCache[] = request.result || [];
        if (caches.length === 0) {
          resolve(null);
          return;
        }
        // Sort by timestamp descending
        caches.sort((a, b) => new Date(b.lastUpdateTimestamp).getTime() - new Date(a.lastUpdateTimestamp).getTime());
        resolve(caches[0]);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // ─── Emergency Communications ───
  async createCommunication(comm: EmergencyCommunication): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COMMS_STORE], 'readwrite');
      const store = transaction.objectStore(COMMS_STORE);
      const request = store.put(comm);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getCommunicationsForEvent(eventId: string): Promise<EmergencyCommunication[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COMMS_STORE], 'readonly');
      const store = transaction.objectStore(COMMS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const comms: EmergencyCommunication[] = request.result || [];
        resolve(comms.filter((c) => c.emergencyEventId === eventId));
      };
      request.onerror = () => reject(request.error);
    });
  },

  async updateCommunicationStatus(id: string, status: CommunicationStatus): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COMMS_STORE], 'readwrite');
      const store = transaction.objectStore(COMMS_STORE);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const comm = getRequest.result as EmergencyCommunication;
        if (!comm) {
          resolve();
          return;
        }
        comm.status = status;
        if (status === 'SENT' || status === 'SYNCED') {
          comm.sentAt = new Date().toISOString();
        }
        const putRequest = store.put(comm);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
};

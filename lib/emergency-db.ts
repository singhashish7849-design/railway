import fs from 'fs';
import path from 'path';
import { EmergencyEvent, EmergencyCommunication } from '@/types/emergency';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'emergency_db.json');

interface EmergencyDbSchema {
  events: EmergencyEvent[];
  communications: EmergencyCommunication[];
}

function readDb(): EmergencyDbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: EmergencyDbSchema = { events: [], communications: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read emergency database, recreating:', err);
    const defaultDb: EmergencyDbSchema = { events: [], communications: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function writeDb(data: EmergencyDbSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const emergencyDb = {
  getEvents(): EmergencyEvent[] {
    const db = readDb();
    return db.events;
  },

  getEventById(id: string): EmergencyEvent | null {
    const db = readDb();
    return db.events.find((e) => e.id === id) || null;
  },

  createEvent(event: EmergencyEvent): void {
    const db = readDb();
    // Check if event already exists
    const idx = db.events.findIndex((e) => e.id === event.id);
    const serverEvent = { ...event, syncStatus: 'SYNCED' as const, updatedAt: new Date().toISOString() };
    if (idx !== -1) {
      db.events[idx] = serverEvent;
    } else {
      db.events.push(serverEvent);
    }
    writeDb(db);
  },

  createCommunication(comm: EmergencyCommunication): void {
    const db = readDb();
    const idx = db.communications.findIndex((c) => c.id === comm.id);
    if (idx !== -1) {
      db.communications[idx] = comm;
    } else {
      db.communications.push(comm);
    }
    writeDb(db);
  },

  getCommunicationsByEventId(eventId: string): EmergencyCommunication[] {
    const db = readDb();
    return db.communications.filter((c) => c.emergencyEventId === eventId);
  }
};

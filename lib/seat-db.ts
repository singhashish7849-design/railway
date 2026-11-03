import fs from 'fs';
import path from 'path';
import {
  CoachConfiguration,
  BerthConfiguration,
  SeatAvailabilitySnapshot,
  SeatAvailabilityStatus,
  BerthType
} from '@/types/seat';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'seat_selection_db.json');

interface DbSchema {
  coachConfigurations: CoachConfiguration[];
  berthConfigurations: BerthConfiguration[];
  seatAvailabilitySnapshots: SeatAvailabilitySnapshot[];
}

// Global in-memory DB lock to support simulated concurrency / atomicity in a single node process
let dbLock = false;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDb(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultDb = seedDefaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read seat database, recreating defaults:', err);
    const defaultDb = seedDefaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

function writeDb(data: DbSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getCoachConfigurations(trainNumber: string): CoachConfiguration[] {
  const db = readDb();
  return db.coachConfigurations.filter((c) => c.trainNumber === trainNumber);
}

export function getBerthConfigurations(coachConfigurationId: string): BerthConfiguration[] {
  const db = readDb();
  return db.berthConfigurations.filter((b) => b.coachConfigurationId === coachConfigurationId);
}

export function getSnapshots(
  trainNumber: string,
  journeyDate: string,
  coachNumber: string
): SeatAvailabilitySnapshot[] {
  const db = readDb();
  return db.seatAvailabilitySnapshots.filter(
    (s) =>
      s.trainNumber === trainNumber &&
      s.journeyDate === journeyDate &&
      s.coachNumber === coachNumber
  );
}

export function upsertSnapshots(snapshots: SeatAvailabilitySnapshot[]): void {
  const db = readDb();
  const existingMap = new Map<string, SeatAvailabilitySnapshot>();

  // Map existing snapshots
  db.seatAvailabilitySnapshots.forEach((s) => {
    const key = `${s.trainNumber}:${s.journeyDate}:${s.coachNumber}:${s.berthNumber}`;
    existingMap.set(key, s);
  });

  // Merge new ones
  snapshots.forEach((s) => {
    const key = `${s.trainNumber}:${s.journeyDate}:${s.coachNumber}:${s.berthNumber}`;
    existingMap.set(key, s);
  });

  db.seatAvailabilitySnapshots = Array.from(existingMap.values());
  writeDb(db);
}

/**
 * Perform an atomic check-and-lock operation for seat selection.
 * Throws an error or returns false if the seat is already occupied/reserved.
 */
export async function lockSeatAtomic(
  trainNumber: string,
  journeyDate: string,
  coachNumber: string,
  berthNumber: number,
  source: string,
  holdDurationSeconds: number = 300
): Promise<{ success: boolean; message: string; snapshot?: SeatAvailabilitySnapshot }> {
  // Wait/spin to acquire global database lock
  let attempts = 0;
  while (dbLock && attempts < 10) {
    await delay(50);
    attempts++;
  }

  dbLock = true;

  try {
    const db = readDb();

    // 1. Verify that this coach configuration and berth actually exist
    const coachConfig = db.coachConfigurations.find(
      (c) => c.trainNumber === trainNumber && c.coachNumber === coachNumber
    );

    if (!coachConfig) {
      return { success: false, message: `Coach ${coachNumber} configuration not found for train ${trainNumber}` };
    }

    const berthConfig = db.berthConfigurations.find(
      (b) => b.coachConfigurationId === coachConfig.id && b.berthNumber === berthNumber
    );

    if (!berthConfig) {
      return { success: false, message: `Berth ${berthNumber} not found in coach ${coachNumber}` };
    }

    // 2. Check current availability snapshot
    const existingIndex = db.seatAvailabilitySnapshots.findIndex(
      (s) =>
        s.trainNumber === trainNumber &&
        s.journeyDate === journeyDate &&
        s.coachNumber === coachNumber &&
        s.berthNumber === berthNumber
    );

    const now = new Date();
    const expiry = new Date(now.getTime() + holdDurationSeconds * 1000);

    if (existingIndex >= 0) {
      const snapshot = db.seatAvailabilitySnapshots[existingIndex];
      // Check if it is expired
      const isExpired = new Date(snapshot.expiresAt).getTime() < now.getTime();

      if (!isExpired && snapshot.status !== 'AVAILABLE') {
        return {
          success: false,
          message: `Seat ${berthNumber} was just selected by another passenger.`
        };
      }

      // If available or expired, we can overwrite/lock it
      snapshot.status = 'RESERVED';
      snapshot.source = source;
      snapshot.fetchedAt = now.toISOString();
      snapshot.expiresAt = expiry.toISOString();
      db.seatAvailabilitySnapshots[existingIndex] = snapshot;
    } else {
      // Create new snapshot
      const newSnapshot: SeatAvailabilitySnapshot = {
        id: `snap_${trainNumber}_${journeyDate}_${coachNumber}_${berthNumber}_${Date.now()}`,
        trainNumber,
        journeyDate,
        coachNumber,
        berthNumber,
        status: 'RESERVED',
        source,
        fetchedAt: now.toISOString(),
        expiresAt: expiry.toISOString()
      };
      db.seatAvailabilitySnapshots.push(newSnapshot);
    }

    writeDb(db);

    const finalSnapshot = db.seatAvailabilitySnapshots.find(
      (s) =>
        s.trainNumber === trainNumber &&
        s.journeyDate === journeyDate &&
        s.coachNumber === coachNumber &&
        s.berthNumber === berthNumber
    );

    return {
      success: true,
      message: `Seat ${berthNumber} locked successfully.`,
      snapshot: finalSnapshot
    };
  } finally {
    dbLock = false;
  }
}

function seedDefaultDb(): DbSchema {
  const coachConfigs: CoachConfiguration[] = [];
  const berthConfigs: BerthConfiguration[] = [];
  const nowStr = new Date().toISOString();

  // Helper to generate seed configs
  const addCoach = (
    train: string,
    cls: string,
    coachNum: string,
    pos: number,
    layout: string,
    rows: number,
    cols: number
  ) => {
    const configId = `cfg_${train}_${coachNum}_${Date.now()}_${pos}`;
    coachConfigs.push({
      id: configId,
      trainNumber: train,
      classCode: cls,
      coachNumber: coachNum,
      layoutType: layout,
      configurationVersion: 1,
      source: 'verified-railway-schema',
      verifiedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr
    });

    generateBerths(configId, layout, rows, cols).forEach((b) => berthConfigs.push(b));
  };

  // --- Train 12951 (New Delhi Rajdhani) ---
  // 3A class: B1, B2, B3, B4 (Layout: 3A_64, 64 berths)
  addCoach('12951', '3A', 'B1', 4, '3A_64', 16, 6);
  addCoach('12951', '3A', 'B2', 5, '3A_64', 16, 6);
  addCoach('12951', '3A', 'B3', 6, '3A_64', 16, 6);
  addCoach('12951', '3A', 'B4', 7, '3A_64', 16, 6);

  // 2A class: A1, A2 (Layout: 2A_46, 46 berths)
  addCoach('12951', '2A', 'A1', 2, '2A_46', 16, 5);
  addCoach('12951', '2A', 'A2', 3, '2A_46', 16, 5);

  // 1A class: H1 (Layout: 1A_24, 24 berths)
  addCoach('12951', '1A', 'H1', 1, '1A_24', 8, 6);

  // --- Train 12001 (Bhopal Shatabdi) ---
  // CC class: C1, C2, C3, C4, C5 (Layout: CC_78, 78 seats)
  addCoach('12001', 'CC', 'C1', 2, 'CC_78', 16, 6);
  addCoach('12001', 'CC', 'C2', 3, 'CC_78', 16, 6);
  addCoach('12001', 'CC', 'C3', 4, 'CC_78', 16, 6);
  addCoach('12001', 'CC', 'C4', 5, 'CC_78', 16, 6);
  addCoach('12001', 'CC', 'C5', 6, 'CC_78', 16, 6);

  // EC class: E1 (Layout: EC_56, 56 seats)
  addCoach('12001', 'EC', 'E1', 1, 'EC_56', 14, 5);

  // --- Train 22436 (Varanasi Vande Bharat) ---
  // CC class: C1, C2, C3, C4, C5 (Layout: CC_78, 78 seats)
  addCoach('22436', 'CC', 'C1', 3, 'CC_78', 16, 6);
  addCoach('22436', 'CC', 'C2', 4, 'CC_78', 16, 6);
  addCoach('22436', 'CC', 'C3', 5, 'CC_78', 16, 6);
  addCoach('22436', 'CC', 'C4', 6, 'CC_78', 16, 6);
  addCoach('22436', 'CC', 'C5', 7, 'CC_78', 16, 6);

  // EC class: E1, E2 (Layout: EC_52, 52 seats)
  addCoach('22436', 'EC', 'E1', 1, 'EC_52', 13, 5);
  addCoach('22436', 'EC', 'E2', 2, 'EC_52', 13, 5);

  return {
    coachConfigurations: coachConfigs,
    berthConfigurations: berthConfigs,
    seatAvailabilitySnapshots: []
  };
}

function generateBerths(
  configId: string,
  layout: string,
  rows: number,
  cols: number
): BerthConfiguration[] {
  const berths: BerthConfiguration[] = [];

  if (layout === '3A_64') {
    // 8 compartments of 8 berths = 64 berths
    for (let c = 0; c < 8; c++) {
      const startBerth = c * 8 + 1;
      const r1 = c * 2;
      const r2 = c * 2 + 1;

      // Inside cabin: Col 0 (Lower), Col 1 (Middle), Col 2 (Upper)
      berths.push({ id: `${configId}_b_${startBerth}`, coachConfigurationId: configId, berthNumber: startBerth, berthType: 'LOWER', row: r1, column: 0 });
      berths.push({ id: `${configId}_b_${startBerth + 1}`, coachConfigurationId: configId, berthNumber: startBerth + 1, berthType: 'MIDDLE', row: r1, column: 1 });
      berths.push({ id: `${configId}_b_${startBerth + 2}`, coachConfigurationId: configId, berthNumber: startBerth + 2, berthType: 'UPPER', row: r1, column: 2 });

      berths.push({ id: `${configId}_b_${startBerth + 3}`, coachConfigurationId: configId, berthNumber: startBerth + 3, berthType: 'LOWER', row: r2, column: 0 });
      berths.push({ id: `${configId}_b_${startBerth + 4}`, coachConfigurationId: configId, berthNumber: startBerth + 4, berthType: 'MIDDLE', row: r2, column: 1 });
      berths.push({ id: `${configId}_b_${startBerth + 5}`, coachConfigurationId: configId, berthNumber: startBerth + 5, berthType: 'UPPER', row: r2, column: 2 });

      // Side cabin: Col 4 (Side Lower), Col 5 (Side Upper)
      berths.push({ id: `${configId}_b_${startBerth + 6}`, coachConfigurationId: configId, berthNumber: startBerth + 6, berthType: 'SIDE_LOWER', row: r1, column: 4 });
      berths.push({ id: `${configId}_b_${startBerth + 7}`, coachConfigurationId: configId, berthNumber: startBerth + 7, berthType: 'SIDE_UPPER', row: r2, column: 5 });
    }
  } else if (layout === '2A_46') {
    // 8 compartments of 6 berths = 48 berths total. Standard 2A cap is 46, so cap at 46.
    for (let c = 0; c < 8; c++) {
      const startBerth = c * 6 + 1;
      const r1 = c * 2;
      const r2 = c * 2 + 1;

      // Inside cabin: Col 0 (Lower), Col 1 (Upper)
      if (startBerth <= 46) {
        berths.push({ id: `${configId}_b_${startBerth}`, coachConfigurationId: configId, berthNumber: startBerth, berthType: 'LOWER', row: r1, column: 0 });
      }
      if (startBerth + 1 <= 46) {
        berths.push({ id: `${configId}_b_${startBerth + 1}`, coachConfigurationId: configId, berthNumber: startBerth + 1, berthType: 'UPPER', row: r1, column: 1 });
      }
      if (startBerth + 2 <= 46) {
        berths.push({ id: `${configId}_b_${startBerth + 2}`, coachConfigurationId: configId, berthNumber: startBerth + 2, berthType: 'LOWER', row: r2, column: 0 });
      }
      if (startBerth + 3 <= 46) {
        berths.push({ id: `${configId}_b_${startBerth + 3}`, coachConfigurationId: configId, berthNumber: startBerth + 3, berthType: 'UPPER', row: r2, column: 1 });
      }

      // Side cabin: Col 3 (Side Lower), Col 4 (Side Upper)
      if (startBerth + 4 <= 46) {
        berths.push({ id: `${configId}_b_${startBerth + 4}`, coachConfigurationId: configId, berthNumber: startBerth + 4, berthType: 'SIDE_LOWER', row: r1, column: 3 });
      }
      if (startBerth + 5 <= 46) {
        berths.push({ id: `${configId}_b_${startBerth + 5}`, coachConfigurationId: configId, berthNumber: startBerth + 5, berthType: 'SIDE_UPPER', row: r2, column: 4 });
      }
    }
  } else if (layout === '1A_24') {
    // 4 cabins (16 berths) + 4 coupes (8 berths) = 24 berths
    // Cabin: 4 berths (L/U on left, L/U on right)
    for (let c = 0; c < 4; c++) {
      const startBerth = c * 4 + 1;
      const row = c;

      // Left
      berths.push({ id: `${configId}_b_${startBerth}`, coachConfigurationId: configId, berthNumber: startBerth, berthType: 'LOWER', row, column: 0 });
      berths.push({ id: `${configId}_b_${startBerth + 1}`, coachConfigurationId: configId, berthNumber: startBerth + 1, berthType: 'UPPER', row, column: 1 });

      // Right
      berths.push({ id: `${configId}_b_${startBerth + 2}`, coachConfigurationId: configId, berthNumber: startBerth + 2, berthType: 'LOWER', row, column: 4 });
      berths.push({ id: `${configId}_b_${startBerth + 3}`, coachConfigurationId: configId, berthNumber: startBerth + 3, berthType: 'UPPER', row, column: 5 });
    }

    // Coupe: 2 berths (L/U on left, empty space on right)
    for (let c = 4; c < 8; c++) {
      const startBerth = 16 + (c - 4) * 2 + 1;
      const row = c;

      // Left only
      berths.push({ id: `${configId}_b_${startBerth}`, coachConfigurationId: configId, berthNumber: startBerth, berthType: 'LOWER', row, column: 0 });
      berths.push({ id: `${configId}_b_${startBerth + 1}`, coachConfigurationId: configId, berthNumber: startBerth + 1, berthType: 'UPPER', row, column: 1 });
    }
  } else if (layout === 'CC_78') {
    // 3+2 layout. Aisle is Column 3.
    // Left: Col 0 (Window), Col 1 (Middle), Col 2 (Aisle)
    // Right: Col 4 (Aisle), Col 5 (Window)
    for (let r = 0; r < 16; r++) {
      const startSeat = r * 5 + 1;

      if (startSeat <= 78) {
        berths.push({ id: `${configId}_b_${startSeat}`, coachConfigurationId: configId, berthNumber: startSeat, berthType: 'WINDOW', row: r, column: 0 });
      }
      if (startSeat + 1 <= 78) {
        berths.push({ id: `${configId}_b_${startSeat + 1}`, coachConfigurationId: configId, berthNumber: startSeat + 1, berthType: 'MIDDLE_SEAT', row: r, column: 1 });
      }
      if (startSeat + 2 <= 78) {
        berths.push({ id: `${configId}_b_${startSeat + 2}`, coachConfigurationId: configId, berthNumber: startSeat + 2, berthType: 'AISLE', row: r, column: 2 });
      }
      if (startSeat + 3 <= 78) {
        berths.push({ id: `${configId}_b_${startSeat + 3}`, coachConfigurationId: configId, berthNumber: startSeat + 3, berthType: 'AISLE', row: r, column: 4 });
      }
      if (startSeat + 4 <= 78) {
        berths.push({ id: `${configId}_b_${startSeat + 4}`, coachConfigurationId: configId, berthNumber: startSeat + 4, berthType: 'WINDOW', row: r, column: 5 });
      }
    }
  } else if (layout === 'EC_56' || layout === 'EC_52') {
    // 2+2 layout. Aisle is Column 2.
    // Left: Col 0 (Window), Col 1 (Aisle)
    // Right: Col 3 (Aisle), Col 4 (Window)
    const limit = layout === 'EC_52' ? 52 : 56;
    const numRows = layout === 'EC_52' ? 13 : 14;

    for (let r = 0; r < numRows; r++) {
      const startSeat = r * 4 + 1;

      if (startSeat <= limit) {
        berths.push({ id: `${configId}_b_${startSeat}`, coachConfigurationId: configId, berthNumber: startSeat, berthType: 'WINDOW', row: r, column: 0 });
      }
      if (startSeat + 1 <= limit) {
        berths.push({ id: `${configId}_b_${startSeat + 1}`, coachConfigurationId: configId, berthNumber: startSeat + 1, berthType: 'AISLE', row: r, column: 1 });
      }
      if (startSeat + 2 <= limit) {
        berths.push({ id: `${configId}_b_${startSeat + 2}`, coachConfigurationId: configId, berthNumber: startSeat + 2, berthType: 'AISLE', row: r, column: 3 });
      }
      if (startSeat + 3 <= limit) {
        berths.push({ id: `${configId}_b_${startSeat + 3}`, coachConfigurationId: configId, berthNumber: startSeat + 3, berthType: 'WINDOW', row: r, column: 4 });
      }
    }
  }

  return berths;
}

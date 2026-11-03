import { RailwaySeatProvider } from './RailwaySeatProvider';
import { TrainClass, Coach, CoachLayout, SeatAvailability, SeatAvailabilityStatus } from '@/types/seat';
import * as seatDb from '@/lib/seat-db';

const CLASS_NAMES: Record<string, string> = {
  '1A': 'AC First Class (1A)',
  '2A': 'AC 2 Tier (2A)',
  '3A': 'AC 3 Tier (3A)',
  'CC': 'AC Chair Car (CC)',
  'EC': 'Executive Class (EC)',
  'SL': 'Sleeper Class (SL)',
};

export class AuthorizedRailwaySeatProvider implements RailwaySeatProvider {
  name = 'authorized-railway-provider';

  async getTrainClasses(trainNumber: string, journeyDate: string): Promise<TrainClass[]> {
    const configs = seatDb.getCoachConfigurations(trainNumber);
    if (configs.length === 0) return [];

    const codes = Array.from(new Set(configs.map((c) => c.classCode)));
    return codes.map((code) => ({
      code,
      name: CLASS_NAMES[code] || `${code} Class`,
    }));
  }

  async getCoaches(trainNumber: string, journeyDate: string, classCode: string): Promise<Coach[]> {
    const configs = seatDb.getCoachConfigurations(trainNumber);
    const classConfigs = configs.filter((c) => c.classCode === classCode);

    return classConfigs
      .map((c) => ({
        number: c.coachNumber,
        position: c.configurationVersion, // We use version/position
        classCode: c.classCode,
      }))
      .sort((a, b) => a.number.localeCompare(b.number));
  }

  async getCoachLayout(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string
  ): Promise<CoachLayout> {
    const configs = seatDb.getCoachConfigurations(trainNumber);
    const config = configs.find((c) => c.coachNumber === coachNumber && c.classCode === classCode);

    if (!config) {
      throw new Error(`Configuration not found for train ${trainNumber}, coach ${coachNumber}`);
    }

    const berths = seatDb.getBerthConfigurations(config.id);
    let maxRow = 0;
    let maxCol = 0;

    berths.forEach((b) => {
      if (b.row > maxRow) maxRow = b.row;
      if (b.column > maxCol) maxCol = b.column;
    });

    const seats = berths.map((b) => ({
      id: `${coachNumber}-${b.berthNumber}`,
      number: b.berthNumber.toString(),
      type: b.berthType,
      status: 'AVAILABLE' as SeatAvailabilityStatus, // Default status, mapped in API using availability
      position: {
        row: b.row,
        column: b.column,
      },
    }));

    return {
      coachNumber,
      classCode,
      rows: maxRow + 1,
      columns: maxCol + 1,
      seats,
    };
  }

  async getSeatAvailability(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string
  ): Promise<SeatAvailability[]> {
    const configs = seatDb.getCoachConfigurations(trainNumber);
    const config = configs.find((c) => c.coachNumber === coachNumber && c.classCode === classCode);
    if (!config) return [];

    const berths = seatDb.getBerthConfigurations(config.id);
    let snapshots = seatDb.getSnapshots(trainNumber, journeyDate, coachNumber);

    const now = new Date();
    const expiry = new Date(now.getTime() + 600 * 1000); // 10 minutes cache

    // 1. If snapshots don't exist yet for this coach & date, initialize them with realistic random distribution
    if (snapshots.length === 0) {
      const initialSnapshots = berths.map((b) => {
        // Random distribution
        // 65% Occupied, 5% Blocked, 5% RAC, 5% Waitlist, 20% Available
        const rand = Math.random();
        let status: SeatAvailabilityStatus = 'AVAILABLE';
        if (rand < 0.65) status = 'OCCUPIED';
        else if (rand < 0.70) status = 'BLOCKED';
        else if (rand < 0.75) status = 'RAC';
        else if (rand < 0.80) status = 'WAITLISTED';

        return {
          id: `snap_${trainNumber}_${journeyDate}_${coachNumber}_${b.berthNumber}_${Date.now()}`,
          trainNumber,
          journeyDate,
          coachNumber,
          berthNumber: b.berthNumber,
          status,
          source: this.name,
          fetchedAt: now.toISOString(),
          expiresAt: expiry.toISOString(),
        };
      });

      seatDb.upsertSnapshots(initialSnapshots);
      snapshots = initialSnapshots;
    } else {
      // 2. If snapshots exist, simulate real-time reservation updates.
      // With a 40% probability, we transition 1-2 available seats to occupied, or occupied seats to available
      if (Math.random() < 0.40) {
        const updatedSnapshots = [...snapshots];
        const numChanges = Math.min(2, Math.floor(Math.random() * 2) + 1);

        for (let i = 0; i < numChanges; i++) {
          const randIndex = Math.floor(Math.random() * updatedSnapshots.length);
          const snap = { ...updatedSnapshots[randIndex] };

          if (snap.status === 'AVAILABLE') {
            snap.status = 'OCCUPIED';
            snap.fetchedAt = now.toISOString();
            snap.expiresAt = expiry.toISOString();
            updatedSnapshots[randIndex] = snap;
          } else if (snap.status === 'OCCUPIED') {
            // Lower chance of becoming available
            if (Math.random() < 0.3) {
              snap.status = 'AVAILABLE';
              snap.fetchedAt = now.toISOString();
              snap.expiresAt = expiry.toISOString();
              updatedSnapshots[randIndex] = snap;
            }
          }
        }

        seatDb.upsertSnapshots(updatedSnapshots);
        snapshots = updatedSnapshots;
      }
    }

    return snapshots.map((s) => ({
      berthNumber: s.berthNumber,
      status: s.status,
    }));
  }
}

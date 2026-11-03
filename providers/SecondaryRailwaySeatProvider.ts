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

export class SecondaryRailwaySeatProvider implements RailwaySeatProvider {
  name = 'secondary-railway-provider';

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
        position: c.configurationVersion,
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
      status: 'AVAILABLE' as SeatAvailabilityStatus,
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

    // 1. If snapshots don't exist, initialize them
    if (snapshots.length === 0) {
      const initialSnapshots = berths.map((b) => {
        const rand = Math.random();
        let status: SeatAvailabilityStatus = 'AVAILABLE';
        // Secondary provider has slightly different occupancy characteristics (e.g. higher occupancy)
        if (rand < 0.75) status = 'OCCUPIED';
        else if (rand < 0.80) status = 'BLOCKED';
        else if (rand < 0.83) status = 'RAC';
        else if (rand < 0.86) status = 'WAITLISTED';

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
    }

    return snapshots.map((s) => ({
      berthNumber: s.berthNumber,
      status: s.status,
    }));
  }
}

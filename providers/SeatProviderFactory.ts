import { RailwaySeatProvider } from './RailwaySeatProvider';
import { AuthorizedRailwaySeatProvider } from './AuthorizedRailwaySeatProvider';
import { SecondaryRailwaySeatProvider } from './SecondaryRailwaySeatProvider';
import { TrainClass, Coach, CoachLayout, SeatAvailability, SeatAvailabilityStatus } from '@/types/seat';
import * as seatDb from '@/lib/seat-db';

export class SeatProviderFactory {
  private static primary = new AuthorizedRailwaySeatProvider();
  private static secondary = new SecondaryRailwaySeatProvider();

  /**
   * Helper to perform a provider query with full fallback logic
   */
  static async runWithFallback<T>(
    operationName: string,
    simulateFail: string | undefined,
    primaryFn: (provider: RailwaySeatProvider) => Promise<T>,
    secondaryFn: (provider: RailwaySeatProvider) => Promise<T>,
    cacheFallbackFn: () => Promise<T>
  ): Promise<{ data: T; providerUsed: string }> {
    // 1. Try Primary Provider (unless simulated to fail)
    if (simulateFail !== 'primary' && simulateFail !== 'all') {
      try {
        const result = await primaryFn(this.primary);
        return { data: result, providerUsed: this.primary.name };
      } catch (err) {
        console.warn(`[SeatProviderFactory] Primary provider failed for ${operationName}, trying secondary:`, err);
      }
    } else {
      console.log(`[SeatProviderFactory] Simulating Primary failure for ${operationName}`);
    }

    // 2. Try Secondary Provider (unless simulated to fail)
    if (simulateFail !== 'all') {
      try {
        const result = await secondaryFn(this.secondary);
        return { data: result, providerUsed: this.secondary.name };
      } catch (err) {
        console.warn(`[SeatProviderFactory] Secondary provider failed for ${operationName}, falling back to cache:`, err);
      }
    } else {
      console.log(`[SeatProviderFactory] Simulating Secondary & Primary failure for ${operationName}`);
    }

    // 3. Try Local Cached Verified Configuration
    try {
      console.log(`[SeatProviderFactory] Falling back to local cache/database for ${operationName}`);
      const result = await cacheFallbackFn();
      return { data: result, providerUsed: 'verified-local-cache' };
    } catch (err) {
      console.error(`[SeatProviderFactory] All providers and cached backups failed for ${operationName}:`, err);
      throw new Error(`Seat availability unavailable: all provider channels exhausted.`);
    }
  }

  static async getTrainClasses(
    trainNumber: string,
    journeyDate: string,
    simulateFail?: string
  ): Promise<{ data: TrainClass[]; providerUsed: string }> {
    return this.runWithFallback(
      'getTrainClasses',
      simulateFail,
      (p) => p.getTrainClasses(trainNumber, journeyDate),
      (p) => p.getTrainClasses(trainNumber, journeyDate),
      async () => {
        // Fallback: Read straight from local database configs
        const configs = seatDb.getCoachConfigurations(trainNumber);
        const codes = Array.from(new Set(configs.map((c) => c.classCode)));
        const classNames: Record<string, string> = {
          '1A': 'AC First Class (1A)',
          '2A': 'AC 2 Tier (2A)',
          '3A': 'AC 3 Tier (3A)',
          'CC': 'AC Chair Car (CC)',
          'EC': 'Executive Class (EC)',
          'SL': 'Sleeper Class (SL)',
        };
        return codes.map((code) => ({
          code,
          name: classNames[code] || `${code} Class`,
        }));
      }
    );
  }

  static async getCoaches(
    trainNumber: string,
    journeyDate: string,
    classCode: string,
    simulateFail?: string
  ): Promise<{ data: Coach[]; providerUsed: string }> {
    return this.runWithFallback(
      'getCoaches',
      simulateFail,
      (p) => p.getCoaches(trainNumber, journeyDate, classCode),
      (p) => p.getCoaches(trainNumber, journeyDate, classCode),
      async () => {
        const configs = seatDb.getCoachConfigurations(trainNumber);
        return configs
          .filter((c) => c.classCode === classCode)
          .map((c) => ({
            number: c.coachNumber,
            position: c.configurationVersion,
            classCode: c.classCode,
          }))
          .sort((a, b) => a.number.localeCompare(b.number));
      }
    );
  }

  static async getCoachLayout(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string,
    simulateFail?: string
  ): Promise<{ data: CoachLayout; providerUsed: string }> {
    return this.runWithFallback(
      'getCoachLayout',
      simulateFail,
      (p) => p.getCoachLayout(trainNumber, coachNumber, classCode, journeyDate),
      (p) => p.getCoachLayout(trainNumber, coachNumber, classCode, journeyDate),
      async () => {
        const configs = seatDb.getCoachConfigurations(trainNumber);
        const config = configs.find((c) => c.coachNumber === coachNumber && c.classCode === classCode);
        if (!config) throw new Error('Layout not in cache');

        const berths = seatDb.getBerthConfigurations(config.id);
        let maxRow = 0;
        let maxCol = 0;
        berths.forEach((b) => {
          if (b.row > maxRow) maxRow = b.row;
          if (b.column > maxCol) maxCol = b.column;
        });

        return {
          coachNumber,
          classCode,
          rows: maxRow + 1,
          columns: maxCol + 1,
          seats: berths.map((b) => ({
            id: `${coachNumber}-${b.berthNumber}`,
            number: b.berthNumber.toString(),
            type: b.berthType,
            status: 'AVAILABLE' as SeatAvailabilityStatus,
            position: { row: b.row, column: b.column },
          })),
        };
      }
    );
  }

  static async getSeatAvailability(
    trainNumber: string,
    coachNumber: string,
    classCode: string,
    journeyDate: string,
    simulateFail?: string
  ): Promise<{ data: SeatAvailability[]; providerUsed: string }> {
    return this.runWithFallback(
      'getSeatAvailability',
      simulateFail,
      (p) => p.getSeatAvailability(trainNumber, coachNumber, classCode, journeyDate),
      (p) => p.getSeatAvailability(trainNumber, coachNumber, classCode, journeyDate),
      async () => {
        const snapshots = seatDb.getSnapshots(trainNumber, journeyDate, coachNumber);
        if (snapshots.length === 0) throw new Error('No snapshots available in cache');
        return snapshots.map((s) => ({
          berthNumber: s.berthNumber,
          status: s.status,
        }));
      }
    );
  }
}

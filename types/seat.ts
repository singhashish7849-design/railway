export type SeatAvailabilityStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'BLOCKED'
  | 'RESERVED'
  | 'RAC'
  | 'WAITLISTED'
  | 'UNKNOWN';

export type BerthType =
  | 'LOWER'
  | 'MIDDLE'
  | 'UPPER'
  | 'SIDE_LOWER'
  | 'SIDE_UPPER'
  | 'SIDE_MIDDLE'
  | 'WINDOW'
  | 'MIDDLE_SEAT'
  | 'AISLE'
  | 'UNKNOWN';

export interface Seat {
  id: string; // e.g. B4-42
  number: string; // e.g. 42
  type: BerthType;
  status: SeatAvailabilityStatus;
  position: {
    row: number;
    column: number;
  };
}

export interface CoachLayout {
  coachNumber: string; // e.g. B4
  classCode: string; // e.g. 3A
  rows: number;
  columns: number;
  seats: Seat[];
}

export interface TrainClass {
  code: string; // e.g. 3A, 2A, 1A, CC, EC, SL
  name: string; // e.g. AC 3 Tier, Executive Class, Sleeper
}

export interface Coach {
  number: string; // e.g. B4, H1
  position: number; // 1-indexed position in sequence
  classCode: string;
}

export interface SeatAvailability {
  berthNumber: number;
  status: SeatAvailabilityStatus;
}

// Database Interfaces
export interface CoachConfiguration {
  id: string;
  trainNumber: string;
  classCode: string;
  coachNumber: string;
  layoutType: string; // e.g. "3A_64", "2A_46", "1A_24", "CC_78", "EC_56"
  configurationVersion: number;
  source: string;
  verifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BerthConfiguration {
  id: string;
  coachConfigurationId: string;
  berthNumber: number;
  berthType: BerthType;
  row: number;
  column: number;
  position?: string;
}

export interface SeatAvailabilitySnapshot {
  id: string;
  trainNumber: string;
  journeyDate: string;
  coachNumber: string;
  berthNumber: number;
  status: SeatAvailabilityStatus;
  source: string;
  fetchedAt: string;
  expiresAt: string;
}

export interface SeatAvailabilityResponse {
  train: {
    number: string;
    name: string;
  };
  journeyDate: string;
  coach: {
    number: string;
    classCode: string;
  };
  seats: Seat[];
  source: {
    provider: string;
    fetchedAt: string;
  };
}

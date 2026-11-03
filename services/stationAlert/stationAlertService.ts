import { Station, LiveJourney } from '@/types/train';

export const STATION_ALERT_THRESHOLDS = [30, 10, 5, 2];
export const STATION_ARRIVAL_RADIUS_KM = 0.5; // 500 meters fallback

export interface StationAlertConfig {
  id: string;
  trainNumber: string;
  stationCode: string;
  stationName: string;
  journeyDate: string;
  enabled: boolean;
  triggeredThresholds: number[]; // e.g. [30, 10]
  lastDelayMinutes?: number;
  coachNumber?: string;
  seatNumber?: string;
  seatType?: string;
}

/**
 * Checks if the selected station is ahead of the train along the route progression.
 */
export function isStationAheadOfTrain(
  stations: Station[],
  selectedStationCode: string
): boolean {
  const selectedIndex = stations.findIndex((s) => s.code === selectedStationCode);
  if (selectedIndex === -1) return false;

  const selectedStation = stations[selectedIndex];
  
  // If the station status is explicitly marked as 'passed' by the railway API, it is behind us
  if (selectedStation.status === 'passed') {
    return false;
  }

  // If upcoming, it is definitely ahead
  if (selectedStation.status === 'upcoming') {
    return true;
  }

  // If current, the train is currently at or arriving at this station (still counts as active)
  return true;
}

/**
 * Checks if the train has arrived at the selected station.
 * Prioritizes route data, then falls back to physical distance proximity check.
 */
export function hasTrainArrivedAtStation(
  journey: LiveJourney,
  stationCode: string,
  distanceKm: number | null
): boolean {
  const station = journey.stations.find((s) => s.code === stationCode);
  if (!station) return false;

  // 1. Check if the API explicitly flags the station as passed
  if (station.status === 'passed') {
    return true;
  }

  // 2. Check if the train's current station matches and has arrival metadata
  if (journey.currentStation?.code === stationCode) {
    // If the train is currently at the station, we are arrived
    return true;
  }

  // 3. Fallback: Check if the coordinate distance is within the 500m arrival radius
  if (distanceKm !== null && distanceKm <= STATION_ARRIVAL_RADIUS_KM) {
    return true;
  }

  return false;
}

export const stationAlertService = {
  /**
   * Save alert configuration to localStorage
   */
  saveAlert(config: StationAlertConfig): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`rail_station_alert_${config.trainNumber}`, JSON.stringify(config));
  },

  /**
   * Get alert configuration from localStorage
   */
  getAlert(trainNumber: string): StationAlertConfig | null {
    if (typeof window === 'undefined') return null;
    const alertJson = localStorage.getItem(`rail_station_alert_${trainNumber}`);
    if (!alertJson) return null;
    try {
      return JSON.parse(alertJson) as StationAlertConfig;
    } catch {
      return null;
    }
  },

  /**
   * Clear alert config for a train
   */
  clearAlert(trainNumber: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`rail_station_alert_${trainNumber}`);
  },

  /**
   * Reset triggered thresholds when disabled/enabled or parameters change
   */
  resetAlertState(config: StationAlertConfig): StationAlertConfig {
    return {
      ...config,
      triggeredThresholds: [],
      lastDelayMinutes: undefined
    };
  }
};

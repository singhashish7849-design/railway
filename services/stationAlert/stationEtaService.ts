import { Station, LiveJourney } from '@/types/train';

/**
 * Calculates remaining journey time (ETA) to the selected station.
 * Prioritizes dynamic speed estimation and falls back to API running delay data.
 */
export function calculateStationETA(
  journey: LiveJourney,
  stationCode: string,
  distanceKm: number
): { text: string; timeMinutes: number | null } {
  const station = journey.stations.find((s) => s.code === stationCode);

  // 1. Calculate ETA dynamically using current speed (if moving reliably at > 5 km/h)
  if (journey.currentLocation?.speedKmh && journey.currentLocation.speedKmh > 5) {
    const hours = distanceKm / journey.currentLocation.speedKmh;
    const minutes = Math.round(hours * 60);
    if (minutes > 0) {
      return {
        text: `${minutes} min`,
        timeMinutes: minutes
      };
    }
  }

  // 2. Fall back to station-specific actual arrival or scheduled arrival times
  if (station) {
    const arrivalTime = station.actualArrival || station.scheduledArrival;
    if (arrivalTime) {
      return {
        text: arrivalTime,
        timeMinutes: null
      };
    }
  }

  return {
    text: 'ETA unavailable',
    timeMinutes: null
  };
}

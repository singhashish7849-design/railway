import { distance, point } from '@turf/turf';

/**
 * Calculates the geodesic distance (in kilometers) between two coordinates using Turf.js.
 */
export function calculateGeodesicDistance(
  lat1?: number,
  lng1?: number,
  lat2?: number,
  lng2?: number
): number | null {
  if (lat1 === undefined || lng1 === undefined || lat2 === undefined || lng2 === undefined) {
    return null;
  }
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    return null;
  }

  try {
    const fromPoint = point([lng1, lat1]);
    const toPoint = point([lng2, lat2]);
    return distance(fromPoint, toPoint, { units: 'kilometers' });
  } catch (error) {
    console.error('Turf.js distance calculation failed:', error);
    return null;
  }
}

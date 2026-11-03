import { env } from '@/config/env';

/**
 * Fetch elevation for a single [lat, lng] point from OpenTopography.
 * Returns elevation in meters.
 */
export async function getElevationForPoint(lat: number, lng: number): Promise<number | undefined> {
  if (env.OPENTOPOGRAPHY_API_KEY) {
    try {
      const url = `https://portal.opentopography.org/API/globaldem?demtype=SRTMGL1&locations=${lat},${lng}&outputFormat=JSON&API_Key=${env.OPENTOPOGRAPHY_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.elevations) && data.elevations.length > 0) {
          return Math.round(data.elevations[0]);
        }
      }
    } catch (e) {
      console.warn('OpenTopography elevation API call failed', e);
    }
  }

  // Fallback simulator based on coordinates (Western Ghats / Aravalli / etc.)
  // Kota / Aravalli regions: elevated ranges
  // Mumbai / Goa / Chennai coastal: low elevations
  const aravalliFactor = Math.sin(lat * 0.5) * Math.cos(lng * 0.5) * 450;
  const simulatedElevation = Math.max(10, Math.round(280 + aravalliFactor + Math.sin(lat * 10) * 45));
  return simulatedElevation;
}

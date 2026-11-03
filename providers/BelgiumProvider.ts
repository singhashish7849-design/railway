import { ITrainProvider } from './ITrainProvider';
import { SearchResult, LiveJourney, Station } from '@/types/train';
import { env } from '@/config/env';
import { getCached, setCached } from '@/lib/cache';

interface IRailStation {
  id: string;
  name: string;
  locationX: string;
  locationY: string;
  standardname: string;
}

interface IRailStop {
  id: string;
  station: string;
  stationinfo: {
    id: string;
    name: string;
    locationX: string;
    locationY: string;
    standardname: string;
  };
  time: string;
  platform: string;
  scheduledDepartureTime: string;
  scheduledArrivalTime: string;
  delay: string;
  canceled: string;
  left: string;
  arrived: string;
}

interface IRailVehicleResponse {
  version: string;
  timestamp: string;
  vehicle: string;
  vehicleinfo: {
    name: string;
    shortname: string;
    number: string;
    type: string;
    locationX: string;
    locationY: string;
  };
  stops: {
    number: string;
    stop: IRailStop[];
  };
}

interface IRailLiveboardDeparture {
  id: string;
  station: string;
  stationinfo: {
    id: string;
    name: string;
    locationX: string;
    locationY: string;
  };
  time: string;
  delay: string;
  canceled: string;
  left: string;
  vehicle: string;
  vehicleinfo: {
    name: string;
    shortname: string;
    number: string;
    type: string;
  };
  platform: string;
}

interface IRailLiveboardResponse {
  version: string;
  timestamp: string;
  station: string;
  stationinfo: {
    id: string;
    name: string;
  };
  departures?: {
    number: string;
    departure: IRailLiveboardDeparture[];
  };
}

export class BelgiumProvider implements ITrainProvider {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.IRAIL_BASE_URL || 'https://api.irail.be';
  }

  private async fetchJson<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}format=json`;
    const start = Date.now();
    let status = 0;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RailGaadi Train Tracker (ashish@example.com)',
        },
      });

      status = res.status;
      clearTimeout(timeoutId);

      const duration = Date.now() - start;
      console.log(`[Provider: Belgium] [Endpoint: ${endpoint}] [Status: ${status}] [Duration: ${duration}ms]`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Not Found (404)');
        }
        if (res.status === 429) {
          throw new Error('Rate Limit Exceeded (429)');
        }
        throw new Error(`API returned HTTP status ${res.status}`);
      }

      const json = await res.json();
      return json as T;
    } catch (err: any) {
      const duration = Date.now() - start;
      console.error(`[Provider: Belgium] [Endpoint: ${endpoint}] [Error: ${err.message}] [Duration: ${duration}ms]`);
      throw err;
    }
  }

  /**
   * Fetches and caches the list of Belgium stations.
   * Cached for 1 hour since station lists are highly static.
   */
  private async getStations(): Promise<IRailStation[]> {
    const cacheKey = 'be:stations';
    const cached = getCached<IRailStation[]>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.fetchJson<{ station: IRailStation[] }>('/stations/');
      const stations = data.station || [];
      setCached(cacheKey, stations, 3600); // cache for 1 hour
      return stations;
    } catch (err) {
      console.error('Failed to fetch Belgium stations list:', err);
      return [];
    }
  }

  async searchTrains(query: string): Promise<SearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    // 1. Check if the query is a vehicle ID format (e.g. starts with BE.NMBS or is a train type/no like IC 1832)
    const isVehicleId =
      cleanQuery.toUpperCase().startsWith('BE.NMBS.') ||
      /^(IC|S|L|P|TGV|ICE|EST)\s*\d+$/i.test(cleanQuery);

    if (isVehicleId) {
      let formattedId = cleanQuery;
      if (!cleanQuery.toUpperCase().startsWith('BE.NMBS.')) {
        // Standardise input like "IC 1832" into "BE.NMBS.IC1832"
        const match = cleanQuery.match(/^(IC|S|L|P|TGV|ICE|EST)\s*(\d+)$/i);
        if (match) {
          formattedId = `BE.NMBS.${match[1].toUpperCase()}${match[2]}`;
        }
      }
      return [
        {
          id: formattedId,
          number: formattedId.replace('BE.NMBS.', ''),
          name: `Belgium Train ${formattedId.replace('BE.NMBS.', '')}`,
          origin: { code: 'BE', name: 'Belgium' },
          destination: { code: 'BE', name: 'Belgium' },
        },
      ];
    }

    // 2. Otherwise, treat query as a station name search
    const stations = await this.getStations();
    const exactMatch = stations.find(
      (s) =>
        s.name.toLowerCase() === cleanQuery.toLowerCase() ||
        s.standardname.toLowerCase() === cleanQuery.toLowerCase()
    );

    // 2a. If exact match is found, load live departures (Liveboard) for this station
    if (exactMatch) {
      try {
        const liveboard = await this.fetchJson<IRailLiveboardResponse>(
          `/liveboard/?station=${encodeURIComponent(exactMatch.name)}`
        );
        const departures = liveboard.departures?.departure || [];
        return departures.map((dep) => {
          const delayMins = Math.round(parseInt(dep.delay, 10) / 60);
          const timeFormatted = this.formatUnixTimestamp(dep.time);
          return {
            id: dep.vehicle,
            number: dep.vehicle,
            name: `${dep.vehicleinfo.shortname || dep.vehicle} to ${dep.station}`,
            origin: { code: exactMatch.name, name: exactMatch.name },
            destination: { code: dep.station, name: dep.station },
            departureTime: timeFormatted,
            duration: delayMins > 0 ? `+${delayMins}m delay` : 'On Time',
          };
        });
      } catch (err) {
        console.error(`Failed to load departures for station ${exactMatch.name}:`, err);
        return [];
      }
    }

    // 2b. Else, return fuzzy station results
    const queryLower = cleanQuery.toLowerCase();
    const filtered = stations.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.standardname.toLowerCase().includes(queryLower)
    );

    return filtered.slice(0, 15).map((s) => ({
      id: s.name,
      number: s.name,
      name: `Station: ${s.standardname || s.name}`,
      origin: { code: s.id, name: s.standardname || s.name },
      destination: { code: s.id, name: s.standardname || s.name },
    }));
  }

  async getLiveJourney(trainId: string): Promise<LiveJourney | null> {
    try {
      const data = await this.fetchJson<IRailVehicleResponse>(`/vehicle/?id=${trainId}`);
      if (!data || !data.stops || !data.stops.stop) {
        return null;
      }

      const rawStops = data.stops.stop;
      const vehicleInfo = data.vehicleinfo;

      // 1. Map raw stops to unified Station models
      const stations: Station[] = rawStops.map((stop, idx) => {
        const isPassed = stop.left === '1';
        const isCurrent = stop.arrived === '1' && stop.left === '0';
        const isUpcoming = stop.arrived === '0' && stop.left === '0';

        const lat = parseFloat(stop.stationinfo.locationY);
        const lng = parseFloat(stop.stationinfo.locationX);

        return {
          code: stop.stationinfo.id,
          name: stop.stationinfo.standardname || stop.station,
          lat: isNaN(lat) ? 0 : lat,
          lng: isNaN(lng) ? 0 : lng,
          scheduledArrival: this.formatUnixTimestamp(stop.scheduledArrivalTime),
          scheduledDeparture: this.formatUnixTimestamp(stop.scheduledDepartureTime),
          actualArrival: stop.arrived === '1' ? this.formatUnixTimestamp(stop.time) : undefined,
          actualDeparture: stop.left === '1' ? this.formatUnixTimestamp(stop.time) : undefined,
          delayMinutes: Math.round(parseInt(stop.delay, 10) / 60),
          distanceKm: 0, // calculated below
          status: isCurrent ? 'current' : isPassed ? 'passed' : 'upcoming',
          platform: stop.platform,
        };
      });

      if (stations.length === 0) return null;

      // 2. Compute distances along path
      stations[0].distanceKm = 0;
      for (let i = 1; i < stations.length; i++) {
        const prev = stations[i - 1];
        const curr = stations[i];
        const dist = this.getHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
        curr.distanceKm = Math.round((prev.distanceKm + dist) * 10) / 10;
      }

      const totalDistanceKm = stations[stations.length - 1].distanceKm;

      // 3. Determine train running status
      const allPassed = rawStops.every((s) => s.left === '1');
      const nonePassed = rawStops.every((s) => s.arrived === '0' && s.left === '0');

      let journeyStatus: LiveJourney['status'] = 'running';
      if (allPassed) journeyStatus = 'completed';
      else if (nonePassed) journeyStatus = 'not_started';

      // 4. Locate current / previous / next stations
      let currentStation = stations.find((s) => s.status === 'current');
      const passedStations = stations.filter((s) => s.status === 'passed');
      const previousStation = passedStations[passedStations.length - 1];
      const nextStation = stations.find((s) => s.status === 'upcoming');

      // If no stop is flagged "current" but some have passed, the train is in transit
      let coveredKm = 0;
      if (currentStation) {
        coveredKm = currentStation.distanceKm;
      } else if (previousStation) {
        coveredKm = previousStation.distanceKm;
      }

      // 5. Interpolate train location coordinates
      let trainLat = parseFloat(vehicleInfo.locationY);
      let trainLng = parseFloat(vehicleInfo.locationX);

      if ((isNaN(trainLat) || isNaN(trainLng) || (trainLat === 0 && trainLng === 0)) && stations.length > 0) {
        // Fallback interpolation
        if (currentStation) {
          trainLat = currentStation.lat;
          trainLng = currentStation.lng;
        } else if (previousStation && nextStation) {
          // Interpolate along route segment based on time
          const prevIdx = stations.indexOf(previousStation);
          const nextIdx = stations.indexOf(nextStation);
          const prevRaw = rawStops[prevIdx];
          const nextRaw = rawStops[nextIdx];

          const depTime = parseInt(prevRaw.time, 10);
          const arrTime = parseInt(nextRaw.time, 10);
          const now = Math.round(Date.now() / 1000);

          let ratio = 0.5;
          if (arrTime > depTime) {
            ratio = Math.min(1, Math.max(0, (now - depTime) / (arrTime - depTime)));
          }

          trainLat = previousStation.lat + ratio * (nextStation.lat - previousStation.lat);
          trainLng = previousStation.lng + ratio * (nextStation.lng - previousStation.lng);
          coveredKm = previousStation.distanceKm + ratio * (nextStation.distanceKm - previousStation.distanceKm);
        } else {
          // If not started, use origin coords. If finished, use destination coords
          const fallbackStation = previousStation || stations[0];
          trainLat = fallbackStation.lat;
          trainLng = fallbackStation.lng;
        }
      }

      const remainingDistanceKm = Math.max(0, Math.round((totalDistanceKm - coveredKm) * 10) / 10);
      const completionPercentage = totalDistanceKm > 0 ? Math.round((coveredKm / totalDistanceKm) * 100 * 10) / 10 : 0;

      // Find current delay (default to next station or overall delay)
      const activeDelayStation = nextStation || currentStation || previousStation;
      const delayMinutes = activeDelayStation?.delayMinutes || 0;

      const origin = { code: stations[0].code, name: stations[0].name };
      const destination = { code: stations[stations.length - 1].code, name: stations[stations.length - 1].name };

      const routeGeometry = stations.map((s) => [s.lng, s.lat] as [number, number]);

      const lastUpdatedStr = data.timestamp
        ? new Date(parseInt(data.timestamp, 10) * 1000).toISOString()
        : new Date().toISOString();

      return {
        trainId: data.vehicle,
        number: vehicleInfo.shortname || vehicleInfo.number || data.vehicle,
        name: `${vehicleInfo.type || 'Train'} ${vehicleInfo.number || ''}`.trim(),
        origin,
        destination,
        currentLocation: {
          lat: trainLat,
          lng: trainLng,
          heading: 0,
          speedKmh: journeyStatus === 'running' ? 90 : 0,
          isMoving: journeyStatus === 'running',
        },
        status: journeyStatus,
        delayMinutes,
        speedKmh: journeyStatus === 'running' ? 90 : 0,
        distanceCoveredKm: Math.round(coveredKm),
        remainingDistanceKm: Math.round(remainingDistanceKm),
        totalDistanceKm: Math.round(totalDistanceKm),
        completionPercentage: Math.round(completionPercentage),
        lastUpdated: lastUpdatedStr,
        previousStation,
        currentStation,
        nextStation,
        ETA: nextStation ? `${nextStation.name} at ${nextStation.scheduledArrival}` : 'Complete',
        stations,
        routeGeometry,
      };
    } catch (err) {
      console.error(`Failed to load live journey for Belgium vehicle ${trainId}:`, err);
      throw err;
    }
  }

  // Helper: format Unix epoch timestamp to Belgium time HH:MM
  private formatUnixTimestamp(unixStr: string): string {
    const ts = parseInt(unixStr, 10);
    if (isNaN(ts)) return '--:--';
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Brussels',
    });
  }

  // Helper: Haversine distance formula
  private getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

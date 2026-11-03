import { NextRequest, NextResponse } from 'next/server';
import { getLiveJourney } from '@/lib/railradar';
import { getNearbyFeaturesForWindowView } from '@/lib/overpass';
import { getAnalyzedFeatures } from '@/services/windowView/featureDetectionService';
import { getElevationForPoint } from '@/services/windowView/elevationService';
import { getWeatherForLocation } from '@/lib/openweather';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';
import { WindowViewResponse, WindowFeature } from '@/types/windowView';
import { point, bearing } from '@turf/turf';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainNumber = searchParams.get('trainNumber') || searchParams.get('trainId');

  if (!trainNumber) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'trainNumber parameters is required', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  // 1. Fetch live train status
  try {
    const journey = await getLiveJourney(trainNumber);
    if (!journey) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Live train details unavailable for train #${trainNumber}`, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const { lat, lng, heading, speedKmh, isMoving } = journey.currentLocation || {};
    if (!lat || !lng) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: `Live GPS coordinates unavailable for train #${trainNumber}`, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // 2. Compute heading/bearing dynamically if default
    let trainBearing = heading || 45;
    if ((trainBearing === 45 || !trainBearing) && journey.nextStation) {
      const nextSt = journey.nextStation;
      if (nextSt.lat && nextSt.lng) {
        try {
          const pt1 = point([lng, lat]);
          const pt2 = point([nextSt.lng, nextSt.lat]);
          trainBearing = Math.round((bearing(pt1, pt2) + 360) % 360);
        } catch (e) {
          // ignore
        }
      }
    }

    // Round coordinates for cache key
    const latRounded = lat.toFixed(2);
    const lngRounded = lng.toFixed(2);
    const bearingBucket = Math.round(trainBearing / 45) % 8;
    const cacheKey = `window:view:${trainNumber}:${latRounded}:${lngRounded}:${bearingBucket}`;

    const cached = getCached<WindowViewResponse>(cacheKey);
    if (cached) {
      return NextResponse.json<ApiResponse<WindowViewResponse>>({
        success: true,
        data: cached,
        cached: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Fetch nearby features
    // Search within 8km radius (detection config defaults)
    const rawOsmFeatures = await getNearbyFeaturesForWindowView(lat, lng, 8);
    const analyzedFeatures = getAnalyzedFeatures(lat, lng, trainBearing, rawOsmFeatures);

    // 4. Fetch weather for current location
    let weather;
    try {
      weather = await getWeatherForLocation(lat, lng, journey.currentStation?.name || '', journey.currentStation?.code || '');
    } catch {
      // Graceful fallback to default weather if OpenWeather fails
      weather = {
        tempC: 25,
        feelsLikeC: 27,
        humidity: 65,
        windSpeedKmh: 12,
        condition: 'Clear',
        icon: '01d',
        rainChancePercent: 10,
      };
    }

    // 5. Fetch elevation for current location
    let elevation;
    try {
      elevation = await getElevationForPoint(lat, lng);
    } catch {
      elevation = 250; // default flat terrain elevation
    }

    // 6. Identify active feature: highest relevance score feature
    // If no features are nearby, currentFeature is null
    const currentFeature = analyzedFeatures.length > 0 ? analyzedFeatures[0] : null;

    // Filter features behind out of upcoming list (only ahead/nearby are shown on timeline/approaching)
    const upcomingFeatures = analyzedFeatures.filter(f => f.direction !== 'BEHIND');

    const result: WindowViewResponse = {
      train: {
        number: journey.number,
        name: journey.name,
      },
      location: {
        latitude: lat,
        longitude: lng,
        bearing: trainBearing,
        speedKmh: speedKmh || 0,
        isMoving: isMoving || false,
      },
      currentFeature,
      upcomingFeatures,
      weather,
      elevation,
    };

    // Cache results for 20 seconds to debounce rapid passenger GPS queries
    setCached(cacheKey, result, 20);

    return NextResponse.json<ApiResponse<WindowViewResponse>>({
      success: true,
      data: result,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Failed to render Window View data', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

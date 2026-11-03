import { NextRequest, NextResponse } from 'next/server';
import { getNearbyFeaturesForWindowView } from '@/lib/overpass';
import { getAnalyzedFeatures } from '@/services/windowView/featureDetectionService';
import { getCached, setCached } from '@/lib/cache';
import { ApiResponse } from '@/types/api';
import { WindowFeature } from '@/types/windowView';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const bearing = parseFloat(searchParams.get('bearing') || '45');
  const radius = parseFloat(searchParams.get('radius') || '8');

  if (!lat || !lng) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'lat and lng parameters are required', timestamp: new Date().toISOString() },
      { status: 400 }
    );
  }

  // Round coordinates for cache key (spatial rounding to ~1.1 km accuracy)
  const latRounded = lat.toFixed(2);
  const lngRounded = lng.toFixed(2);
  const bearingBucket = Math.round(bearing / 45) % 8;
  const cacheKey = `window:features:${latRounded}:${lngRounded}:${bearingBucket}:${radius}`;

  const cached = getCached<WindowFeature[]>(cacheKey);
  if (cached) {
    return NextResponse.json<ApiResponse<WindowFeature[]>>({
      success: true,
      data: cached,
      cached: true,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // 1. Fetch raw POIs centered on location
    const rawOsmFeatures = await getNearbyFeaturesForWindowView(lat, lng, radius);

    // 2. Classify and rank features
    const analyzedFeatures = getAnalyzedFeatures(lat, lng, bearing, rawOsmFeatures);

    // Cache results for 10 minutes
    setCached(cacheKey, analyzedFeatures, 600);

    return NextResponse.json<ApiResponse<WindowFeature[]>>({
      success: true,
      data: analyzedFeatures,
      cached: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: err.message || 'Failed to detect nearby features', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

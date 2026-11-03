import { distance, bearing, point } from '@turf/turf';
import { WindowFeature, WindowFeatureType, WINDOW_VIEW_CONFIG } from '@/types/windowView';
import { TerrainFeature } from '@/lib/overpass';

// Map Overpass type to WindowFeatureType
export function mapOsmToWindowType(type: TerrainFeature['type'], name: string): WindowFeatureType {
  const lowercaseName = name.toLowerCase();
  
  if (type === 'river') {
    return 'RIVER';
  }
  if (type === 'bridge') {
    return 'BRIDGE';
  }
  if (type === 'tunnel') {
    return 'TUNNEL';
  }
  if (type === 'mountain') {
    if (lowercaseName.includes('hill') || lowercaseName.includes('ghat')) {
      return 'HILL';
    }
    return 'MOUNTAIN';
  }
  if (type === 'city') {
    if (lowercaseName.includes('district') || lowercaseName.includes('ward')) {
      return 'DISTRICT';
    }
    return 'CITY';
  }
  if (type === 'tourist') {
    if (lowercaseName.includes('lake') || lowercaseName.includes('dam') || lowercaseName.includes('reservoir')) {
      return 'LAKE';
    }
    if (lowercaseName.includes('monument') || lowercaseName.includes('fort') || lowercaseName.includes('temple')) {
      return 'ATTRACTION';
    }
    return 'LANDMARK';
  }
  return 'LANDMARK';
}

// Scoring rules based on feature type
export function getBaseScore(type: WindowFeatureType): number {
  switch (type) {
    case 'RIVER': return 100;
    case 'MOUNTAIN': return 95;
    case 'BRIDGE': return 90;
    case 'TUNNEL': return 85;
    case 'ATTRACTION': return 80;
    case 'LAKE': return 70;
    case 'CITY': return 60;
    case 'HILL': return 50;
    case 'DISTRICT': return 40;
    case 'LANDMARK': return 30;
    default: return 20;
  }
}

/**
 * Filter, classify, and score nearby OSM features relative to the train's current position and heading.
 */
export function getAnalyzedFeatures(
  trainLat: number,
  trainLng: number,
  trainBearing: number,
  osmFeatures: TerrainFeature[]
): WindowFeature[] {
  const trainPt = point([trainLng, trainLat]);
  const analyzed: WindowFeature[] = [];

  for (const f of osmFeatures) {
    const poiPt = point([f.lng, f.lat]);
    
    // 1. Calculate distance (km) using Turf.js
    const distKm = distance(trainPt, poiPt, { units: 'kilometers' });

    // 2. Calculate bearing from train to POI
    const poiBearing = bearing(trainPt, poiPt); // -180 to 180

    // 3. Calculate absolute bearing difference (0 to 180)
    const normTrain = (trainBearing % 360 + 360) % 360;
    const normPoi = (poiBearing % 360 + 360) % 360;
    let bearingDiff = Math.abs(normTrain - normPoi);
    if (bearingDiff > 180) {
      bearingDiff = 360 - bearingDiff;
    }

    // 4. Classify direction
    let direction: 'AHEAD' | 'NEARBY' | 'BEHIND' = 'NEARBY';
    if (bearingDiff <= 45) {
      direction = 'AHEAD';
    } else if (bearingDiff >= 135) {
      direction = 'BEHIND';
    }

    // 5. Apply Proximity Rules
    let isRelevant = false;
    if (direction === 'AHEAD' && distKm <= WINDOW_VIEW_CONFIG.aheadDistanceKm) {
      isRelevant = true;
    } else if (direction === 'NEARBY' && distKm <= WINDOW_VIEW_CONFIG.detectionRadiusKm) {
      isRelevant = true;
    } else if (direction === 'BEHIND' && distKm <= WINDOW_VIEW_CONFIG.importantFeatureRadiusKm) {
      // Behind features are only relevant if they are very close (we just passed them)
      isRelevant = true;
    }

    if (!isRelevant) continue;

    // 6. Score feature based on type, distance, and direction
    const featureType = mapOsmToWindowType(f.type, f.name);
    const baseScore = getBaseScore(featureType);
    
    // Proximity modifier: closer is more interesting (up to +50 points)
    const maxRadius = direction === 'AHEAD' ? WINDOW_VIEW_CONFIG.aheadDistanceKm : WINDOW_VIEW_CONFIG.detectionRadiusKm;
    const distanceScore = Math.max(0, (maxRadius - distKm) / maxRadius) * 50;

    // Direction modifier: ahead is most relevant, behind is least
    let directionModifier = 15; // default for NEARBY
    if (direction === 'AHEAD') {
      directionModifier = 30;
    } else if (direction === 'BEHIND') {
      directionModifier = -20;
    }

    const relevanceScore = Math.round(baseScore + distanceScore + directionModifier);

    analyzed.push({
      id: `${f.type}-${f.name.replace(/\s+/g, '-').toLowerCase()}-${f.lat.toFixed(4)}-${f.lng.toFixed(4)}`,
      name: f.name,
      type: featureType,
      latitude: f.lat,
      longitude: f.lng,
      distanceKm: Math.round(distKm * 10) / 10,
      direction,
      relevanceScore,
    });
  }

  // Sort by relevance score descending
  return analyzed.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

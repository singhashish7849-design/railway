export type WindowFeatureType =
  | 'RIVER'
  | 'LAKE'
  | 'MOUNTAIN'
  | 'HILL'
  | 'BRIDGE'
  | 'TUNNEL'
  | 'CITY'
  | 'DISTRICT'
  | 'ATTRACTION'
  | 'LANDMARK'
  | 'WEATHER';

export interface WindowFeature {
  id: string;
  name: string;
  type: WindowFeatureType;
  latitude: number;
  longitude: number;
  distanceKm: number;
  direction: 'AHEAD' | 'NEARBY' | 'BEHIND';
  elevation?: number;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

export interface WindowViewConfig {
  detectionRadiusKm: number;
  aheadDistanceKm: number;
  importantFeatureRadiusKm: number;
  maximumVisibleFeatures: number;
}

export const WINDOW_VIEW_CONFIG: WindowViewConfig = {
  detectionRadiusKm: 5,
  aheadDistanceKm: 10,
  importantFeatureRadiusKm: 3,
  maximumVisibleFeatures: 5,
};

export interface WindowViewResponse {
  train: {
    number: string;
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
    bearing: number;
    speedKmh: number;
    isMoving: boolean;
  };
  currentFeature: WindowFeature | null;
  upcomingFeatures: WindowFeature[];
  weather?: {
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    windSpeedKmh: number;
    condition: string;
    icon: string;
    rainChancePercent?: number;
  };
  elevation?: number;
}

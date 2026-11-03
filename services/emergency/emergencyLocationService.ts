export interface PositionData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export const emergencyLocationService = {
  getCurrentLocation(): Promise<PositionData> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Location unavailable'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString()
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          reject(new Error('Location unavailable'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
};

import { useState, useCallback } from 'react';
import { emergencyLocationService, PositionData } from '@/services/emergency/emergencyLocationService';

export function useEmergencyLocation() {
  const [location, setLocation] = useState<PositionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await emergencyLocationService.getCurrentLocation();
      setLocation(position);
      setLoading(false);
      return position;
    } catch (err: any) {
      setError(err.message || 'Location unavailable');
      setLoading(false);
      return null;
    }
  }, []);

  return {
    location,
    loading,
    error,
    fetchLocation
  };
}

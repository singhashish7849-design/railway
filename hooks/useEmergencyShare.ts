import { useCallback, useState } from 'react';
import { EmergencyEvent } from '@/types/emergency';
import { emergencyCommunicationService } from '@/services/emergency/emergencyCommunicationService';

export function useEmergencyShare() {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getEmergencySummary = useCallback((event: EmergencyEvent): string => {
    const locStr = event.latitude && event.longitude
      ? `${event.latitude.toFixed(6)}, ${event.longitude.toFixed(6)}`
      : 'Unavailable';
      
    const accuracyStr = event.accuracy !== undefined ? `±${event.accuracy.toFixed(0)}m` : 'N/A';
    const formattedTime = new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `RAILGAADI EMERGENCY\n\nTrain:\n${event.trainNumber}\n\nCoach:\n${event.coach || 'N/A'}\n\nSeat:\n${event.seat || 'N/A'}\n\nCurrent location:\n${locStr}\n\nCurrent station:\n${event.currentStation || 'In Transit'}\n\nNext station:\n${event.nextStation || 'N/A'}\n\nLast known update:\n${formattedTime}\n\nLocation accuracy:\n${accuracyStr}`;
  }, []);

  const generateShareLink = useCallback(async (event: EmergencyEvent): Promise<string | null> => {
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    if (!isOnline) {
      setShareLink(null);
      return null;
    }

    setLoading(true);
    try {
      // Simulate generating a secure, expiring location share link on the server.
      // The endpoint returns a token that resolves only the minimum location data
      // and automatically invalidates after a short duration (e.g., 30 minutes).
      const shareToken = `tmp_lnk_${event.id.replace('ev_', '')}_${Math.floor(Math.random() * 100000)}`;
      const link = `${window.location.origin}/share/emergency/${shareToken}`;
      setShareLink(link);
      return link;
    } catch (err) {
      console.error('Failed to generate expiring share link:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shareLink,
    loading,
    getEmergencySummary,
    generateShareLink
  };
}

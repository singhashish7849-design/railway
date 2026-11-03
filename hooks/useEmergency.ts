import { useCallback } from 'react';
import { useEmergencyStore } from '@/store/emergency';
import { emergencyService } from '@/services/emergency/emergencyService';
import { emergencySecurityService } from '@/services/emergency/emergencySecurityService';
import { emergencyCommunicationService } from '@/services/emergency/emergencyCommunicationService';
import { emergencyStorageService } from '@/services/emergency/emergencyStorageService';

export function useEmergency() {
  const isEmergencyActive = useEmergencyStore((state) => state.isEmergencyActive);
  const activeEvent = useEmergencyStore((state) => state.activeEvent);
  const timelineSteps = useEmergencyStore((state) => state.timelineSteps);
  const parentContacts = useEmergencyStore((state) => state.parentContacts);
  const securityPersonnel = useEmergencyStore((state) => state.securityPersonnel);
  
  const setEmergencyActive = useEmergencyStore((state) => state.setEmergencyActive);
  const setActiveEvent = useEmergencyStore((state) => state.setActiveEvent);
  const setTimelineSteps = useEmergencyStore((state) => state.setTimelineSteps);
  const addTimelineStep = useEmergencyStore((state) => state.addTimelineStep);
  const setSecurityPersonnel = useEmergencyStore((state) => state.setSecurityPersonnel);
  const resetEmergencyState = useEmergencyStore((state) => state.resetEmergencyState);

  const activateEmergencyMode = useCallback(
    async (params: {
      trainNumber: string;
      trainName: string;
      coach: string;
      seat: string;
      currentStation: string;
      nextStation: string;
      destination: string;
      journeyDate: string;
    }) => {
      // 1. Enter emergency mode immediately (One-Tap activation)
      setEmergencyActive(true);
      setTimelineSteps([]); // Clear old logs
      
      addTimelineStep('Emergency mode activated', 'completed');
      addTimelineStep('Journey information loaded', 'completed');
      
      // 2. Fetch location and create event locally
      const { event, locationSuccess } = await emergencyService.activateEmergency(params);
      setActiveEvent(event);
      
      if (locationSuccess) {
        addTimelineStep('Location captured', 'completed');
      } else {
        addTimelineStep('Location unavailable', 'info');
      }
      
      addTimelineStep('Emergency saved', 'completed');
      
      // 3. Log initial network status
      const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
      if (!isOnline) {
        addTimelineStep('No network connection', 'failed');
        addTimelineStep('Waiting for communication...', 'waiting');
      } else {
        addTimelineStep('Sync status pending', 'waiting');
      }
      
      // 4. Fetch same-train verified security guards
      const security = emergencySecurityService.getSecurityPersonnelForTrain(event.trainNumber, event.coach);
      setSecurityPersonnel(security);
      
      // 5. Trigger SMS communications for pre-configured parents
      if (parentContacts.length > 0) {
        for (const contact of parentContacts) {
          await emergencyCommunicationService.sendParentAlert(event, contact);
        }
      }
      
      return event;
    },
    [setEmergencyActive, setTimelineSteps, addTimelineStep, setActiveEvent, setSecurityPersonnel, parentContacts]
  );

  const resolveEmergencyMode = useCallback(() => {
    resetEmergencyState();
  }, [resetEmergencyState]);

  return {
    isEmergencyActive,
    activeEvent,
    timelineSteps,
    parentContacts,
    securityPersonnel,
    activateEmergencyMode,
    resolveEmergencyMode
  };
}

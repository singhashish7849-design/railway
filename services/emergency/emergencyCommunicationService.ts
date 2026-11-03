import { EmergencyEvent, ParentContact, EmergencyCommunication } from '@/types/emergency';
import { emergencyStorageService } from './emergencyStorageService';

export const emergencyCommunicationService = {
  generateEmergencyMessage(event: EmergencyEvent): string {
    const locStr = event.latitude && event.longitude 
      ? `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)} (accuracy ±${event.accuracy?.toFixed(0)}m)` 
      : 'Location unavailable';

    return `🚨 RAILGAADI EMERGENCY\n\nI may need assistance.\n\nTrain: ${event.trainNumber} (${event.trainName})\nCoach: ${event.coach || 'N/A'}\nSeat: ${event.seat || 'N/A'}\n\nCurrent location:\n${locStr}\n\nCurrent station:\n${event.currentStation || 'In Transit'}\n\nNext station:\n${event.nextStation || 'N/A'}\n\nTime:\n${new Date(event.timestamp).toLocaleTimeString()}`;
  },

  async sendParentAlert(event: EmergencyEvent, parent: ParentContact): Promise<EmergencyCommunication> {
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    const message = this.generateEmergencyMessage(event);
    const commId = `comm_parent_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newComm: EmergencyCommunication = {
      id: commId,
      emergencyEventId: event.id,
      type: 'SMS',
      recipient: `${parent.name} (${parent.phoneNumber})`,
      status: isOnline ? 'PENDING' : 'PREPARED',
      createdAt: new Date().toISOString()
    };

    // Save initial communication record locally
    await emergencyStorageService.createCommunication(newComm);

    if (isOnline) {
      try {
        const response = await fetch('/api/emergency/events/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            commId,
            type: 'SMS',
            recipient: parent.phoneNumber,
            message
          })
        });

        if (response.ok) {
          await emergencyStorageService.updateCommunicationStatus(commId, 'SENT');
          newComm.status = 'SENT';
          newComm.sentAt = new Date().toISOString();
        } else {
          await emergencyStorageService.updateCommunicationStatus(commId, 'FAILED');
          newComm.status = 'FAILED';
        }
      } catch (err) {
        console.error('Failed to send backend alert:', err);
        await emergencyStorageService.updateCommunicationStatus(commId, 'FAILED');
        newComm.status = 'FAILED';
      }
    } else {
      // Offline: Enqueue as pending communication
      await emergencyStorageService.updateCommunicationStatus(commId, 'PREPARED');
    }

    return newComm;
  },

  getSMSComposerUri(event: EmergencyEvent, phoneNumber: string): string {
    const message = this.generateEmergencyMessage(event);
    // Standard URL encoding for parameters
    const encodedBody = encodeURIComponent(message);
    
    // Detect iOS to use standard separator '&body='
    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    
    return `sms:${phoneNumber}${separator}body=${encodedBody}`;
  },

  async sendSecurityAlert(event: EmergencyEvent, guardPhone: string): Promise<EmergencyCommunication> {
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    const message = this.generateEmergencyMessage(event);
    const commId = `comm_sec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newComm: EmergencyCommunication = {
      id: commId,
      emergencyEventId: event.id,
      type: 'SECURITY_ALERT',
      recipient: `Security (${guardPhone})`,
      status: isOnline ? 'PENDING' : 'PREPARED',
      createdAt: new Date().toISOString()
    };

    await emergencyStorageService.createCommunication(newComm);

    if (isOnline) {
      try {
        const response = await fetch('/api/emergency/security/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: event.id,
            guardPhone,
            message
          })
        });

        if (response.ok) {
          await emergencyStorageService.updateCommunicationStatus(commId, 'SENT');
          newComm.status = 'SENT';
          newComm.sentAt = new Date().toISOString();
        } else {
          await emergencyStorageService.updateCommunicationStatus(commId, 'FAILED');
          newComm.status = 'FAILED';
        }
      } catch (err) {
        console.error('Failed to alert security:', err);
        await emergencyStorageService.updateCommunicationStatus(commId, 'FAILED');
        newComm.status = 'FAILED';
      }
    } else {
      await emergencyStorageService.updateCommunicationStatus(commId, 'PREPARED');
    }

    return newComm;
  }
};

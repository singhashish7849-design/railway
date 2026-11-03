export type NetworkStatusType = 'CONNECTED' | 'OFFLINE';
export type EmergencyEventStatus = 'ACTIVE' | 'RESOLVED';
export type SyncStatusType = 'PENDING' | 'SYNCED';

export interface EmergencyEvent {
  id: string;
  userId: string;
  trainNumber: string;
  trainName: string;
  coach: string;
  seat: string;
  currentStation: string;
  nextStation: string;
  destination: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timestamp: string;
  networkStatus: NetworkStatusType;
  status: EmergencyEventStatus;
  syncStatus: SyncStatusType;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationType = 'SMS' | 'BACKEND_ALERT' | 'SECURITY_ALERT';
export type CommunicationStatus = 'PENDING' | 'PREPARED' | 'SENT' | 'FAILED' | 'SYNCED';

export interface EmergencyCommunication {
  id: string;
  emergencyEventId: string;
  type: CommunicationType;
  recipient: string;
  status: CommunicationStatus;
  createdAt: string;
  sentAt?: string;
}

export interface ParentContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface SecurityPersonnel {
  securityId: string;
  name: string;
  role: string;
  verified: boolean;
  trainNumber: string;
  coach: string;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  lastVerifiedAt: string;
}

export interface OfflineJourneyCache {
  trainNumber: string;
  trainName: string;
  route: string;
  stationList: any[];
  stationCoordinates: Record<string, { lat: number; lng: number }>;
  destination: string;
  coach: string;
  seat: string;
  emergencyContacts: any[];
  lastKnownPosition?: { lat: number; lng: number };
  lastUpdateTimestamp: string;
}

import { SecurityPersonnel } from '@/types/emergency';

const MOCK_SECURITY_DB: SecurityPersonnel[] = [
  {
    securityId: 'sec_rpf_001',
    name: 'S.I. Satish Kumar',
    role: 'RPF Sub-Inspector',
    verified: true,
    trainNumber: '12951',
    coach: 'B2',
    availability: 'AVAILABLE',
    lastVerifiedAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
  },
  {
    securityId: 'sec_rpf_002',
    name: 'Constable Rajesh Singh',
    role: 'RPF Guard',
    verified: true,
    trainNumber: '12951',
    coach: 'A1',
    availability: 'AVAILABLE',
    lastVerifiedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    securityId: 'sec_rpf_003',
    name: 'Inspector Gurpreet Singh',
    role: 'RPF Head Constable',
    verified: true,
    trainNumber: '12013',
    coach: 'C1',
    availability: 'AVAILABLE',
    lastVerifiedAt: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
  }
];

export const emergencySecurityService = {
  getSecurityPersonnelForTrain(trainNumber: string, coachCode?: string): SecurityPersonnel[] {
    const trainSecurity = MOCK_SECURITY_DB.filter((s) => s.trainNumber === trainNumber);
    if (!trainSecurity.length) return [];
    
    if (coachCode) {
      // Prioritize exact coach matches first, then return all for the train
      const coachMatches = trainSecurity.filter((s) => s.coach.toUpperCase() === coachCode.toUpperCase());
      if (coachMatches.length > 0) return coachMatches;
    }
    
    return trainSecurity;
  }
};

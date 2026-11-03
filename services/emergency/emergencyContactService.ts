export interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  category: 'GENERAL' | 'RAILWAY_SECURITY' | 'MEDICAL' | 'FIRE' | 'RAILWAY_ASSISTANCE';
  description: string;
}

const INDIAN_CONTACTS: EmergencyContact[] = [
  {
    id: 'in_gen',
    name: 'National Emergency Helpline',
    number: '112',
    category: 'GENERAL',
    description: 'All-in-one national emergency helpline for police and general assistance.'
  },
  {
    id: 'in_sec',
    name: 'Railway Protection Force (RPF)',
    number: '182',
    category: 'RAILWAY_SECURITY',
    description: 'On-board safety, crime reporting, and railway security assistance.'
  },
  {
    id: 'in_med',
    name: 'Ambulance & Medical Services',
    number: '108',
    category: 'MEDICAL',
    description: 'Emergency medical response and transport service.'
  },
  {
    id: 'in_fire',
    name: 'Fire Department',
    number: '101',
    category: 'FIRE',
    description: 'Fire control helpline.'
  },
  {
    id: 'in_rail',
    name: 'Integrated Indian Railways Helpline',
    number: '139',
    category: 'RAILWAY_ASSISTANCE',
    description: 'Cleanliness, security, medical, catering, and general enquiries.'
  }
];

const BELGIUM_CONTACTS: EmergencyContact[] = [
  {
    id: 'be_gen',
    name: 'European Emergency Helpline',
    number: '112',
    category: 'GENERAL',
    description: 'Emergency helpline valid across Belgium and all EU states.'
  },
  {
    id: 'be_sec',
    name: 'Securail Assistance',
    number: '080030230',
    category: 'RAILWAY_SECURITY',
    description: '24/7 security assistance for passengers inside SNCB trains and stations.'
  },
  {
    id: 'be_med',
    name: 'Ambulance / Medical Services',
    number: '112',
    category: 'MEDICAL',
    description: 'Emergency ambulance and medical dispatch.'
  },
  {
    id: 'be_fire',
    name: 'Fire Brigade',
    number: '112',
    category: 'FIRE',
    description: 'Emergency fire services.'
  },
  {
    id: 'be_rail',
    name: 'SNCB Passenger Assistance',
    number: '025282828',
    category: 'RAILWAY_ASSISTANCE',
    description: 'Train schedule assistance, customer care, and special assistance enquiries.'
  }
];

export class EmergencyContactProvider {
  static getContacts(countryCode: string = 'IN'): EmergencyContact[] {
    return countryCode === 'BE' ? BELGIUM_CONTACTS : INDIAN_CONTACTS;
  }

  static getContactByCategory(
    category: string,
    countryCode: string = 'IN'
  ): EmergencyContact | null {
    const list = this.getContacts(countryCode);
    return list.find((c) => c.category === category) || null;
  }
}

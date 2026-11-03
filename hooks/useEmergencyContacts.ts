import { useState, useEffect, useCallback } from 'react';
import { ParentContact } from '@/types/emergency';
import { emergencyStorageService } from '@/services/emergency/emergencyStorageService';
import { EmergencyContactProvider, EmergencyContact } from '@/services/emergency/emergencyContactService';
import { useEmergencyStore } from '@/store/emergency';

export function useEmergencyContacts(countryCode: string = 'IN') {
  const parentContacts = useEmergencyStore((state) => state.parentContacts);
  const setParentContacts = useEmergencyStore((state) => state.setParentContacts);
  const [officialContacts, setOfficialContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const parents = await emergencyStorageService.getParentContacts();
      setParentContacts(parents);

      const official = EmergencyContactProvider.getContacts(countryCode);
      setOfficialContacts(official);
    } catch (err) {
      console.warn('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [countryCode, setParentContacts]);

  const saveParentContacts = useCallback(async (contacts: ParentContact[]) => {
    try {
      await emergencyStorageService.saveParentContacts(contacts);
      setParentContacts(contacts);
    } catch (err) {
      console.warn('Failed to save contacts:', err);
    }
  }, [setParentContacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  return {
    parentContacts,
    officialContacts,
    loading,
    saveParentContacts,
    reloadContacts: loadContacts,
  };
}

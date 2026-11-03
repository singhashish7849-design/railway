'use client';

import React, { useState } from 'react';
import { Phone, ShieldAlert, HeartPulse, Flame, HelpCircle } from 'lucide-react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { EmergencyContact } from '@/services/emergency/emergencyContactService';
import { EmergencyConfirmation } from './EmergencyConfirmation';

interface EmergencyContactCardProps {
  countryCode?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  GENERAL: ShieldAlert,
  RAILWAY_SECURITY: ShieldAlert,
  MEDICAL: HeartPulse,
  FIRE: Flame,
  RAILWAY_ASSISTANCE: HelpCircle
};

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  RAILWAY_SECURITY: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  MEDICAL: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  FIRE: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  RAILWAY_ASSISTANCE: 'text-rail-blue bg-rail-blue/10 border-rail-blue/20'
};

export function EmergencyContactCard({ countryCode = 'IN' }: EmergencyContactCardProps) {
  const { officialContacts, loading } = useEmergencyContacts(countryCode);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  const handleCallInitiated = (contact: EmergencyContact) => {
    setSelectedContact(contact);
  };

  const handleConfirmCall = () => {
    if (selectedContact) {
      window.location.href = `tel:${selectedContact.number}`;
    }
  };

  if (loading) {
    return (
      <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl animate-pulse space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
          <Phone className="h-4 w-4 text-emerald-500" />
          <span>Verified Railway Help Desk</span>
        </div>

        <div className="space-y-3.5">
          {officialContacts.map((contact) => {
            const IconComponent = CATEGORY_ICONS[contact.category] || HelpCircle;
            const colorClass = CATEGORY_COLORS[contact.category] || CATEGORY_COLORS.RAILWAY_ASSISTANCE;

            return (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <IconComponent className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {contact.name}
                    </h5>
                    <p className="text-[9.5px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5 leading-normal max-w-[220px]">
                      {contact.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCallInitiated(contact)}
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-[10.5px] font-black text-white px-3.5 shadow-sm transition-all active:scale-95 outline-none flex-shrink-0"
                >
                  <Phone className="h-3 w-3 fill-current" />
                  <span>Call {contact.number}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedContact && (
        <EmergencyConfirmation
          isOpen={Boolean(selectedContact)}
          onClose={() => setSelectedContact(null)}
          onConfirm={handleConfirmCall}
          title={`Call ${selectedContact.name}?`}
          message={`This will initiate a phone call to ${selectedContact.number} on your device. Please confirm.`}
          confirmText="Call"
        />
      )}
    </>
  );
}

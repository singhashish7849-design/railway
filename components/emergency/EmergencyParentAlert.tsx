'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Users, Send, CheckCircle2 } from 'lucide-react';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { ParentContact, EmergencyEvent } from '@/types/emergency';
import { emergencyCommunicationService } from '@/services/emergency/emergencyCommunicationService';

interface EmergencyParentAlertProps {
  event: EmergencyEvent | null;
}

export function EmergencyParentAlert({ event }: EmergencyParentAlertProps) {
  const { parentContacts, saveParentContacts, loading } = useEmergencyContacts();
  const [isEditing, setIsEditing] = useState(false);
  const [p1Name, setP1Name] = useState('');
  const [p1Relation, setP1Relation] = useState('');
  const [p1Phone, setP1Phone] = useState('');
  
  const [p2Name, setP2Name] = useState('');
  const [p2Relation, setP2Relation] = useState('');
  const [p2Phone, setP2Phone] = useState('');

  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  // Sync inputs on load
  useEffect(() => {
    if (parentContacts.length > 0) {
      const p1 = parentContacts[0];
      setP1Name(p1.name);
      setP1Relation(p1.relationship);
      setP1Phone(p1.phoneNumber);
      
      const p2 = parentContacts[1] || { name: '', relationship: '', phoneNumber: '' };
      setP2Name(p2.name);
      setP2Relation(p2.relationship);
      setP2Phone(p2.phoneNumber);
    }
  }, [parentContacts]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p1Name || !p1Phone) return;

    const list: ParentContact[] = [
      {
        id: 'parent_1',
        name: p1Name,
        relationship: p1Relation || 'Parent',
        phoneNumber: p1Phone
      }
    ];

    if (p2Name && p2Phone) {
      list.push({
        id: 'parent_2',
        name: p2Name,
        relationship: p2Relation || 'Parent',
        phoneNumber: p2Phone
      });
    }

    await saveParentContacts(list);
    setIsEditing(false);
  };

  const handleAlert = async () => {
    if (!event || parentContacts.length === 0) return;

    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;
    
    if (isOnline) {
      setAlertStatus('Sending emergency alerts via server...');
      for (const parent of parentContacts) {
        await emergencyCommunicationService.sendParentAlert(event, parent);
      }
      setAlertStatus('Alert messages sent successfully.');
    } else {
      // Offline fallback: trigger SMS intent composer and log status
      setAlertStatus('SMS composer opened. Press Send to notify your contact.');
      
      // Open SMS composer for each configured contact (usually opens sequentially or handles the first one)
      parentContacts.forEach((parent, idx) => {
        setTimeout(() => {
          const smsUri = emergencyCommunicationService.getSMSComposerUri(event, parent.phoneNumber);
          window.location.href = smsUri;
        }, idx * 1000);
      });
    }
  };

  if (loading) return null;

  const hasContacts = parentContacts.length > 0;

  return (
    <div className="premium-glass-card border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">
          <Users className="h-4 w-4 text-rail-blue" />
          <span>Trusted Parent Contacts</span>
        </div>
        {hasContacts && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-black text-slate-400 hover:text-rail-blue transition-colors flex items-center gap-1 uppercase outline-none"
          >
            <Edit2 className="h-3 w-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing || !hasContacts ? (
        <form onSubmit={handleSave} className="space-y-4 pt-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Configure Trusted Parents / Guardians
          </p>

          {/* Parent 1 */}
          <div className="space-y-2">
            <span className="text-[9.5px] font-black text-rail-blue uppercase tracking-wider block">Parent 1 (Required)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                required
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relation"
                value={p1Relation}
                onChange={(e) => setP1Relation(e.target.value)}
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={p1Phone}
                onChange={(e) => setP1Phone(e.target.value)}
                required
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Parent 2 */}
          <div className="space-y-2">
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Parent 2 (Optional)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Name"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relation"
                value={p2Relation}
                onChange={(e) => setP2Relation(e.target.value)}
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={p2Phone}
                onChange={(e) => setP2Phone(e.target.value)}
                className="col-span-1 text-xs font-semibold p-2 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl outline-none focus:border-rail-blue text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {hasContacts && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 outline-none"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 inline-flex h-9 items-center justify-center rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow outline-none"
            >
              Save Contacts
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4.5">
          {/* Display Contacts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {parentContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 border border-slate-200/55 dark:border-slate-800/40 rounded-2xl bg-slate-50/40 dark:bg-slate-900/20"
              >
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {contact.name}
                  </span>
                  <span className="text-[8.5px] font-black uppercase text-rail-blue px-2 py-0.5 rounded-full bg-rail-blue/5 border border-rail-blue/15">
                    {contact.relationship}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-slate-450 dark:text-slate-400 font-bold mt-1.5">
                  {contact.phoneNumber}
                </p>
              </div>
            ))}
          </div>

          {/* Trigger Alert Actions */}
          {event && (
            <div className="space-y-3 pt-1 border-t border-slate-200/30 dark:border-slate-800/30">
              <button
                onClick={handleAlert}
                className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-xs font-black text-white shadow-glow shadow-rose-500/20 transition-all outline-none"
              >
                <Send className="h-4 w-4" />
                <span>Alert Parents / Guardians</span>
              </button>

              {alertStatus && (
                <div className="flex items-start gap-2 p-3 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-250 dark:border-slate-800/50 rounded-2xl animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-650 dark:text-slate-350 font-bold leading-normal">
                    {alertStatus}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

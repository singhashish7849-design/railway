'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, ShieldAlert, Heart, History, Settings, LogOut,
  UserCheck, Plus, Trash2, Edit, Check, AlertCircle, Loader2,
  Train, ArrowRight, Save, KeyRound, ShieldCheck, X, ZoomIn
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';
import { emergencyStorageService } from '@/services/emergency/emergencyStorageService';
import { useFavoritesStore } from '@/store/favorites';
import { useSearchStore } from '@/store/search';

// Default Initial Avatar Component (head/shoulder silhouette with user initial)
function DefaultAvatar({ initial, className, initialClassName }: { initial: string; className?: string; initialClassName?: string }) {
  return (
    <div className={cn("relative w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 border-2 border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0", className)}>
      {/* Shoulder/Head Background Silhouette */}
      <svg className="absolute inset-0 h-full w-full text-slate-400/40 dark:text-slate-600/40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      {/* High-visibility Centered Initial */}
      <span className={cn("relative z-10 text-3xl sm:text-4xl font-black text-slate-800 dark:text-white drop-shadow-sm font-sans", initialClassName)}>
        {initial}
      </span>
    </div>
  );
}

// Pre-defined avatar options fallback
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80'
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'emergency' | 'favorites' | 'searches' | 'settings'>('profile');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Lightbox Modal state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Close Lightbox Modal on Escape Keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isImageModalOpen) {
        setIsImageModalOpen(false);
      }
    };
    if (isImageModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isImageModalOpen]);

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab 1: Profile details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 2: Emergency contacts details
  const [contacts, setContacts] = useState<any[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('Parent');
  const [contactPhone, setContactPhone] = useState('');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);
  const [savingContact, setSavingContact] = useState(false);

  // Tab 3 & 4: Favorites and searches lists
  const [favorites, setFavorites] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Tab 5: Settings / Password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Scroll directly to target hash if exists
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (['profile', 'emergency', 'favourites', 'settings'].includes(hash)) {
        setActiveTab(hash === 'favourites' ? 'favorites' : hash as any);
      }
    }
  }, []);

  const loadAllData = async (currentUser: any) => {
    try {
      setLoading(true);
      const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');

      const savedLocalName = typeof window !== 'undefined' ? localStorage.getItem('railgaadi_user_name') : null;

      if (isDemo) {
        // Load mock profile
        const prof = { fullName: savedLocalName || 'Demo User', phone: '+91 99999 99999', avatarUrl: '' };
        setProfile(prof);
        setFullName(prof.fullName);
        setPhone(prof.phone);
        setAvatarUrl(prof.avatarUrl);

        // Load emergency contacts from IndexedDB
        const parents = await emergencyStorageService.getParentContacts();
        const mappedParents = parents.map((c, idx) => ({
          id: c.id,
          name: c.name,
          relationship: c.relationship,
          phone: c.phoneNumber,
          isPrimary: idx === 0
        }));
        setContacts(mappedParents);

        // Load favorites from Zustand
        const favStore = useFavoritesStore.getState().favorites;
        const mappedFavs = favStore.map(f => ({
          id: f.id || f.number,
          trainNumber: f.number,
          trainName: f.name
        }));
        setFavorites(mappedFavs);

        // Load searches from Zustand
        const searchStore = useSearchStore.getState().recentSearches;
        const mappedSearches = searchStore.map(s => ({
          id: s.id || s.number,
          trainNumber: s.number,
          trainName: s.name
        }));
        setRecentSearches(mappedSearches);
        setLoading(false);
        return;
      }

      // 1. Fetch Profile
      const metaName = currentUser?.user_metadata?.fullName || currentUser?.user_metadata?.full_name || savedLocalName || '';
      const { data: prof } = await supabase.from('profiles').select('*').eq('authUserId', currentUser.id).single();
      if (prof) {
        setProfile(prof);
        const displayName = prof.fullName || metaName || 'RailGaadi User';
        setFullName(displayName);
        setPhone(prof.phone || '');
        setAvatarUrl(prof.avatarUrl || '');
        if (displayName && displayName !== 'RailGaadi User') {
          localStorage.setItem('railgaadi_user_name', displayName);
        }
      } else {
        const displayName = metaName || 'RailGaadi User';
        setFullName(displayName);
        if (displayName && displayName !== 'RailGaadi User') {
          localStorage.setItem('railgaadi_user_name', displayName);
        }
      }

      // 2. Fetch Emergency Contacts
      const { data: cont } = await supabase.from('emergency_contacts').select('*').eq('userId', currentUser.id).order('createdAt', { ascending: true });
      setContacts(cont || []);

      // 3. Fetch Favorites
      const { data: favs } = await supabase.from('user_favourite_trains').select('*').eq('userId', currentUser.id).order('createdAt', { ascending: false });
      setFavorites(favs || []);

      // 4. Fetch Recent Searches
      const { data: searches } = await supabase.from('recent_searches').select('*').eq('userId', currentUser.id).order('searchedAt', { ascending: false });
      setRecentSearches(searches || []);
      
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
      if (isDemo) {
        const demoUser = { id: 'demo-user-id', email: 'demo@railgaadi.com' };
        setUser(demoUser);
        loadAllData(demoUser);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      loadAllData(user);
    };
    fetchSession();
  }, []);

  const showNotification = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setErrorMsg(null);
    } else {
      setErrorMsg(msg);
      setSuccessMsg(null);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 4000);
  };

  // Derive user initial for default avatar
  const getInitial = () => {
    if (fullName && fullName.trim().length > 0 && fullName !== 'RailGaadi User') {
      return fullName.trim()[0].toUpperCase();
    }
    if (user?.user_metadata?.fullName) {
      return user.user_metadata.fullName.trim()[0].toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.trim()[0].toUpperCase();
    }
    if (user?.email && user.email.trim().length > 0) {
      return user.email.trim()[0].toUpperCase();
    }
    return 'A';
  };

  // Upload Profile Photo to Supabase Storage
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate File Type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showNotification('error', 'Only JPG, PNG and WEBP images are allowed.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate File Size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showNotification('error', 'Image must be smaller than 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingPhoto(true);

    try {
      const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');

      if (isDemo || !user) {
        const previewUrl = URL.createObjectURL(file);
        setAvatarUrl(previewUrl);
        showNotification('success', 'Profile photo updated (Demo Mode).');
        setUploadingPhoto(false);
        return;
      }

      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/profile.${fileExt}`;

      // Upload file to Supabase Storage bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Save public URL in profiles database table
      await supabase
        .from('profiles')
        .update({ avatarUrl: publicUrl, updatedAt: new Date().toISOString() })
        .eq('authUserId', user.id);

      setAvatarUrl(publicUrl);
      showNotification('success', 'Profile photo updated.');
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      showNotification('error', err.message || 'Unable to upload profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);

  // Remove Profile Photo Confirmation Handler
  const handleConfirmRemovePhoto = async () => {
    setIsRemovingPhoto(true);

    try {
      const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');

      if (!isDemo && user) {
        await supabase.storage.from('avatars').remove([
          `${user.id}/profile.jpg`,
          `${user.id}/profile.jpeg`,
          `${user.id}/profile.png`,
          `${user.id}/profile.webp`
        ]).catch(() => {});

        await supabase
          .from('profiles')
          .update({ avatarUrl: null, updatedAt: new Date().toISOString() })
          .eq('authUserId', user.id);
      }

      setAvatarUrl('');
      setShowRemoveDialog(false);
      showNotification('success', 'Profile image removed successfully.');
    } catch (err: any) {
      showNotification('error', 'Failed to remove profile image. Please try again.');
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    setSavingProfile(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('railgaadi_user_name', fullName.trim());
    }

    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      setTimeout(() => {
        setSavingProfile(false);
        showNotification('success', 'Profile updated locally in Demo Mode.');
      }, 400);
      return;
    }

    try {
      const normalizedPhone = phone.replace(/[^0-9+]/g, '');
      const { error } = await supabase.from('profiles').update({
        fullName,
        phone: normalizedPhone,
        avatarUrl,
        updatedAt: new Date().toISOString()
      }).eq('authUserId', user.id);

      if (error) throw error;
      
      // Update local auth metadata too
      await supabase.auth.updateUser({
        data: { fullName, phone: normalizedPhone, avatarUrl }
      });

      showNotification('success', 'Profile updated successfully.');
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Tab 2: CRUD Emergency Contacts
  const openAddContact = () => {
    setEditingContact(null);
    setContactName('');
    setContactRelation('Parent');
    setContactPhone('');
    setContactIsPrimary(contacts.length === 0); // Default to primary if first contact
    setShowContactModal(true);
  };

  const openEditContact = (c: any) => {
    setEditingContact(c);
    setContactName(c.name);
    setContactRelation(c.relationship);
    setContactPhone(c.phone);
    setContactIsPrimary(c.isPrimary);
    setShowContactModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    setSavingContact(true);
    const normalizedPhone = contactPhone.replace(/[^0-9+]/g, '');
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');

    if (isDemo) {
      const parents = contacts.map(c => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        phoneNumber: c.phone
      }));
      
      const newContact = {
        id: editingContact ? editingContact.id : `parent_${Date.now()}`,
        name: contactName,
        relationship: contactRelation,
        phoneNumber: normalizedPhone
      };

      let updated = [];
      if (editingContact) {
        updated = parents.map(p => p.id === editingContact.id ? newContact : p);
      } else {
        updated = [...parents, newContact];
      }

      await emergencyStorageService.saveParentContacts(updated);
      setSavingContact(false);
      setShowContactModal(false);
      showNotification('success', 'Emergency contact saved locally.');
      loadAllData(user);
      return;
    }

    try {
      if (contactIsPrimary) {
        // Clear primary status from other contacts first
        await supabase.from('emergency_contacts').update({ isPrimary: false }).eq('userId', user.id);
      }

      if (editingContact) {
        // Update contact
        const { error } = await supabase.from('emergency_contacts').update({
          name: contactName,
          relationship: contactRelation,
          phone: normalizedPhone,
          isPrimary: contactIsPrimary,
          updatedAt: new Date().toISOString()
        }).eq('id', editingContact.id);

        if (error) throw error;
        showNotification('success', 'Emergency contact updated.');
      } else {
        // Create contact
        const { error } = await supabase.from('emergency_contacts').insert({
          userId: user.id,
          name: contactName,
          relationship: contactRelation,
          phone: normalizedPhone,
          isPrimary: contactIsPrimary
        });

        if (error) throw error;
        showNotification('success', 'Emergency contact added.');
      }

      setShowContactModal(false);
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save emergency contact.');
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      const parents = contacts.map(c => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        phoneNumber: c.phone
      }));
      const updated = parents.filter(p => p.id !== id);
      await emergencyStorageService.saveParentContacts(updated);
      showNotification('success', 'Emergency contact deleted locally.');
      loadAllData(user);
      return;
    }

    try {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Emergency contact deleted.');
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete emergency contact.');
    }
  };

  const handleSetPrimary = async (c: any) => {
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      showNotification('success', `${c.name} set as primary contact locally.`);
      return;
    }

    try {
      await supabase.from('emergency_contacts').update({ isPrimary: false }).eq('userId', user.id);
      await supabase.from('emergency_contacts').update({ isPrimary: true }).eq('id', c.id);
      showNotification('success', `${c.name} set as primary emergency contact.`);
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', 'Failed to update primary contact.');
    }
  };

  // Tab 3: Remove Favorite
  const handleRemoveFavorite = async (id: string) => {
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      const fav = favorites.find(f => f.id === id);
      if (fav) {
        await useFavoritesStore.getState().removeFavorite(fav.trainNumber);
        showNotification('success', 'Favorite train removed locally.');
        loadAllData(user);
      }
      return;
    }

    try {
      const { error } = await supabase.from('user_favourite_trains').delete().eq('id', id);
      if (error) throw error;
      showNotification('success', 'Favorite train removed.');
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', 'Failed to remove favorite train.');
    }
  };

  // Tab 4: Clear searches
  const handleClearSearches = async () => {
    if (!confirm('Are you sure you want to clear your recent searches?')) return;
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      await useSearchStore.getState().clearRecentSearches();
      showNotification('success', 'Search history cleared locally.');
      loadAllData(user);
      return;
    }

    try {
      const { error } = await supabase.from('recent_searches').delete().eq('userId', user.id);
      if (error) throw error;
      showNotification('success', 'Search history cleared.');
      loadAllData(user);
    } catch (err: any) {
      showNotification('error', 'Failed to clear search history.');
    }
  };

  // Tab 5: Reset Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword.length < 8) {
      showNotification('error', 'Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Passwords do not match.');
      return;
    }

    setChangingPassword(true);
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      setTimeout(() => {
        setChangingPassword(false);
        showNotification('success', 'Password updated locally in Demo Mode.');
        setNewPassword('');
        setConfirmPassword('');
      }, 400);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showNotification('success', 'Password updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    const isDemo = typeof window !== 'undefined' && document.cookie.includes('railgaadi-demo-mode=true');
    if (isDemo) {
      document.cookie = 'railgaadi-demo-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } else {
      await supabase.auth.signOut();
    }
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-rail-blue animate-spin" />
        <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Loading user profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 pb-20">
      
      {/* Hidden File Input for Supabase Storage Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />

      {/* ─── Profile Card with Cover & Overlapping Avatar ─────────────────── */}
      <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass overflow-hidden">
        
        {/* Cover Banner Section */}
        <div className="relative h-44 sm:h-60 w-full bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 overflow-hidden">
          {/* Subtle Railway Theme Graphic Overlay & Grid pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/20 via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          {/* RailGaadi Badge / Branding Pill on Cover */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 rounded-full bg-slate-900/60 backdrop-blur-md px-3 sm:px-4 py-1.5 border border-white/10 text-white/90 text-xs font-bold shadow-md">
            <Train className="h-4 w-4 text-sky-400" />
            <span>RailGaadi Member</span>
          </div>
        </div>

        {/* Profile Card Main Details Body */}
        <div className="relative px-6 sm:px-8 pb-8 pt-0 flex flex-col items-center text-center">
          
          {/* Overlapping Profile Avatar (Offset -mt-12 mobile, -mt-14 desktop) */}
          <div className="-mt-12 sm:-mt-14 mb-4">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              aria-label="View enlarged profile image"
              title="Click to view enlarged profile photo"
              className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-rail-blue focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-full transition-transform duration-200 hover:scale-[1.03] active:scale-95 flex-shrink-0"
            >
              {avatarUrl ? (
                <div className="relative w-[90px] h-[90px] sm:w-[110px] sm:h-[110px] rounded-full overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl flex-shrink-0">
                  <img src={avatarUrl} alt={fullName || 'User Profile'} className="h-full w-full object-cover group-hover:brightness-105 transition-all duration-200 rounded-full" />
                  {/* Zoom Icon Overlay on Hover */}
                  <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-full">
                    <ZoomIn className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                </div>
              ) : (
                <div className="relative group flex-shrink-0">
                  <DefaultAvatar initial={getInitial()} className="border-4 border-white dark:border-slate-900 shadow-xl group-hover:brightness-105 transition-all duration-200" />
                  {/* Zoom Icon Overlay on Hover */}
                  <div className="absolute inset-0 rounded-full bg-slate-950/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <ZoomIn className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* User Name & Info */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {fullName || user?.user_metadata?.full_name || 'RailGaadi User'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>

          {/* Action Buttons: Upload / Change & Remove */}
          <div className="mt-4 flex flex-wrap gap-2.5 justify-center items-center">
            {!avatarUrl ? (
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 disabled:opacity-50 text-xs font-bold text-white px-4 shadow-glow transition-all"
              >
                {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={uploadingPhoto || isRemovingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 disabled:opacity-50 text-xs font-bold text-white px-4 shadow-glow transition-all"
                >
                  {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                  <span>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                </button>

                <button
                  type="button"
                  disabled={uploadingPhoto || isRemovingPhoto}
                  onClick={() => setShowRemoveDialog(true)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 disabled:opacity-50 text-xs font-bold text-rose-500 px-4 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Photo</span>
                </button>
              </>
            )}
          </div>

          {/* RailGaadi Relevant Information Pills & Quick Nav Links */}
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 w-full max-w-xl flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              Verified Account
            </span>
            <Link
              href="/bookings"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <History className="h-3.5 w-3.5 text-sky-500" />
              <span>My Bookings</span>
            </Link>
            <Link
              href="/tracking"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Train className="h-3.5 w-3.5 text-indigo-500" />
              <span>Live Tracking</span>
            </Link>
          </div>

        </div>
      </div>

        {/* Confirmation Dialog Modal for Removing Profile Image */}
        {showRemoveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-center gap-3 text-rose-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    Remove Profile Image?
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    This will remove your current profile photo and restore your default avatar.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRemovingPhoto}
                  onClick={() => setShowRemoveDialog(false)}
                  className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRemovingPhoto}
                  onClick={handleConfirmRemovePhoto}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-xs font-bold text-white shadow-glow transition-all"
                >
                  {isRemovingPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <span>Remove</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Profile Image Lightbox Modal ─────────────────────────────────── */}
        {isImageModalOpen && (
          <div
            className="fixed inset-0 z-[9999] w-screen h-screen min-h-screen flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 cursor-pointer select-none"
            onClick={() => setIsImageModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Profile Image Lightbox"
          >
            {/* Inner Content wrapper */}
            <div
              className="relative flex flex-col items-center justify-center cursor-default max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Accessible Close Button */}
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                aria-label="Close profile image"
                className="absolute -top-12 right-0 sm:-right-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/90 text-white hover:bg-slate-700 transition-colors border border-slate-700/80 shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 z-20 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Enlarged Image / Avatar Container */}
              <div
                className="overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-2xl p-2 sm:p-4 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || 'User Profile Photo'}
                    className="max-w-[85vw] max-h-[75vh] sm:max-w-[70vw] sm:max-h-[75vh] object-contain rounded-2xl shadow-md select-none pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    className="p-6 flex items-center justify-center pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DefaultAvatar
                      initial={getInitial()}
                      className="h-56 w-56 sm:h-72 sm:w-72 border-4 border-rail-blue shadow-2xl"
                      initialClassName="text-7xl sm:text-8xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Main Tab notifications */}
      {(errorMsg || successMsg) && (
        <div className="mx-auto max-w-xl">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-500 leading-normal animate-in fade-in duration-250">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-500 leading-normal animate-in fade-in duration-250">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}
        </div>
      )}

      {/* ─── Columns grid Layout ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sticky Left Sidebar panel */}
        <aside className="w-full md:w-60 md:shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'emergency', label: 'Emergency Contacts', icon: ShieldAlert },
            { id: 'favorites', label: 'Favorite Trains', icon: Heart },
            { id: 'searches', label: 'Recent Searches', icon: History },
            { id: 'settings', label: 'Account Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); router.push(`#${tab.id === 'favorites' ? 'favourites' : tab.id}`); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all text-left outline-none',
                  activeTab === tab.id
                    ? 'bg-rail-blue text-white shadow-glow'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Cards display panel */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: PROFILE INFORMATION */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-6 shadow-glass animate-in fade-in duration-200">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Personal Information</h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Selection Grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest block">Choose Avatar</span>
                  <div className="flex flex-wrap gap-2.5">
                    {AVATAR_OPTIONS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAvatarUrl(url)}
                        className={cn(
                          'relative h-12 w-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 outline-none',
                          avatarUrl === url ? 'border-rail-blue ring-2 ring-rail-blue/20' : 'border-transparent opacity-80'
                        )}
                      >
                        <img src={url} alt={`Avatar option ${i + 1}`} className="h-full w-full object-cover" />
                        {avatarUrl === url && (
                          <div className="absolute inset-0 bg-rail-blue/15 flex items-center justify-center text-rail-blue">
                            <div className="bg-white rounded-full p-0.5 shadow-md">
                              <Check className="h-2.5 w-2.5" />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest leading-none">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 py-3 px-3.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest leading-none">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99999 99999"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50 py-3 px-3.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-rail-blue transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/30 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white px-5 shadow-glow transition-all"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: EMERGENCY CONTACTS */}
          {activeTab === 'emergency' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-6 shadow-glass animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Emergency Contacts</h3>
                <button
                  onClick={openAddContact}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rail-blue/10 hover:bg-rail-blue/15 text-xs font-black text-rail-blue px-3.5 border border-rail-blue/15 transition-all outline-none"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Contact</span>
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                  No emergency contacts configured yet. Add one to enable Parent SMS notifications.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        'p-4.5 border rounded-2xl flex flex-col justify-between gap-3 bg-slate-50/30 dark:bg-slate-900/10 transition-all',
                        c.isPrimary ? 'border-rail-blue bg-rail-blue/5' : 'border-slate-200/60 dark:border-slate-805/40'
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{c.name}</span>
                            {c.isPrimary && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-rail-blue/10 border border-rail-blue/20 px-1.5 py-0.5 font-mono text-[8px] font-bold text-rail-blue uppercase">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block mt-1 tracking-wider">{c.relationship}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditContact(c)}
                            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 hover:text-rail-blue flex items-center justify-center transition-all outline-none"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all outline-none"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-250/20 dark:border-slate-800/40">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{c.phone}</span>
                        {!c.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(c)}
                            className="text-[10px] font-black text-slate-450 hover:text-rail-blue uppercase tracking-wider outline-none"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal overlay popup form */}
              {showContactModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-sm glass-panel p-6 rounded-3xl shadow-glass border border-slate-200 dark:border-slate-800 space-y-5">
                    <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {editingContact ? 'Edit Contact' : 'Add Contact'}
                    </h4>

                    <form onSubmit={handleSaveContact} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block leading-none">Full Name</label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          required
                          placeholder="Contact full name"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block leading-none">Relationship</label>
                          <select
                            value={contactRelation}
                            onChange={(e) => setContactRelation(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all"
                          >
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Parent">Parent</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block leading-none">Phone Number</label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            required
                            placeholder="+91 99999 99999"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={contactIsPrimary}
                          onChange={(e) => setContactIsPrimary(e.target.checked)}
                          disabled={contacts.length === 0} // Can't uncheck if it's the only contact
                          className="h-4 w-4 rounded border-slate-350 text-rail-blue focus:ring-rail-blue outline-none"
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-450">Set as Primary contact</span>
                      </label>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowContactModal(false)}
                          className="flex-1 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 outline-none"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingContact}
                          className="flex-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow"
                        >
                          {savingContact ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4 w-4" />}
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FAVORITE TRAINS */}
          {activeTab === 'favorites' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-6 shadow-glass animate-in fade-in duration-200">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Favorite Trains</h3>

              {favorites.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                  You haven't saved any favorite trains yet. Heart a train on the live board tracker.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="glass-panel group flex items-center justify-between rounded-2xl p-4 transition-all duration-150 border border-slate-200/40 dark:border-slate-850/40 hover:-translate-y-0.5 hover:shadow-glass-hover"
                    >
                      <Link href={`/train/${fav.trainNumber}`} className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rail-blue/10 text-rail-blue group-hover:bg-rail-blue group-hover:text-white transition-all flex-shrink-0">
                          <Train className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-black text-rail-blue block">#{fav.trainNumber}</span>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm truncate leading-tight mt-0.5">{fav.trainName}</h4>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1 ml-2">
                        <Link
                          href={`/train/${fav.trainNumber}`}
                          className="h-8.5 w-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-400 hover:text-rail-blue flex items-center justify-center transition-all outline-none"
                          title="Track Live"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFavorite(fav.id)}
                          className="h-8.5 w-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-450 hover:text-rose-500 hover:bg-rose-500/5 flex items-center justify-center transition-all outline-none"
                          title="Remove from favorites"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RECENT SEARCHES */}
          {activeTab === 'searches' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-6 shadow-glass animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Searches</h3>
                {recentSearches.length > 0 && (
                  <button
                    onClick={handleClearSearches}
                    className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-xl border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-black text-rose-505 px-3.5 transition-all outline-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-450 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
                  Search history is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentSearches.map((search) => (
                    <Link
                      key={search.id}
                      href={`/train/${search.trainNumber}`}
                      className="glass-panel group flex items-center justify-between rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-hover"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-450 group-hover:bg-rail-blue group-hover:text-white transition-all flex-shrink-0">
                          <Train className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-black text-slate-400 block">#{search.trainNumber}</span>
                          <h4 className="font-black text-slate-900 dark:text-white text-xs truncate mt-0.5">{search.trainName}</h4>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0 group-hover:translate-x-0.5 group-hover:text-rail-blue transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACCOUNT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 space-y-6 shadow-glass animate-in fade-in duration-200">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Account Settings</h3>
              
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-black text-slate-950 dark:text-white block">Security Credentials</span>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-normal font-semibold mt-1">
                    Your password operations are fully authenticated and secure. Email password changes are linked to your Supabase Auth session.
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm pt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block leading-none">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 8 characters"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block leading-none">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 px-3.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white px-5 shadow-glow"
                  >
                    {changingPassword ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}

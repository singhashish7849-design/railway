'use client';

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUser = () => user;
  const getSession = () => session;

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, options?: { data?: Record<string, any>; emailRedirectTo?: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options,
    });
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'railgaadi-demo-mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    return await supabase.auth.signOut();
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
    });
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    getUser,
    getSession,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

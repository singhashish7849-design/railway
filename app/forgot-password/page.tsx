'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Train, Mail, ArrowLeft, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message || 'Unable to send password reset email.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Reset link sent successfully! Check your inbox for instructions.');
      setEmail('');
      setLoading(false);
    } catch (err) {
      setErrorMsg('Network error. Failed to reach the authorization server.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      
      {/* Branding Background elements */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-rail-blue/5 blur-3xl" />
      
      <div className="w-full max-w-sm glass-panel p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass space-y-6">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rail-blue text-white shadow-glow">
            <Train className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Enter your email to receive a password recovery link
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-500 leading-normal animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-500 leading-normal animate-in fade-in duration-200">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{successMsg}</p>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/40 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rail-blue transition-colors outline-none"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

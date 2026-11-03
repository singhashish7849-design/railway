'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Train, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Sparkles, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDemoLogin = () => {
    document.cookie = 'railgaadi-demo-mode=true; path=/; max-age=86400';
    localStorage.setItem('railgaadi_user_name', fullName.trim() || 'Demo User');
    setSuccessMsg('Demo session active! Redirecting to Dashboard...');
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = email.trim().toLowerCase();

    // Simple validation
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setErrorMsg('Please enter a valid email.');
      setLoading(false);
      return;
    }

    try {
      // Always store name locally if provided
      if (fullName.trim()) {
        localStorage.setItem('railgaadi_user_name', fullName.trim());
      }

      console.log("LOGIN USER:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      console.log("HAS SESSION:", !!data?.session);

      if (error) {
        console.error("SUPABASE LOGIN ERROR:", error);
        setErrorMsg(error.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      if (data?.user) {
        if (fullName.trim()) {
          try {
            await supabase.auth.updateUser({
              data: { fullName: fullName.trim(), full_name: fullName.trim() }
            });
            await supabase.from('profiles').upsert({
              authUserId: data.user.id,
              fullName: fullName.trim(),
              email: normalizedEmail,
              updatedAt: new Date().toISOString()
            }, { onConflict: 'authUserId' });
          } catch (updateErr) {
            console.warn('Profile name update skipped:', updateErr);
          }
        }

        setSuccessMsg('Login successful! Redirecting...');
        
        // Determine target route (defaulting to /dashboard)
        const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const targetRedirect = searchParams.get('redirectTo') || '/dashboard';

        // Full window navigation ensures fresh auth session cookies are included in headers to Netlify middleware
        setTimeout(() => {
          window.location.href = targetRedirect;
        }, 400);
      } else {
        setErrorMsg('Authentication failed. Please check your credentials.');
        setLoading(false);
      }

    } catch (err: any) {
      console.error('LOGIN EXCEPTION:', err);
      setErrorMsg(err?.message || 'Unable to connect to the authentication server. Please check your network connection.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* ─── Left Column (Branding & Micro-journey Visuals) ───────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white md:flex">
        
        {/* Background Gradients & Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/50 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rail-blue/10 blur-3xl" />
        
        {/* Logo and Brand */}
        <div className="relative z-10 flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rail-blue text-white shadow-glow">
            <Train className="h-5.5 w-5.5" />
          </div>
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-white">
              Rail<span className="text-rail-blue">Gaadi</span>
            </span>
            <span className="ml-2 rounded-full bg-rail-blue/20 border border-rail-blue/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rail-blue tracking-wide uppercase">
              Live Tracker
            </span>
          </div>
        </div>

        {/* Live Train Path Simulation Visual */}
        <div className="relative z-10 flex flex-1 flex-col justify-center items-center">
          <div className="relative w-full max-w-md h-48 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-left">
            {/* Animated Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:16px_16px]" />
            
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="text-[10px] font-bold text-rail-blue uppercase tracking-wider block">Active Journey</span>
                <h4 className="text-base font-black tracking-tight mt-0.5 text-white">Rajdhani Express</h4>
                <p className="text-xs text-slate-400 font-medium">NDLS to BCT · IN.IR.12952</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ON TIME</span>
              </div>
            </div>

            {/* Simulated Rails & Train Path (Linear Animation) */}
            <div className="relative w-full h-8 flex items-center mt-2">
              <div className="absolute left-0 right-0 h-1 bg-slate-800 rounded-full" />
              <div className="absolute left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,_transparent,_transparent_12px,_rgba(255,255,255,0.15)_12px,_rgba(255,255,255,0.15)_14px)]" />
              
              {/* Moving Train Node */}
              <motion.div 
                animate={{ x: [0, 360, 0] }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute flex items-center"
              >
                <div className="relative flex h-5.5 w-10 items-center justify-center rounded-lg bg-rail-blue text-white shadow-glow border border-sky-400/20">
                  <Train className="h-3 w-3" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold pt-2 border-t border-white/5">
              <span>Next: Kota Jn</span>
              <span>Delay: 0 mins</span>
              <span>Speed: 120 km/h</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 font-medium text-left">
          &copy; {new Date().getFullYear()} RailGaadi. Minimal, state-of-the-art rail safety.
        </div>
      </div>

      {/* ─── Right Column (Login Card & Form) ─────────────────────────────── */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:px-16 xl:px-24">
        
        {/* Mobile Header Branding */}
        <div className="absolute top-6 left-6 flex items-center gap-2 md:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rail-blue text-white shadow-glow">
            <Train className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            Rail<span className="text-rail-blue">Gaadi</span>
          </span>
        </div>

        <div className="mx-auto w-full max-w-sm space-y-6 text-left">
          
          {/* Header Title */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back 👋
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Enter your details to access RailGaadi
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold text-rose-500 leading-normal animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-left">{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-500 leading-normal animate-in fade-in slide-in-from-top-1 duration-200">
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p className="text-left">{successMsg}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="fullName" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                Your Name <span className="text-[10px] text-slate-400 font-medium lowercase">(for profile)</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue focus:ring-1 focus:ring-rail-blue/20 transition-all text-left"
                />
              </div>
            </div>

            {/* Email Field */}
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
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue focus:ring-1 focus:ring-rail-blue/20 transition-all text-left"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-rail-blue hover:text-sky-600 transition-colors uppercase tracking-wider outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue focus:ring-1 focus:ring-rail-blue/20 transition-all text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all active:scale-98 border border-sky-500/10 mt-2",
                loading ? "opacity-80 cursor-not-allowed" : ""
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            {/* Quick Demo Mode Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-98"
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Explore in Demo Mode (Instant Access)</span>
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-slate-500 font-medium pt-2">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-rail-blue hover:text-sky-600 transition-colors"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


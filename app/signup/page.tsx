'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Phone, ShieldAlert, Sparkles, Check, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/utils/cn';

type OnboardingStep = 1 | 2 | 3;

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<OnboardingStep>(1);

  // Form Fields - Step 1: Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields - Step 2: Basic Information
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Form Fields - Step 3: Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Parent');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Validation / Loading States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password strength checker state
  const [passwordStrength, setPasswordStrength] = useState<'Weak' | 'Medium' | 'Strong'>('Weak');
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0);

  // Calculate Password Strength
  useEffect(() => {
    let score = 0;
    if (!password) {
      setPasswordStrengthScore(0);
      setPasswordStrength('Weak');
      return;
    }
    if (password.length >= 8) score += 2;
    else if (password.length >= 6) score += 1;

    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

    if (hasNumbers) score += 1;
    if (hasSpecial) score += 1;
    if (hasMixedCase) score += 1;

    setPasswordStrengthScore(score);

    if (score <= 2) setPasswordStrength('Weak');
    else if (score <= 4) setPasswordStrength('Medium');
    else setPasswordStrength('Strong');
  }, [password]);

  // Navigate to Step 2
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all account fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  // Step 2 Completed -> Perform Final Signup
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName || !phone) {
      setErrorMsg('Please fill in all basic information fields.');
      return;
    }
    if (fullName.trim().length < 3) {
      setErrorMsg('Please enter a reasonable full name (minimum 3 characters).');
      return;
    }
    // Store full name in localStorage so it's instantly available for Profile
    localStorage.setItem('railgaadi_user_name', fullName.trim());

    // Simple phone format validation (at least 10 digits)
    const normalizedPhone = phone.replace(/[^0-9+]/g, '');
    if (normalizedPhone.length < 10) {
      setErrorMsg('Please enter a valid phone number with area code.');
      return;
    }

    // Call signup directly without requiring step 3 emergency setup
    handleFinalSignup();
  };

  // Perform Final Signup
  const handleFinalSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    console.log('[SIGNUP] Final signup initiated for:', normalizedEmail);

    if (fullName.trim()) {
      localStorage.setItem('railgaadi_user_name', fullName.trim());
    }

    const normalizedPhone = phone.replace(/[^0-9+]/g, '');

    // Setup user metadata
    const userMetadata: Record<string, string> = {
      fullName: fullName.trim(),
      full_name: fullName.trim(),
      phone: normalizedPhone,
    };

    if (emergencyName && emergencyPhone) {
      const normalizedEmergencyPhone = emergencyPhone.replace(/[^0-9+]/g, '');
      userMetadata.emergencyName = emergencyName;
      userMetadata.emergencyRelationship = emergencyRelationship;
      userMetadata.emergencyPhone = normalizedEmergencyPhone;
    }

    try {
      console.log('[SIGNUP] Sending single auth.signUp request to Supabase...');

      // 10-second timeout to prevent hanging on network/auth responses
      const signUpPromise = supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: userMetadata,
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Signup request timed out. Please check your connection and try again.')), 10000)
      );

      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

      console.log('[SIGNUP] Supabase response received:', {
        userId: data?.user?.id,
        hasSession: !!data?.session,
        error: error?.message
      });

      if (error) {
        const msg = error.message ? error.message.toLowerCase() : '';
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit') || (error as any).status === 429) {
          setErrorMsg('Supabase email service is temporarily rate limited. Please try again later.');
        } else if (msg.includes('already registered') || msg.includes('already exists')) {
          setErrorMsg('An account with this email address already exists.');
        } else {
          setErrorMsg(error.message || 'An error occurred during account creation.');
        }
        return;
      }

      if (data?.user) {
        if (data.session) {
          await supabase.auth.signOut();
        }
        console.log('[SIGNUP] Signup successful! Redirecting to login...');
        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 800);
      } else {
        setErrorMsg('Failed to create account. Please try again.');
      }
    } catch (err: any) {
      console.error('[SIGNUP] Exception during signup:', err);
      const msg = err.message ? err.message.toLowerCase() : '';
      if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        setErrorMsg('Supabase email service is temporarily rate limited. Please try again later.');
      } else {
        setErrorMsg(err.message || 'Authentication server connection failure. Please try again.');
      }
    } finally {
      console.log('[SIGNUP] Resetting loading state to false.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* ─── Left Column (Visual Branding & Step Trackers) ────────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-slate-900 p-12 text-white md:flex">
        
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/50 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-rail-blue/10 blur-3xl" />
        
        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rail-blue text-white shadow-glow">
            <Train className="h-5.5 w-5.5" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Rail<span className="text-rail-blue">Gaadi</span>
          </span>
        </div>

        {/* Step Checkpoints Visual Layout */}
        <div className="relative z-10 mx-auto w-full max-w-sm space-y-8 text-left">
          <h3 className="text-lg font-black tracking-tight text-slate-100 text-left">Set Up Your Account</h3>
          
          <div className="space-y-6 text-left">
            {[
              { num: 1, title: 'Account Settings', desc: 'Secure email and password' },
              { num: 2, title: 'Basic Information', desc: 'Personal details and verification' },
              { num: 3, title: 'Emergency Contacts', desc: 'Alert configuration' },
            ].map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;

              return (
                <div key={s.num} className="flex gap-4 items-start text-left">
                  <div
                    className={cn(
                      'flex h-7.5 w-7.5 items-center justify-center rounded-full text-xs font-bold border transition-all duration-300 shrink-0 mt-0.5',
                      isActive
                        ? 'border-rail-blue bg-rail-blue text-white shadow-glow'
                        : isCompleted
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 text-slate-500'
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <div className="text-left">
                    <h4
                      className={cn(
                        'text-sm font-bold leading-none transition-colors text-left',
                        isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                      )}
                    >
                      {s.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 font-semibold text-left">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium text-left">
          &copy; {new Date().getFullYear()} RailGaadi. Secure PWA-ready onboarding.
        </div>
      </div>

      {/* ─── Right Column (Onboarding Multi-Step Card) ────────────────────── */}
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
          
          {/* Header titles */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {step === 1 && 'Create an account'}
              {step === 2 && 'Tell us about yourself'}
              {step === 3 && 'Emergency setup'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              {step === 1 && 'Step 1 of 3 · Account details'}
              {step === 2 && 'Step 2 of 3 · Personal details'}
              {step === 3 && 'Step 3 of 3 · Safety contacts (Optional)'}
            </p>
          </div>

          {/* Form Actions */}
          <div className="space-y-5 text-left">
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

            <AnimatePresence mode="wait">
              {/* Step 1 Form */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  onSubmit={handleStep1Next}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
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
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="password" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1 pt-1.5 text-left">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Password strength:</span>
                          <span
                            className={cn(
                              passwordStrength === 'Weak' && 'text-rose-500',
                              passwordStrength === 'Medium' && 'text-amber-500',
                              passwordStrength === 'Strong' && 'text-emerald-500'
                            )}
                          >
                            {passwordStrength}
                          </span>
                        </div>
                        <div className="flex h-1.5 gap-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              passwordStrengthScore <= 2 && 'bg-rose-500 w-1/3',
                              passwordStrengthScore === 3 && 'bg-amber-500 w-2/3',
                              passwordStrengthScore >= 4 && 'bg-emerald-500 w-full'
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="confirmPassword" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all mt-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.form>
              )}

              {/* Step 2 Form */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  onSubmit={handleStep2Next}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="fullName" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="phone" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 99999 99999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 text-left">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 outline-none"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "flex-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all",
                        loading ? "opacity-80 cursor-not-allowed" : ""
                      )}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Step 3 Form */}
              {step === 3 && (
                <motion.form
                  key="step3"
                  onSubmit={handleFinalSignup}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <div className="p-3.5 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-2.5 text-left">
                    <ShieldAlert className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5 animate-pulse" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-semibold text-left">
                      RailGaadi features Emergency Mode. Adding a primary parent or guardian contact enables automated SMS tracking coordinates dispatch if triggered.
                    </p>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label htmlFor="emergencyName" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                      Contact Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="emergencyName"
                        type="text"
                        placeholder="Mother / Father Name"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-left">
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="emergencyRelationship" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                        Relationship
                      </label>
                      <select
                        id="emergencyRelationship"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-3.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-rail-blue transition-all text-left"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Parent">Parent</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label htmlFor="emergencyPhone" className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none block text-left">
                        Contact Phone
                      </label>
                      <input
                        id="emergencyPhone"
                        type="tel"
                        placeholder="+91 88888 88888"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 px-3.5 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-rail-blue transition-all text-left"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2 text-left">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className="flex-1 inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 outline-none"
                    >
                      Back
                    </button>
                    
                    {/* If no contact details entered, offer a Skip button to complete signup directly */}
                    {!emergencyName && !emergencyPhone ? (
                      <button
                        type="button"
                        onClick={() => handleFinalSignup()}
                        disabled={loading}
                        className="flex-1 inline-flex h-11 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-white transition-all outline-none"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Skip & Signup</span>}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                            <span>Signing up...</span>
                          </>
                        ) : (
                          <span>Complete Signup</span>
                        )}
                      </button>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-slate-500 font-medium pt-1">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-rail-blue hover:text-sky-600 transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

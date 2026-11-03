'use client';

import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, Terminal, Play, CheckCircle } from 'lucide-react';

export function ConfigRequired() {
  const [copied, setCopied] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const envTemplate = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-phone-number`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartDemo = () => {
    setLoadingDemo(true);
    // Set cookie to flag local demo mode bypass
    document.cookie = 'railgaadi-demo-mode=true; path=/; max-age=31536000';
    
    // Refresh to apply changes and redirect to /dashboard
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 overflow-y-auto py-10">
      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-glass space-y-6">
        
        <div className="flex flex-col items-center text-center space-y-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm animate-pulse">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Database Configuration Required
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 font-semibold mt-1.5 max-w-sm leading-normal">
              RailGaadi is ready, but your `.env.local` file is missing valid Supabase API endpoints.
            </p>
          </div>
        </div>

        {/* DEMO MODE BYPASS CTA */}
        <div className="p-5 rounded-2xl border border-rail-blue/20 bg-rail-blue/5 text-center space-y-3">
          <h4 className="text-xs font-black text-rail-blue uppercase tracking-wider">Want to test the app immediately?</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
            Launch in **Demo Mode** to test the complete application, profile settings, and map features instantly inside your browser, bypassing cloud configurations.
          </p>
          <button
            onClick={handleStartDemo}
            disabled={loadingDemo}
            className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rail-blue hover:bg-sky-600 text-xs font-bold text-white shadow-glow transition-all outline-none"
          >
            {loadingDemo ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{loadingDemo ? 'Launching...' : 'Launch in Demo Mode'}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest block">Instructions</span>
            <ol className="list-decimal list-inside text-xs font-semibold text-slate-650 dark:text-slate-350 space-y-1.5 leading-normal">
              <li>Create a new Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-rail-blue hover:underline">supabase.com</a>.</li>
              <li>Navigate to Project Settings &gt; API and copy your project URL and keys.</li>
              <li>Create/open your <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-rose-500 font-mono text-[10px]">.env.local</code> file in the workspace root.</li>
              <li>Paste the variables, fill in your values, and restart your server.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-450 dark:text-slate-450 uppercase tracking-widest block">Environment Variables Template</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-rail-blue hover:text-sky-600 transition-colors uppercase outline-none"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-850 bg-slate-950 p-4.5 font-mono text-[10.5px] text-slate-300 leading-relaxed overflow-x-auto shadow-inner">
              <pre>{envTemplate}</pre>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

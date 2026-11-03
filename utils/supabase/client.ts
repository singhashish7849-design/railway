import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './config';
import { clientEnv } from '@/config/env';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || clientEnv.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || clientEnv.SUPABASE_PUBLISHABLE_KEY;

  if (!isSupabaseConfigured()) {
    // Return dummy client with placeholder parameters to prevent loading-time crashes
    return createBrowserClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key'
    );
  }

  return createBrowserClient(url, key);
}


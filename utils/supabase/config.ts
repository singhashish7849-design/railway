import { clientEnv } from '@/config/env';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || clientEnv.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || clientEnv.SUPABASE_PUBLISHABLE_KEY;
  
  if (!url || !key) return false;
  if (url === 'your-supabase-url-here' || url.startsWith('your-') || url.includes('placeholder-project')) return false;
  // sb_publishable_ keys are not valid for @supabase/ssr (only anon keys are supported)
  if (key.startsWith('sb_publishable_')) return false;
  
  try {
    // Attempt to parse as URL
    new URL(url);
    return true;
  } catch {
    return false;
  }
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getPublicSiteUrl() {
  const configuredUrl = (import.meta.env.VITE_SITE_URL || import.meta.env.VITE_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://storygrid-five.vercel.app';
}

export function requireSupabaseClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('StoryGrid requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Configure the environment before starting the app.');
  }
  return supabase;
}

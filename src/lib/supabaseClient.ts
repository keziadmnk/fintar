import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [FinTar Supabase Client] Supabase is not yet configured or using placeholder credentials.\n' +
    'To connect your real backend:\n' +
    '1. Open .env.local\n' +
    '2. Set VITE_SUPABASE_URL=https://<your-project-id>.supabase.co\n' +
    '3. Set VITE_SUPABASE_ANON_KEY=<your-anon-key>\n' +
    'Running in offline local storage / fallback demo mode until configured.'
  );
}

// Instantiate client with real credentials or safe fallback dummy values for local development
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl! : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey! : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

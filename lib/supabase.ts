import { createClient } from '@supabase/supabase-js';

// Client should NOT use service role key. We keep this file only if you later add RLS + anon key access.
// For this project, client talks to Vercel /api/*, which uses SUPABASE_SERVICE_ROLE_KEY server-side.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

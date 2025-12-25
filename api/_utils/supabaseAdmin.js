import { createClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('supabaseAdmin is server-only');
}

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const MISSING_ENV = !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = MISSING_ENV ? null : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export function getSupabaseAdmin() {
  if (MISSING_ENV) {
    throw new Error('Missing env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabaseAdmin;
}
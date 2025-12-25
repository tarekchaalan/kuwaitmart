import { createClient } from '@supabase/supabase-js';

const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function getUser(req) {
  const authz = req?.headers?.authorization || '';
  const token = (authz.startsWith('Bearer ') ? authz.slice(7) : null) || req?.cookies?.['sb-access-token'] || null;
  if (!token) return null;
  try {
    const { data, error } = await supabaseAnon.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}



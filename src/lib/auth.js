import { getSupabase } from './supabaseClient.js';

export async function signUp({ email, password, fullName, phone, addressParts }) {
  const sb = getSupabase();
  const { data: auth, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;

  // Only upsert profile immediately if we have a session (no email confirmation flow)
  if (auth.session && auth.user) {
    const composedAddress = composeAddress(addressParts);
    const { error: pErr } = await sb.from('profiles').upsert({ id: auth.user.id, full_name: fullName, phone: phone || null, address: composedAddress || null, email });
    if (pErr) throw pErr;
  } else {
    // Save pending profile patch to apply on first SIGNED_IN event
    try {
      const composedAddress = composeAddress(addressParts);
      const patch = { full_name: fullName || null, phone: phone || null, address: composedAddress || null, email };
      localStorage.setItem('kuwaitmart.pendingProfilePatch', JSON.stringify(patch));
    } catch {}
  }

  return auth.user;
}

function composeAddress(parts = {}) {
  const bt = parts?.buildingType ? `Type: ${parts.buildingType}` : null;
  const bno = parts?.buildingNumber ? `Building: ${parts.buildingNumber}` : null;
  const block = parts?.blockNumber ? `Block: ${parts.blockNumber}` : null;
  const street = parts?.streetNumber ? `Street: ${parts.streetNumber}` : null;
  const area = parts?.area ? `Area: ${parts.area}` : null;
  const floor = parts?.floor ? `Floor: ${parts.floor}` : null;
  return [bt, bno, block, street, area, floor].filter(Boolean).join(', ');
}

export async function signIn({ email, password }) {
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const sb = getSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

export async function getProfile() {
  const sb = getSupabase();
  const {
    data: { user }
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw error;
  return { user, profile: data };
}

export async function updateProfile(patch) {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await sb.from('profiles').update(patch).eq('id', user.id).select('*').single();
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export function onAuthStateChange(callback) {
  const sb = getSupabase();
  return sb.auth.onAuthStateChange(callback);
}

import { getSupabase, getCurrentGuestId } from './supabaseClient.js';

export async function mergeGuestOrdersIntoUser() {
  const sb = getSupabase();
  const guestId = getCurrentGuestId();
  const { data: userRes } = await sb.auth.getUser();
  const user = userRes?.user || null;
  const userId = user?.id || null;
  const userEmail = user?.email || null;
  if (!guestId || !userId) return 0;
  const updates = { user_id: userId };
  if (userEmail) updates.email = userEmail;
  const { data: updatedRows, error } = await sb
    .from('orders')
    .update(updates)
    .eq('guest_cookie_id', guestId)
    .is('user_id', null)
    .select('id');
  if (error) throw error;
  return (updatedRows || []).length;
}



import { getSupabase } from './supabaseClient.js';

async function findUserCart(sb) {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('carts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
  return data;
}

async function findGuestCart(sb) {
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const guestId = getCurrentGuestId();
  const { data } = await sb.from('carts').select('*').eq('guest_cookie_id', guestId).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data;
}

export async function getOrCreateActiveCart() {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const guestId = getCurrentGuestId();
  const { data, error } = await sb.rpc('get_or_create_cart', { p_guest: guestId });
  if (error) { console.error('Failed to get/create cart:', error); throw error; }
  return data;
}

export async function addToCart({ product_id, qty = 1, option_values = null, unit_price_kwd = null }) {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const { error } = await sb.rpc('add_to_cart_cookie', {
    p_guest: getCurrentGuestId(),
    p_product: product_id,
    p_qty: qty,
    p_opts: option_values,
    p_price: unit_price_kwd
  });
  if (error) throw error;
  return true;
}

export async function setQty(item_id, qty) {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const { data, error } = await sb.rpc('set_cart_item_qty_cookie', { p_guest: getCurrentGuestId(), p_item: item_id, p_qty: qty });
  if (error) throw error;
  return data;
}

export async function removeItem(item_id) {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const { data, error } = await sb.rpc('remove_cart_item_cookie', { p_guest: getCurrentGuestId(), p_item: item_id });
  if (error) throw error;
  return !!data;
}

export async function getCartLines() {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const { data, error } = await sb.rpc('get_cart_lines_cookie', { p_guest: getCurrentGuestId() });
  if (error) throw error;
  return data || [];
}

export async function getCartCount() {
  const lines = await getCartLines();
  return lines.reduce((sum, line) => sum + (line.qty || 0), 0);
}

export async function clearCart() {
  const sb = getSupabase();
  const { getCurrentGuestId } = await import('./supabaseClient.js');
  const { error } = await sb.rpc('clear_cart_cookie', { p_guest: getCurrentGuestId() });
  if (error) throw error;
  return true;
}

// Call after successful login to merge guest cart into user cart
export async function mergeGuestIntoUserCart() {
  const sb = getSupabase();
  const guest = await findGuestCart(sb);
  const userCart = await findUserCart(sb);
  const { data: { user } } = await sb.auth.getUser();
  if (!guest || !user) return userCart || null;

  if (!userCart) {
    // Claim guest cart as user cart
    const { data, error } = await sb.from('carts')
      .update({ user_id: user.id, guest_cookie_id: null })
      .eq('id', guest.id).select('*').single();
    if (error) throw error;
    return data;
  }

  // Merge items into existing user cart
  const { data: guestItems } = await sb.from('cart_items').select('*').eq('cart_id', guest.id);
  for (const gi of guestItems || []) {
    await addToCart({
      product_id: gi.product_id,
      qty: gi.qty,
      option_values: gi.option_values,
      unit_price_kwd: gi.unit_price_kwd
    });
  }
  await sb.from('carts').delete().eq('id', guest.id);
  return await findUserCart(sb);
}

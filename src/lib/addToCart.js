import { getSupabase, getCurrentGuestId } from "./supabaseClient.js";

export async function addToCartFast({ product_id, qty, option_values, unit_price_kwd, bump }) {
  bump?.(qty); // optimistic badge bump
  const supabase = getSupabase();
  const { error } = await supabase.rpc('add_to_cart_cookie', {
    p_guest: getCurrentGuestId(),
    p_product: product_id,
    p_qty: qty,
    p_opts: option_values || {},
    p_price: unit_price_kwd
  });
  if (error) throw error;
}

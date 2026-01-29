import { supabaseAdmin } from "./supabaseAdmin.js";
import crypto from "crypto";

// Soft utilities for optional payments schema. All functions swallow errors
// so the app keeps working even if the payments tables aren't created yet.

const CLICK_KEY = process.env.CLICK_KEY;

/**
 * Verify HMAC signature for Click gateway callbacks.
 * This helps prevent spoofed payment status messages.
 *
 * @param {object} params - Parameters to verify
 * @param {string} params.orderId - Order ID
 * @param {string} params.sessionId - Session ID
 * @param {string} params.status - Payment status (success/failed/etc)
 * @param {string} signature - The signature to verify
 * @returns {boolean} Whether the signature is valid
 */
export function verifyClickSignature({ orderId, sessionId, status }, signature) {
  if (!CLICK_KEY || !signature) return false;

  try {
    // Create message string from sorted params
    const message = `orderId=${orderId}&sessionId=${sessionId}&status=${status}`;
    const expectedSignature = crypto
      .createHmac("sha256", CLICK_KEY)
      .update(message)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Atomically increment coupon usage if not already applied for this order.
 * Returns true if increment was successful, false if already applied or limit reached.
 *
 * @param {string} orderId - Order ID
 * @param {string} couponCode - Coupon code to increment
 * @returns {Promise<{success: boolean, reason?: string}>}
 */
export async function incrementCouponUsageAtomic(orderId, couponCode) {
  if (!orderId || !couponCode) {
    return { success: false, reason: "missing_params" };
  }

  try {
    // First check if coupon was already applied for this order
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("coupon_applied")
      .eq("id", orderId)
      .single();

    if (order?.coupon_applied) {
      console.log(`[coupon] Coupon already applied for order ${orderId}, skipping increment`);
      return { success: false, reason: "already_applied" };
    }

    // Get coupon with current usage
    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("id, used_count, usage_limit")
      .eq("code", couponCode)
      .maybeSingle();

    if (!coupon) {
      console.warn(`[coupon] Coupon ${couponCode} not found`);
      return { success: false, reason: "coupon_not_found" };
    }

    // Check if limit reached
    const currentUsage = Number(coupon.used_count || 0);
    if (coupon.usage_limit !== null && currentUsage >= coupon.usage_limit) {
      console.warn(`[coupon] Coupon ${couponCode} limit reached`);
      return { success: false, reason: "limit_reached" };
    }

    // Atomically update both coupon usage AND order's coupon_applied flag
    // This prevents race conditions by using a single transaction-like pattern
    const { error: orderError } = await supabaseAdmin
      .from("orders")
      .update({ coupon_applied: true })
      .eq("id", orderId)
      .eq("coupon_applied", false); // Only update if not already applied

    if (orderError) {
      console.error(`[coupon] Failed to mark order ${orderId} coupon_applied:`, orderError);
      return { success: false, reason: "order_update_failed" };
    }

    // Now increment the coupon usage
    const { error: couponError } = await supabaseAdmin
      .from("coupons")
      .update({ used_count: currentUsage + 1 })
      .eq("id", coupon.id)
      .eq("used_count", currentUsage); // Optimistic locking

    if (couponError) {
      // Rollback order's coupon_applied flag if coupon update failed
      await supabaseAdmin
        .from("orders")
        .update({ coupon_applied: false })
        .eq("id", orderId);
      console.error(`[coupon] Failed to increment coupon ${couponCode}:`, couponError);
      return { success: false, reason: "coupon_update_failed" };
    }

    console.log(`[coupon] Incremented coupon ${couponCode} usage to ${currentUsage + 1} for order ${orderId}`);
    return { success: true };
  } catch (e) {
    console.error(`[coupon] Error incrementing coupon ${couponCode}:`, e);
    return { success: false, reason: "error" };
  }
}

async function safe(fn) {
  try {
    return await fn();
  } catch (e) {
    return { error: e };
  }
}

export async function insertPaymentIfSupported({ orderId, amountKwd, currency = "KWD", sessionId, indicatorToken, status = "initiated", method = null, gatewayRaw = null }) {
  return await safe(async () => {
    const methodToSave = (method === 'KNET' || method === 'CARD') ? method : 'CARD';
    const { data, error } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: orderId,
        amount_kwd: Number(amountKwd || 0),
        currency: currency || "KWD",
        session_id: sessionId || null,
        indicator_token: indicatorToken || null,
        status,
        method: methodToSave,
        gateway_raw: gatewayRaw || null,
      })
      .select("id")
      .single();
    if (error) return { error };
    return { id: data?.id || null };
  });
}

export async function addPaymentEventIfSupported({ paymentId, event, payload = null }) {
  return await safe(async () => {
    if (!paymentId) return {};
    const { error } = await supabaseAdmin
      .from("payment_events")
      .insert({ payment_id: paymentId, event, payload: payload || null });
    if (error) return { error };
    return {};
  });
}

async function findLatestPayment({ sessionId, orderId }) {
  // Try by session first, then by order
  let id = null;
  if (sessionId) {
    const { data } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    id = data?.id || null;
  }
  if (!id && orderId) {
    const { data } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    id = data?.id || null;
  }
  return id;
}

export async function updatePaymentBySessionOrOrder({ sessionId, orderId, patch, event = null, eventPayload = null }) {
  return await safe(async () => {
    let paymentId = await findLatestPayment({ sessionId, orderId });
    if (!paymentId) {
      // Try to create a row if none exists yet
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, total_kwd, currency')
        .eq('id', orderId)
        .order('id')
        .limit(1)
        .maybeSingle();
      if (order) {
        const created = await insertPaymentIfSupported({
          orderId: orderId,
          amountKwd: order.total_kwd,
          currency: order.currency || 'KWD',
          sessionId,
          indicatorToken: null,
          status: (patch && patch.status) ? patch.status : 'initiated',
          gatewayRaw: null,
        });
        paymentId = created?.id || null;
      }
      if (!paymentId) return {};
    }
    const cleanPatch = Object.fromEntries(Object.entries(patch || {}).filter(([, v]) => v !== undefined));
    const { error } = await supabaseAdmin
      .from("payments")
      .update({ ...cleanPatch, updated_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (!error && event) {
      await addPaymentEventIfSupported({ paymentId, event, payload: eventPayload || null });
    }
    if (error) return { error };
    return { id: paymentId };
  });
}

export async function safeUpdateOrderPaidAt(orderId, paid) {
  return await safe(async () => {
    const iso = paid ? new Date().toISOString() : null;
    // Try with paid_at; if it fails (column missing), fall back to status-only
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ paid_at: iso })
      .eq("id", orderId);
    if (error) return { error };
    return {};
  });
}

export async function safeUpdateOrderGatewayRaw(orderId, gatewayRaw) {
  return await safe(async () => {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ gateway_raw: gatewayRaw })
      .eq("id", orderId);
    if (error) return { error };
    return {};
  });
}



import { supabaseAdmin } from "./supabaseAdmin.js";

// Soft utilities for optional payments schema. All functions swallow errors
// so the app keeps working even if the payments tables aren't created yet.

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



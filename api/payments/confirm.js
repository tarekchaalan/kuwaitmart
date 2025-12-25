import { supabaseAdmin } from "../_utils/supabaseAdmin.js";
import { updatePaymentBySessionOrOrder, addPaymentEventIfSupported, safeUpdateOrderPaidAt } from "../_utils/payments.js";

const CLICK_BASE_URL = process.env.CLICK_BASE_URL || "https://clickkw.com";
const CLICK_DEVELOPER_USER = process.env.CLICK_DEVELOPER_USER;
const CLICK_KEY = process.env.CLICK_KEY;

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { orderId, indicator_status, force, failIfPending, message, message_type } = req.query || {};
    if (!orderId) return res.status(400).json({ error: "orderId required" });
    if (!CLICK_DEVELOPER_USER || !CLICK_KEY) return res.status(500).json({ error: "Gateway env missing" });

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: "Order not found" });

    const forceRecheck = String(force || "").toLowerCase() === "1" || String(force || "").toLowerCase() === "true";
    if (order.status === "paid" && !forceRecheck) return res.json({ status: "paid" });

    // If the indicator token doesn't match, don't immediately fail; continue to verify via paymentstatus
    const indicatorMismatch = !!(order.payment_ref && indicator_status && String(order.payment_ref) !== String(indicator_status));

    const sessionId = String(req.query?.sessionId || order.mf_session_id || "");
    if (!sessionId) {
      // Do not flip order to failed if we don't have a session id to verify against
      return res.status(400).json({ error: "no_session_id_for_order" });
    }

    // Fast-path: if the return URL contains a message, honor it
    const msg = String(message || "").toLowerCase();
    if (msg) {
      // Map common gateway tokens to internal statuses
      let next = msg === 'success' ? 'paid' : msg;
      if (msg === 'error' || msg === 'wrong' || msg === 'fail' || msg === 'failed' || msg === 'rejected') next = 'failed';
      if (msg === 'cancel' || msg === 'cancelled') next = 'cancelled';
      await supabaseAdmin.from("orders").update({ status: next }).eq("id", orderId);
      if (next === 'paid') { await safeUpdateOrderPaidAt(orderId, true); }
      await updatePaymentBySessionOrOrder({
        sessionId,
        orderId,
        patch: { status: next === 'paid' ? 'captured' : (next === 'failed' ? 'failed' : undefined) },
        event: 'status_checked',
        eventPayload: { via: 'return_message', message: msg, message_type: message_type || null },
      });
      return res.json({ status: next, gateway: { via: 'return_message', message: msg, message_type } });
    }

    const url = `${CLICK_BASE_URL}/api/developer/gatedeveloper/paymentstatus/${encodeURIComponent(CLICK_DEVELOPER_USER)}`;
    const postBody = JSON.stringify({ session_id: sessionId, order_id: Number(order.order_number) });

    async function fetchStatusOnce() {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CLICK_KEY}`,
        },
        body: postBody,
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        return { error: "paymentstatus_http_error", httpStatus: r.status, body: msg };
      }
      const payload = await r.json().catch(() => ({}));
      const statusStr = String(payload?.Status || payload?.status || payload?.Response || payload?.response || "").toLowerCase();
      const isSuccess = statusStr === "success";
      const isFailed = statusStr === "failed" || statusStr === "fail" || statusStr === "rejected";
      return { payload, statusStr, isSuccess, isFailed };
    }

    // Optional short polling when forced, to account for gateway propagation delays
    const maxWaitMs = 1000 * Math.min(60, Number(req.query?.wait || (forceRecheck ? 10 : 0))); // default 10s when force=1
    const started = Date.now();
    let last = await fetchStatusOnce();
    while (!last.error && !last.isSuccess && !last.isFailed && Date.now() - started < maxWaitMs) {
      await new Promise((r) => setTimeout(r, 1000));
      last = await fetchStatusOnce();
    }

    if (last.error) {
      return res.status(502).json({ error: last.error, status: last.httpStatus, body: last.body });
    }

    // Update order conservatively: mark paid on success; mark failed only on explicit failure; else keep pending
    let next = last.isSuccess ? "paid" : (last.isFailed ? "failed" : order.status);
    // Optional override: when requested, finalize non-success states as failed (e.g., user aborted on gateway page)
    const shouldFailIfPending = String(failIfPending || "").toLowerCase() === "1" || String(failIfPending || "").toLowerCase() === "true";
    if (!last.isSuccess && !last.isFailed && shouldFailIfPending) {
      next = "failed";
    }
    const orderPatch = { status: next };
    await supabaseAdmin.from("orders").update(orderPatch).eq("id", orderId);

    // Persist gateway payload and events in payments table if available
    const txid = last?.payload?.transaction_id || last?.payload?.TransactionId || last?.payload?.TxnId || null;
    const refno = last?.payload?.reference_no || last?.payload?.ReferenceNo || null;
    const paymentPatch = { status: last.isSuccess ? "captured" : (last.isFailed ? "failed" : undefined), gateway_raw: last.payload };
    if (txid) paymentPatch.gateway_transaction_id = txid;
    if (refno) paymentPatch.reference_no = refno;
    await updatePaymentBySessionOrOrder({
      sessionId,
      orderId,
      patch: paymentPatch,
      event: "status_checked",
      eventPayload: last.payload,
    });

    // On success: set paid_at and sync mf_session_id when a different sessionId was supplied
    if (last.isSuccess) {
      await safeUpdateOrderPaidAt(orderId, true);
      if (String(order.mf_session_id || "") !== String(sessionId)) {
        await supabaseAdmin.from("orders").update({ mf_session_id: sessionId }).eq("id", orderId);
      }
      // Increment coupon usage count when payment is confirmed
      try {
        if (order.coupon_code) {
          const { data: cp } = await supabaseAdmin
            .from('coupons')
            .select('id, used_count, usage_limit')
            .eq('code', order.coupon_code)
            .maybeSingle();
          if (cp) {
            const nextUsed = Number(cp.used_count || 0) + 1;
            await supabaseAdmin
              .from('coupons')
              .update({ used_count: nextUsed })
              .eq('id', cp.id);
          }
        }
      } catch {}
    }

    return res.json({ status: next, gateway: last.payload, indicator_mismatch: indicatorMismatch || undefined });
  } catch (e) {
    console.error("/api/payments/confirm error", e);
    return res.status(500).json({ error: "internal_error" });
  }
}



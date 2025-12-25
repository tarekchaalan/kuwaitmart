import { supabaseAdmin } from "../_utils/supabaseAdmin.js";
import { updatePaymentBySessionOrOrder, safeUpdateOrderPaidAt } from "../_utils/payments.js";

const CLICK_BASE_URL = process.env.CLICK_BASE_URL || "https://clickkw.com";
const CLICK_DEVELOPER_USER = process.env.CLICK_DEVELOPER_USER;
const CLICK_KEY = process.env.CLICK_KEY;

export default async function handler(req, res) {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = method === 'GET' ? (req.query || {}) : (typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body||{}));
    const { orderId, sessionId: sessionIdFromBody } = body;
    if (!orderId) return res.status(400).json({ error: "orderId required" });
    if (!CLICK_DEVELOPER_USER || !CLICK_KEY) return res.status(500).json({ error: "Gateway env missing" });

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: "Order not found" });

    const sessionId = String(sessionIdFromBody || order.mf_session_id || "");
    if (!sessionId) return res.status(400).json({ error: "no_session_id_for_order" });

    const url = `${CLICK_BASE_URL}/api/developer/gatedeveloper/paymentstatus/${encodeURIComponent(CLICK_DEVELOPER_USER)}`;
    const postBody = JSON.stringify({ session_id: sessionId, order_id: Number(order.order_number) });
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${CLICK_KEY}` },
      body: postBody,
    });
    if (!r.ok) {
      const txt = await r.text().catch(()=>"");
      return res.status(502).json({ error: "paymentstatus_http_error", status: r.status, body: txt });
    }
    const payload = await r.json().catch(()=>({}));
    const statusStr = String(payload?.Status || payload?.status || payload?.Response || payload?.response || "").toLowerCase();
    const isSuccess = statusStr === 'success';
    const isFailed = statusStr === 'failed' || statusStr === 'fail' || statusStr === 'rejected';

    const next = isSuccess ? 'paid' : (isFailed ? 'failed' : order.status);
    await supabaseAdmin.from('orders').update({ status: next }).eq('id', orderId);
    const txid = payload?.transaction_id || payload?.TransactionId || payload?.TxnId || null;
    const refno = payload?.reference_no || payload?.ReferenceNo || null;
    const paymentPatch = { status: isSuccess ? 'captured' : (isFailed ? 'failed' : undefined), gateway_raw: payload };
    if (txid) paymentPatch.gateway_transaction_id = txid;
    if (refno) paymentPatch.reference_no = refno;
    await updatePaymentBySessionOrOrder({ sessionId, orderId, patch: paymentPatch, event: 'status_checked', eventPayload: payload });
    if (isSuccess) {
      await safeUpdateOrderPaidAt(orderId, true);
    }
    return res.json({ status: next, gateway: payload });
  } catch (e) {
    console.error('/api/payments/verify error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
}



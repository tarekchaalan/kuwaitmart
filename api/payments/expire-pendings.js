import { supabaseAdmin } from "../_utils/supabaseAdmin.js";

// Marks stale pending orders as failed/cancelled when users never return from the gateway
// Usage (GET/POST):
//   /api/payments/expire-pendings?minutes=60&status=failed
// Defaults: minutes=60, status=failed

export default async function handler(req, res) {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const inBody = method === 'GET' ? (req.query || {}) : (typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body||{}));
    const minutes = Math.max(1, Number(inBody.minutes || process.env.PAYMENT_PENDING_TTL_MIN || 60));
    const targetStatus = String(inBody.status || 'failed').toLowerCase() === 'cancelled' ? 'cancelled' : 'failed';

    const cutoffIso = new Date(Date.now() - minutes * 60 * 1000).toISOString();

    // Find pending orders older than cutoff with no paid_at
    const { data: stale, error: findErr } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('status', 'pending')
      .is('paid_at', null)
      .lt('created_at', cutoffIso);
    if (findErr) throw findErr;

    const staleIds = (stale||[]).map(r=>r.id);
    if (staleIds.length === 0) return res.json({ ok: true, updated: 0 });

    // Update orders status
    const { error: updErr } = await supabaseAdmin
      .from('orders')
      .update({ status: targetStatus })
      .in('id', staleIds);
    if (updErr) throw updErr;

    // Best-effort: update payments rows for these orders
    try {
      await supabaseAdmin
        .from('payments')
        .update({ status: targetStatus === 'failed' ? 'failed' : 'initiated' })
        .in('order_id', staleIds);
    } catch {}

    return res.json({ ok: true, updated: staleIds.length, status: targetStatus, cutoff: cutoffIso });
  } catch (e) {
    console.error('/api/payments/expire-pendings error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
}



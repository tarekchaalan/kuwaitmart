import { getSupabaseAdmin } from "../_utils/supabaseAdmin.js";

export default async function handler(req, res) {
  const method = req.method || "";
  if (method !== "POST" && method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const orderId = req.query?.orderId || body.orderId;
    if (!orderId) return res.status(400).json({ error: "orderId required" });

    // Read the order to obtain its order_number
    const { data: order, error: oErr } = await supabaseAdmin.from('orders').select('id, order_number').eq('id', orderId).single();
    if (oErr) throw oErr;
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Delete payment events -> payments -> order items -> order (strict cascade)
    try {
      const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('id')
        .eq('order_id', order.id);
      const paymentIds = (payments || []).map(p => p.id);
      if (paymentIds.length > 0) {
        await supabaseAdmin.from('payment_events').delete().in('payment_id', paymentIds);
        await supabaseAdmin.from('payments').delete().in('id', paymentIds);
      }
    } catch (e) {
      // Continue even if payments schema is missing
    }

    const { error: itemsErr } = await supabaseAdmin.from('order_items').delete().eq('order_id', order.id);
    if (itemsErr) throw itemsErr;

    // Delete the order itself
    const { error: delErr } = await supabaseAdmin.from('orders').delete().eq('id', order.id);
    if (delErr) throw delErr;

    return res.json({ ok: true, deletedId: order.id, removedOrderNumber: order.order_number });
  } catch (e) {
    console.error('/api/orders/delete error', e);
    const dev = process.env.NODE_ENV !== 'production';
    return res.status(500).json(dev ? { error: 'delete_failed', message: String(e?.message||e), stack: e?.stack } : { error: 'delete_failed' });
  }
}



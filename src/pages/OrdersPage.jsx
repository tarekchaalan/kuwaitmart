import React from "react";
import { IoIosCash } from "react-icons/io";
import { FaCreditCard } from "react-icons/fa6";
import { Icon } from "../components/Primitives.jsx";
import { getSupabase, getCurrentGuestId } from "../lib/supabaseClient.js";
import RestockNotice from "../components/RestockNotice.jsx";

export default function OrdersPage({ store, t }) {
  const { user } = store;
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [active, setActive] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const supabase = getSupabase();
        let data = [];
        if (user?.email || user?.id) {
          const cond = [];
          if (user?.id) cond.push(`user_id.eq.${user.id}`);
          if (user?.email) cond.push(`email.ilike.${user.email}`);
          const orStr = cond.length > 0 ? cond.join(',') : '';
          const resp = await supabase
            .from('orders')
            .select('id, order_number, total_kwd, status, payment_method, created_at, paid_at, coupon_code, payment_ref, name, phone, email, address, notes')
            .or(orStr)
            .in('status', ['paid', 'pending', 'failed'])
            .order('created_at', { ascending: false });
          data = resp.data || [];
        } else {
          const guestId = getCurrentGuestId();
          const resp = await supabase
            .from('orders')
            .select('id, order_number, total_kwd, status, payment_method, created_at, paid_at, coupon_code, payment_ref, name, phone, email, address, notes')
            .eq('guest_cookie_id', guestId)
            .in('status', ['paid', 'pending', 'failed'])
            .order('created_at', { ascending: false });
          data = resp.data || [];
        }
        setRows(data);
      } catch (e) {
        console.error('Failed to load orders', e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.email, user?.id]);

  // Lightweight UI helpers
  const StatusPill = ({ status }) => {
    const s = String(status || '').toLowerCase();
    const styles = s === 'paid'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : s === 'pending'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : (s === 'failed' || s === 'cancelled')
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';
    return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${styles}`}>{status || '—'}</span>;
  };

  const PaymentBadge = ({ row }) => {
    const raw = String(row?.payment_method || '').toLowerCase();
    let method = raw;
    if (!method) {
      if (row?.payment_ref || row?.mf_session_id) method = 'card';
      else if (String(row?.status||'').toLowerCase() === 'pending') method = 'cod';
    }
    const isCOD = method === 'cod' || method === 'cash_on_delivery' || method === 'cash';
    const isCard = method === 'card' || method === 'credit' || method === 'credit_card';
    const label = isCOD ? 'Cash on Delivery' : (isCard ? 'Credit Card' : '—');
    return (
      <span className="inline-flex items-center gap-1 text-xs">
        {isCOD ? <IoIosCash className="text-emerald-600 text-xl" /> : <FaCreditCard className="text-sky-600 text-xl" />}
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {t.myOrders}
      </h2>
      <RestockNotice lang={store.lang} className="mb-4" />
      {(
        <div className="rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto relative">
          {loading ? (
            <div className="text-slate-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-slate-500">No orders to show.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500"><tr>
                <th>#</th><th>Status</th><th>Payment</th><th>Total</th><th>Placed</th><th>Paid at</th>
              </tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t hover:bg-slate-50 cursor-pointer"
                    onClick={async ()=>{
                      try {
                        setActive(r);
                        setOpen(true);
                        const supabase = getSupabase();
                        const { data: its } = await supabase
                          .from('order_items')
                          .select('id, title_en, title_ar, qty, unit_price_kwd, line_total_kwd, option_values')
                          .eq('order_id', r.id)
                          .order('id', { ascending: true });
                        setItems(its||[]);
                      } catch (e) { console.error('order_items load error', e); setItems([]); }
                    }}>
                    <td className="py-2">{r.order_number || r.id}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td><PaymentBadge row={r} /></td>
                    <td>KWD {Number(r.total_kwd||0).toFixed(3)}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                    <td>{r.paid_at ? new Date(r.paid_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {open && active && (
            <div className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/30" onClick={()=>setOpen(false)} />
              <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">Order #{active.order_number || active.id}</div>
                  <button onClick={()=>setOpen(false)} className="rounded-lg border px-2 py-1 text-sm">Close</button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Status:</span> <StatusPill status={active.status} /></div>
                    <div><span className="text-slate-500">Created:</span> {new Date(active.created_at).toLocaleString()}</div>
                    <div><span className="text-slate-500">Payment:</span> <span className="inline-flex items-center gap-1 align-middle"><PaymentBadge row={active} /></span></div>
                    <div><span className="text-slate-500">Paid at:</span> {active.paid_at ? new Date(active.paid_at).toLocaleString() : '—'}</div>
                    <div><span className="text-slate-500">Total:</span> KWD {Number(active.total_kwd||0).toFixed(3)}</div>
                    <div><span className="text-slate-500">Coupon:</span> {active.coupon_code || '—'}</div>
                    <div><span className="text-slate-500">Name:</span> {active.name || '—'}</div>
                    <div><span className="text-slate-500">Phone:</span> {active.phone || '—'}</div>
                    <div><span className="text-slate-500">Email:</span> {active.email || '—'}</div>
                    <div className="sm:col-span-2 break-words whitespace-pre-wrap"><span className="text-slate-500">Address:</span> {active.address || '—'}</div>
                    <div className="sm:col-span-2 break-words whitespace-pre-wrap"><span className="text-slate-500">Notes:</span> {active.notes || '—'}</div>
                    <div className="sm:col-span-2 break-all whitespace-pre-wrap"><span className="text-slate-500">Payment Ref:</span> {active.payment_ref || '—'}</div>
                  </div>
                  <div className="rounded-xl border p-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500"><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
                      <tbody>
                        {items.map(it => (
                          <tr key={it.id} className="border-t">
                            <td className="py-2">{it.title_en || it.title_ar || '—'}</td>
                            <td>{it.qty}</td>
                            <td>KWD {Number(it.unit_price_kwd).toFixed(3)}</td>
                            <td>KWD {Number(it.line_total_kwd).toFixed(3)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


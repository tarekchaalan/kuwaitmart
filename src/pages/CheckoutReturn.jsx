import React from "react";

export default function CheckoutReturn({ store, t }) {
  const [status, setStatus] = React.useState("loading");
  const [orderNumber, setOrderNumber] = React.useState(null);
  const [paymentRef, setPaymentRef] = React.useState(null);

  React.useEffect(() => {
    // Normalize querystring: Click can append a second '?' before message params
    const href = String(window.location.href || "");
    const qIdx = href.indexOf('?');
    const rawQs = qIdx >= 0 ? href.slice(qIdx + 1) : '';
    const normalizedQs = rawQs.replace(/\?/g, '&');
    const params = new URLSearchParams(normalizedQs);
    const orderId = params.get("orderId");
    const lang = params.get("lang");
    if (lang === "ar" || lang === "en") {
      try { store.setLang(lang); } catch {}
    }
    const indicator_status = params.get("indicator_status") || "";
    const message = params.get("message") || "";
    const message_type = params.get("message_type") || "";
    if (!orderId) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        const q = new URLSearchParams({ orderId, indicator_status, message, message_type }).toString();
        const r = await fetch(`/api/payments/confirm?${q}`);
        const j = await r.json();
        const st = String(j?.status || "").toLowerCase();
        if (st === "paid") setStatus("paid");
        else if (st === "failed" || st === "cancelled") setStatus("failed");
        else setStatus("pending");
        if (st === "paid") {
          try {
            const sb = (await import("../lib/supabaseClient.js")).getSupabase();
            const { data } = await sb.from("orders").select("order_number, payment_ref").eq("id", orderId).maybeSingle();
            setOrderNumber(data?.order_number || null);
            setPaymentRef(data?.payment_ref || null);
          } catch {}
          try {
            const { clearCart, getCartCount } = await import("../lib/cart.js");
            await clearCart();
            store.setCart([]);
            const count = await getCartCount();
            store.setCartCount(count);
          } catch {}
        } else if (!st || st === "pending") {
          // Short poll to transition pending -> paid when gateway settles
          setTimeout(async () => {
            try {
              const q2 = new URLSearchParams({ orderId }).toString();
              const r2 = await fetch(`/api/payments/confirm?${q2}`);
              const j2 = await r2.json();
              const st2 = String(j2?.status || "").toLowerCase();
              if (st2 === "paid") {
                setStatus("paid");
                try {
                  const sb = (await import("../lib/supabaseClient.js")).getSupabase();
                  const { data } = await sb.from("orders").select("order_number, payment_ref").eq("id", orderId).maybeSingle();
                  setOrderNumber(data?.order_number || null);
                  setPaymentRef(data?.payment_ref || null);
                } catch {}
                try {
                  const { clearCart, getCartCount } = await import("../lib/cart.js");
                  await clearCart();
                  store.setCart([]);
                  const count = await getCartCount();
                  store.setCartCount(count);
                } catch {}
              } else if (st2 === "failed" || st2 === "cancelled") {
                setStatus("failed");
              }
            } catch {}
          }, 3000);
        }
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
  }, []);

  if (status === "loading") {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-slate-600">{t.loading || "Processing payment…"}</div>;
  }

  if (status === "paid") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-2xl font-semibold text-emerald-700 mb-2">{t.paymentSuccess || "Payment successful"}</div>
          <div className="text-slate-700 mb-4 space-y-1">
            {orderNumber && (
              <div>{t.order} #{orderNumber}</div>
            )}
            {paymentRef && (
              <div className="text-sm text-slate-600">Payment Ref: <span className="font-mono break-all">{paymentRef}</span></div>
            )}
          </div>
          <div className="flex gap-2 mb-2">
            <button onClick={() => store.navigate("/orders")} className="rounded-lg border px-4 py-2 text-sm">{t.myOrders || "My orders"}</button>
            <button onClick={() => store.navigate("/")}
              className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm">
              {t.continueShopping}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6">
        <div className="text-2xl font-semibold text-rose-700 mb-2">{t.paymentFailed || "Payment failed"}</div>
        <div className="text-slate-600 mb-4">{t.tryAgain || "Please try again or choose another method."}</div>
        <div className="flex gap-2">
          <button onClick={() => store.navigate("/checkout")} className="rounded-lg border px-4 py-2 text-sm">{t.backToCheckout || "Back to checkout"}</button>
          <button onClick={() => store.navigate("/")} className="rounded-lg border px-4 py-2 text-sm">{t.continueShopping}</button>
        </div>
      </div>
    </div>
  );
}



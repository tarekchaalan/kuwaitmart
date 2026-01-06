import React, { useState, useMemo } from "react";
import { fmtKWD, computeDiscounted } from "../lib/helpers.js";
import { createOrder, validateCoupon } from "../lib/api.js";
import { getSupabase, getCurrentGuestId } from "../lib/supabaseClient.js";
import { onAuthStateChange } from "../lib/auth.js";
import RestockNotice from "../components/RestockNotice.jsx";
import {
  setQty,
  removeItem,
  getCartLines,
  getCartCount,
  clearCart,
} from "../lib/cart.js";

function useCartTotals(cart, couponMeta) {
  const subtotal = cart.reduce(
    (sum, i) => sum + (i.unit_price_kwd || 0) * i.qty,
    0
  );
  const percentOff = couponMeta?.pct_off
    ? (Number(couponMeta.pct_off) / 100) * subtotal
    : 0;
  const fixedOff = couponMeta?.amount_off_kwd
    ? Number(couponMeta.amount_off_kwd)
    : 0;
  const couponDeduction = Math.min(
    subtotal,
    Math.max(0, percentOff + fixedOff)
  );
  const total = Math.max(0, subtotal - couponDeduction);
  return { subtotal, total, appliedDiscount: couponDeduction };
}

// Best-effort parser to extract structured fields from a composed address string
function parseAddressString(address) {
  const result = {
    buildingType: "",
    buildingNumber: "",
    blockNumber: "",
    streetNumber: "",
    area: "",
    floor: "",
  };
  if (!address || typeof address !== "string") return result;

  const normalize = (s) =>
    String(s || "")
      .trim()
      .replace(/^,+|,+$/g, "");

  const tryParseFloor = (s) => {
    const str = String(s || "");
    // Common patterns: "2 Floor", "Floor 2", "2nd Floor", "GF", "Ground", "Mezzanine"
    const m1 = str.match(/\b(\d{1,2})\s*(?:st|nd|rd|th)?\s*Floor\b/i);
    if (m1) return m1[1];
    const m2 = str.match(/\bFloor\s*(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if (m2) return m2[1];
    const m3 = str.match(/\b(\d{1,2})(?:st|nd|rd|th)\b/i);
    if (m3 && /floor/i.test(str)) return m3[1];
    if (/\bGF\b/i.test(str) || /\bGround\b/i.test(str)) return "Ground";
    if (/\bMezz(?:anine)?\b/i.test(str)) return "Mezzanine";
    return "";
  };

  try {
    const tokens = address
      .split(/\s*,\s*/)
      .map(normalize)
      .filter(Boolean);

    for (const token of tokens) {
      // Labeled numeric segments
      const block = token.match(/^Block\s+([^,\s]+.*)$/i);
      if (block) {
        result.blockNumber = normalize(block[1]);
        continue;
      }
      const street = token.match(/^Street\s+([^,\s]+.*)$/i);
      if (street) {
        result.streetNumber = normalize(street[1]);
        continue;
      }
      const buildingNo = token.match(/^#([^,\s]+.*)$/);
      if (buildingNo) {
        result.buildingNumber = normalize(buildingNo[1]);
        continue;
      }
      const f = tryParseFloor(token);
      if (f) {
        result.floor = f;
        continue;
      }

      // Unlabeled free text: prefer as buildingType first, then area
      if (!result.buildingType) {
        result.buildingType = token;
        continue;
      }
      if (!result.area) {
        result.area = token;
        continue;
      }
    }

    // Fallbacks from the whole string when labels are present but tokens missed
    if (!result.blockNumber) {
      const m = address.match(/\bBlock\s+([^,\s]+)/i);
      if (m) result.blockNumber = normalize(m[1]);
    }
    if (!result.streetNumber) {
      const m = address.match(/\bStreet\s+([^,\s]+)/i);
      if (m) result.streetNumber = normalize(m[1]);
    }
    if (!result.buildingNumber) {
      const m = address.match(/#([^,\s]+)/);
      if (m) result.buildingNumber = normalize(m[1]);
    }
    if (!result.floor) {
      const f = tryParseFloor(address);
      if (f) result.floor = f;
    }
  } catch {}
  return result;
}

function PayBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs">
      <span className="size-4 rounded bg-slate-200 dark:bg-slate-700" />
      {label}
    </span>
  );
}

function CartLine({ item, lang, onUpdate, fmtKWDLocal }) {
  const title = lang === "en" ? item.title_en : item.title_ar;
  const unit = item.unit_price_kwd || 0;
  const lineTotal = unit * item.qty;

  const handleQtyChange = async (newQty) => {
    try {
      await setQty(item.cart_item_id, newQty);
      onUpdate();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item.cart_item_id);
      onUpdate();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  return (
    <div className="flex gap-3 items-center border border-slate-200 rounded-xl p-3">
      <div className="size-16 bg-slate-200 rounded-lg grid place-items-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <span role="img" aria-label="">
            🛒
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-800 line-clamp-1">
          {title}
        </div>
        {item.option_values && (
          <div className="text-xs text-slate-500">
            {Object.entries(item.option_values)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}
          </div>
        )}
        <div className="text-xs text-slate-500">{fmtKWDLocal(unit)} ×</div>
        <div className="mt-2 inline-flex items-center gap-2">
          <button
            onClick={() => handleQtyChange(Math.max(1, item.qty - 1))}
            className="size-7 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{item.qty}</span>
          <button
            onClick={() => handleQtyChange(item.qty + 1)}
            className="size-7 rounded-md border border-slate-300 hover:bg-slate-100"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold">{fmtKWDLocal(lineTotal)}</div>
      <button
        onClick={handleRemove}
        className="text-slate-400 hover:text-rose-600"
      >
        ✕
      </button>
    </div>
  );
}

function GuestForm({ t }) {
  return (
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <label className="block text-xs text-slate-500 mb-1">{t.name}</label>
        <input className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs text-slate-500 mb-1">{t.address}</label>
        <input className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t.phone}</label>
        <input className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">
          Email ({t.optional})
        </label>
        <input
          type="email"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs text-slate-500 mb-1">
          Order Notes ({t.optional})
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-3 py-2 text-sm"
        />
      </div>
    </form>
  );
}

export default function CheckoutPage({ store, t }) {
  const { cart, setCart, setCartCount, coupon, setCoupon, lang, user } = store;
  const [couponMeta, setCouponMeta] = useState(null);
  const restocking = false; // Temporarily block checkout during restock
  const drawAttentionToRestock = () => {
    try {
      const el = document.getElementById("restock-notice");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-amber-400", "animate-pulse");
        setTimeout(() => {
          el.classList.remove("ring-4", "ring-amber-400", "animate-pulse");
        }, 1600);
      }
    } catch {}
  };
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    buildingType: "",
    buildingNumber: "",
    blockNumber: "",
    streetNumber: "",
    area: "",
    floor: "",
  });

  const { subtotal, total, appliedDiscount } = useCartTotals(cart, couponMeta);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'cod'
  const [errors, setErrors] = useState({});

  // Simple client-side validators
  const isValidPhone = (val) => {
    const s = String(val || "");
    // Only allow digits, +, parentheses, and spaces
    if (!/^[0-9+()\s]+$/.test(s)) return false;
    // Plus sign: at most one, only at start if present
    const plusCount = (s.match(/\+/g) || []).length;
    if (plusCount > 1) return false;
    if (plusCount === 1 && s.indexOf("+") !== 0) return false;
    // Parentheses must be balanced and in order
    let balance = 0;
    for (const ch of s) {
      if (ch === "(") balance++;
      if (ch === ")") {
        balance--;
        if (balance < 0) return false;
      }
    }
    if (balance !== 0) return false;
    // Validate total digits length
    const digits = s.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 12;
  };
  const isValidEmail = (val) => {
    const v = String(val || "").trim();
    if (!v) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  };

  const handleCartUpdate = async () => {
    try {
      const lines = await getCartLines();
      const count = await getCartCount();
      setCart(lines);
      setCartCount(count);
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  // Refresh cart when user signs in or out while on checkout
  React.useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((_event, _session) => {
      setTimeout(() => {
        handleCartUpdate().catch(() => {});
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Prefill guest details from the most recent order using the same guest cookie id
  React.useEffect(() => {
    if (user) return; // Signed-in users use profile data instead
    (async () => {
      try {
        const sb = getSupabase();
        const guestId = getCurrentGuestId();
        if (!guestId) return;
        const resp = await sb
          .from("orders")
          .select("name, phone, email, address, notes")
          .eq("guest_cookie_id", guestId)
          .in("status", ["paid", "pending", "failed"])
          .order("created_at", { ascending: false })
          .limit(1);
        const last = (resp.data || [])[0];
        if (!last) return;
        const parsed = parseAddressString(last.address || "");
        setFormData((prev) => ({
          ...prev,
          name: prev.name || last.name || "",
          phone: prev.phone || last.phone || "",
          email: prev.email || last.email || "",
          notes: prev.notes || "",
          buildingType: prev.buildingType || parsed.buildingType || "",
          buildingNumber: prev.buildingNumber || parsed.buildingNumber || "",
          blockNumber: prev.blockNumber || parsed.blockNumber || "",
          streetNumber: prev.streetNumber || parsed.streetNumber || "",
          area: prev.area || parsed.area || "",
          floor: prev.floor || parsed.floor || "",
        }));
      } catch (e) {
        console.error("Failed to prefill from last order", e);
      }
    })();
  }, [user]);

  const validateGuestRequired = () => {
    if (user) return { missing: [], invalid: [] };
    const requiredKeys = [
      "name",
      "phone",
      "buildingType",
      "buildingNumber",
      "blockNumber",
      "streetNumber",
      "area",
    ];
    const friendly = {
      name: "Name",
      phone: "Phone",
      buildingType: "Building Type",
      buildingNumber: "Building Number",
      blockNumber: "Block Number",
      streetNumber: "Street Number",
      area: "Area",
    };
    const newErrors = {};
    const missing = [];
    const invalid = [];
    for (const k of requiredKeys) {
      if (!String(formData[k] || "").trim()) {
        newErrors[k] = true;
        missing.push(friendly[k] || k);
      }
    }
    // Format validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = true;
      if (!invalid.includes("Phone")) invalid.push("Phone");
    }
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = true;
      if (!invalid.includes("Email")) invalid.push("Email");
    }
    setErrors(newErrors);
    return { missing, invalid };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* RestockNotice: Set show={true} to display the banner */}
      {/* <div className="lg:col-span-3">
        <RestockNotice id="restock-notice" lang={store.lang} show={false} />
      </div> */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t.products}</h3>
            {cart.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    await clearCart();
                    setCart([]);
                    setCartCount(0);
                  } catch (e) {
                    console.error("Failed to clear cart:", e);
                    alert("Failed to clear cart");
                  }
                }}
                className="rounded-lg border border-rose-300 text-rose-700 py-1 px-3 text-xs hover:bg-rose-50"
              >
                {t.clearCart}
              </button>
            )}
          </div>
          {cart.length === 0 ? (
            <div className="text-slate-500 py-6">{t.emptyCart}</div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <CartLine
                  key={item.cart_item_id}
                  item={item}
                  lang={lang}
                  fmtKWDLocal={fmtKWD}
                  onUpdate={handleCartUpdate}
                />
              ))}
            </div>
          )}
        </div>

        {!user && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold mb-4">{t.guestCheckout}</h3>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">
                  {t.name}
                </label>
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full rounded-lg border ${
                    errors.name ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  required
                />
              </div>
              {/* Removed freeform address; capture structured fields below */}
              {/* Extended address fields for guest */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Building Type
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.buildingType ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.buildingType || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingType: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Building Number
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.buildingNumber
                      ? "border-rose-500"
                      : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.buildingNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Block Number
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.blockNumber ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.blockNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, blockNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Street Number
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.streetNumber ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.streetNumber || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, streetNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Area
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.area ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.area || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Floor
                </label>
                <input
                  className={`w-full rounded-lg border ${
                    errors.floor ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  value={formData.floor || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  {t.phone}
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={`w-full rounded-lg border ${
                    errors.phone ? "border-rose-500" : "border-slate-300"
                  } bg-white px-3 py-2 text-sm`}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Email ({t.optional})
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-500 mb-1">
                  Order Notes ({t.optional})
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sticky top-24">
          <h3 className="text-lg font-semibold mb-4">{t.receipt}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{t.subtotal}</span>
              <span>{fmtKWD(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={coupon}
                onChange={(e) => store.setCoupon(e.target.value)}
                placeholder={t.coupon}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <button
                onClick={async () => {
                  try {
                    const res = await validateCoupon(coupon);
                    if (res.valid) {
                      setCouponMeta(res.data);
                      store.setCoupon(res.data.code);
                    } else {
                      setCouponMeta(null);
                      if (res.reason === "limit_reached") {
                        alert(
                          "This coupon has reached its usage limit and is no longer available"
                        );
                      } else if (res.reason === "not_found") {
                        alert("Invalid or expired coupon");
                      } else {
                        alert("Invalid coupon");
                      }
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Error validating coupon");
                  }
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                {t.apply}
              </button>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Promo</span>
                <span>- {fmtKWD(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2">
              <span>{t.total}</span>
              <span>{fmtKWD(total)}</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Payment Method</div>
            <div className="grid grid-cols-1 gap-2">
              <label className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  className="accent-sky-600"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span>KNET</span>
              </label>
              <label className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer">
                <input
                  type="radio"
                  name="payment-method"
                  className="accent-sky-600"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>
          <button
            aria-disabled={restocking || cart.length === 0 || placing}
            onClick={async () => {
              if (restocking) {
                drawAttentionToRestock();
                return;
              }
              try {
                if (placing) return;
                setPlacing(true);
                const supabase = getSupabase();
                // Resolve customer details (prefer signed-in profile)
                let profile = null;
                if (user?.id) {
                  try {
                    const { data: p } = await supabase
                      .from("profiles")
                      .select("full_name, phone, address")
                      .eq("id", user.id)
                      .single();
                    profile = p || null;
                  } catch {}
                }
                const nameVal = user
                  ? profile?.full_name || formData.name || null
                  : formData.name || null;
                const addrParts = [];
                if (formData.buildingType)
                  addrParts.push(String(formData.buildingType));
                if (formData.area) addrParts.push(String(formData.area));
                if (formData.blockNumber)
                  addrParts.push(`Block ${formData.blockNumber}`);
                if (formData.streetNumber)
                  addrParts.push(`Street ${formData.streetNumber}`);
                if (formData.buildingNumber)
                  addrParts.push(`#${formData.buildingNumber}`);
                if (formData.floor) {
                  const f = String(formData.floor);
                  const withSuffix = /floor/i.test(f) ? f : `${f} Floor`;
                  addrParts.push(withSuffix);
                }
                const composedGuestAddress = addrParts.join(", ");
                const addressVal = user
                  ? profile?.address || null
                  : composedGuestAddress;
                const phoneVal = user
                  ? profile?.phone || formData.phone || null
                  : formData.phone || null;
                const emailVal = user
                  ? user.email || formData.email || null
                  : formData.email || null;

                // Compute cart fingerprint for idempotency
                const cartFingerprint = btoa(
                  JSON.stringify(
                    cart.map((i) => [
                      i.product_id,
                      i.unit_price_kwd,
                      i.qty,
                      i.option_values || null,
                    ])
                  )
                );

                // Try to reuse a recent pending order with same identity and cart
                let order = null;
                {
                  const { data: existing } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("status", "pending")
                    .eq(
                      "guest_cookie_id",
                      user?.id ? null : getCurrentGuestId()
                    )
                    .eq("user_id", user?.id || null)
                    .eq("cart_fingerprint", cartFingerprint)
                    .gt(
                      "created_at",
                      new Date(Date.now() - 10 * 60 * 1000).toISOString()
                    )
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                  if (existing) order = existing;
                }

                if (!order) {
                  const guestValidation = validateGuestRequired();
                  if (
                    guestValidation.missing.length ||
                    guestValidation.invalid.length
                  ) {
                    // Scroll to guest section for visibility
                    document
                      .querySelector("h3.text-lg.font-semibold.mb-4")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    const err = new Error("guest_validation_failed");
                    err.missing = guestValidation.missing;
                    err.invalid = guestValidation.invalid;
                    throw err;
                  }
                  const { data: created, error: orderError } = await supabase
                    .from("orders")
                    .insert({
                      user_id: user?.id || null,
                      guest_cookie_id: user ? null : getCurrentGuestId(),
                      email: emailVal,
                      phone: phoneVal,
                      name: nameVal,
                      address: addressVal,
                      notes: formData.notes || null,
                      coupon_code: coupon || null,
                      subtotal_kwd: subtotal,
                      discount_kwd: appliedDiscount,
                      total_kwd: total,
                      status: "pending",
                      cart_fingerprint: cartFingerprint,
                      payment_method: paymentMethod === "cod" ? "COD" : "Card",
                    })
                    .select("*")
                    .single();
                  if (orderError) throw orderError;
                  order = created;

                  // Generate unique order_number for COD orders (similar to card payment logic)
                  const timestampPart = Date.now() % 1000000000;
                  const uniqueOrderNumber =
                    timestampPart + (Number(order.id) || 0);

                  const { error: updateError } = await supabase
                    .from("orders")
                    .update({ order_number: uniqueOrderNumber })
                    .eq("id", order.id);

                  if (updateError) throw updateError;
                  order.order_number = uniqueOrderNumber;
                }

                // Create order items
                const orderItems = cart.map((item) => ({
                  order_id: order.id,
                  product_id: item.product_id,
                  title_en: item.title_en,
                  title_ar: item.title_ar,
                  option_values: item.option_values,
                  unit_price_kwd: item.unit_price_kwd,
                  qty: item.qty,
                  line_total_kwd: item.unit_price_kwd * item.qty,
                }));

                const { error: itemsError } = await supabase
                  .from("order_items")
                  .insert(orderItems);

                if (itemsError) throw new Error("order_items_failed");

                if (paymentMethod === "cod") {
                  // Increment coupon usage count for COD orders
                  if (coupon) {
                    try {
                      const { data: cp } = await supabase
                        .from("coupons")
                        .select("id, used_count, usage_limit")
                        .eq("code", coupon)
                        .maybeSingle();
                      if (cp) {
                        const nextUsed = Number(cp.used_count || 0) + 1;
                        await supabase
                          .from("coupons")
                          .update({ used_count: nextUsed })
                          .eq("id", cp.id);
                      }
                    } catch (e) {
                      console.error("Failed to increment coupon usage:", e);
                    }
                  }

                  try {
                    const { clearCart, getCartCount } = await import(
                      "../lib/cart.js"
                    );
                    await clearCart();
                    setCart([]);
                    const count = await getCartCount();
                    setCartCount(count);
                  } catch {}
                  alert("Order placed with Cash on Delivery. Thank you!");
                  store.navigate("/orders");
                } else {
                  // Create payment session + redirect
                  try {
                    const sesRes = await fetch("/api/payments/session", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ orderId: order.id }),
                    });
                    const ses = await sesRes.json();
                    if (!sesRes.ok) {
                      if (ses?.error === "amount_below_minimum" && ses?.min) {
                        alert(
                          `Minimum order amount is ${
                            ses.min.toFixed ? ses.min.toFixed(3) : ses.min
                          } KWD`
                        );
                        // Delete the order since payment session failed
                        try {
                          await supabase
                            .from("order_items")
                            .delete()
                            .eq("order_id", order.id);
                          await supabase
                            .from("orders")
                            .delete()
                            .eq("id", order.id);
                        } catch (delErr) {
                          console.error("Failed to cleanup order:", delErr);
                        }
                        return;
                      }
                      throw new Error(ses?.error || "session_failed");
                    }
                    const q = new URLSearchParams({
                      orderId: order.id,
                      lang,
                      sessionId: ses.sessionId,
                    }).toString();
                    window.location.assign(`/api/payments/session-update?${q}`);
                  } catch (gwErr) {
                    console.error("Gateway error", gwErr);
                    // Delete the order and its items since payment session failed
                    try {
                      await supabase
                        .from("order_items")
                        .delete()
                        .eq("order_id", order.id);
                      await supabase.from("orders").delete().eq("id", order.id);
                    } catch (delErr) {
                      console.error("Failed to cleanup order:", delErr);
                    }
                    alert("Payment gateway error, please try again.");
                  }
                }
              } catch (e) {
                console.error(e);
                if (e && e.message === "guest_validation_failed") {
                  const missing = Array.isArray(e.missing) ? e.missing : [];
                  const invalid = Array.isArray(e.invalid) ? e.invalid : [];
                  const parts = [];
                  if (missing.length)
                    parts.push(`Missing: ${missing.join(", ")}`);
                  if (invalid.length)
                    parts.push(`Invalid: ${invalid.join(", ")}`);
                  const msg = parts.length
                    ? parts.join("\n")
                    : "Please review your details.";
                  alert(msg);
                } else if (e && e.message === "order_items_failed") {
                  alert(
                    "Unable to attach items to your order. Please try again."
                  );
                } else if (e && e.message === "session_failed") {
                  alert("Payment session failed. Please try again.");
                } else {
                  alert("Error creating order. Please try again.");
                }
              } finally {
                setPlacing(false);
              }
            }}
            className={`mt-4 w-full rounded-xl bg-emerald-600 text-white py-2 font-medium hover:bg-emerald-700 ${
              restocking ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {t.placeOrder}
          </button>
          <button
            onClick={() => store.navigate("/")}
            className="mt-2 w-full rounded-xl border border-slate-300 py-2 text-sm"
          >
            {t.continueShopping}
          </button>
        </div>
      </div>
    </div>
  );
}

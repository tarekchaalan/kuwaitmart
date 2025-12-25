import React from "react";
import { fmtKWD, computeDiscounted } from "../../lib/helpers.js";
import { QtyButton, Icon } from "../Primitives.jsx";
import {
  setQty,
  removeItem,
  getCartLines,
  getCartCount,
} from "../../lib/cart.js";

function useCartTotals(cart, coupon) {
  const subtotal = cart.reduce(
    (sum, i) => sum + (i.unit_price_kwd || 0) * i.qty,
    0
  );
  const couponDeduction = 0; // Coupon logic handled server-side
  const total = Math.max(0, subtotal - couponDeduction);
  return { subtotal, total, appliedDiscount: couponDeduction };
}

function CartLine({ item, lang, onUpdate, onRemove }) {
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
        <div className="text-xs text-slate-500">{fmtKWD(unit)} ×</div>
        <div className="mt-2 inline-flex items-center gap-2">
          <QtyButton onClick={() => handleQtyChange(Math.max(1, item.qty - 1))}>
            −
          </QtyButton>
          <span className="w-8 text-center text-sm">{item.qty}</span>
          <QtyButton onClick={() => handleQtyChange(item.qty + 1)}>+</QtyButton>
        </div>
      </div>
      <div className="text-sm font-semibold">{fmtKWD(lineTotal)}</div>
      <button
        onClick={handleRemove}
        className="text-slate-400 hover:text-rose-600"
      >
        ✕
      </button>
    </div>
  );
}

export default function CartDrawer({ store, t }) {
  const { cartOpen, setCartOpen, cart, setCart, setCartCount, lang, navigate } =
    store;
  const { subtotal, total, appliedDiscount } = useCartTotals(cart, "");

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

  return (
    <div
      className={`fixed inset-0 z-40 ${
        cartOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-slate-900/40 transition ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`absolute top-0 ${
          document?.documentElement?.dir === "rtl" ? "left-0" : "right-0"
        } h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ${
          cartOpen
            ? "translate-x-0"
            : document?.documentElement?.dir === "rtl"
            ? "-translate-x-full"
            : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Icon name="cart" /> Cart
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-full border px-3 py-1 text-sm"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-200px)]">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              {t.emptyCart}
              <div className="mt-4">
                <button
                  className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm"
                  onClick={() => {
                    setCartOpen(false);
                  }}
                >
                  {t.shopNow}
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <CartLine
                key={item.cart_item_id}
                item={item}
                lang={lang}
                onUpdate={handleCartUpdate}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{t.subtotal}</span>
              <span className="font-medium">{fmtKWD(subtotal)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{"Discount"}</span>
                <span className="font-medium">- {fmtKWD(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base mt-2">
              <span className="font-semibold">{t.total}</span>
              <span className="font-semibold">{fmtKWD(total)}</span>
            </div>

            <button
              onClick={() => {
                setCartOpen(false);
                if (typeof navigate === "function") navigate("/checkout");
              }}
              className="mt-4 w-full rounded-xl bg-emerald-600 text-white py-2 font-medium hover:bg-emerald-700"
            >
              {t.checkout}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

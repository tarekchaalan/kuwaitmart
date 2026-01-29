import React from "react";
import { fmtKWD } from "../../lib/helpers.js";
import { setQty, removeItem } from "../../lib/cart.js";

/**
 * Shared CartLine component for displaying cart items
 * Used in both CartDrawer and CheckoutPage
 *
 * @param {Object} props
 * @param {Object} props.item - Cart item object
 * @param {string} props.lang - Current language ('en' or 'ar')
 * @param {Function} props.onUpdate - Callback after cart update
 * @param {Function} [props.fmtPrice] - Optional custom price formatter (defaults to fmtKWD)
 */
export default function CartLine({ item, lang, onUpdate, fmtPrice = fmtKWD }) {
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
            alt={title || "Product image"}
            className="h-full w-full object-contain"
          />
        ) : (
          <span role="img" aria-label="Cart item">
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
        <div className="text-xs text-slate-500">{fmtPrice(unit)} ×</div>
        <div className="mt-2 inline-flex items-center gap-2">
          <button
            onClick={() => handleQtyChange(Math.max(1, item.qty - 1))}
            className="size-7 rounded-md border border-slate-300 hover:bg-slate-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{item.qty}</span>
          <button
            onClick={() => handleQtyChange(item.qty + 1)}
            className="size-7 rounded-md border border-slate-300 hover:bg-slate-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold">{fmtPrice(lineTotal)}</div>
      <button
        onClick={handleRemove}
        className="text-slate-400 hover:text-rose-600"
        aria-label="Remove item from cart"
      >
        ✕
      </button>
    </div>
  );
}

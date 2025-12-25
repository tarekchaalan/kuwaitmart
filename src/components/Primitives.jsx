import React from "react";
import { FaShoppingCart, FaSearch, FaUser } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { MdDiscount } from "react-icons/md";

export function Badge({ children, tone = "info" }) {
  const map = {
    info: "bg-sky-100 text-sky-700 border-sky-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warn: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function Icon({ name, className = "" }) {
  // Map specified names to react-icons components
  const IconComponent =
    name === "cart" ? FaShoppingCart :
    name === "search" ? FaSearch :
    name === "user" || name === "logout" || name === "login" ? FaUser :
    name === "options" ? IoMdSettings :
    name === "discount" ? MdDiscount :
    null;

  if (IconComponent) return <IconComponent className={className} />;

  // Fallback to existing emojis for other names; removed explicit orders emoji as requested
  const glyphs = {
    logo: "🛒",
    feather: "🪶",
  };
  return <span className={className}>{glyphs[name] ?? ""}</span>;
}

export function QtyButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="size-7 rounded-md border border-slate-300 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

import React from "react";

export default function RestockNotice({ lang = "en", size = "default", className = "", id = "", show = false }) {
  // Set show to true to display the banner (e.g., for future delays)
  if (!show) return null;

  const isSmall = size === "small";
  const baseClass = isSmall
    ? "rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-base text-center"
    : "rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 p-3 text-lg md:text-xl text-center";
  const textEn = "Products will be available to order by the end of December.";
  const textAr = "سيتم إعادة التخزين وستكون المنتجات متاحة للطلب بحلول نهاية ديسمبر.";
  const text = lang === "ar" ? textAr : textEn;
  return (
    <div id={id || undefined} className={`${baseClass} ${className}`.trim()}>
      {text}
    </div>
  );
}



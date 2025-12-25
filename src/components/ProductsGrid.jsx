import React, { useEffect, useState } from "react";
import { Icon, Badge } from "./Primitives.jsx";
import { fetchProducts, fetchCategories } from "../lib/api.js";
import { fmtKWD, computeDiscounted } from "../lib/helpers.js";
import { addToCartFast } from "../lib/addToCart.js";
import RestockNotice from "./RestockNotice.jsx";

function ProductCard({ p, lang, t, onAdd, navigate }) {
  const [animating, setAnimating] = useState(false);
  const discounted = computeDiscounted(p.priceKWD, p.discountPct);
  const hasDiscount = p.discountPct > 0;
  return (
    <div
      onClick={() =>
        p.slug && navigate(`/product/${encodeURIComponent(p.slug)}`)
      }
      role="button"
      className="group h-full flex flex-col rounded-2xl border border-slate-200 bg-slate-100 shadow-sm hover:shadow transition overflow-hidden cursor-pointer"
    >
      <div className="aspect-square w-full bg-slate-200 flex items-center justify-center overflow-hidden p-2">
        {p.image ? (
          <img
            src={p.image}
            alt={lang === "en" ? p.title_en : p.title_ar}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-6xl">🛒</div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 min-h-[28px]">
          {p.severalOptions && (
            <Badge tone="info">
              <Icon name="options" className="mr-1" /> {t.options}
            </Badge>
          )}
          {hasDiscount && (
            <Badge tone="danger">
              <Icon name="discount" className="mr-1" /> {t.discount}{" "}
              {p.discountPct}%
            </Badge>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-slate-800">
          {lang === "en" ? p.title_en : p.title_ar}
        </h3>
        {Array.isArray(p.optionNames) && p.optionNames.length > 0 && (
          <div className="text-xs text-slate-500 mb-2 line-clamp-1">
            {p.optionNames.join(', ')}
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-baseline gap-2 mb-3">
          {hasDiscount && (
            <span className="text-xs line-through text-slate-400">
              {fmtKWD(p.priceKWD)}
            </span>
          )}
          <span className="text-base font-semibold text-slate-900">
            {fmtKWD(discounted)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (animating) return;
            onAdd();
            setAnimating(true);
            setTimeout(() => setAnimating(false), 1300);
          }}
          disabled={animating}
          className="w-full rounded-xl bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-700 active:bg-sky-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {animating ? (
            <svg
              className="checkmark checkmark--sm"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 52 52"
              aria-hidden
            >
              <circle
                className="checkmark__circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="checkmark__check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          ) : (
            t.addToCart
          )}
        </button>
      </div>
    </div>
  );
}

async function addToCart(p, store) {
  try {
    const discounted = computeDiscounted(p.priceKWD, p.discountPct);
    await addToCartFast({
      product_id: p.id,
      qty: 1,
      option_values: null,
      unit_price_kwd: discounted,
      bump: (qty) => {
        // Optimistic UI update
        store.setCartCount((prev) => prev + qty);
      },
    });

    // Reload cart in store
    const { getCartLines, getCartCount } = await import("../lib/cart.js");
    const lines = await getCartLines();
    const count = await getCartCount();
    store.setCart(lines);
    store.setCartCount(count);
  } catch (error) {
    console.error("Failed to add to cart:", error);
  }
}

export default function ProductsGrid({ store, t }) {
  const {
    lang,
    query,
    activeCat,
    page,
    setPage,
    cart,
    setCart,
    products,
    setProducts,
    pageCount,
    setPageCount,
    loading,
    setLoading,
  } = store;

  const [cats, setCats] = useState([]);
  const [catLabel, setCatLabel] = useState(
    lang === "en" ? "All products" : "جميع المنتجات"
  );

  // Load categories once (for label)
  useEffect(() => {
    fetchCategories().then(setCats).catch(console.error);
  }, []);

  // Update label when category or language changes
  useEffect(() => {
    if (activeCat === "all") {
      setCatLabel(lang === "en" ? "All products" : "جميع المنتجات");
    } else {
      const c = cats.find((x) => x.id === activeCat);
      setCatLabel(
        c
          ? lang === "en"
            ? c.name_en
            : c.name_ar
          : lang === "en"
          ? "All products"
          : "جميع المنتجات"
      );
    }
  }, [activeCat, cats, lang]);

  // Fetch products & total count
  useEffect(() => {
    setLoading(true);
    fetchProducts({ page, categoryId: activeCat, q: query })
      .then(({ items, pageCount, count }) => {
        setProducts(items);
        setPageCount(pageCount);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, activeCat, query]);

  const pageItems = products;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
        {catLabel}
      </h2>
      <RestockNotice lang={store.lang} className="mb-4" />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden"
            >
              <div className="aspect-square w-full bg-slate-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-300 rounded w-2/3" />
                <div className="h-4 bg-slate-300 rounded w-1/3" />
                <div className="h-8 bg-slate-300 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="text-slate-500 py-10">
          No products match your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              lang={lang}
              t={t}
              onAdd={() => addToCart(p, store)}
              navigate={store.navigate}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={() => setPage((n) => Math.max(1, n - 1))}
          disabled={page <= 1}
          className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm disabled:opacity-40"
        >
          ←
        </button>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {page} / {pageCount}
        </span>
        <button
          onClick={() => setPage((n) => Math.min(pageCount, n + 1))}
          disabled={page >= pageCount}
          className="rounded-full border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm disabled:opacity-40"
        >
          →
        </button>
      </div>
    </section>
  );
}

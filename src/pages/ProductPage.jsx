import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductBySlug } from "../lib/api.js";
import { fmtKWD, computeDiscounted } from "../lib/helpers.js";

export default function ProductPage({ store, t }) {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductBySlug(slug)
      .then((p) => {
        setProduct(p || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const price = useMemo(() => {
    if (!product) return 0;
    // legacy component not used now; retained for compatibility
    return Number(product.base_price_kwd);
  }, [product, activeVariantId]);

  const compareAt = useMemo(() => {
    if (!product) return null;
    // compare_at_kwd lives on product only
    return product.compare_at_kwd ? Number(product.compare_at_kwd) : null;
  }, [product, activeVariantId]);

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-6">Loading…</div>;
  if (!product) return <div className="mx-auto max-w-7xl px-4 py-6">Not found</div>;

  const title = store.lang === "en" ? product.title_en : product.title_ar;
  const desc = store.lang === "en" ? product.description_en : product.description_ar;
  const imgs = (product.product_images || []).slice().sort((a,b)=>(a.position??0)-(b.position??0));
  const hasDiscount = compareAt && compareAt > price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="aspect-square w-full rounded-2xl overflow-hidden border">
          {imgs[0]?.url ? (
            <img
              src={imgs[0].url}
              alt={store.lang === "en" ? (imgs[0].alt_en || title) : (imgs[0].alt_ar || title)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-6xl">🛒</div>
          )}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {imgs.slice(1,7).map((im, i) => (
            <img
              key={i}
              src={im.url}
              alt={store.lang === "en" ? (im.alt_en || title) : (im.alt_ar || title)}
              loading="lazy"
              className="aspect-square w-full object-cover rounded-lg border"
            />
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <div className="flex items-baseline gap-2 mb-4">
          {hasDiscount && <span className="text-sm line-through text-slate-400">{fmtKWD(compareAt)}</span>}
          <span className="text-2xl font-bold">{fmtKWD(price)}</span>
        </div>

        {product.has_options && (
          <div className="mb-4">
            <label className="block text-xs text-slate-500 mb-1">{t.options}</label>
            <select
              value={activeVariantId || ''}
              onChange={(e)=>setActiveVariantId(e.target.value || null)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {/* legacy UI no longer used */}
            </select>
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none mb-6 whitespace-pre-wrap">{desc}</div>

        <button
          onClick={() => {
            if (adding) return;
            const cartItem = {
              id: product.id + (activeVariantId?`:${activeVariantId}`:''),
              title_en: product.title_en,
              title_ar: product.title_ar,
              priceKWD: price,
              discountPct: hasDiscount ? Math.round((1 - (price/(compareAt||price))) * 100) : 0,
              qty: 1,
            };
            store.setCart([ ...store.cart, cartItem ]);
            setAdding(true);
            setTimeout(()=>setAdding(false), 1350);
          }}
          disabled={adding}
          className="rounded-xl bg-sky-600 text-white px-4 py-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >{t.addToCart}</button>
      </div>
    </div>
  );
}



import React, { useEffect } from "react";
import { fetchCategories } from "../lib/api.js";

function CategoryChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "whitespace-nowrap rounded-full border px-3 py-1 text-sm transition " +
        (active
          ? "border-sky-500 bg-sky-50 text-sky-700"
          : "border-slate-300 hover:bg-slate-50 text-slate-700")
      }
    >
      {children}
    </button>
  );
}

export default function CategoryRow({ store, t }) {
  const { lang, activeCat, setActiveCat, setPage, categories, setCategories } =
    store;
  useEffect(() => {
    (async () => {
      if (categories?.length) return;
      try {
        const data = await fetchCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  return (
    <div className="sticky top-[130px] md:top-[80px] z-20 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-2 overflow-x-auto">
        <div className="flex gap-2">
          <CategoryChip
            active={activeCat === "all"}
            onClick={() => {
              setActiveCat("all");
              setPage(1);
              try { if (typeof window !== 'undefined' && window.location?.pathname !== '/') { (store?.navigate||(()=>{}))('/'); } } catch {}
            }}
          >
            {t.allProducts}
          </CategoryChip>
          {(categories?.length ? categories : []).map((c) => (
            <CategoryChip
              key={c.id}
              active={activeCat === c.id}
              onClick={() => {
                setActiveCat(c.id);
                setPage(1);
                try { if (typeof window !== 'undefined' && window.location?.pathname !== '/') { (store?.navigate||(()=>{}))('/'); } } catch {}
              }}
            >
              {lang === "en" ? c.name_en : c.name_ar}
            </CategoryChip>
          ))}
        </div>
      </div>
    </div>
  );
}

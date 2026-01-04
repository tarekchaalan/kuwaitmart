import React from "react";
import Navbar from "./components/Navbar.jsx";
import CategoryRow from "./components/CategoryRow.jsx";
import ProductsGrid from "./components/ProductsGrid.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/cart/CartDrawer.jsx";
import { useStore } from "./state/store.js";
import { useRTL } from "./hooks/useRTL.js";
import { DICT } from "./i18n/dict.js";
import { getSupabase } from "./lib/supabaseClient.js";
import CheckoutReturn from "./pages/CheckoutReturn.jsx";
import { applyProductSEO } from "./lib/seo.js";
import Privacy from "./pages/Privacy.jsx";

// --- Tiny router (pathname-based) -------------------------------------------
function parseRoute(pathname) {
  const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home", params: {} };
  if (parts[0] === "checkout" && parts[1] === "return") return { name: "checkout_return", params: {} };
  if (parts[0] === "checkout") return { name: "checkout", params: {} };
  if (parts[0] === "orders") return { name: "orders", params: {} };
  if (parts[0] === "product" && parts[1])
    return { name: "product", params: { slug: parts[1] } };
  if (parts[0] === "privacy") return { name: "privacy", params: {} };
  return { name: "home", params: {} };
}

function useRouter() {
  const [route, setRoute] = React.useState(() =>
    parseRoute(window.location.pathname)
  );
  React.useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, "", to);
      setRoute(parseRoute(to));
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  return { route, navigate };
}

function Link({ to, navigate, className = "", children, ...rest }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}

// Build label from option row (name + price)
const labelFromOptionRow = (row) => row?.name || "Default";

function ProductPage({ slug, store, t, navigate }) {
  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState(null);
  const [images, setImages] = React.useState([]);
  const [optionRows, setOptionRows] = React.useState([]); // [{ name, price_kwd }]
  const [selectedName, setSelectedName] = React.useState("");
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  const [animatingAdd, setAnimatingAdd] = React.useState(false);
  const [optionsTitle, setOptionsTitle] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = getSupabase();
      const { data: p } = await supabase
        .from("products")
        .select(
          "id, slug, title_en, title_ar, description_en, description_ar, base_price_kwd, pct_disc, has_options, active"
        )
        .eq("slug", decodeURIComponent(slug))
        .eq("active", true)
        .maybeSingle();
      if (!p) {
        setLoading(false);
        return;
      }
      setProduct(p);
      const [{ data: imgs }, { data: opt }] = await Promise.all([
        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", p.id)
          .order("position"),
        supabase
          .from("product_options")
          .select("options_title, options_names_prices")
          .eq("product_id", p.id)
          .maybeSingle(),
      ]);
      const ordered = (imgs || [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setImages(ordered);
      // Filter options: must be active AND product must be active
      const productActive = p?.active ?? true;
      const rows = Array.isArray(opt?.options_names_prices)
        ? opt.options_names_prices.filter((r) => productActive && r.active !== false)
        : [];
      setOptionRows(rows);
      setOptionsTitle(opt?.options_title || "Option");
      const def =
        rows.find((r) => Number(r.price_kwd) === Number(p.base_price_kwd)) ||
        rows[0] ||
        null;
      setSelectedName(def?.name || "");
      setActiveImageIdx(0);
      setLoading(false);
    })();
  }, [slug]);

  // Apply SEO when product is available (must be declared before any early returns)
  React.useEffect(() => {
    if (!product) return;
    const titleLocal = store.lang === "en" ? product.title_en : product.title_ar;
    const descLocal = store.lang === "en" ? product.description_en : product.description_ar;
    const selectedRowLocal = optionRows.find((r) => r.name === selectedName) || null;
    const basePriceLocal = selectedRowLocal ? Number(selectedRowLocal.price_kwd) : Number(product.base_price_kwd);
    const pctDiscLocal = product.pct_disc ? Number(product.pct_disc) : 0;
    const priceLocal = pctDiscLocal > 0 ? basePriceLocal * (1 - pctDiscLocal / 100) : basePriceLocal;
    const url = `${window.location.origin}/product/${encodeURIComponent(product.slug)}`;
    const mainImage = images?.[0]?.url || null;
    applyProductSEO({
      name: titleLocal,
      description: descLocal,
      url,
      image: mainImage,
      priceKWD: priceLocal,
      lang: store.lang,
    });
  }, [product, images, optionRows, selectedName, store.lang]);

  if (loading)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-slate-500">
        Loading…
      </div>
    );
  if (!product)
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border bg-white/70 dark:bg-slate-900/60 p-6">
          <div className="font-semibold text-lg mb-2">Product not found</div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Back to store
          </button>
        </div>
      </div>
    );

  const title = store.lang === "en" ? product.title_en : product.title_ar;
  const desc =
    store.lang === "en" ? product.description_en : product.description_ar;
  const selectedRow = optionRows.find((r) => r.name === selectedName) || null;
  const basePrice = selectedRow
    ? Number(selectedRow.price_kwd)
    : Number(product.base_price_kwd);
  const pctDisc = product.pct_disc ? Number(product.pct_disc) : 0;
  const price = pctDisc > 0 ? basePrice * (1 - pctDisc / 100) : basePrice;



  return (
    <div className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        {images?.length ? (
          <>
            <div className="aspect-square rounded-2xl overflow-hidden shadow bg-slate-200 p-2">
              <img
                src={images[activeImageIdx]?.url}
                alt={
                  store.lang === "en"
                    ? images[activeImageIdx]?.alt_en || title
                    : images[activeImageIdx]?.alt_ar || title
                }
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {images.map((im, i) => (
                <button
                  key={im.id}
                  onClick={() => setActiveImageIdx(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden border ${
                    i === activeImageIdx
                      ? "border-slate-400"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src={im.url}
                    alt={store.lang === "en" ? im.alt_en || title : im.alt_ar || title}
                    loading="lazy"
                    className="h-full w-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="aspect-square rounded-2xl bg-slate-200 grid place-items-center text-6xl shadow">
            🛒
          </div>
        )}
      </div>

      <div className="space-y-5">
        <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
        <div className="flex items-baseline gap-3">
          {pctDisc > 0 ? (
            <span className="text-sm text-slate-400">
              <span className="line-through">KWD {basePrice.toFixed(3)}</span>
            </span>
          ) : null}
          <span className="text-2xl font-bold text-slate-900">
            KWD {price.toFixed(3)}
          </span>
        </div>

        {product.has_options && optionRows.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t.options}
            </label>
            <select
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white text-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {optionRows.map((r, i) => (
                <option key={`${r.name}-${i}`} value={r.name}>
                  {labelFromOptionRow(r)} — KWD {Number(r.price_kwd).toFixed(3)}
                </option>
              ))}
            </select>
          </div>
        )}

        {desc && (
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {desc}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={async () => {
              try {
                const { addToCart } = await import("./lib/cart.js");
                await addToCart({
                  product_id: product.id,
                  qty: 1,
                  option_values: selectedName
                    ? { [optionsTitle]: selectedName }
                    : null,
                  unit_price_kwd: price,
                });
                navigate("/checkout");
              } catch (error) {
                console.error("Failed to add to cart:", error);
              }
            }}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium"
          >
            {store.lang === "en" ? "Buy now" : "اشتري الآن"}
          </button>
          <button
            onClick={async () => {
              if (animatingAdd) return;
              try {
                const { addToCartFast } = await import("./lib/addToCart.js");
                await addToCartFast({
                  product_id: product.id,
                  qty: 1,
                  option_values: selectedName
                    ? { [optionsTitle]: selectedName }
                    : null,
                  unit_price_kwd: price,
                  bump: (qty) => {
                    // Optimistic UI update
                    store.setCartCount((prev) => prev + qty);
                  },
                });
                setAnimatingAdd(true);
                setTimeout(() => setAnimatingAdd(false), 1300);

                // Reload cart in store
                const { getCartLines, getCartCount } = await import(
                  "./lib/cart.js"
                );
                const lines = await getCartLines();
                const count = await getCartCount();
                store.setCart(lines);
                store.setCartCount(count);
              } catch (error) {
                console.error("Failed to add to cart:", error);
              }
            }}
            disabled={animatingAdd}
            className="relative rounded-xl bg-sky-600 text-white px-5 py-2.5 text-sm flex items-center justify-center hover:bg-sky-700 active:bg-sky-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className={animatingAdd ? "invisible" : ""}>
              {store.lang === "en" ? "Add to cart" : "أضف للسلة"}
            </span>
            {animatingAdd && (
              <span className="absolute inset-0 flex items-center justify-center">
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
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const store = useStore();
  const t = DICT[store.lang];
  useRTL(store.lang);
  const { route, navigate } = useRouter();
  store.navigate = navigate;
  const showCategoryBar = route.name === "home" || route.name === "product";

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <Navbar store={store} t={t} />
      {showCategoryBar && <CategoryRow store={store} t={t} />}

      {route.name === "home" && <ProductsGrid store={store} t={t} />}
      {route.name === "product" && (
        <ProductPage
          slug={route.params.slug}
          store={store}
          t={t}
          navigate={navigate}
        />
      )}
      {route.name === "checkout" && <CheckoutPage store={store} t={t} />}
      {route.name === "checkout_return" && <CheckoutReturn store={store} t={t} />}
      {route.name === "orders" && <OrdersPage store={store} t={t} />}
      {route.name === "privacy" && <Privacy />}

      <Footer />
      <CartDrawer store={store} t={t} />
    </div>
  );
}

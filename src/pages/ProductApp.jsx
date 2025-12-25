import React from "react";
import Navbar from "../components/Navbar.jsx";
import CategoryRow from "../components/CategoryRow.jsx";
import Footer from "../components/Footer.jsx";
import CartDrawer from "../components/cart/CartDrawer.jsx";
import { useStore } from "../state/store.js";
import { useRTL } from "../hooks/useRTL.js";
import { DICT } from "../i18n/dict.js";
import ProductPage from "./ProductPage.jsx";

export default function ProductApp() {
  const store = useStore();
  const t = DICT[store.lang];
  useRTL(store.lang);

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(52,211,153,0.12),transparent_60%)] text-slate-800 dark:text-slate-100">
      <Navbar store={store} t={t} />
      <CategoryRow store={store} t={t} />
      <ProductPage store={store} t={t} />
      <Footer />
      <CartDrawer store={store} t={t} />
    </div>
  );
}



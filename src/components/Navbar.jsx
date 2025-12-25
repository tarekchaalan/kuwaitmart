import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Primitives.jsx";
import logoUrl from "../assets/favicon.png";
import { signIn, signOut, signUp } from "../lib/auth.js";
import { mergeGuestIntoUserCart } from "../lib/cart.js";
import { mergeGuestOrdersIntoUser } from "../lib/orders.js";
import { FaBook } from "react-icons/fa6";

function AuthModal({
  t,
  show,
  onClose,
  authMode,
  setAuthMode,
  authData,
  setAuthData,
  onSubmit,
  loading,
}) {
  // lock scroll when open
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (!show) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {authMode === "login" ? "Log in" : "Sign Up"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === "signup" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Full Name</label>
                <input type="text" value={authData.fullName} onChange={(e)=>setAuthData({ ...authData, fullName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Phone</label>
                <input type="tel" value={authData.phone||""} onChange={(e)=>setAuthData({ ...authData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Building Type</label>
                  <input value={authData.buildingType||""} onChange={(e)=>setAuthData({ ...authData, buildingType: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Building Number</label>
                  <input value={authData.buildingNumber||""} onChange={(e)=>setAuthData({ ...authData, buildingNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Block Number</label>
                  <input value={authData.blockNumber||""} onChange={(e)=>setAuthData({ ...authData, blockNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Street Number</label>
                  <input value={authData.streetNumber||""} onChange={(e)=>setAuthData({ ...authData, streetNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Area</label>
                  <input value={authData.area||""} onChange={(e)=>setAuthData({ ...authData, area: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">Floor</label>
                  <input value={authData.floor||""} onChange={(e)=>setAuthData({ ...authData, floor: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={authData.email}
              onChange={(e) =>
                setAuthData({ ...authData, email: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={authData.password}
              onChange={(e) =>
                setAuthData({ ...authData, password: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-sky-600/50 text-white py-2 font-medium"
          >
            {loading
              ? "Loading..."
              : authMode === "login"
              ? t.login
              : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() =>
              setAuthMode(authMode === "login" ? "signup" : "login")
            }
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
          >
            {authMode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Navbar({ store, t }) {
  const {
    lang,
    setLang,
    query,
    setQuery,
    setCartOpen,
    setView,
    user,
    cartCount,
  } = store;
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === "login") {
        await signIn({ email: authData.email, password: authData.password });
        await mergeGuestIntoUserCart();
        await mergeGuestOrdersIntoUser();
      } else {
        await signUp({
          email: authData.email,
          password: authData.password,
          fullName: authData.fullName,
          phone: authData.phone,
          addressParts: {
            buildingType: authData.buildingType,
            buildingNumber: authData.buildingNumber,
            blockNumber: authData.blockNumber,
            streetNumber: authData.streetNumber,
            area: authData.area,
            floor: authData.floor,
          },
        });
        await mergeGuestIntoUserCart();
        await mergeGuestOrdersIntoUser();
      }
      setShowAuth(false);
      setAuthData({ email: "", password: "", fullName: "" });
    } catch (err) {
      console.error("Auth error:", err);
      alert(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <button
            className="flex items-center gap-2 font-semibold text-slate-800"
            onClick={() => store.navigate("/")}
          >
            <img src={logoUrl} alt="" className="size-14" />
            <span className="hidden sm:block text-2xl">KuwaitMart</span>
          </button>

          <div className="flex-1" />

          <div className="relative max-w-xl w-full hidden md:block">
            <input
              value={query}
              onChange={(e) => store.setQuery(e.target.value)}
              placeholder={t.searchAll}
              className="w-full rounded-full border border-slate-300 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <Icon
              name="search"
              className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400"
            />
          </div>

          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="ml-3 rounded-full border px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {t.language}
          </button>

          <nav className="ml-3 flex items-center gap-2">
            {!user && (
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                <Icon name="user" />
                <span className="hidden sm:block">{showAuth ? '' : t.login}</span>
              </button>
            )}
            <button
              onClick={() => store.navigate("/orders")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <FaBook />
              <span className="hidden sm:block">{t.myOrders}</span>
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                <Icon name="logout" />
                <span className="hidden sm:block">{t.logout}</span>
              </button>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="md:hidden px-4 pb-3">
          <input
            value={query}
            onChange={(e) => store.setQuery(e.target.value)}
            placeholder={t.searchAll}
            className="w-full rounded-full border border-slate-300 bg-white px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </header>

      {/* Modal is PORTALED outside the header, so fixed works correctly */}
      <AuthModal
        t={t}
        show={showAuth}
        onClose={() => setShowAuth(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authData={authData}
        setAuthData={setAuthData}
        onSubmit={handleAuth}
        loading={authLoading}
      />
    </>
  );
}

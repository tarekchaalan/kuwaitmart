import { useState, useEffect } from "react";
import { getCurrentUser, onAuthStateChange } from "../lib/auth.js";
import { getCartLines, getCartCount } from "../lib/cart.js";

export function useStore() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [coupon, setCoupon] = useState("");

  // NEW: server data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load cart data on mount and when cart changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        const lines = await getCartLines();
        setCart(lines);
        const count = await getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };

    loadCart();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);

      // Per Supabase docs, defer any client calls to avoid deadlocks across tabs
      setTimeout(async () => {
        // Apply pending profile patch after first real session
        if (session?.user) {
          try {
            const raw = localStorage.getItem('kuwaitmart.pendingProfilePatch');
            if (raw) {
              const patch = JSON.parse(raw);
              const { updateProfile } = await import('../lib/auth.js');
              await updateProfile(patch);
              localStorage.removeItem('kuwaitmart.pendingProfilePatch');
            }
          } catch (e) { /* ignore */ }
        }
        try {
          const lines = await getCartLines();
          setCart(lines);
          const count = await getCartCount();
          setCartCount(count);
        } catch (error) {
          console.error('Failed to reload cart:', error);
        }
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load initial user
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return {
    lang,
    setLang,
    query,
    setQuery,
    activeCat,
    setActiveCat,
    cartOpen,
    setCartOpen,
    cart,
    setCart,
    cartCount,
    setCartCount,
    page,
    setPage,
    view,
    setView,
    user,
    setUser,
    coupon,
    setCoupon,
    categories,
    setCategories,
    products,
    setProducts,
    pageCount,
    setPageCount,
    loading,
    setLoading,
  };
}



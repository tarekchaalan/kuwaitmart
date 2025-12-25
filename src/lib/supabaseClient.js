import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const STORAGE_KEY = "kuwaitmart-auth";
const CART_KEY = "kuwaitmart.cart.token";
const COOKIE_KEY = "kuwaitmart.guest.id";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getOrCreateGuestId() {
  let guestId = getCookie(COOKIE_KEY);
  if (!guestId) {
    guestId = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
    setCookie(COOKIE_KEY, guestId);
  }
  return guestId;
}

function token() {
  // For backward compatibility, still check localStorage first
  let t = localStorage.getItem(CART_KEY);
  if (!t) {
    t = getOrCreateGuestId();
    localStorage.setItem(CART_KEY, t);
  }
  return t;
}

// HMR-safe singleton
const make = () =>
  createClient(url, key, {
    auth: {
      storageKey: STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      multiTab: true,
    },
    // Ensure the guest header is attached to ALL requests (tables + RPC)
    global: {
      fetch: (input, init = {}) => {
        const urlStr = typeof input === "string" ? input : input?.url || "";
        const shouldAttachGuest = /\/rest\/v1\//.test(urlStr);
        const headers = new Headers(init?.headers || {});
        if (shouldAttachGuest)
          headers.set("x-guest-cookie", getOrCreateGuestId());
        return fetch(input, { ...init, headers });
      },
    },
  });

// Ensure we only create one instance
if (!globalThis.__kuwaitmart_supabase_client) {
  globalThis.__kuwaitmart_supabase_client = make();
}

export const supabase = globalThis.__kuwaitmart_supabase_client;
export const getSupabase = () => supabase;
export const getCartToken = () => token();

// Debug function to test if guest cookie is being sent
export const testGuestCookie = async () => {
  try {
    const { data, error } = await supabase.rpc("request_guest_cookie");
    console.log("Guest cookie from header:", data);
    if (error) {
      console.error("RPC error:", error);
    }
    return data;
  } catch (err) {
    console.error("Failed to get guest cookie from header:", err);
    return null;
  }
};

// Test if the function exists
export const testFunctionExists = async () => {
  try {
    const { data, error } = await supabase.rpc("request_guest_cookie");
    console.log("Function exists, result:", data, "error:", error);
    return { exists: true, data, error };
  } catch (err) {
    console.log("Function does not exist or error:", err.message);
    return { exists: false, error: err.message };
  }
};

// Get current guest cookie ID
export const getCurrentGuestId = () => getOrCreateGuestId();

// Export the default client for backward compatibility
export default supabase;

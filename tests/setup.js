import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Basic fetch mock (always stub; tests can override per-case)
globalThis.fetch = vi.fn(async () => ({
  ok: true,
  status: 200,
  json: async () => ({}),
  text: async () => "",
  headers: new Map(),
}));

// Minimal crypto.getRandomValues polyfill for uuid-like generation
if (!globalThis.crypto) {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.getRandomValues !== "function") {
  globalThis.crypto.getRandomValues = (arr) => {
    for (let i = 0; i < arr.length; i++)
      arr[i] = Math.floor(Math.random() * 256);
    return arr;
  };
}

// Default environment variables used in API tests
process.env.SUPABASE_URL =
  process.env.SUPABASE_URL || "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "anon_key";
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "service_key";
process.env.BASE_URL = process.env.BASE_URL || "https://example.com";
process.env.CLICK_BASE_URL =
  process.env.CLICK_BASE_URL || "https://clickkw.com";
process.env.CLICK_DEVELOPER_USER =
  process.env.CLICK_DEVELOPER_USER || "devuser";
process.env.CLICK_KEY = process.env.CLICK_KEY || "click_key";

// Helper to create mock req/res for API route tests
export function createMockReqRes({
  method = "GET",
  url = "/",
  query = {},
  body = undefined,
  headers = {},
  cookies = {},
} = {}) {
  const req = {
    method,
    url,
    query,
    body,
    headers,
    cookies,
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader: (k, v) => {
      res.headers[k] = v;
    },
    getHeader: (k) => res.headers[k],
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (obj) => {
      res.body = obj;
      return res;
    },
    send: (txt) => {
      res.body = txt;
      return res;
    },
    end: () => res,
  };
  return { req, res };
}

// --- Global mock for server-only Supabase admin client (chainable shape) ---
// Prevents noisy "insert is not a function" errors when API routes are tested
const makeQueryBuilder = () => {
  const builder = {
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    or: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: null, error: null })),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    head: vi.fn(() => builder),
  };
  return builder;
};

const from = vi.fn(() => makeQueryBuilder());
export const supabaseAdmin = { from };
export const getSupabaseAdmin = () => supabaseAdmin;

// Mock supabaseAdmin across import style (named or default) and path variants
vi.mock(
  "/Users/tarek/Developer/Work/kuwaitmart/api/_utils/supabaseAdmin.js",
  () => ({
    __esModule: true,
    default: supabaseAdmin,
    supabaseAdmin,
    getSupabaseAdmin,
  })
);
vi.mock("../../../api/_utils/supabaseAdmin.js", () => ({
  __esModule: true,
  default: supabaseAdmin,
  supabaseAdmin,
  getSupabaseAdmin,
}));
vi.mock("../../api/_utils/supabaseAdmin.js", () => ({
  __esModule: true,
  default: supabaseAdmin,
  supabaseAdmin,
  getSupabaseAdmin,
}));
vi.mock("../api/_utils/supabaseAdmin.js", () => ({
  __esModule: true,
  default: supabaseAdmin,
  supabaseAdmin,
  getSupabaseAdmin,
}));

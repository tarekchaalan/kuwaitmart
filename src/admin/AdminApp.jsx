import React, { useEffect, useMemo, useState } from "react";
import faviconUrl from "../assets/favicon.png";
import { supabase } from "../lib/supabaseClient.js";
import { IoIosCash } from "react-icons/io";
import { FaCreditCard } from "react-icons/fa6";

/**
 * Admin Dashboard — Single-file React app
 * - Separate admin gate: only emails present in public.admins may log in
 * - Uses Supabase **email/password** auth (no self-signup in UI)
 * - After login, verifies membership in admins and blocks otherwise
 * - Clean CRUD for: Categories, Products, Coupons, Orders (read)
 * - EN/AR fields supported, has_options, % discounts, inventory, active toggles
 * - TailwindCSS expected; drop into /src/admin/AdminApp.jsx (or use as a standalone route)
 *
 * ENV (Vite):
 *  VITE_SUPABASE_URL
 *  VITE_SUPABASE_ANON_KEY
 *
 * IMPORTANT: In Supabase Auth settings, DISABLE email self-signups if you want full control
 * and add admin users yourself via the dashboard (Auth → Users) or Admin API. Then add their
 * user_id to public.admins. Non-admin users will be rejected at gate even if credentials are valid.
 */

// Reuse shared client to avoid multiple GoTrue instances

function useAdminSession() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const sess = data.session ?? null;
      setSession(sess);
      if (sess?.user) {
        const { data: ok } = await supabase.rpc("is_admin");
        setIsAdmin(!!ok);
      }
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession ?? null);
        // IMPORTANT: avoid awaiting Supabase calls inside this callback to prevent lockups across tabs
        // Defer the RPC to the next tick
        setTimeout(async () => {
          if (nextSession?.user) {
            try {
              const { data: ok } = await supabase.rpc("is_admin");
              setIsAdmin(!!ok);
            } catch (e) {
              console.error("is_admin RPC failed", e);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        }, 0);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, isAdmin, loading };
}

export default function AdminApp() {
  const { session, isAdmin, loading } = useAdminSession();
  const [tab, setTab] = useState("dashboard");

  if (loading) return <FullCenter>Loading…</FullCenter>;
  if (!session) return <Login />;
  if (!isAdmin) return <Blocked />;

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-800">
      <Topbar />
      <SessionRefresher />
      <div className="mx-auto max-w-7xl p-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <aside className="lg:col-span-1">
          <Nav tab={tab} setTab={setTab} />
        </aside>
        <main className="lg:col-span-4">
          {tab === "dashboard" && <Dashboard />}
          {tab === "categories" && <Categories />}
          {tab === "products" && <Products />}
          {tab === "coupons" && <Coupons />}
          {tab === "orders" && <Orders />}
        </main>
      </div>
    </div>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <img src={faviconUrl} alt="KuwaitMart" className="h-6 w-6" />
          <span>KuwaitMart — Admin</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-lg border px-3 py-1.5 text-sm"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function Nav({ tab, setTab }) {
  const items = [
    ["dashboard", "Overview"],
    ["categories", "Categories"],
    ["products", "Products"],
    ["coupons", "Coupons"],
    ["orders", "Orders"],
  ];
  return (
    <nav className="rounded-2xl border bg-white p-2">
      {items.map(([key, label]) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
            tab === key
              ? "bg-sky-50 text-sky-700 border border-sky-200"
              : "hover:bg-slate-50"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

function FullCenter({ children }) {
  return (
    <div className="grid place-items-center min-h-dvh text-slate-500">
      {children}
    </div>
  );
}

// Keep Supabase session warm to avoid stale auth stopping requests
function SessionRefresher() {
  React.useEffect(() => {
    const iv = setInterval(async () => {
      try {
        await supabase.auth.getSession();
      } catch {}
    }, 60_000);
    const onVisible = async () => {
      if (document.visibilityState === "visible") {
        try {
          await supabase.auth.getSession();
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}

// --- UI: Multi-select dropdown for categories (non-searchable) ---
function MultiSelectCategories({ cats, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = (id) => {
    onChange((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const label =
    selected.length === 0 ? "Select categories" : `${selected.length} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg border px-3 py-2 text-sm text-left flex items-center justify-between"
      >
        <span className="truncate">{label}</span>
        <span className="ml-2 text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow p-2 max-h-56 overflow-auto">
          {cats.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span className="text-sm">{c.name_en}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Verify admin membership
    const { data: ok } = await supabase.rpc("is_admin");
    if (!ok) {
      await supabase.auth.signOut();
      setError("Access denied: not an admin user");
    }
    setLoading(false);
  };

  return (
    <FullCenter>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow"
      >
        <div className="text-lg font-semibold mb-4">Admin Login</div>
        <label className="block text-xs text-slate-500 mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 rounded-lg border px-3 py-2 text-sm"
        />
        <label className="block text-xs text-slate-500 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-lg border px-3 py-2 text-sm"
        />
        {error && <div className="text-rose-600 text-sm mb-3">{error}</div>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-sky-600 text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-500 mt-3">
          Admins are added by owner only.
        </p>
      </form>
    </FullCenter>
  );
}

function Blocked() {
  return <FullCenter>Access denied — not an admin.</FullCenter>;
}

// ======= Overview =======
function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const pA = supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", true);
      const pI = supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", false);
      const o = supabase
        .from("orders")
        .select("id", { count: "exact", head: true });
      const c = supabase
        .from("categories")
        .select("id", { count: "exact", head: true });
      const [prA, orr, cr, prI] = await Promise.all([pA, o, c, pI]);
      setStats({
        productsActive: prA.count || 0,
        productsInactive: prI.count || 0,
        variants: 0,
        orders: orr.count || 0,
        categories: cr.count || 0,
      });
    })();
  }, []);

  if (!stats)
    return <div className="rounded-2xl border bg-white p-4">Loading…</div>;
  const Card = ({ label, value }) => (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card label="Categories" value={stats.categories} />
      <Card
        label="Products (Active | Inactive)"
        value={`${stats.productsActive} | ${stats.productsInactive}`}
      />
      <Card
        label="Orders"
        value={stats.orders}
        className="col-span-2 md:col-span-4"
      />
    </div>
  );
}

// ======= Categories CRUD =======
function Categories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    slug: "",
    name_en: "",
    name_ar: "",
    position: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const load = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("position");
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form.slug || !form.name_en || !form.name_ar) return;
    const { error } = await supabase.from("categories").insert(form);
    if (error) {
      console.error(error);
      alert(`Error creating category: ${error.message}`);
      return;
    }
    setForm({ slug: "", name_en: "", name_ar: "", position: 0 });
    load();
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      slug: row.slug,
      name_en: row.name_en,
      name_ar: row.name_ar,
      position: row.position,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editForm.slug || !editForm.name_en || !editForm.name_ar) return;
    const { error } = await supabase
      .from("categories")
      .update(editForm)
      .eq("id", editingId);
    if (error) {
      console.error(error);
      alert(`Error updating category: ${error.message}`);
      return;
    }
    setEditingId(null);
    setEditForm({});
    load();
  };

  const remove = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Products will lose this category association."
      )
    )
      return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert(`Error deleting category: ${error.message}`);
      return;
    }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold mb-3">New Category</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="name_en"
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="name_ar"
            value={form.name_ar}
            onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="position"
            value={form.position}
            onChange={(e) =>
              setForm({ ...form, position: Number(e.target.value) })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button
            onClick={save}
            className="md:col-span-4 rounded-lg bg-emerald-600 text-white py-2 text-sm"
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th>Slug</th>
              <th>EN</th>
              <th>AR</th>
              <th>Pos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                {editingId === r.id ? (
                  <>
                    <td className="py-2">
                      <input
                        value={editForm.slug}
                        onChange={(e) =>
                          setEditForm({ ...editForm, slug: e.target.value })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        value={editForm.name_en}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name_en: e.target.value })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        value={editForm.name_ar}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name_ar: e.target.value })
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={editForm.position}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            position: Number(e.target.value),
                          })
                        }
                        className="w-20 rounded border px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={saveEdit}
                        className="text-emerald-600 font-medium"
                      >
                        Save
                      </button>
                      <button onClick={cancelEdit} className="text-slate-600">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2">{r.slug}</td>
                    <td>{r.name_en}</td>
                    <td>{r.name_ar}</td>
                    <td>{r.position}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => startEdit(r)}
                        className="text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(r.id)}
                        className="text-rose-600"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======= Products CRUD =======
function Products() {
  const empty = {
    slug: "",
    title_en: "",
    title_ar: "",
    description_en: "",
    description_ar: "",
    pct_disc: "",
    active: true,
    category_id: null,
  };
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [optTitle, setOptTitle] = useState("");
  const [optRows, setOptRows] = useState([
    { name: "", price_kwd: "", sku: "", active: true },
  ]);
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [q, setQ] = useState("");
  const [selectedCats, setSelectedCats] = useState([]); // multi-category ids
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const activeRows = useMemo(
    () => (rows || []).filter((r) => !!r.active),
    [rows]
  );
  const inactiveRows = useMemo(
    () => (rows || []).filter((r) => !r.active),
    [rows]
  );
  const activeIdSet = useMemo(
    () => new Set(activeRows.map((r) => r.id)),
    [activeRows]
  );
  const inactiveIdSet = useMemo(
    () => new Set(inactiveRows.map((r) => r.id)),
    [inactiveRows]
  );
  const selectedActiveCount = useMemo(
    () => selectedIds.filter((id) => activeIdSet.has(id)).length,
    [selectedIds, activeIdSet]
  );
  const selectedInactiveCount = useMemo(
    () => selectedIds.filter((id) => inactiveIdSet.has(id)).length,
    [selectedIds, inactiveIdSet]
  );

  const load = async () => {
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase
        .from("products")
        .select("*, categories:category_id(name_en)")
        .ilike("title_en", `%${q}%`)
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name_en").order("position"),
    ]);
    setRows(products || []);
    setCats(categories || []);
  };
  useEffect(() => {
    load();
  }, [q]);

  const exportProductsCsv = async () => {
    if (exporting) return;
    setExporting(true);
    setExportMsg("");
    try {
      // Fetch ALL products (active + inactive), plus related data we can derive into a useful CSV.
      const products = await fetchAllSupabaseRows(
        () =>
          supabase
            .from("products")
            .select("*")
            .order("id", { ascending: true }),
        1000
      );
      const productIds = Array.from(
        new Set((products || []).map((p) => p?.id).filter(Boolean))
      );

      const [
        categories,
        productCats,
        productImages,
        productOptions,
        productVariants,
      ] = await Promise.all([
        fetchAllSupabaseRows(
          () =>
            supabase
              .from("categories")
              .select("*")
              .order("id", { ascending: true }),
          1000
        ),
        fetchAllSupabaseRowsByInChunks(
          "product_categories",
          "*",
          "product_id",
          productIds,
          500
        ),
        fetchAllSupabaseRowsByInChunks(
          "product_images",
          "*",
          "product_id",
          productIds,
          500
        ),
        fetchAllSupabaseRowsByInChunks(
          "product_options",
          "*",
          "product_id",
          productIds,
          500
        ),
        // product_variants may not exist in every deployment; swallow errors if missing.
        (async () => {
          try {
            return await fetchAllSupabaseRowsByInChunks(
              "product_variants",
              "*",
              "product_id",
              productIds,
              500
            );
          } catch (e) {
            console.warn(
              "product_variants not available; skipping in export",
              e
            );
            return [];
          }
        })(),
      ]);

      const categoriesById = Object.create(null);
      for (const c of categories || []) categoriesById[c.id] = c;

      const catsByProductId = Object.create(null);
      for (const r of productCats || []) {
        const pid = r.product_id;
        if (!pid) continue;
        if (!catsByProductId[pid]) catsByProductId[pid] = [];
        if (r.category_id) catsByProductId[pid].push(r.category_id);
      }

      const imagesByProductId = Object.create(null);
      for (const im of productImages || []) {
        const pid = im.product_id;
        if (!pid) continue;
        if (!imagesByProductId[pid]) imagesByProductId[pid] = [];
        imagesByProductId[pid].push(im);
      }

      const optionsByProductId = Object.create(null);
      for (const po of productOptions || []) {
        const pid = po.product_id;
        if (!pid) continue;
        if (!optionsByProductId[pid]) optionsByProductId[pid] = [];
        optionsByProductId[pid].push(po);
      }

      const variantsByProductId = Object.create(null);
      for (const v of productVariants || []) {
        const pid = v.product_id;
        if (!pid) continue;
        if (!variantsByProductId[pid]) variantsByProductId[pid] = [];
        variantsByProductId[pid].push(v);
      }

      const lines = [];

      for (const p of products || []) {
        const pid = p.id;

        // categories: combine primary + join table
        const catIds = [];
        if (p?.category_id) catIds.push(p.category_id);
        if (catsByProductId[pid]?.length) catIds.push(...catsByProductId[pid]);
        const dedupCatIds = Array.from(new Set(catIds.filter(Boolean)));
        const catNamesEn = dedupCatIds
          .map((id) => categoriesById[id]?.name_en)
          .filter(Boolean);

        const imgs = (imagesByProductId[pid] || [])
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const imageUrls = imgs.map((x) => x?.url).filter(Boolean);

        const category_names_en = catNamesEn.join("|");

        const addLine = ({
          options_title,
          line_name,
          line_sku,
          line_price_kwd,
          line_active,
        }) => {
          lines.push({
            title_en: p?.title_en ?? "",
            options_title: options_title ?? "",
            line_name: line_name ?? "",
            line_sku: line_sku ?? "",
            line_price_kwd: line_price_kwd ?? null,
            in_stock: line_active ? "Y" : "N",
            category_names_en,
          });
        };

        // Variants (if present)
        const vars = variantsByProductId[pid] || [];
        if (vars.length > 0) {
          for (const v of vars) {
            addLine({
              options_title: "",
              line_name: v?.option_values
                ? safeJSONString(v.option_values)
                : "",
              line_sku: v?.sku ?? "",
              line_price_kwd: v?.price_kwd ?? null,
              line_active: (p?.active ?? true) && (v?.active ?? true),
            });
          }
        }

        // Options from product_options.options_names_prices (contains sku + price_kwd + active)
        const pos = optionsByProductId[pid] || [];
        let emittedOptionLines = 0;
        for (const po of pos) {
          const title = po?.options_title ?? "";
          const arr = Array.isArray(po?.options_names_prices)
            ? po.options_names_prices
            : [];
          for (const opt of arr) {
            emittedOptionLines++;
            addLine({
              options_title: title,
              line_name: opt?.name ?? "",
              line_sku: opt?.sku ?? "",
              line_price_kwd: opt?.price_kwd ?? null,
              line_active: (p?.active ?? true) && (opt?.active ?? true),
            });
          }
        }

        // If no options/variants rows, export a base product line
        if (vars.length === 0 && emittedOptionLines === 0) {
          addLine({
            options_title: "",
            line_name: "",
            line_sku: "",
            line_price_kwd: p?.base_price_kwd ?? null,
            line_active: p?.active ?? true,
          });
        }
      }

      const preferredOrder = [
        "title_en",
        "options_title",
        "line_name",
        "line_sku",
        "line_price_kwd",
        "in_stock",
        "category_names_en",
      ];

      const csv = objectsToCsv(lines, preferredOrder);
      downloadCsvUtf8(
        csv,
        `kuwaitmart-products-${new Date().toISOString().slice(0, 10)}.csv`
      );
      setExportMsg(
        `Exported ${lines.length} line(s) from ${products.length} product(s).`
      );
    } catch (e) {
      console.error("exportProductsCsv failed", e);
      alert(`Failed to export CSV: ${e?.message || "unknown_error"}`);
    } finally {
      setExporting(false);
    }
  };

  const create = async () => {
    // Clean and validate options
    const cleaned = (optRows || [])
      .map((r) => {
        const skuRaw = String(r.sku || "")
          .replace(/[^0-9]/g, "")
          .slice(0, 6);
        return {
          name: String(r.name || "").trim(),
          price_kwd: toNum(r.price_kwd),
          sku: skuRaw || null,
          active: r.active !== false,
        };
      })
      .filter((r) => r.name && Number.isFinite(r.price_kwd));

    // Calculate base price from lowest active option
    const activePrices = cleaned
      .filter((r) => r.active)
      .map((r) => r.price_kwd);
    const base_price_kwd =
      activePrices.length > 0 ? Math.min(...activePrices) : 0;

    const payload = {
      ...form,
      base_price_kwd,
      has_options: true,
      pct_disc: toNumNull(form.pct_disc),
    };
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) {
      console.error(error);
      alert(`Error creating product: ${error.message}`);
      return;
    }

    const productId = data.id;
    // categories (many-to-many)
    if (selectedCats.length > 0) {
      const joinRows = selectedCats.map((cid) => ({
        product_id: productId,
        category_id: cid,
      }));
      const { error: pcErr } = await supabase
        .from("product_categories")
        .insert(joinRows);
      if (pcErr) {
        console.error(pcErr);
        alert(`Error saving categories: ${pcErr.message}`);
      }
    }
    // Save options
    if (cleaned.length > 0) {
      const { error: optErr } = await supabase.from("product_options").insert({
        product_id: productId,
        options_title: optTitle.trim() || "Options",
        options_names_prices: cleaned,
        position: 0,
      });
      if (optErr) {
        console.error(optErr);
        alert(`Error saving options: ${optErr.message}`);
      }
    }
    if (files && files.length > 0) {
      try {
        for (const file of files) {
          const webp = await fileToWebPBlob(file, 0.7);
          if (!webp) continue;
          const safeName = (file.name || "image")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .replace(/\.[^.]+$/, "");
          const path = `products/${productId}/${Date.now()}-${safeName}.webp`;
          const { error: upErr } = await supabase.storage
            .from("product-images")
            .upload(path, webp, { contentType: "image/webp", upsert: true });
          if (upErr) {
            console.error(upErr);
            continue;
          }
          const { data: pub } = supabase.storage
            .from("product-images")
            .getPublicUrl(path);
          const url = pub?.publicUrl;
          if (!url) continue;
          await supabase
            .from("product_images")
            .insert({ product_id: productId, url, position: 0 });
        }
      } catch (e) {
        console.error("image upload error", e);
      }
    }

    setForm(empty);
    setSelectedCats([]);
    setOptTitle("");
    setOptRows([{ name: "", price_kwd: "", sku: "", active: true }]);
    setFiles([]);
    load();
  };

  const startEdit = async (id) => {
    const { data: p } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!p) return;
    setEditingId(id);
    setForm({
      slug: p.slug || "",
      title_en: p.title_en || "",
      title_ar: p.title_ar || "",
      description_en: p.description_en || "",
      description_ar: p.description_ar || "",
      pct_disc: p.pct_disc ?? "",
      active: !!p.active,
      category_id: p.category_id || null,
    });
    const { data: pc } = await supabase
      .from("product_categories")
      .select("category_id")
      .eq("product_id", id);
    setSelectedCats((pc || []).map((r) => r.category_id));
    const { data: opt } = await supabase
      .from("product_options")
      .select("options_title, options_names_prices")
      .eq("product_id", id)
      .maybeSingle();
    if (opt) {
      setOptTitle(opt.options_title || "Options");
      setOptRows(
        Array.isArray(opt.options_names_prices)
          ? opt.options_names_prices.map((r) => ({
              name: r.name || "",
              price_kwd: r.price_kwd ?? "",
              sku: r.sku || "",
              active: r.active !== false,
            }))
          : [{ name: "", price_kwd: "", sku: "", active: true }]
      );
    } else {
      setOptTitle("");
      setOptRows([{ name: "", price_kwd: "", sku: "", active: true }]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateProduct = async () => {
    if (!editingId) return;

    // Clean and validate options
    const cleaned = (optRows || [])
      .map((r) => {
        const skuRaw = String(r.sku || "")
          .replace(/[^0-9]/g, "")
          .slice(0, 6);
        return {
          name: String(r.name || "").trim(),
          price_kwd: toNum(r.price_kwd),
          sku: skuRaw || null,
          active: r.active !== false,
        };
      })
      .filter((r) => r.name && Number.isFinite(r.price_kwd));

    // Calculate base price from lowest active option
    const activePrices = cleaned
      .filter((r) => r.active)
      .map((r) => r.price_kwd);
    const base_price_kwd =
      activePrices.length > 0 ? Math.min(...activePrices) : 0;

    const payload = {
      ...form,
      base_price_kwd,
      has_options: true,
      pct_disc: toNumNull(form.pct_disc),
    };
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", editingId);
    if (error) {
      console.error(error);
      alert(`Error updating product: ${error.message}`);
      return;
    }
    // replace category links
    await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", editingId);
    if (selectedCats.length > 0) {
      const joinRows = selectedCats.map((cid) => ({
        product_id: editingId,
        category_id: cid,
      }));
      const { error: linkErr } = await supabase
        .from("product_categories")
        .insert(joinRows);
      if (linkErr) {
        console.error(linkErr);
        alert(`Error saving categories: ${linkErr.message}`);
      }
    }
    // Save options
    const { data: existing } = await supabase
      .from("product_options")
      .select("product_id")
      .eq("product_id", editingId)
      .maybeSingle();
    if (existing) {
      const { error: uErr } = await supabase
        .from("product_options")
        .update({
          options_title: optTitle.trim() || "Options",
          options_names_prices: cleaned,
        })
        .eq("product_id", editingId);
      if (uErr) {
        console.error(uErr);
        alert(`Error updating options: ${uErr.message}`);
      }
    } else if (cleaned.length > 0) {
      const { error: iErr } = await supabase.from("product_options").insert({
        product_id: editingId,
        options_title: optTitle.trim() || "Options",
        options_names_prices: cleaned,
        position: 0,
      });
      if (iErr) {
        console.error(iErr);
        alert(`Error saving options: ${iErr.message}`);
      }
    }
    setEditingId(null);
    setForm(empty);
    setSelectedCats([]);
    setOptTitle("");
    setOptRows([{ name: "", price_kwd: "", sku: "", active: true }]);
    load();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
    setSelectedCats([]);
    setOptTitle("");
    setOptRows([{ name: "", price_kwd: "", sku: "", active: true }]);
    setFiles([]);
  };

  const remove = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert(`Error deleting product: ${error.message}`);
      return;
    }
    load();
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const all = (rows || []).map((r) => r.id);
    setSelectedIds(all);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkMarkInactive = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const target = selectedIds.filter((id) => activeIdSet.has(id));
      if (target.length === 0) {
        setBulkLoading(false);
        return;
      }
      const { error } = await supabase
        .from("products")
        .update({ active: false })
        .in("id", target);
      if (error) throw error;
      clearSelection();
      await load();
    } catch (e) {
      console.error("bulk mark inactive error", e);
      alert("Failed to update selected products");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkMarkActive = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      const target = selectedIds.filter((id) => inactiveIdSet.has(id));
      if (target.length === 0) {
        setBulkLoading(false);
        return;
      }
      const { error } = await supabase
        .from("products")
        .update({ active: true })
        .in("id", target);
      if (error) throw error;
      clearSelection();
      await load();
    } catch (e) {
      console.error("bulk mark active error", e);
      alert("Failed to update selected products");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.length} product(s)? This cannot be undone.`
      )
    )
      return;
    setBulkLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedIds);
      if (error) throw error;
      clearSelection();
      await load();
    } catch (e) {
      console.error("bulk delete error", e);
      alert("Failed to delete selected products");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold mb-3">New Product</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <div className="text-sm">
            <MultiSelectCategories
              cats={cats}
              selected={selectedCats}
              onChange={setSelectedCats}
            />
          </div>
          <input
            placeholder="title_en"
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="title_ar"
            value={form.title_ar}
            onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="% Discount"
            value={form.pct_disc}
            onChange={(e) => setForm({ ...form, pct_disc: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <div className="md:col-span-3 space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="font-medium text-sm">Options</div>
            <input
              placeholder="Options title (e.g. Size, Color)"
              value={optTitle}
              onChange={(e) => setOptTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <div className="space-y-2">
              {optRows.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) =>
                      setOptRows(
                        optRows.map((x, ix) =>
                          ix === i ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                    className="col-span-5 rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Price"
                    value={r.price_kwd}
                    onChange={(e) =>
                      setOptRows(
                        optRows.map((x, ix) =>
                          ix === i ? { ...x, price_kwd: e.target.value } : x
                        )
                      )
                    }
                    className="col-span-3 rounded-lg border px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="SKU (1–6 digits)"
                    value={r.sku || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const cleaned = raw.replace(/[^0-9]/g, "").slice(0, 6);
                      setOptRows(
                        optRows.map((x, ix) =>
                          ix === i ? { ...x, sku: cleaned } : x
                        )
                      );
                    }}
                    className="col-span-3 rounded-lg border px-3 py-2 text-sm"
                  />
                  <label className="col-span-1 flex items-center gap-1 text-xs whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={r.active !== false}
                      onChange={(e) =>
                        setOptRows(
                          optRows.map((x, ix) =>
                            ix === i ? { ...x, active: e.target.checked } : x
                          )
                        )
                      }
                    />
                    <span className="text-slate-600">Active</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setOptRows([
                    ...optRows,
                    { name: "", price_kwd: "", sku: "", active: true },
                  ])
                }
                className="rounded-lg border px-3 py-1.5 text-xs"
              >
                Add row
              </button>
              {optRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setOptRows(optRows.slice(0, -1))}
                  className="rounded-lg border px-3 py-1.5 text-xs"
                >
                  Remove row
                </button>
              )}
            </div>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="md:col-span-3 rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="description_en"
            value={form.description_en}
            onChange={(e) =>
              setForm({ ...form, description_en: e.target.value })
            }
            className="md:col-span-3 rounded-lg border px-3 py-2 text-sm"
          />
          <textarea
            placeholder="description_ar"
            value={form.description_ar}
            onChange={(e) =>
              setForm({ ...form, description_ar: e.target.value })
            }
            className="md:col-span-3 rounded-lg border px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            active
          </label>
          {editingId ? (
            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={updateProduct}
                className="rounded-lg bg-sky-600 text-white py-2 px-3 text-sm"
              >
                Update Product
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={create}
              className="md:col-span-3 rounded-lg bg-emerald-600 text-white py-2 text-sm"
            >
              Create Product
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            placeholder="Search title_en…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <div className="flex-1" />
          <button
            onClick={exportProductsCsv}
            disabled={exporting}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
            title="Export ALL products (active + inactive) to CSV"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
        {exportMsg && (
          <div className="mb-3 text-xs text-slate-600">{exportMsg}</div>
        )}

        {selectedIds.length > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div>{selectedIds.length} selected</div>
            <div className="flex items-center gap-2">
              {selectedIds.length < (rows?.length || 0) && (
                <button
                  onClick={selectAllVisible}
                  className="rounded border px-2 py-1"
                >
                  Select all
                </button>
              )}
              <button
                onClick={clearSelection}
                className="rounded border px-2 py-1"
              >
                Clear
              </button>
              {selectedInactiveCount > 0 && (
                <button
                  onClick={bulkMarkActive}
                  disabled={bulkLoading}
                  className="rounded border px-2 py-1"
                >
                  Mark active
                </button>
              )}
              {selectedActiveCount > 0 && (
                <button
                  onClick={bulkMarkInactive}
                  disabled={bulkLoading}
                  className="rounded border px-2 py-1"
                >
                  Mark inactive
                </button>
              )}
              <button
                onClick={bulkDelete}
                disabled={bulkLoading}
                className="rounded border border-rose-300 text-rose-700 px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto mb-6">
          <div className="font-semibold mb-2">Active products</div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th></th>
                <th>Title EN</th>
                <th>Base</th>
                <th>% Discount</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 w-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="py-2">{r.title_en}</td>
                  <td>KWD {Number(r.base_price_kwd).toFixed(3)}</td>
                  <td>{r.pct_disc ?? "—"}</td>
                  <td>{r.active ? "Yes" : "No"}</td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => startEdit(r.id)}
                      className="text-sky-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {activeRows.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={6}>
                    No active products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto">
          <div className="font-semibold mb-2">Inactive products</div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th></th>
                <th>Title EN</th>
                <th>Base</th>
                <th>% Discount</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inactiveRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 w-6">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="py-2">{r.title_en}</td>
                  <td>KWD {Number(r.base_price_kwd).toFixed(3)}</td>
                  <td>{r.pct_disc ?? "—"}</td>
                  <td>{r.active ? "Yes" : "No"}</td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => startEdit(r.id)}
                      className="text-sky-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="text-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {inactiveRows.length === 0 && (
                <tr>
                  <td className="py-2 text-slate-500" colSpan={6}>
                    No inactive products
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ======= Variants CRUD =======
function Variants() {
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    sku: "",
    option_values: "{}",
    price_kwd: "",
    compare_at_kwd: "",
    inventory_qty: 0,
    barcode: "",
    active: true,
  });

  const load = async () => {
    const [{ data: prods }, { data: vars }] = await Promise.all([
      supabase
        .from("products")
        .select("id, title_en")
        .order("created_at", { ascending: false }),
      supabase
        .from("product_variants")
        .select("*")
        .order("id", { ascending: false }),
    ]);
    setProducts(prods || []);
    setRows(vars || []);
  };
  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const payload = {
      product_id: form.product_id || null,
      sku: emptyToNull(form.sku),
      option_values: safeJSON(form.option_values),
      price_kwd: toNum(form.price_kwd),
      compare_at_kwd: toNumNull(form.compare_at_kwd),
      inventory_qty: Number(form.inventory_qty || 0),
      barcode: emptyToNull(form.barcode),
      active: !!form.active,
    };
    const { error } = await supabase.from("product_variants").insert(payload);
    if (error) {
      console.error(error);
      alert(`Error creating variant: ${error.message}`);
      return;
    }
    setForm({
      product_id: "",
      sku: "",
      option_values: "{}",
      price_kwd: "",
      compare_at_kwd: "",
      inventory_qty: 0,
      barcode: "",
      active: true,
    });
    load();
  };

  const remove = async (id) => {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      alert(`Error deleting variant: ${error.message}`);
      return;
    }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold mb-3">New Variant</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title_en}
              </option>
            ))}
          </select>
          <input
            placeholder="sku"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder='option_values (JSON e.g. {"Size":"500g"})'
            value={form.option_values}
            onChange={(e) =>
              setForm({ ...form, option_values: e.target.value })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="price_kwd"
            value={form.price_kwd}
            onChange={(e) => setForm({ ...form, price_kwd: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="compare_at_kwd (optional)"
            value={form.compare_at_kwd || ""}
            onChange={(e) =>
              setForm({ ...form, compare_at_kwd: e.target.value })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="inventory_qty"
            value={form.inventory_qty}
            onChange={(e) =>
              setForm({ ...form, inventory_qty: e.target.value })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="barcode (optional)"
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            active
          </label>
          <button
            onClick={create}
            className="md:col-span-3 rounded-lg bg-emerald-600 text-white py-2 text-sm"
          >
            Create Variant
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Compare</th>
              <th>Inv</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">
                  {products.find((p) => p.id === r.product_id)?.title_en || "—"}
                </td>
                <td>{r.sku || "—"}</td>
                <td>KWD {Number(r.price_kwd).toFixed(3)}</td>
                <td>
                  {r.compare_at_kwd
                    ? `KWD ${Number(r.compare_at_kwd).toFixed(3)}`
                    : "—"}
                </td>
                <td>{r.inventory_qty}</td>
                <td>{r.active ? "Yes" : "No"}</td>
                <td className="text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="text-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======= Coupons =======
function Coupons() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    code: "",
    pct_off: "",
    amount_off_kwd: "",
    starts_at: "",
    ends_at: "",
    usage_limit: "",
    active: true,
  });
  const load = async () => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("starts_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  const create = async () => {
    const payload = {
      code: form.code.trim().toUpperCase(),
      pct_off: toNumNull(form.pct_off),
      amount_off_kwd: toNumNull(form.amount_off_kwd),
      starts_at: form.starts_at ? convertKuwaitToUTC(form.starts_at) : null,
      ends_at: form.ends_at ? convertKuwaitToUTC(form.ends_at) : null,
      usage_limit: emptyToNull(form.usage_limit),
      active: !!form.active,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) {
      console.error(error);
      alert(`Error creating coupon: ${error.message}`);
      return;
    }
    setForm({
      code: "",
      pct_off: "",
      amount_off_kwd: "",
      starts_at: "",
      ends_at: "",
      usage_limit: "",
      active: true,
    });
    load();
  };
  const remove = async (id) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert(`Error deleting coupon: ${error.message}`);
      return;
    }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="font-semibold mb-3">New Coupon</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            placeholder="CODE"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="% off (e.g. 10)"
            value={form.pct_off}
            onChange={(e) => setForm({ ...form, pct_off: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="amount_off_kwd"
            value={form.amount_off_kwd}
            onChange={(e) =>
              setForm({ ...form, amount_off_kwd: e.target.value })
            }
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            placeholder="usage_limit"
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />{" "}
            active
          </label>
          <button
            onClick={create}
            className="md:col-span-3 rounded-lg bg-emerald-600 text-white py-2 text-sm"
          >
            Create Coupon
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th>Code</th>
              <th>%</th>
              <th>Fixed</th>
              <th>Active</th>
              <th>Used/Limit</th>
              <th>Window</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.code}</td>
                <td>{r.pct_off ?? "—"}</td>
                <td>{r.amount_off_kwd ?? "—"}</td>
                <td>{r.active ? "Yes" : "No"}</td>
                <td>
                  {r.used_count}/{r.usage_limit ?? "∞"}
                </td>
                <td>
                  {fmtDT(r.starts_at)} → {fmtDT(r.ends_at)}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => remove(r.id)}
                    className="text-rose-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======= Orders (read-only MVP) =======
function Orders() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const view = async (r) => {
    setLoading(true);
    setOpen(true);
    setReceipt(null);
    setItems([]);
    try {
      const [{ data: order }, { data: orderItems }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", r.id).maybeSingle(),
        supabase
          .from("order_items")
          .select("*")
          .eq("order_id", r.id)
          .order("id", { ascending: true }),
      ]);
      setReceipt(order || r);
      const baseItems = orderItems || [];
      // Derive SKU from product_options by matching the selected option row
      const productIds = Array.from(
        new Set(baseItems.map((it) => it.product_id).filter(Boolean))
      );
      if (productIds.length > 0) {
        const { data: opts } = await supabase
          .from("product_options")
          .select("product_id, options_title, options_names_prices")
          .in("product_id", productIds);
        const byPid = Object.create(null);
        for (const row of opts || []) byPid[row.product_id] = row;
        const norm = (v) =>
          String(v ?? "")
            .trim()
            .toLowerCase();
        const enriched = baseItems.map((it) => {
          let sku = null;
          const cfg = byPid[it.product_id];
          if (cfg && it.option_values && typeof it.option_values === "object") {
            const selectedValues = Object.values(it.option_values).map(norm);
            const match = Array.isArray(cfg.options_names_prices)
              ? cfg.options_names_prices.find((x) =>
                  selectedValues.includes(norm(x?.name))
                )
              : null;
            sku = match?.sku || null;
          }
          // Fallback: price-match for multi-option products (within tolerance)
          if (
            !sku &&
            cfg &&
            Array.isArray(cfg.options_names_prices) &&
            cfg.options_names_prices.length > 1
          ) {
            const target = Number(it.unit_price_kwd);
            const tol = 0.0005; // KWD has 3 decimals; tolerate half a mil
            const priceMatches = cfg.options_names_prices.filter((x) => {
              const px = Number(x?.price_kwd);
              if (!Number.isFinite(px) || !Number.isFinite(target))
                return false;
              return Math.abs(px - target) < tol;
            });
            if (priceMatches.length === 1) sku = priceMatches[0]?.sku || null;
          }
          // Fallback: if product has exactly one option row with a sku, use it
          if (
            !sku &&
            cfg &&
            Array.isArray(cfg.options_names_prices) &&
            cfg.options_names_prices.length === 1
          ) {
            const only = cfg.options_names_prices[0];
            if (only && only.sku) sku = only.sku;
          }
          return { ...it, __sku: sku };
        });
        setItems(enriched);
      } else {
        setItems(baseItems);
      }
    } catch (e) {
      console.error("Failed to load receipt", e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-2xl border bg-white p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-t hover:bg-slate-50 cursor-pointer"
              onClick={() => view(r)}
            >
              <td className="py-2">{r.order_number}</td>
              <td>
                <StatusPill status={r.status} />
              </td>
              <td>
                <PaymentBadge row={r} />
              </td>
              <td>KWD {Number(r.total_kwd).toFixed(3)}</td>
              <td>{r.name || "—"}</td>
              <td>{r.phone || "—"}</td>
              <td>{fmtDT(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">
                Order #{receipt?.order_number || "—"}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-2 py-1 text-sm"
              >
                Close
              </button>
            </div>
            {loading ? (
              <div className="text-slate-500">Loading…</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-slate-500">Status:</span>
                    <StatusPill status={receipt?.status} />
                    {/* Action buttons - inline like macOS window controls */}
                    {(() => {
                      const methodRaw = String(
                        receipt?.payment_method || ""
                      ).toLowerCase();
                      const isCOD =
                        methodRaw === "cod" ||
                        methodRaw === "cash_on_delivery" ||
                        methodRaw === "cash";
                      const statusLower = String(
                        receipt?.status || ""
                      ).toLowerCase();

                      // For FAILED orders
                      if (statusLower === "failed") {
                        return (
                          <>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "paid",
                                      paid_at: new Date().toISOString(),
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;

                                  // Increment coupon usage count when manually marking as paid
                                  if (receipt.coupon_code) {
                                    try {
                                      const { data: cp } = await supabase
                                        .from("coupons")
                                        .select("id, used_count, usage_limit")
                                        .eq("code", receipt.coupon_code)
                                        .maybeSingle();
                                      if (cp) {
                                        const nextUsed =
                                          Number(cp.used_count || 0) + 1;
                                        await supabase
                                          .from("coupons")
                                          .update({ used_count: nextUsed })
                                          .eq("id", cp.id);
                                        console.log(
                                          `Admin: Incremented coupon ${receipt.coupon_code} usage to ${nextUsed}`
                                        );
                                      }
                                    } catch (e) {
                                      console.error(
                                        "Failed to increment coupon usage:",
                                        e
                                      );
                                    }
                                  }

                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order marked as paid");
                                } catch (e) {
                                  console.error("mark paid error", e);
                                  alert("Failed to mark as paid");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
                              title="Mark as Paid"
                            />
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "pending",
                                      paid_at: null,
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg(
                                    "Order status changed to pending"
                                  );
                                } catch (e) {
                                  console.error("mark pending error", e);
                                  alert("Failed to mark as pending");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60"
                              title="Mark as Pending"
                            />
                          </>
                        );
                      }

                      // For PENDING COD orders
                      if (statusLower === "pending" && isCOD) {
                        return (
                          <>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "paid",
                                      paid_at: new Date().toISOString(),
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;

                                  // Increment coupon usage count when manually marking as paid
                                  if (receipt.coupon_code) {
                                    try {
                                      const { data: cp } = await supabase
                                        .from("coupons")
                                        .select("id, used_count, usage_limit")
                                        .eq("code", receipt.coupon_code)
                                        .maybeSingle();
                                      if (cp) {
                                        const nextUsed =
                                          Number(cp.used_count || 0) + 1;
                                        await supabase
                                          .from("coupons")
                                          .update({ used_count: nextUsed })
                                          .eq("id", cp.id);
                                        console.log(
                                          `Admin: Incremented coupon ${receipt.coupon_code} usage to ${nextUsed}`
                                        );
                                      }
                                    } catch (e) {
                                      console.error(
                                        "Failed to increment coupon usage:",
                                        e
                                      );
                                    }
                                  }

                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Payment confirmed");
                                } catch (e) {
                                  console.error("mark paid error", e);
                                  alert("Failed to mark as paid");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
                              title="Mark as Paid"
                            />
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "failed",
                                      paid_at: null,
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order cancelled");
                                } catch (e) {
                                  console.error("mark failed error", e);
                                  alert("Failed to cancel order");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-60"
                              title="Mark as Failed"
                            />
                          </>
                        );
                      }

                      // For PENDING KNET orders
                      if (statusLower === "pending" && !isCOD) {
                        return (
                          <>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "paid",
                                      paid_at: new Date().toISOString(),
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;

                                  // Increment coupon usage count when manually marking as paid
                                  if (receipt.coupon_code) {
                                    try {
                                      const { data: cp } = await supabase
                                        .from("coupons")
                                        .select("id, used_count, usage_limit")
                                        .eq("code", receipt.coupon_code)
                                        .maybeSingle();
                                      if (cp) {
                                        const nextUsed =
                                          Number(cp.used_count || 0) + 1;
                                        await supabase
                                          .from("coupons")
                                          .update({ used_count: nextUsed })
                                          .eq("id", cp.id);
                                        console.log(
                                          `Admin: Incremented coupon ${receipt.coupon_code} usage to ${nextUsed}`
                                        );
                                      }
                                    } catch (e) {
                                      console.error(
                                        "Failed to increment coupon usage:",
                                        e
                                      );
                                    }
                                  }

                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order marked as paid");
                                } catch (e) {
                                  console.error("mark paid error", e);
                                  alert("Failed to mark as paid");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
                              title="Mark as Paid"
                            />
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({ status: "failed", paid_at: null })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order cancelled");
                                } catch (e) {
                                  console.error("mark failed error", e);
                                  alert("Failed to cancel order");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-60"
                              title="Mark as Failed"
                            />
                          </>
                        );
                      }

                      // For PAID orders
                      if (statusLower === "paid") {
                        return (
                          <>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "pending",
                                      paid_at: null,
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg(
                                    "Order status changed to pending"
                                  );
                                } catch (e) {
                                  console.error("mark pending error", e);
                                  alert("Failed to mark as pending");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60"
                              title="Mark as Pending"
                            />
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      status: "failed",
                                      paid_at: null,
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order cancelled");
                                } catch (e) {
                                  console.error("mark failed error", e);
                                  alert("Failed to cancel order");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-60"
                              title="Mark as Failed"
                            />
                          </>
                        );
                      }

                      return null;
                    })()}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Created:</span>{" "}
                    {fmtDT(receipt?.created_at)}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Payment:</span>{" "}
                    <span className="inline-flex items-center gap-1 align-middle">
                      <PaymentBadge row={receipt} />
                    </span>
                  </div>
                  {(() => {
                    const methodRaw = String(
                      receipt?.payment_method || ""
                    ).toLowerCase();
                    const isCOD =
                      methodRaw === "cod" ||
                      methodRaw === "cash_on_delivery" ||
                      methodRaw === "cash";
                    const isKNET =
                      methodRaw === "card" ||
                      methodRaw === "credit" ||
                      methodRaw === "credit_card";
                    const statusLower = String(
                      receipt?.status || ""
                    ).toLowerCase();
                    const showDelivery =
                      (statusLower === "paid" && isKNET) ||
                      (statusLower === "pending" && isCOD);

                    if (!showDelivery) return null;

                    return (
                      <div className="text-sm flex items-center gap-2">
                        <span className="text-slate-500">Delivery Status:</span>
                        {receipt?.delivered_at ? (
                          <>
                            <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                              Delivered{" "}
                              {new Date(
                                receipt.delivered_at
                              ).toLocaleDateString()}
                            </span>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      delivered_at: null,
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Delivery status reverted");
                                } catch (e) {
                                  console.error("revert delivery error", e);
                                  alert("Failed to revert delivery status");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60"
                              title="Revert to Awaiting Delivery"
                            />
                          </>
                        ) : (
                          <>
                            <span className="inline-block rounded-full border px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                              Awaiting Delivery
                            </span>
                            <button
                              onClick={async () => {
                                if (!receipt?.id) return;
                                setVerifyMsg("");
                                setMarking(true);
                                try {
                                  const { error } = await supabase
                                    .from("orders")
                                    .update({
                                      delivered_at: new Date().toISOString(),
                                    })
                                    .eq("id", receipt.id);
                                  if (error) throw error;
                                  await load();
                                  const { data: updated } = await supabase
                                    .from("orders")
                                    .select("*")
                                    .eq("id", receipt.id)
                                    .maybeSingle();
                                  setReceipt(updated || receipt);
                                  setVerifyMsg("Order marked as delivered");
                                } catch (e) {
                                  console.error("mark delivered error", e);
                                  alert("Failed to mark as delivered");
                                } finally {
                                  setMarking(false);
                                }
                              }}
                              disabled={marking || deleting}
                              className="rounded-full w-4 h-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-60"
                              title="Mark as Delivered"
                            />
                          </>
                        )}
                      </div>
                    );
                  })()}
                  <div className="text-sm">
                    <span className="text-slate-500">Name:</span>{" "}
                    {receipt?.name || "—"}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Phone:</span>{" "}
                    {receipt?.phone || "—"}
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500">Email:</span>{" "}
                    {receipt?.email || "—"}
                  </div>
                  <div className="text-sm sm:col-span-2 break-words whitespace-pre-wrap">
                    <span className="text-slate-500">Address:</span>{" "}
                    {receipt?.address || "—"}
                  </div>
                  <div className="text-sm sm:col-span-2 break-words whitespace-pre-wrap">
                    <span className="text-slate-500">Notes:</span>{" "}
                    {receipt?.notes || "—"}
                  </div>
                </div>
                <div className="rounded-xl border p-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500">
                      <tr>
                        <th>Item</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="py-2">
                            {it.title_en || it.title_ar || "—"}
                          </td>
                          <td>{it.__sku || "—"}</td>
                          <td>{it.qty}</td>
                          <td>KWD {Number(it.unit_price_kwd).toFixed(3)}</td>
                          <td>KWD {Number(it.line_total_kwd).toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Coupon:</span>{" "}
                    {receipt?.coupon_code || "—"}
                  </div>
                  <div className="sm:col-span-2 break-all whitespace-pre-wrap">
                    <span className="text-slate-500">Payment Ref:</span>{" "}
                    {receipt?.payment_ref || "—"}
                  </div>
                  <div>
                    <span className="text-slate-500">Subtotal:</span> KWD{" "}
                    {Number(receipt?.subtotal_kwd || 0).toFixed(3)}
                  </div>
                  <div>
                    <span className="text-slate-500">Discount:</span> KWD{" "}
                    {Number(receipt?.discount_kwd || 0).toFixed(3)}
                  </div>
                  <div className="font-semibold sm:col-span-2">
                    <span className="text-slate-700">Total:</span> KWD{" "}
                    {Number(receipt?.total_kwd || 0).toFixed(3)}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={async () => {
                      if (!receipt?.id) return;
                      if (!confirm("Delete this order?")) return;
                      setVerifyMsg("");
                      setDeleting(true);
                      try {
                        const qs = new URLSearchParams({
                          orderId: receipt.id,
                        }).toString();
                        const res = await fetch(`/api/orders/delete?${qs}`, {
                          method: "POST",
                        });
                        const raw = await res.text().catch(() => "");
                        let j = {};
                        try {
                          j = JSON.parse(raw || "{}");
                        } catch {}
                        if (!res.ok) {
                          const msg =
                            j?.message ||
                            j?.error ||
                            raw ||
                            res.statusText ||
                            "delete_failed";
                          throw new Error(msg);
                        }
                        setVerifyMsg("Order deleted.");
                        setOpen(false);
                        // Reload list
                        await load();
                      } catch (e) {
                        console.error("delete order error", e);
                        alert(
                          `Failed to delete order: ${
                            e?.message || "unknown_error"
                          }`
                        );
                      } finally {
                        setDeleting(false);
                      }
                    }}
                    disabled={marking || deleting}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-rose-50 disabled:opacity-60 text-rose-700 border-rose-300"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </div>
                {verifyMsg && (
                  <div className="text-xs text-slate-600 text-right">
                    {verifyMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const cls = map[s] || "bg-slate-50 text-slate-600 border-slate-200";
  const label = s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function PaymentBadge({ row }) {
  // Prefer explicit field when present; otherwise infer from gateway fields
  const methodRaw = String(row?.payment_method || "").toLowerCase();
  let method = methodRaw;
  if (!method) {
    // Heuristics: any gateway session/ref => online card
    if (row?.payment_ref || row?.mf_session_id) method = "card";
    else if (String(row?.status || "").toLowerCase() === "pending")
      method = "cod";
  }
  const isCOD =
    method === "cod" || method === "cash_on_delivery" || method === "cash";
  const isCard =
    method === "card" || method === "credit" || method === "credit_card";
  const label = isCOD ? "Cash on Delivery" : "KNET";
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      {isCOD ? (
        <IoIosCash className="text-emerald-600 text-xl" />
      ) : (
        <FaCreditCard className="text-sky-600 text-xl" />
      )}
      <span>{label}</span>
    </span>
  );
}

// ===== helpers =====
function toNum(v) {
  return Number.parseFloat(v);
}
function toNumNull(v) {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : null;
}
function emptyToNull(v) {
  return v ? v : null;
}
function safeJSON(v) {
  try {
    return JSON.parse(v || "{}");
  } catch {
    return {};
  }
}
function fmtDT(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-US", { timeZone: "Asia/Kuwait" });
}
function convertKuwaitToUTC(datetimeLocal) {
  return datetimeLocal + ":00+03:00";
}

// Convert an image File to WebP Blob using canvas
async function fileToWebPBlob(file, quality) {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality ?? 0.7)
    );
    return blob;
  } catch (e) {
    console.error("fileToWebPBlob error", e);
    return null;
  }
}

// ===== CSV + export helpers (admin-only) =====
function safeJSONString(v) {
  try {
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    return String(v ?? "");
  }
}

function downloadTextFile(text, filename, mime) {
  const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Excel (especially on Windows) commonly mis-detects UTF-8 CSV and shows Arabic as gibberish.
// Adding a UTF-8 BOM makes Excel reliably interpret the file as UTF-8.
function downloadCsvUtf8(csvText, filename) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM, csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  let s = "";
  if (typeof v === "string") s = v;
  else if (typeof v === "number" || typeof v === "boolean") s = String(v);
  else s = safeJSONString(v);
  // Normalize newlines
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function objectsToCsv(rows, preferredOrder = []) {
  const arr = Array.isArray(rows) ? rows : [];
  const headers = (preferredOrder || []).slice();
  const headerLine = headers.map(csvEscape).join(",");
  const lines = arr.map((r) => headers.map((h) => csvEscape(r?.[h])).join(","));
  return [headerLine, ...lines].join("\n");
}

async function fetchAllSupabaseRows(makeQuery, pageSize = 1000) {
  const out = [];
  let from = 0;
  for (;;) {
    const to = from + pageSize - 1;
    const { data, error } = await makeQuery().range(from, to);
    if (error) throw error;
    const chunk = data || [];
    out.push(...chunk);
    if (chunk.length < pageSize) break;
    from += pageSize;
  }
  return out;
}

async function fetchAllSupabaseRowsByInChunks(
  table,
  select,
  field,
  ids,
  chunkSize = 500
) {
  const all = [];
  const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
  if (list.length === 0) return all;
  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .in(field, chunk);
    if (error) throw error;
    all.push(...(data || []));
  }
  return all;
}

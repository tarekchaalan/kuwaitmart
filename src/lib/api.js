import { getSupabase } from "./supabaseClient.js";

const PAGE_SIZE = 24;

export async function fetchCategories() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name_en, name_ar, position")
    .order("position", { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchProducts({ page = 1, categoryId = "all", q = "" }) {
  const supabase = getSupabase();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const baseSelect = `
    id, slug, title_en, title_ar, base_price_kwd, pct_disc,
    has_options, active, created_at, category_id,
    product_images(url, position),
    product_options(options_names_prices)
  `;

  let query =
    categoryId === "all"
      ? supabase.from("products").select(baseSelect, { count: "exact" })
      : supabase
          .from("products")
          .select(
            `
          ${baseSelect},
          product_categories!inner(category_id)
          `,
            { count: "exact" }
          )
          .eq("product_categories.category_id", categoryId);

  query = query.eq("active", true).order("created_at", { ascending: false });

  if (q?.trim()) {
    const ilike = `%${q.trim()}%`;
    query = query.or(`title_en.ilike.${ilike},title_ar.ilike.${ilike}`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const items = (data || []).map((p) => {
    // Determine if product truly has several options (>1)
    // Options are only active if both the product AND the option are active
    const productActive = p?.active ?? true;
    let optionsCount = 0;
    let optionNames = [];
    const po = p.product_options;
    if (Array.isArray(po)) {
      const arr = po[0]?.options_names_prices;
      if (Array.isArray(arr)) {
        const activeArr = arr.filter((r) => productActive && r.active !== false);
        optionsCount = activeArr.length;
        optionNames = activeArr.map((r)=>String(r?.name||'').trim()).filter(Boolean);
      }
    } else if (po && Array.isArray(po.options_names_prices)) {
      const activeArr = po.options_names_prices.filter((r) => productActive && r.active !== false);
      optionsCount = activeArr.length;
      optionNames = activeArr.map((r)=>String(r?.name||'').trim()).filter(Boolean);
    }

    return {
    id: p.id,
    slug: p.slug,
    title_en: p.title_en,
    title_ar: p.title_ar,
    priceKWD: Number(p.base_price_kwd),
    discountPct: Number(p.pct_disc) || 0,
    severalOptions: optionsCount > 1,
    optionNames,
    image:
      p.product_images?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0]
        ?.url || null,
    categoryId: p.category_id ?? (categoryId !== "all" ? categoryId : null),
  }; });

  const pageCount = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));
  return { items, count, pageCount };
}

export async function fetchProductById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, title_en, title_ar, description_en, description_ar,
      base_price_kwd, pct_disc, has_options,
      product_images(url, alt_en, alt_ar, position)
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchProductBySlug(slug) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id, slug, title_en, title_ar, description_en, description_ar,
      base_price_kwd, pct_disc, has_options,
      product_images(url, alt_en, alt_ar, position)
    `
    )
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}

export async function validateCoupon(code) {
  if (!code) return null;
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("coupons")
    .select("code, pct_off, amount_off_kwd")
    .eq("active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .ilike("code", code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOrder(payload) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert({ ...payload, currency: "KWD", status: "pending" })
    .select("id, order_number")
    .single();
  if (error) throw error;
  return data;
}

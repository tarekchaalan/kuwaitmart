import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('lib/api', () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });

  it('fetchCategories returns rows', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        from: () => ({
          select: () => ({
            order: async () => ({ data: [{ id: 'c1' }], error: null }),
          }),
        }),
      }),
    }));
    const { fetchCategories } = await import('../../src/lib/api.js');
    const res = await fetchCategories();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
  });

  it('fetchProducts maps product fields and computes pageCount', async () => {
    const rows = [
      { id: 'p1', slug: 'slug-1', title_en: 'T1', title_ar: 'A1', base_price_kwd: 1.5, pct_disc: 10, has_options: true, created_at: '2021', category_id: 'c1', product_images: [{ url: 'u1', position: 1 }], product_options: [{ options_names_prices: [{ name: 'Size' }, { name: 'Color' }] }] },
    ];
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({ order: () => ({ range: async () => ({ data: rows, error: null, count: 1 }) }) }),
            order: () => ({ range: async () => ({ data: rows, error: null, count: 1 }) }),
          }),
        }),
      }),
    }));
    const { fetchProducts } = await import('../../src/lib/api.js');
    const { items, pageCount, count } = await fetchProducts({ page: 1, categoryId: 'all', q: '' });
    expect(count).toBe(1);
    expect(pageCount).toBe(1);
    expect(items[0].severalOptions).toBe(true);
    expect(items[0].image).toBe('u1');
  });

  it('fetchProductById and fetchProductBySlug return single row', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({ single: async () => ({ data: { id: 'p2' }, error: null }) }),
          }),
        }),
      }),
    }));
    const { fetchProductById, fetchProductBySlug } = await import('../../src/lib/api.js');
    expect(await fetchProductById('p2')).toEqual({ id: 'p2' });
    expect(await fetchProductBySlug('slug')).toEqual({ id: 'p2' });
  });

  it('validateCoupon returns data or null', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({ lte: () => ({ gte: () => ({ ilike: () => ({ maybeSingle: async () => ({ data: { code: 'SAVE10' }, error: null }) }) }) }) }),
          }),
        }),
      }),
    }));
    const { validateCoupon } = await import('../../src/lib/api.js');
    expect(await validateCoupon('SAVE10')).toEqual({ code: 'SAVE10' });
    expect(await validateCoupon('')).toBeNull();
  });

  it('createOrder inserts and returns id/order_number', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        from: () => ({
          insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'o1', order_number: 1 }, error: null }) }) }),
        }),
      }),
    }));
    const { createOrder } = await import('../../src/lib/api.js');
    const res = await createOrder({});
    expect(res).toEqual({ id: 'o1', order_number: 1 });
  });
});



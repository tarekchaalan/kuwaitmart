import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('cart lib', () => {
  beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });

  it('getOrCreateActiveCart returns data from RPC', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({ rpc: async (name) => (name === 'get_or_create_cart' ? { data: { id: 'cart-1' }, error: null } : { data: true, error: null }) }),
      getCurrentGuestId: () => 'guest-123',
    }));
    const { getOrCreateActiveCart } = await import('../../src/lib/cart.js');
    const res = await getOrCreateActiveCart();
    expect(res).toEqual({ id: 'cart-1' });
  });

  it('getCartLines and getCartCount', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({ rpc: async (name) => (name === 'get_cart_lines_cookie' ? { data: [{ qty: 2 }, { qty: 3 }], error: null } : { data: true, error: null }) }),
      getCurrentGuestId: () => 'guest-123',
    }));
    const { getCartLines, getCartCount } = await import('../../src/lib/cart.js');
    const lines = await getCartLines();
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBe(2);
    await expect(getCartCount()).resolves.toBe(5);
  });

  it('addToCart, setQty, removeItem, clearCart call RPCs and return values', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({ rpc: async () => ({ data: true, error: null }) }),
      getCurrentGuestId: () => 'guest-123',
    }));
    const { addToCart, setQty, removeItem, clearCart } = await import('../../src/lib/cart.js');
    await expect(addToCart({ product_id: 'p1', qty: 1 })).resolves.toBe(true);
    await expect(setQty('i1', 3)).resolves.toBeDefined();
    await expect(removeItem('i1')).resolves.toBe(true);
    await expect(clearCart()).resolves.toBe(true);
  });

  it('mergeGuestIntoUserCart claims guest cart when user has none', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => ({
      getSupabase: () => ({
        auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
        from: (table) => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: async () => ({ data: table === 'carts' ? { id: 'guest-id' } : null }),
                  single: async () => ({ data: null }),
                }),
              }),
            }),
          }),
          update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: { id: 'claimed-cart' } }) }) }) }),
          delete: () => ({ eq: async () => ({}) }),
        }),
        rpc: async () => ({ data: true, error: null }),
      }),
      getCurrentGuestId: () => 'guest-123',
    }));
    const { mergeGuestIntoUserCart } = await import('../../src/lib/cart.js');
    const cart = await mergeGuestIntoUserCart();
    expect(cart).toEqual({ id: 'claimed-cart' });
  });
});



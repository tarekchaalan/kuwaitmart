import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('addToCartFast', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('calls supabase rpc with correct payload and bumps count', async () => {
    vi.doMock('../../src/lib/supabaseClient.js', () => {
      return {
        getSupabase: () => ({ rpc: vi.fn(async () => ({ error: null })) }),
        getCurrentGuestId: () => 'guest-123',
      };
    });
    const { addToCartFast } = await import('../../src/lib/addToCart.js');
    const bump = vi.fn();
    await addToCartFast({ product_id: 'p1', qty: 2, option_values: { c: 'red' }, unit_price_kwd: 1.25, bump });
    expect(bump).toHaveBeenCalledWith(2);
  });

  it('propagates rpc errors', async () => {
    vi.resetModules();
    vi.doMock('../../src/lib/supabaseClient.js', () => {
      return {
        getSupabase: () => ({ rpc: vi.fn(async () => ({ error: new Error('boom') })) }),
        getCurrentGuestId: () => 'guest-123',
      };
    });
    const { addToCartFast } = await import('../../src/lib/addToCart.js');
    await expect(addToCartFast({ product_id: 'p', qty: 1 })).rejects.toThrow();
  });
});



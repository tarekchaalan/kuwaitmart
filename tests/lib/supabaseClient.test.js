import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        getUser: vi.fn(async () => ({ data: { user: null } })),
      },
      rpc: vi.fn(async () => ({ data: null, error: null })),
    })),
  };
});

// Ensure clean module state between tests
beforeEach(() => {
  // Reset cookie/localStorage
  document.cookie = '';
  localStorage.clear();
  // Force module to re-evaluate
  delete globalThis.__birdsite_supabase_client;
});

describe('supabaseClient', async () => {
  it('getCurrentGuestId creates and persists cookie and token', async () => {
    const mod = await import('../../src/lib/supabaseClient.js');
    const id = mod.getCurrentGuestId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(10);
    // cookie should be set
    expect(document.cookie.includes('birdsite.guest.id=')).toBe(true);
    // token stored in localStorage after getCartToken
    mod.getCartToken();
    expect(localStorage.getItem('birdsite.cart.token')).toBeTruthy();
  });

  it('getSupabase returns singleton instance', async () => {
    const mod = await import('../../src/lib/supabaseClient.js');
    const a = mod.getSupabase();
    const b = mod.getSupabase();
    expect(a).toBe(b);
  });

  it('testFunctionExists returns exists flag without throwing', async () => {
    const mod = await import('../../src/lib/supabaseClient.js');
    const res = await mod.testFunctionExists();
    expect(typeof res.exists).toBe('boolean');
  });
});



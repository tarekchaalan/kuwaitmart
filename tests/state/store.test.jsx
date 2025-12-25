import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../../src/lib/cart.js', () => ({
  getCartLines: vi.fn(async () => [{ id: 'i1', qty: 2 }]),
  getCartCount: vi.fn(async () => 2),
}));

vi.mock('../../src/lib/auth.js', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
  onAuthStateChange: vi.fn((cb) => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}));

describe('useStore', () => {
  it('initializes state and loads cart/user', async () => {
    const { useStore } = await import('../../src/state/store.js');
    const { result } = renderHook(() => useStore());
    await waitFor(() => expect(result.current.cartCount).toBe(2));
    await waitFor(() => expect(result.current.user).toEqual({ id: 'u1' }));
  });
});



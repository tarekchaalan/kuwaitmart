import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client module used by mergeGuestOrdersIntoUser
vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/supabaseClient.js', () => {
  const state = {
    guestId: 'guest-123',
    user: { id: 'u1', email: 'user@example.com' },
    updatedIds: ['o1', 'o2'],
    throwOnUpdate: false,
  };

  const from = vi.fn(() => {
    const builder = {
      update: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      is: vi.fn(() => builder),
      select: vi.fn(async () => {
        if (state.throwOnUpdate) throw new Error('update failed');
        return { data: state.updatedIds.map(id => ({ id })), error: null };
      }),
    };
    return builder;
  });

  const getSupabase = () => ({
    from,
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user }, error: null })),
    }
  });
  const getCurrentGuestId = () => state.guestId;

  // Control API for tests
  // eslint-disable-next-line no-undef
  global.__ORDERS_MERGE_MOCK__ = { state };

  return { getSupabase, getCurrentGuestId };
});

import { mergeGuestOrdersIntoUser } from '../../src/lib/orders.js';

describe('mergeGuestOrdersIntoUser', () => {
  beforeEach(() => {
    if (global.__ORDERS_MERGE_MOCK__) {
      Object.assign(global.__ORDERS_MERGE_MOCK__.state, {
        guestId: 'guest-123',
        user: { id: 'u1', email: 'user@example.com' },
        updatedIds: ['o1', 'o2'],
        throwOnUpdate: false,
      });
    }
  });

  it('returns 0 when missing guest id', async () => {
    global.__ORDERS_MERGE_MOCK__.state.guestId = null;
    const n = await mergeGuestOrdersIntoUser();
    expect(n).toBe(0);
  });

  it('returns 0 when missing user id', async () => {
    global.__ORDERS_MERGE_MOCK__.state.user = { id: null, email: 'user@example.com' };
    const n = await mergeGuestOrdersIntoUser();
    expect(n).toBe(0);
  });

  it('updates guest orders with user info and returns updated count', async () => {
    const n = await mergeGuestOrdersIntoUser();
    expect(n).toBe(2);
  });

  it('throws when update/select fails', async () => {
    global.__ORDERS_MERGE_MOCK__.state.throwOnUpdate = true;
    await expect(mergeGuestOrdersIntoUser()).rejects.toThrow('update failed');
  });
});



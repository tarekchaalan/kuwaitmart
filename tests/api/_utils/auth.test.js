// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(async (token) => ({ data: { user: token ? { id: 'u1' } : null }, error: null })),
    },
  }),
}));

describe('api/_utils/auth.getUser', () => {
  it('returns null without token', async () => {
    const { getUser } = await import('../../../api/_utils/auth.js');
    const user = await getUser({ headers: {}, cookies: {} });
    expect(user).toBeNull();
  });

  it('returns user with bearer token', async () => {
    const { getUser } = await import('../../../api/_utils/auth.js');
    const user = await getUser({ headers: { authorization: 'Bearer t' }, cookies: {} });
    expect(user).toEqual({ id: 'u1' });
  });
});



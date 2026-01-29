// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../setup.js';

// Mock auth to return an authenticated user who owns the order
vi.mock('../../../api/_utils/auth.js', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 'user1', app_metadata: {} }),
}));

vi.mock('../../../api/_utils/supabaseAdmin.js', () => {
  const supabaseAdmin = {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: 'o1', order_number: 5, user_id: 'user1' }, error: null }),
        }),
        gt: () => ({
          order: () => ({ select: async () => ({ data: [{ id: 'o2', order_number: 6 }], error: null }) }),
        }),
        order: () => ({ select: async () => ({ data: [{ id: 'o2', order_number: 6 }], error: null }) }),
      }),
      delete: () => ({ eq: async () => ({ error: null }) }),
      update: () => ({ eq: async () => ({ error: null }), in: async () => ({}) }),
    }),
  };
  const getSupabaseAdmin = () => supabaseAdmin;
  return { supabaseAdmin, getSupabaseAdmin };
});

describe('api/orders/delete', () => {
  it('deletes order and shifts order_number of subsequent orders', async () => {
    const mod = await import('../../../api/orders/delete.js');
    const { req, res } = createMockReqRes({ method: 'DELETE', query: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.removedOrderNumber).toBe(5);
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getUser } = await import('../../../api/_utils/auth.js');
    getUser.mockResolvedValueOnce(null);

    const mod = await import('../../../api/orders/delete.js');
    const { req, res } = createMockReqRes({ method: 'DELETE', query: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Authentication required');
  });
});



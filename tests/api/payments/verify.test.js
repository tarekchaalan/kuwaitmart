// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../setup.js';

vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', order_number: 1 } }) }) }),
      update: () => ({ eq: async () => ({}) }),
    }),
  },
}));

describe('api/payments/verify', () => {
  it('verifies success and marks paid', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ Status: 'success' }) }));
    const mod = await import('../../../api/payments/verify.js');
    const { req, res } = createMockReqRes({ method: 'GET', query: { orderId: 'o1', sessionId: 's1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('paid');
  });
});



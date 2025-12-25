// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../setup.js';

vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', total_kwd: 1.5, currency: 'KWD' } }) }) }),
      update: () => ({ eq: async () => ({}) }),
      // Provide insert that works for both usages in code:
      // 1) insert(...).select(...).single()
      // 2) await insert(...) returning { error }
      insert: () => ({
        error: null,
        select: () => ({
          single: async () => ({ data: { id: 'p1' }, error: null }),
        }),
      }),
    }),
  },
}));

describe('api/payments/session', () => {
  it('creates session and returns ids', async () => {
    // Mock gateway fetch
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ gatewayResponse: { session_id: 's1', indicator_status: 'ind' } }) }));
    const mod = await import('../../../api/payments/session.js');
    const { req, res } = createMockReqRes({ method: 'POST', body: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ sessionId: 's1', indicator: 'ind' });
  });
});



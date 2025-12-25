// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { createMockReqRes } from '../../setup.js';

describe('api/payments/session (branches)', () => {
  beforeAll(() => { process.env.MIN_ORDER_KWD = '10'; });

  it('rejects when amount below minimum', async () => {
    vi.resetModules();
    vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
      supabaseAdmin: {
        from: () => ({
          select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', total_kwd: 5, order_number: 1 } }) }) }),
        }),
      },
    }));
    const mod = await import('../../../api/payments/session.js');
    const { req, res } = createMockReqRes({ method: 'POST', body: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('amount_below_minimum');
  });
});



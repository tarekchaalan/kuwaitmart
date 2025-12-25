// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../setup.js';

vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', order_number: 1, total_kwd: 1.5, currency: 'KWD', name: 'N', phone: 'P', email: 'E', address: 'A' } }) }) }),
      update: () => ({ eq: async () => ({}) }),
    }),
  },
}));

describe('api/payments/session-update', () => {
  it('redirects (GET) when gateway returns Location header', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, status: 302, headers: new Map([['location', 'https://pay/123']]) }));
    const mod = await import('../../../api/payments/session-update.js');
    const { req, res } = createMockReqRes({ method: 'GET', query: { orderId: 'o1', lang: 'en', sessionId: 's1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(303);
    expect(res.headers['Location']).toBe('https://pay/123');
  });
});



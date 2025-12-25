// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createMockReqRes } from '../../setup.js';

describe('api/payments/session-update (branches)', () => {
  let fetchSpy;
  afterEach(() => { fetchSpy?.mockRestore?.(); });

  it('400 when No session for order', async () => {
    vi.resetModules();
    const saMod = await import('/Users/tarek/Developer/Work/bird-mart/api/_utils/supabaseAdmin.js');
    saMod.supabaseAdmin.from = () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', mf_session_id: null, order_number: 1, total_kwd: 5 } }) }) }),
    });
    const mod = await import('../../../api/payments/session-update.js');
    const { req, res } = createMockReqRes({ method: 'POST', body: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('No session for order');
  });

  it('GET: responds 303 with Location when gateway issues redirect', async () => {
    vi.resetModules();
    // No-op the payments util side effects to avoid unexpected throws
    vi.mock('/Users/tarek/Developer/Work/bird-mart/api/_utils/payments.js', () => ({
      updatePaymentBySessionOrOrder: async () => ({}),
      addPaymentEventIfSupported: async () => ({}),
    }));
    const saMod = await import('/Users/tarek/Developer/Work/bird-mart/api/_utils/supabaseAdmin.js');
    saMod.supabaseAdmin.from = () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', mf_session_id: 's1', order_number: 1, total_kwd: 5 } }) }) }),
      update: () => ({ eq: async () => ({}) }),
    });
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 302,
      headers: { get: (k) => (k.toLowerCase() === 'location' ? 'https://gw/pay' : null) },
      json: async () => ({}),
      text: async () => '',
    });
    const mod = await import('../../../api/payments/session-update.js');
    const { req, res } = createMockReqRes({ method: 'GET', url: '/api/payments/session-update', query: { orderId: 'o1', lang: 'en' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(303);
    expect(res.getHeader('Location')).toBe('https://gw/pay');
  });
});



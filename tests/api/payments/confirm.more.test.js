// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockReqRes } from '../../setup.js';

describe('api/payments/confirm (branches)', () => {
  let fetchSpy;
  afterEach(() => { fetchSpy?.mockRestore?.(); });

  it('400 when no session id is available', async () => {
    vi.resetModules();
    // Override the shared supabaseAdmin mock directly
    const saMod = await import('/Users/tarek/Developer/Work/bird-mart/api/_utils/supabaseAdmin.js');
    saMod.supabaseAdmin.from = () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', order_number: 1, mf_session_id: null } }) }) }),
    });
    const mod = await import('../../../api/payments/confirm.js');
    const { req, res } = createMockReqRes({ method: 'GET', query: { orderId: 'o1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('no_session_id_for_order');
  });

  it('sets indicator_mismatch when token differs and marks paid on gateway success', async () => {
    vi.resetModules();
    const saMod = await import('/Users/tarek/Developer/Work/bird-mart/api/_utils/supabaseAdmin.js');
    saMod.supabaseAdmin.from = () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'o1', status: 'pending', order_number: 1, mf_session_id: 's1', payment_ref: 'ABC' } }) }) }),
      update: () => ({ eq: async () => ({}) }),
    });

    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map(),
      json: async () => ({ Status: 'SUCCESS', transaction_id: 't1', reference_no: 'r1' }),
      text: async () => '',
    });

    const mod = await import('../../../api/payments/confirm.js');
    const { req, res } = createMockReqRes({ method: 'GET', query: { orderId: 'o1', sessionId: 's1', indicator_status: 'XYZ', force: '1' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('paid');
    expect(res.body.indicator_mismatch).toBe(true);
  });
});



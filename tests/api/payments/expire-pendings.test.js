// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../setup.js';

vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({ eq: () => ({ is: () => ({ lt: async () => ({ data: [{ id: 1 }, { id: 2 }], error: null }) }) }) }),
      update: () => ({ in: async () => ({}) }),
    }),
  },
}));

describe('api/payments/expire-pendings', () => {
  it('marks pending orders as failed', async () => {
    const mod = await import('../../../api/payments/expire-pendings.js');
    const { req, res } = createMockReqRes({ method: 'GET', query: { minutes: '60', status: 'failed' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.updated).toBe(2);
  });
});



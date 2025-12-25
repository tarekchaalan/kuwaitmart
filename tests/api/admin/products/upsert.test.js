// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../../../setup.js';

vi.mock('../../../../api/_utils/auth.js', () => ({
  getUser: vi.fn(async () => ({ app_metadata: { roles: ['admin'] } })),
}));


vi.mock('../../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: () => ({
      upsert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'p1' }, error: null })
        })
      })
    }),
  },
}));

describe('api/admin/products/upsert', () => {
  it('sanity: mock wired', async () => {
    const { supabaseAdmin } = await import('../../../../api/_utils/supabaseAdmin.js');
    expect(typeof supabaseAdmin.from).toBe('function');
  });
  it('allows admin to upsert', async () => {
    const mod = await import('../../../../api/admin/products/upsert.js');
    const { req, res } = createMockReqRes({ method: 'POST', body: { id: 'p1', title_en: 'X' } });
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
  });
});



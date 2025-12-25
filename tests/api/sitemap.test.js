// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createMockReqRes } from '../setup.js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ order: () => ({ range: async () => ({ data: [], error: null }) }) }) }),
    }),
  }),
}));

describe('api/sitemap', () => {
  it('returns xml', async () => {
    const mod = await import('../../api/sitemap.js');
    const { req, res } = createMockReqRes();
    await mod.default(req, res);
    expect(res.statusCode).toBe(200);
    expect(String(res.body)).toContain('<urlset');
  });
});



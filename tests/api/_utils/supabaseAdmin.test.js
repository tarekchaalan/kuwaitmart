import { expect, describe, it } from 'vitest';

describe('supabaseAdmin util (mocked)', () => {
  it('exposes a chainable from()', async () => {
    const mod = await import('../../../api/_utils/supabaseAdmin.js');
    expect(typeof mod.supabaseAdmin.from).toBe('function');
    const qb = mod.supabaseAdmin.from('orders');
    expect(typeof qb.select).toBe('function');
    expect(typeof qb.insert).toBe('function');
    expect(typeof qb.update).toBe('function');
  });
});



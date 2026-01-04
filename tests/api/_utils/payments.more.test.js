// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

describe('api/_utils/payments (branches)', () => {
  it('updatePaymentBySessionOrOrder returns {} when no payment and no order', async () => {
    vi.resetModules();
    const saMod = await import('/Users/tarek/Developer/Work/kuwaitmart/api/_utils/supabaseAdmin.js');
    // payments lookup returns nothing; orders lookup returns nothing
    saMod.supabaseAdmin.from = () => ({
      select: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }),
      order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }),
      maybeSingle: async () => ({ data: null }),
      update: () => ({ eq: async () => ({}) }),
    });
    const mod = await import('../../../api/_utils/payments.js');
    const res = await mod.updatePaymentBySessionOrOrder({ sessionId: 's', orderId: 'o', patch: { status: 'pending' } });
    expect(res).toEqual({});
  });

  it('insertPaymentIfSupported returns { id: null } when insert returns no id', async () => {
    vi.resetModules();
    const saMod = await import('/Users/tarek/Developer/Work/kuwaitmart/api/_utils/supabaseAdmin.js');
    saMod.supabaseAdmin.from = () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    });
    const mod = await import('../../../api/_utils/payments.js');
    const ins = await mod.insertPaymentIfSupported({ orderId: 'o1', amountKwd: 1, sessionId: 's1' });
    expect(ins).toEqual({ id: null });
  });
});



// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../api/_utils/supabaseAdmin.js', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 1 }, error: null })) })) })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: 1 } })) })) })) })) })),
      eq: vi.fn(() => ({ single: vi.fn(async () => ({ data: { id: 1, total_kwd: 1.5, currency: 'KWD' } })) })),
      order: vi.fn(() => ({ limit: vi.fn(() => ({ maybeSingle: vi.fn(async () => ({ data: { id: 1 } })) })) })),
      in: vi.fn(async () => ({ error: null })),
    })),
  },
}));

describe('payments utils', () => {
  beforeEach(() => vi.clearAllMocks());

  it('insertPaymentIfSupported inserts and returns id', async () => {
    const { insertPaymentIfSupported } = await import('../../../api/_utils/payments.js');
    const res = await insertPaymentIfSupported({ orderId: 1, amountKwd: 1.5, sessionId: 's' });
    expect(res).toEqual({ id: 1 });
  });

  it('addPaymentEventIfSupported inserts without error', async () => {
    const { addPaymentEventIfSupported } = await import('../../../api/_utils/payments.js');
    const res = await addPaymentEventIfSupported({ paymentId: 1, event: 'x' });
    expect(res).toEqual({});
  });

  it('updatePaymentBySessionOrOrder updates and returns id', async () => {
    const { updatePaymentBySessionOrOrder } = await import('../../../api/_utils/payments.js');
    const res = await updatePaymentBySessionOrOrder({ sessionId: 's', orderId: 10, patch: { status: 'captured' } });
    expect(res).toEqual({ id: 1 });
  });

  it('safeUpdateOrderPaidAt and safeUpdateOrderGatewayRaw succeed', async () => {
    const { safeUpdateOrderPaidAt, safeUpdateOrderGatewayRaw } = await import('../../../api/_utils/payments.js');
    expect(await safeUpdateOrderPaidAt(1, true)).toEqual({});
    expect(await safeUpdateOrderGatewayRaw(1, { a: 1 })).toEqual({});
  });
});



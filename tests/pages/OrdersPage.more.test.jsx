import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OrdersPage from '../../src/pages/OrdersPage.jsx';

// Supabase client mock that returns awaitable values at the end of the chain
vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/supabaseClient.js', () => {
  const state = { orders: [], order_items: [], throwOnOrders: false };

  const from = vi.fn((table) => {
    const builder = {
      _table: table,
      select: vi.fn(() => builder),
      or: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      order: vi.fn(() => ({
        // Make the result awaitable: awaiting this object resolves to { data, error }
        then: (resolve) => {
          if (builder._table === 'orders') {
            if (state.throwOnOrders) {
              // Simulate rejection path
              return Promise.reject(new Error('orders error')).then(resolve);
            }
            return resolve({ data: [...state.orders], error: null });
          }
          if (builder._table === 'order_items') {
            return resolve({ data: [...state.order_items], error: null });
          }
          return resolve({ data: [], error: null });
        },
      })),
    };
    return builder;
  });

  const getSupabase = () => ({ from });
  const getCurrentGuestId = () => 'guest-1';
  const __setMockState = (partial) => Object.assign(state, partial);
  return { getSupabase, getCurrentGuestId, __setMockState };
});

import { __setMockState } from '/Users/tarek/Developer/Work/bird-mart/src/lib/supabaseClient.js';

describe('OrdersPage states', () => {
  const t = { myOrders: 'My orders' };

  beforeEach(() => {
    __setMockState({ orders: [], order_items: [], throwOnOrders: false });
  });

  it('shows loading then empty state for guest with no orders', async () => {
    render(<OrdersPage store={{ user: null, lang: 'en' }} t={t} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    await screen.findByText('No orders to show.');
  });

  it('renders rows for existing orders and opens modal on click', async () => {
    __setMockState({ orders: [{
      id: 'o1', order_number: '1001', total_kwd: 2.5, status: 'paid', payment_method: 'card', created_at: new Date().toISOString(), paid_at: new Date().toISOString()
    }], order_items: [{ id: 'i1', title_en: 'Item 1', qty: 2, unit_price_kwd: 1.25, line_total_kwd: 2.50 }] });

    render(<OrdersPage store={{ user: null, lang: 'en' }} t={t} />);

    // Row appears
    await screen.findByText('1001');

    // Click row to open modal and load items
    fireEvent.click(screen.getByText('1001'));

    await screen.findByText(/Order #1001/);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});



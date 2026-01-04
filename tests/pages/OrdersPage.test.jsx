import { render, screen } from '@testing-library/react';
import React from 'react';
import OrdersPage from '../../src/pages/OrdersPage.jsx';
import { vi, describe, it, expect } from 'vitest';

// Mock Supabase client used by OrdersPage
vi.mock('/Users/tarek/Developer/Work/kuwaitmart/src/lib/supabaseClient.js', () => {
  const makeQueryBuilder = () => {
    const builder = {
      select: vi.fn(() => builder),
      or: vi.fn(() => builder),
      eq: vi.fn(() => builder),
      in: vi.fn(() => builder),
      order: vi.fn(() => builder),
    };
    return builder;
  };
  const from = vi.fn(() => ({ ...makeQueryBuilder(), then: undefined }));
  const getSupabase = () => ({ from });
  return {
    getSupabase,
    getCurrentGuestId: () => 'guest-1',
  };
});

describe('OrdersPage', () => {
  const t = { myOrders: 'My orders' };
  const store = { user: null, lang: 'en' };

  it('renders heading', () => {
    render(<OrdersPage store={store} t={t} />);
    expect(screen.getByText('My orders')).toBeInTheDocument();
  });
});



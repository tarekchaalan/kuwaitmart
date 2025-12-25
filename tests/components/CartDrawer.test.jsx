import { render, screen } from '@testing-library/react';
import React from 'react';
import CartDrawer from '../../src/components/cart/CartDrawer.jsx';
import { describe, it, expect } from 'vitest';

describe('CartDrawer', () => {
  const t = { emptyCart: 'Your cart is empty', subtotal: 'Subtotal', total: 'Total', checkout: 'Checkout', shopNow: 'Shop now' };
  const baseStore = {
    cartOpen: true,
    setCartOpen: () => {},
    cart: [],
    setCart: () => {},
    setCartCount: () => {},
    lang: 'en',
    navigate: () => {},
  };

  it('renders empty state', () => {
    render(<CartDrawer store={baseStore} t={t} />);
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders totals when cart has items', () => {
    const store = { ...baseStore, cart: [{ cart_item_id: '1', title_en: 'Item', title_ar: 'عنصر', unit_price_kwd: 1.25, qty: 2 }] };
    render(<CartDrawer store={store} t={t} />);
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});



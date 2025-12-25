import { render, screen } from '@testing-library/react';
import React from 'react';
import CheckoutPage from '../../src/pages/CheckoutPage.jsx';

// Minimal mocks for auth and supabase client helpers used by CheckoutPage side-effects
import { vi, describe, it, expect } from 'vitest';

vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/auth.js', () => ({
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
}));

vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/cart.js', () => ({
  setQty: vi.fn(),
  removeItem: vi.fn(),
  getCartLines: vi.fn(async () => []),
  getCartCount: vi.fn(async () => 0),
  clearCart: vi.fn(async () => {}),
}));

vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/api.js', () => ({
  createOrder: vi.fn(),
  validateCoupon: vi.fn(async () => null),
}));

describe('CheckoutPage', () => {
  const t = {
    products: 'Products',
    receipt: 'Receipt',
    emptyCart: 'Your cart is empty',
    guestCheckout: 'Guest checkout',
    apply: 'Apply',
    total: 'Total',
    continueShopping: 'Continue',
    placeOrder: 'Place order',
    name: 'Name',
    address: 'Address',
    phone: 'Phone',
    optional: 'optional',
    coupon: 'Coupon',
    clearCart: 'Clear cart',
  };

  const makeStore = (overrides = {}) => ({
    cart: [],
    setCart: () => {},
    setCartCount: () => {},
    coupon: '',
    setCoupon: () => {},
    lang: 'en',
    user: null,
    navigate: () => {},
    ...overrides,
  });

  it('renders empty cart state', () => {
    render(<CheckoutPage store={makeStore()} t={t} />);
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Receipt')).toBeInTheDocument();
  });
});



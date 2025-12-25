import { render, screen } from '@testing-library/react';
import React from 'react';
import CheckoutReturn from '../../src/pages/CheckoutReturn.jsx';
import { describe, it, expect } from 'vitest';

describe('CheckoutReturn', () => {
  const t = { loading: 'Processing payment…', continueShopping: 'Continue' };
  const store = {
    setLang: () => {},
    navigate: () => {},
    setCart: () => {},
    setCartCount: () => {},
  };

  it('renders without crashing and shows a call-to-action', async () => {
    // Set query without triggering jsdom navigation
    window.history.pushState({}, '', '/checkout/return?orderId=abc123');
    render(<CheckoutReturn store={store} t={t} />);
    // Assert a stable CTA text is present regardless of status
    expect(await screen.findByText('Continue')).toBeInTheDocument();
  });
});



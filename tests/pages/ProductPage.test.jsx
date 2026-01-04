import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductPage from '../../src/pages/ProductPage.jsx';
import { vi, describe, it, expect } from 'vitest';

vi.mock('/Users/tarek/Developer/Work/kuwaitmart/src/lib/api.js', () => ({
  fetchProductBySlug: vi.fn(async () => ({
    id: 1,
    slug: 'foo',
    title_en: 'Foo',
    title_ar: 'فو',
    description_en: 'Desc',
    description_ar: 'وصف',
    base_price_kwd: 1.25,
    compare_at_kwd: null,
    product_images: [],
    has_options: false,
  })),
}));

describe('ProductPage (legacy)', () => {
  const t = { addToCart: 'Add to cart', options: 'Options' };
  const store = { lang: 'en', cart: [], setCart: () => {} };

  it('renders product title and price', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/product/foo' }] }>
        <Routes>
          <Route path="/product/:slug" element={<ProductPage store={store} t={t} />} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('Foo')).toBeInTheDocument();
    expect(await screen.findByText(/KWD/i)).toBeInTheDocument();
  });
});



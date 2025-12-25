import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../src/lib/api.js', () => ({
  fetchCategories: vi.fn(async () => [{ id: 'c1', name_en: 'Cat', name_ar: 'ق' }]),
  fetchProducts: vi.fn(async () => ({ items: [{ id: 'p1', slug: 's1', title_en: 'T', title_ar: 'A', priceKWD: 1, discountPct: 0, image: null, severalOptions: false, optionNames: [] }], pageCount: 1, count: 1 })),
}));

vi.mock('../../src/lib/addToCart.js', () => ({
  addToCartFast: vi.fn(async () => {}),
}));

vi.mock('../../src/lib/cart.js', () => ({
  getCartLines: vi.fn(async () => []),
  getCartCount: vi.fn(async () => 1),
}));

describe('ProductsGrid', () => {
  it('renders products and handles add to cart', async () => {
    const { default: ProductsGrid } = await import('../../src/components/ProductsGrid.jsx');
    const store = {
      lang: 'en', query: '', activeCat: 'all', page: 1,
      setPage: vi.fn(), setProducts: vi.fn(), setPageCount: vi.fn(), setLoading: vi.fn(),
      setCart: vi.fn(), setCartCount: vi.fn(),
      products: [{ id: 'p1', slug: 's1', title_en: 'T', title_ar: 'A', priceKWD: 1, discountPct: 0, image: null, severalOptions: false, optionNames: [] }],
      pageCount: 1, loading: false,
      navigate: vi.fn(),
    };
    const t = { options: 'Several options', discount: 'Discount', addToCart: 'Add to cart', items: 'items' };
    render(<ProductsGrid store={store} t={t} />);
    await waitFor(() => screen.getByText('Add to cart'));
    fireEvent.click(screen.getByText('Add to cart'));
    await waitFor(() => expect(store.setCartCount).toHaveBeenCalled());
  });
});



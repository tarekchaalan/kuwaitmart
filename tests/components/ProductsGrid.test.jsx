import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetchCategories = vi.fn(async () => [{ id: 'c1', name_en: 'Cat', name_ar: 'ق' }]);
const mockFetchProducts = vi.fn(async () => ({
  items: [
    {
      id: 'p1',
      slug: 's1',
      title_en: 'T',
      title_ar: 'A',
      priceKWD: 1,
      discountPct: 0,
      image: null,
      severalOptions: false,
      optionNames: []
    }
  ],
  pageCount: 1,
  count: 1
}));

const mockAddToCartFast = vi.fn(async ({ bump }) => {
  if (bump) bump(1);
});

const mockGetCartLines = vi.fn(async () => []);
const mockGetCartCount = vi.fn(async () => 1);

vi.mock('../../src/lib/api.js', () => ({
  fetchCategories: mockFetchCategories,
  fetchProducts: mockFetchProducts,
}));

vi.mock('../../src/lib/addToCart.js', () => ({
  addToCartFast: mockAddToCartFast,
}));

vi.mock('../../src/lib/cart.js', () => ({
  getCartLines: mockGetCartLines,
  getCartCount: mockGetCartCount,
}));

vi.mock('../../src/components/RestockNotice.jsx', () => ({
  default: () => null,
}));

describe('ProductsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products and handles add to cart', async () => {
    const { default: ProductsGrid } = await import('../../src/components/ProductsGrid.jsx');
    const store = {
      lang: 'en',
      query: '',
      activeCat: 'all',
      page: 1,
      setPage: vi.fn(),
      setProducts: vi.fn(),
      setPageCount: vi.fn(),
      setLoading: vi.fn(),
      setCart: vi.fn(),
      setCartCount: vi.fn(),
      products: [
        {
          id: 'p1',
          slug: 's1',
          title_en: 'Test Product',
          title_ar: 'منتج تجريبي',
          priceKWD: 1.5,
          discountPct: 0,
          image: null,
          severalOptions: false,
          optionNames: []
        }
      ],
      pageCount: 1,
      loading: false,
      navigate: vi.fn(),
    };
    const t = {
      options: 'Several options',
      discount: 'Discount',
      addToCart: 'Add to cart',
      items: 'items'
    };

    render(<ProductsGrid store={store} t={t} />);

    await waitFor(() => expect(screen.getByText('Add to cart')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Add to cart'));

    await waitFor(() => {
      expect(mockAddToCartFast).toHaveBeenCalled();
      expect(store.setCartCount).toHaveBeenCalled();
    });
  });

  it('displays product with discount badge', async () => {
    const { default: ProductsGrid } = await import('../../src/components/ProductsGrid.jsx');
    const store = {
      lang: 'en',
      query: '',
      activeCat: 'all',
      page: 1,
      setPage: vi.fn(),
      setProducts: vi.fn(),
      setPageCount: vi.fn(),
      setLoading: vi.fn(),
      setCart: vi.fn(),
      setCartCount: vi.fn(),
      products: [
        {
          id: 'p2',
          slug: 's2',
          title_en: 'Discounted Product',
          title_ar: 'منتج بخصم',
          priceKWD: 10,
          discountPct: 20,
          image: null,
          severalOptions: false,
          optionNames: []
        }
      ],
      pageCount: 1,
      loading: false,
      navigate: vi.fn(),
    };
    const t = {
      options: 'Several options',
      discount: 'Discount',
      addToCart: 'Add to cart',
      items: 'items'
    };

    render(<ProductsGrid store={store} t={t} />);

    await waitFor(() => {
      const discountBadges = screen.getAllByText(/Discount/);
      expect(discountBadges.length).toBeGreaterThan(0);
      expect(screen.getByText('Discounted Product')).toBeInTheDocument();
    });
  });

  it('shows loading skeleton while fetching', async () => {
    const { default: ProductsGrid } = await import('../../src/components/ProductsGrid.jsx');
    const store = {
      lang: 'en',
      query: '',
      activeCat: 'all',
      page: 1,
      setPage: vi.fn(),
      setProducts: vi.fn(),
      setPageCount: vi.fn(),
      setLoading: vi.fn(),
      setCart: vi.fn(),
      setCartCount: vi.fn(),
      products: [],
      pageCount: 1,
      loading: true,
      navigate: vi.fn(),
    };
    const t = {
      options: 'Several options',
      discount: 'Discount',
      addToCart: 'Add to cart',
      items: 'items'
    };

    const { container } = render(<ProductsGrid store={store} t={t} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});



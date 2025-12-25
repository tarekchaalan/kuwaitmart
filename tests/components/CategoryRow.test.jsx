import { render, screen } from '@testing-library/react';
import React from 'react';
import CategoryRow from '../../src/components/CategoryRow.jsx';
import { vi, describe, it, expect } from 'vitest';

vi.mock('/Users/tarek/Developer/Work/bird-mart/src/lib/api.js', () => ({
  fetchCategories: vi.fn(async () => ([])),
}));

describe('CategoryRow', () => {
  const t = { allProducts: 'All products' };
  const makeStore = (overrides={}) => ({
    lang: 'en',
    activeCat: 'all',
    setActiveCat: () => {},
    setPage: () => {},
    categories: [],
    setCategories: () => {},
    navigate: () => {},
    ...overrides,
  });

  it('renders the all-products pill', () => {
    render(<CategoryRow store={makeStore()} t={t} />);
    expect(screen.getByText('All products')).toBeInTheDocument();
  });
});



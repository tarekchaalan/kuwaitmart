import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock child components to keep this a shell test
vi.mock('../../src/components/Navbar.jsx', () => ({ __esModule: true, default: () => <div>Navbar</div> }));
vi.mock('../../src/components/CategoryRow.jsx', () => ({ __esModule: true, default: () => <div>CategoryRow</div> }));
vi.mock('../../src/components/Footer.jsx', () => ({ __esModule: true, default: () => <div>Footer</div> }));
vi.mock('../../src/components/cart/CartDrawer.jsx', () => ({ __esModule: true, default: () => <div>CartDrawer</div> }));
vi.mock('../../src/pages/ProductPage.jsx', () => ({ __esModule: true, default: () => <div>ProductPage</div> }));

// Mock store + hooks
vi.mock('../../src/state/store.js', () => ({ useStore: () => ({ lang: 'en' }) }));
vi.mock('../../src/hooks/useRTL.js', () => ({ useRTL: () => {} }));

import ProductApp from '../../src/pages/ProductApp.jsx';

describe('ProductApp shell', () => {
  it('renders core layout pieces', () => {
    render(<ProductApp />);
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('CategoryRow')).toBeInTheDocument();
    expect(screen.getByText('ProductPage')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('CartDrawer')).toBeInTheDocument();
  });
});



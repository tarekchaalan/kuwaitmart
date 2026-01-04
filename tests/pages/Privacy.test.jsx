import { render, screen } from '@testing-library/react';
import React from 'react';
import Privacy from '../../src/pages/Privacy.jsx';
import { describe, it, expect } from 'vitest';

describe('Privacy page', () => {
  it('renders heading', () => {
    render(<Privacy />);
    expect(screen.getByText(/Privacy Policy of KuwaitMart/i)).toBeInTheDocument();
  });
});



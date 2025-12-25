import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from '../../src/components/Footer.jsx';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
  it('renders Payments section', () => {
    render(<Footer />);
    expect(screen.getByText('Payments')).toBeInTheDocument();
  });
});



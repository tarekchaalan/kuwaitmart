import { render, screen } from '@testing-library/react';
import React from 'react';
import PayBadge from '../../src/components/PayBadge.jsx';
import { describe, it, expect } from 'vitest';

describe('PayBadge', () => {
  it('renders label', () => {
    render(<PayBadge label="Test Badge" />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });
});



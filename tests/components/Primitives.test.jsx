import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, Icon, QtyButton } from '../../src/components/Primitives.jsx';

describe('Primitives', () => {
  it('Badge renders with content', () => {
    render(<Badge tone="success">OK</Badge>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('Icon renders mapped and fallback icons', () => {
    const { container: c1 } = render(<Icon name="cart" />);
    expect(c1.querySelector('svg')).toBeTruthy();
    const { container: c2 } = render(<Icon name="logo" />);
    expect(c2.textContent).toContain('🐦');
  });

  it('QtyButton renders and is clickable', () => {
    const fn = () => {};
    const { container } = render(<QtyButton onClick={fn}>+</QtyButton>);
    expect(container.querySelector('button')).toBeTruthy();
  });
});



import { describe, it, expect } from 'vitest';
import * as Components from '../../src/components/index.js';

describe('components/index exports', () => {
  it('exports main components', () => {
    const keys = Object.keys(Components);
    // Default-named exports
    expect(keys).toEqual(expect.arrayContaining([
      'Navbar', 'CategoryRow', 'ProductsGrid', 'Footer', 'CartDrawer'
    ]));
    // Re-exports from Primitives
    expect(keys).toEqual(expect.arrayContaining([
      'Badge', 'Icon', 'QtyButton'
    ]));

    // Values should be functions (components)
    expect(typeof Components.Navbar).toBe('function');
    expect(typeof Components.Badge).toBe('function');
  });
});



import { describe, it, expect } from 'vitest';
import { fmtKWD, computeDiscounted } from '../../src/lib/helpers.js';

describe('helpers', () => {
  it('fmtKWD formats to 3 decimals with KWD prefix', () => {
    expect(fmtKWD(1)).toBe('KWD 1.000');
    expect(fmtKWD(1.2)).toBe('KWD 1.200');
    expect(fmtKWD('2.3456')).toBe('KWD 2.346');
  });

  it('computeDiscounted returns same when pct <= 0', () => {
    expect(computeDiscounted(10, 0)).toBe(10);
    expect(computeDiscounted(10, -5)).toBe(10);
  });

  it('computeDiscounted applies percentage', () => {
    expect(computeDiscounted(100, 10)).toBe(90);
    expect(computeDiscounted(50, 25)).toBe(37.5);
  });
});



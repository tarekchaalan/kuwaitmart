// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { roundKWD } from '../../../api/_utils/money.js';

describe('roundKWD', () => {
  it('rounds to 3 decimals and handles invalid', () => {
    expect(roundKWD(1.2346)).toBe(1.235);
    expect(roundKWD('2.0')).toBe(2.000);
    expect(roundKWD('bad')).toBe(0);
  });
});



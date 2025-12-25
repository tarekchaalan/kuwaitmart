import { describe, it, expect } from 'vitest';
import { CATEGORIES, SEED_PRODUCTS } from '../../src/lib/data.js';

describe('lib/data', () => {
  it('has the expected number of categories with unique ids', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true);
    expect(CATEGORIES.length).toBe(7);
    const ids = CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('generates 72 seed products mapped to valid categories', () => {
    expect(SEED_PRODUCTS.length).toBe(72);
    const categoryIds = new Set(CATEGORIES.map(c => c.id));
    for (const p of SEED_PRODUCTS) {
      expect(categoryIds.has(p.categoryId)).toBe(true);
      expect(typeof p.id).toBe('string');
      expect(typeof p.title_en).toBe('string');
      expect(typeof p.title_ar).toBe('string');
    }
  });

  it('has reasonable price ranges and discount distribution', () => {
    const prices = SEED_PRODUCTS.map(p => p.priceKWD);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    // Base from generator: 0.75 .. 2.75
    expect(min).toBeGreaterThanOrEqual(0.75);
    expect(max).toBeLessThanOrEqual(2.75);

    const discounts = SEED_PRODUCTS.map(p => p.discountPct);
    const allowed = new Set([0, 15]);
    expect(discounts.every(d => allowed.has(d))).toBe(true);

    const discountCount = discounts.filter(d => d === 15).length;
    // Every 7th product has a discount, ~10 or 11 of 72
    expect(discountCount).toBeGreaterThanOrEqual(10);
    expect(discountCount).toBeLessThanOrEqual(11);
  });
});



import { describe, it, expect } from 'vitest';
import { DICT } from '../../src/i18n/dict.js';

describe('i18n DICT', () => {
  it('has en and ar locales', () => {
    expect(DICT).toBeTruthy();
    expect(DICT.en).toBeTruthy();
    expect(DICT.ar).toBeTruthy();
  });

  it('contains expected core keys', () => {
    const requiredKeys = [
      'categories','searchAll','login','logout','myOrders','emptyCart','shopNow','checkout',
      'addToCart','options','discount','price','original','newPrice','products','allProducts',
      'items','quantity','remove','subtotal','coupon','apply','total','guestCheckout','name',
      'address','phone','optional','placeOrder','language','receipt','continueShopping','clearCart',
      'showMore','showLess'
    ];
    for (const key of requiredKeys) {
      expect(Object.prototype.hasOwnProperty.call(DICT.en, key)).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(DICT.ar, key)).toBe(true);
    }
  });

  it('has language toggle labels appropriate for each locale', () => {
    expect(DICT.en.language).toBe('عربي');
    expect(DICT.ar.language).toBe('EN');
  });

  it('en and ar entries differ for at least one known label', () => {
    expect(DICT.en.categories).not.toBe(DICT.ar.categories);
  });
});



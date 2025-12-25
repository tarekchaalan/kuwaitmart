import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRTL } from '../../src/hooks/useRTL.js';

describe('useRTL', () => {
  it('toggles document dir and lang', () => {
    const { rerender } = renderHook(({ lang }) => useRTL(lang), { initialProps: { lang: 'en' } });
    expect(document.documentElement.dir).toBe('ltr');
    expect(document.documentElement.lang).toBe('en');
    rerender({ lang: 'ar' });
    expect(document.documentElement.dir).toBe('rtl');
    expect(document.documentElement.lang).toBe('ar');
  });
});



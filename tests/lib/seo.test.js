import { describe, it, expect } from 'vitest';

describe('seo', () => {
  it('applyProductSEO sets title, meta, link and json-ld', async () => {
    const { applyProductSEO } = await import('../../src/lib/seo.js');
    applyProductSEO({ name: 'Parrot Food', description: 'Yummy', url: 'https://x/p', image: 'https://x/i.png', priceKWD: 1.23 });

    expect(document.title.includes('Parrot Food')).toBe(true);
    const metaDesc = document.head.querySelector('meta[name="description"]');
    expect(metaDesc).toBeTruthy();
    const linkCanon = document.head.querySelector('link[rel="canonical"]');
    expect(linkCanon?.getAttribute('href')).toBe('https://x/p');
    const ld = document.head.querySelector('script[type="application/ld+json"][data-id="product"]');
    expect(ld).toBeTruthy();
  });
});



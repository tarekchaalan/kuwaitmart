// Tiny SEO helper for SPA pages
// Updates <title>, meta tags, canonical link, and JSON-LD

function ensureMeta(selectorAttr, name, content) {
  if (!content) return;
  const sel = `meta[${selectorAttr}="${name}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(selectorAttr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function ensureLink(rel, href) {
  if (!href) return;
  const sel = `link[rel="${rel}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id, data) {
  const sel = `script[type="application/ld+json"][data-id="${id}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.setAttribute('data-id', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function truncate(str, max) {
  if (!str) return '';
  const s = String(str).trim().replace(/\s+/g, ' ');
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + '…';
}

export function applyProductSEO({
  name,
  description,
  url,
  image,
  priceKWD,
  currency = 'KWD',
  availability = 'https://schema.org/InStock',
  lang = 'en',
}) {
  try {
    const title = lang === 'en' ? `${name} | KuwaitMart` : `${name} | كويت مارت`;
    const desc = truncate(description || name, 155);

    document.title = title;
    ensureMeta('name', 'description', desc);
    ensureLink('canonical', url);

    // Open Graph
    ensureMeta('property', 'og:type', 'product');
    ensureMeta('property', 'og:title', title);
    ensureMeta('property', 'og:description', desc);
    ensureMeta('property', 'og:url', url);
    if (image) ensureMeta('property', 'og:image', image);

    // Twitter
    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', title);
    ensureMeta('name', 'twitter:description', desc);
    if (image) ensureMeta('name', 'twitter:image', image);

    // JSON-LD Product
    const json = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: name,
      image: image ? [image] : undefined,
      description: desc,
      url,
      offers: {
        '@type': 'Offer',
        priceCurrency: currency,
        price: typeof priceKWD === 'number' ? priceKWD.toFixed(3) : String(priceKWD || ''),
        availability,
        url,
      },
    };
    setJsonLd('product', json);
  } catch (e) {
    // no-op
  }
}



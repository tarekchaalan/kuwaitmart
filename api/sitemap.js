// api/sitemap.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const xmlEscape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const isoDate = (d) => new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD

export default async function handler(req, res) {
  try {
    const base = (process.env.BASE_URL || 'https://birdmartkwt.com').replace(/\/+$/, '');
    const pageSize = 1000;

    // 1) Collect product URLs with proper lastmod (use created_at; updated_at may not exist)
    let from = 0;
    const productRows = [];
    for (;;) {
      const { data, error } = await supabase
        .from('products')
        .select('slug, created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;
      productRows.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    const productUrls = productRows.map((p) => {
      const loc = `${base}/product/${encodeURIComponent(p.slug)}`;
      const lastmod = isoDate(p.created_at || Date.now());
      return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${lastmod}</lastmod></url>`;
    });

    // 2) Add non-product URLs that actually exist in the SPA router
    const staticPages = [
      { loc: `${base}/`, lastmod: isoDate(Date.now()) },
      { loc: `${base}/privacy`, lastmod: isoDate(Date.now()) },
    ].map(({ loc, lastmod }) => `<url><loc>${xmlEscape(loc)}</loc><lastmod>${lastmod}</lastmod></url>`);

    // 3) Build XML with required namespace, no extra whitespace inside <loc>
    const body = [...staticPages, ...productUrls].join('');

    const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;

    // 4) Cache: edge-friendly, safe staleness
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, max-age=300, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.status(500).send('sitemap generation error');
  }
}

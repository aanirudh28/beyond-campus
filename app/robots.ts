import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // The casebook PDFs are public content we WANT indexed (Google ranks
      // PDFs as their own results). Crawlers only ever see /casebooks/*.pdf —
      // the rewrite to /api/resources happens server-side and is never
      // robots-checked — so allowing just that path exposes the files while
      // leaving /api/ shut. Listing both would invite Google to index each
      // PDF twice, once per URL.
      allow: ['/', '/casebooks/'],
      disallow: ['/admin', '/dashboard', '/tracker', '/api/'],
    },
    sitemap: 'https://www.beyond-campus.in/sitemap.xml',
  }
}

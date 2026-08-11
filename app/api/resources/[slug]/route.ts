import { NextResponse } from 'next/server'
import { CASEBOOK_ALIASES } from '@/lib/casebooks'

// Public R2 bucket base. Visitors reach files through beyond-campus.in
// /casebooks/<name>.pdf, which this route 302s to the bucket — so the final URL
// in the address bar IS this host. Swap this one constant if storage moves.
// Override with R2_PUBLIC_BASE in Vercel once a custom domain is attached to the
// bucket (e.g. https://files.beyond-campus.in). Cloudflare rate-limits the raw
// r2.dev subdomain and says not to rely on it for production traffic, and now
// that we redirect visitors straight there, that limit is in the hot path.
const R2_BASE = process.env.R2_PUBLIC_BASE || 'https://pub-031bec4e20ec4e52a40b76e945e3974a.r2.dev'

// slug -> { actual filename in the bucket, filename to give the user on download }
const RESOURCES: Record<string, { file: string; downloadName: string }> = {
  'iima-2025': {
    file: 'IIMA-Consult-Prep-Book-Case-Book-2025-26.pdf',
    downloadName: 'IIM-Ahmedabad-Consult-Prep-Book-2025-26.pdf',
  },
  'iimb-2025': {
    file: 'IIM B Casebook 2025.pdf',
    downloadName: 'IIM-Bangalore-Casebook-2025.pdf',
  },
  'iimc-2025': {
    file: 'IIM Calcutta CaseBook 2025-26.pdf',
    downloadName: 'IIM-Calcutta-Casebook-2025-26.pdf',
  },
  'iiml-2025': {
    file: 'IIM L Casebook 2025.pdf',
    downloadName: 'IIM-Lucknow-Casebook-2025.pdf',
  },
  'isb-2025': {
    file: 'ISB Casebook 2025.pdf',
    downloadName: 'ISB-Casebook-2025.pdf',
  },
  'bitsom-2024': {
    file: 'BITSoM Casebook 2023-2024.pdf',
    downloadName: 'BITSoM-Casebook-2023-2024.pdf',
  },
  'case-interview-guide': {
    file: 'Case Interview Guide.pdf',
    downloadName: 'Case-Interview-Guide.pdf',
  },
  'srcc-guestimates': {
    file: 'SRCC Guesstimates-Book-Volume-1-6.pdf',
    downloadName: 'SRCC-Guesstimates-Book-Volume-1-6.pdf',
  },
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  // Accept both the descriptive public slug (iim-bangalore-casebook-2025, via
  // the /casebooks/*.pdf rewrite) and the short internal one (iimb-2025).
  const resource = RESOURCES[CASEBOOK_ALIASES[slug] ?? slug]

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  const upstreamUrl = `${R2_BASE}/${encodeURIComponent(resource.file)}`

  // REDIRECT — do not proxy. Proxying these bytes burned 7.6GB of Vercel's
  // 10GB/mo Fast Origin Transfer in eight days, which pauses the whole project
  // on Hobby when it runs out. Two things made it unfixable by caching:
  //   1. Vercel refuses to cache ANY response whose request carries a `Range`
  //      header, and browsers fetch inline PDFs almost entirely by range. So
  //      s-maxage never applied and every request was a cache MISS.
  //   2. This handler ignored that Range header and re-fetched the WHOLE file
  //      from R2 each time, so a viewer asking for 100KB pulled all 16MB.
  // A 302 hands the client to R2 directly: Vercel moves ~300 bytes, R2 serves
  // range requests natively, and its egress is free.
  //
  // 302 and not 301 on purpose — a permanent redirect would make Google
  // consolidate onto the r2.dev URL and we would lose the branded
  // beyond-campus.in/casebooks/*.pdf result we just worked to get indexed.
  // A temporary redirect keeps the source URL as the indexed one.
  return NextResponse.redirect(upstreamUrl, {
    status: 302,
    headers: {
      // Let the edge remember the tiny redirect itself (no Range on this hop).
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}

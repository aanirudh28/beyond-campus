import { NextResponse } from 'next/server'
import { CASEBOOK_ALIASES } from '@/lib/casebooks'

// Public R2 bucket base — files served from here, but visitors only ever see
// beyond-campus.in/api/resources/<slug> links. Swap this one constant if the
// storage provider ever changes again; no other code or public links need to move.
const R2_BASE = 'https://pub-031bec4e20ec4e52a40b76e945e3974a.r2.dev'

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

  const upstream = await fetch(upstreamUrl)
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'File unavailable' }, { status: 502 })
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${resource.downloadName}"`,
      // Cache at the edge/browser for a day — cuts down repeat egress from R2
      // (though R2 egress is free, this still keeps things snappy for repeat visitors).
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}

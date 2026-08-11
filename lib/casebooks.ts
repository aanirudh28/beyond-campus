// Single source of truth for the consulting casebook set. Used by:
//  - app/api/capture-lead  (immediate "here's your pack" email)
//  - app/api/nurture        (weekly-case audience = casebook leads)
//  - app/api/admin/consulting (funnel tracker)
//  - app/resources/consulting (public page — keep the titles in sync)
// `name` MUST match the resource string stored by track-download / capture-lead.

export const SITE = 'https://www.beyond-campus.in'

export interface Casebook {
  name: string
  slug: string
  // Keyword-rich public filename. This is what Google sees and what people
  // paste around, so it spells the college out in full ("iim-bangalore", not
  // "iimb"). `slug` stays the short internal id so nothing else has to move.
  fileSlug: string
}

export const CASEBOOKS: Casebook[] = [
  { name: 'IIM Ahmedabad Consult Prep Book 2025-26', slug: 'iima-2025', fileSlug: 'iim-ahmedabad-consulting-casebook-2025' },
  { name: 'IIM Bangalore Casebook 2025', slug: 'iimb-2025', fileSlug: 'iim-bangalore-casebook-2025' },
  { name: 'IIM Calcutta Casebook 2025-26', slug: 'iimc-2025', fileSlug: 'iim-calcutta-casebook-2025' },
  { name: 'IIM Lucknow Casebook 2025', slug: 'iiml-2025', fileSlug: 'iim-lucknow-casebook-2025' },
  { name: 'ISB Casebook 2025', slug: 'isb-2025', fileSlug: 'isb-casebook-2025' },
  { name: 'BITSoM Casebook 2023-24', slug: 'bitsom-2024', fileSlug: 'bitsom-casebook-2023-24' },
  { name: 'Case Interview Guide', slug: 'case-interview-guide', fileSlug: 'case-interview-guide' },
  { name: 'SRCC Guestimates Book — Volume 1-6', slug: 'srcc-guestimates', fileSlug: 'srcc-guesstimates-book' },
]

export const CASEBOOK_NAMES = CASEBOOKS.map(c => c.name)

// fileSlug -> internal slug, so /api/resources/<either> resolves.
export const CASEBOOK_ALIASES: Record<string, string> = Object.fromEntries(
  CASEBOOKS.filter(c => c.fileSlug !== c.slug).map(c => [c.fileSlug, c.slug])
)

// Public download path. Reads as a file, carries the keywords, and is served
// by the /casebooks/:slug.pdf -> /api/resources/:slug rewrite in next.config.
export const casebookPath = (slug: string) => {
  const book = CASEBOOKS.find(c => c.slug === slug || c.fileSlug === slug)
  return `/casebooks/${book?.fileSlug ?? slug}.pdf`
}

export const casebookUrl = (slug: string) => `${SITE}${casebookPath(slug)}`

// Real download tallies read from `resource_downloads`, keyed by slug.
export interface DownloadCounts {
  total: Record<string, number>
  week: Record<string, number>
}

// Below this, a real number reads as "nobody wants this" and does more harm
// than showing nothing. We omit rather than inflate.
export const COUNT_FLOOR = 25

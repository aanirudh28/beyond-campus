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
}

export const CASEBOOKS: Casebook[] = [
  { name: 'IIM Ahmedabad Consult Prep Book 2025-26', slug: 'iima-2025' },
  { name: 'IIM Bangalore Casebook 2025', slug: 'iimb-2025' },
  { name: 'IIM Calcutta Casebook 2025-26', slug: 'iimc-2025' },
  { name: 'IIM Lucknow Casebook 2025', slug: 'iiml-2025' },
  { name: 'ISB Casebook 2025', slug: 'isb-2025' },
  { name: 'BITSoM Casebook 2023-24', slug: 'bitsom-2024' },
  { name: 'Case Interview Guide', slug: 'case-interview-guide' },
  { name: 'SRCC Guestimates Book — Volume 1-6', slug: 'srcc-guestimates' },
]

export const CASEBOOK_NAMES = CASEBOOKS.map(c => c.name)

export const casebookUrl = (slug: string) => `${SITE}/api/resources/${slug}`

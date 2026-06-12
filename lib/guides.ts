import { offCampusInternshipGuide } from '@/content/guides/off-campus-internship-india'
import { coldEmailToHrGuide } from '@/content/guides/cold-email-to-hr-internship'
import { consultingWithoutIimGuide } from '@/content/guides/consulting-internship-without-iim'
import { foundersOfficeGuide } from '@/content/guides/founders-office-roles-freshers'

/* ----------------------------------------------------------------------------
   Guides are TS modules exporting frontmatter + a markdown body (no fs reads,
   so they bundle cleanly into the static pages AND the runtime sitemap).
   To add a guide: copy a file in content/guides/, register it here, done.
---------------------------------------------------------------------------- */

export interface Guide {
  slug: string
  title: string // page H1 + Article headline
  seoTitle: string // <title> tag, keyword-leading
  description: string
  category: string // mono-label shown on cards, e.g. "PLAYBOOK"
  datePublished: string // ISO yyyy-mm-dd
  dateModified: string
  readMinutes: number
  md: string
}

const GUIDES: Guide[] = [
  offCampusInternshipGuide,
  coldEmailToHrGuide,
  consultingWithoutIimGuide,
  foundersOfficeGuide,
]

export function getAllGuides(): Guide[] {
  return [...GUIDES].sort((a, b) => b.datePublished.localeCompare(a.datePublished))
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find(g => g.slug === slug)
}

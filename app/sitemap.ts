import { MetadataRoute } from 'next'
import { JOB_DOMAINS, getPublishedJobs } from '@/lib/jobsPublic'
import { getAllGuides } from '@/lib/guides'

export const revalidate = 3600 // refresh hourly so newly published jobs appear without a redeploy

const BASE = 'https://www.beyond-campus.in'

// path, changeFrequency, priority — no fake lastModified churn: only pages
// whose real update time we know (jobs) report one.
const STATIC_ROUTES: [string, 'daily' | 'weekly' | 'monthly', number][] = [
  ['', 'weekly', 1.0],
  ['/jobs', 'daily', 0.9],
  ['/guides', 'weekly', 0.9],
  ['/summer', 'weekly', 0.9],
  ['/book', 'weekly', 0.9],
  ['/cohort', 'weekly', 0.9],
  ['/job-tracker', 'weekly', 0.9],
  ['/aptitude', 'weekly', 0.9],
  ['/resources/resume-roast', 'weekly', 0.9],
  ['/program', 'weekly', 0.8],
  ['/free', 'weekly', 0.8],
  ['/results', 'weekly', 0.8],
  ['/resources/career-toolkit', 'monthly', 0.8],
  ['/resources/consulting', 'monthly', 0.8],
  ['/resources/cold-email-pack', 'monthly', 0.7],
  ['/resources/linkedin-scripts', 'monthly', 0.7],
  ['/resources/resume-builder', 'monthly', 0.7],
  ['/resources/resume-guide', 'monthly', 0.7],
  ['/resources/resume-templates', 'monthly', 0.7],
  ['/resources/excel-interview-prep', 'monthly', 0.7],
  ['/community', 'weekly', 0.6],
  ['/get-started', 'monthly', 0.6],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, changeFrequency, priority]) => ({
    url: `${BASE}${path}`,
    changeFrequency,
    priority,
  }))

  for (const g of getAllGuides()) {
    entries.push({
      url: `${BASE}/guides/${g.slug}`,
      lastModified: new Date(`${g.dateModified}T00:00:00Z`),
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  for (const d of JOB_DOMAINS) {
    entries.push({ url: `${BASE}/jobs/${d.slug}`, changeFrequency: 'daily', priority: 0.8 })
  }

  const jobs = await getPublishedJobs(undefined, 500)
  for (const job of jobs) {
    entries.push({
      url: `${BASE}/jobs/view/${job.id}`,
      lastModified: job.published_at ? new Date(job.published_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  return entries
}

import { createClient } from '@supabase/supabase-js'

/* ----------------------------------------------------------------------------
   Public, read-only access to the curated jobs feed for the SEO pages under
   /jobs. Uses the anon key — RLS only exposes rows with status = 'published',
   so nothing pending/rejected can leak. No cookies, safe at build/ISR time.
---------------------------------------------------------------------------- */

export interface PublicJob {
  id: string
  company: string
  role: string
  location: string | null
  job_url: string
  jd_summary: string | null
  domain: string
  posted_at: string | null
  published_at: string | null
}

export interface JobDomainInfo {
  slug: string
  domain: string
  label: string
  title: string
  blurb: string
}

export const JOB_DOMAINS: JobDomainInfo[] = [
  {
    slug: 'consulting',
    domain: 'consulting',
    label: 'Consulting',
    title: 'Consulting Jobs & Internships for Freshers in India',
    blurb:
      'Entry-level consulting and strategy roles open to 0–2 year candidates — analyst programs, research roles, and boutique firms that hire off-campus.',
  },
  {
    slug: 'finance',
    domain: 'finance',
    label: 'Finance',
    title: 'Finance Jobs & Internships for Freshers in India',
    blurb:
      'Fresher finance roles — analyst, investment research, FP&A, and fintech openings that do not require an IIM tag or campus placement.',
  },
  {
    slug: 'marketing',
    domain: 'marketing',
    label: 'Marketing',
    title: 'Marketing Jobs & Internships for Freshers in India',
    blurb:
      'Entry-level marketing, growth, content, and brand roles at startups and companies hiring freshers directly off-campus.',
  },
  {
    slug: 'business-development',
    domain: 'bd',
    label: 'Business Development',
    title: 'Business Development & Sales Jobs for Freshers in India',
    blurb:
      'BD, sales, and partnerships roles for freshers — the fastest hiring funnel into high-growth startups for non-tech students.',
  },
  {
    slug: 'operations',
    domain: 'operations',
    label: 'Operations',
    title: 'Operations Jobs & Internships for Freshers in India',
    blurb:
      'Ops, program management, and supply chain roles for 0–2 year candidates at startups and growth-stage companies.',
  },
  {
    slug: 'founders-office',
    domain: 'founders_office',
    label: "Founder's Office",
    title: "Founder's Office Jobs for Freshers in India",
    blurb:
      "Founder's Office and Chief of Staff style roles — the highest-leverage entry point for ambitious non-tech freshers.",
  },
]

export const domainBySlug = (slug: string) => JOB_DOMAINS.find(d => d.slug === slug)
export const domainInfo = (domain: string) => JOB_DOMAINS.find(d => d.domain === domain)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

const JOB_COLUMNS = 'id, company, role, location, job_url, jd_summary, domain, posted_at, published_at'

export async function getPublishedJobs(domain?: string, limit = 100): Promise<PublicJob[]> {
  let query = anonClient()
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (domain) query = query.eq('domain', domain)
  const { data } = await query
  return (data as PublicJob[] | null) || []
}

export async function getPublishedJob(id: string): Promise<PublicJob | null> {
  if (!UUID_RE.test(id)) return null
  const { data } = await anonClient()
    .from('jobs')
    .select(JOB_COLUMNS)
    .eq('status', 'published')
    .eq('id', id)
    .maybeSingle()
  return (data as PublicJob | null) || null
}

export function timeAgo(iso: string | null): string {
  if (!iso) return 'Recently'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} month${days >= 60 ? 's' : ''} ago`
}

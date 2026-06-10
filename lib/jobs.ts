import Anthropic from '@anthropic-ai/sdk'
import { serviceClient, parseClaudeJson } from '@/lib/tracker'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export type Ats = 'greenhouse' | 'lever' | 'ashby'
export type JobDomain = 'consulting' | 'finance' | 'marketing' | 'bd' | 'operations' | 'founders_office' | 'other'

export interface JobSourceRow {
  id: string
  company: string
  ats: Ats
  slug: string
  active: boolean
  last_synced_at: string | null
}

export interface NormalizedPosting {
  externalId: string
  role: string
  jobUrl: string
  location: string | null
  description: string
  postedAt: string | null
}

interface Classification {
  i: number
  keep: boolean
  domain: JobDomain
  jd_summary: string
}

export interface SourceReport {
  source: string
  fetched: number
  fresh: number
  kept: number
  expired: number
  error?: string
}

// titles that are never fresher non-tech business roles — drop before spending tokens
const HARD_NO = /senior|staff|principal|lead|director|manager|head of|vp |vice president|engineer|engineering|developer|sde|devops|scientist|architect|designer|intern(ship)? - tech/i

const stripHtml = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Returns null on ANY failure (so callers skip the expiry diff); [] = empty board.
export async function fetchAtsPostings(source: JobSourceRow): Promise<NormalizedPosting[] | null> {
  if (source.ats === 'greenhouse') {
    const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs?content=true`) as
      { jobs?: { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; updated_at?: string }[] } | null
    if (!data?.jobs) return null
    return data.jobs.map(j => ({
      externalId: String(j.id),
      role: j.title,
      jobUrl: j.absolute_url,
      location: j.location?.name || null,
      description: stripHtml(j.content || ''),
      postedAt: j.updated_at || null,
    }))
  }

  if (source.ats === 'lever') {
    const data = await fetchJson(`https://api.lever.co/v0/postings/${source.slug}?mode=json`) as
      { id: string; text: string; hostedUrl: string; categories?: { location?: string }; descriptionPlain?: string; createdAt?: number }[] | null
    if (!Array.isArray(data)) return null
    return data.map(j => ({
      externalId: j.id,
      role: j.text,
      jobUrl: j.hostedUrl,
      location: j.categories?.location || null,
      description: j.descriptionPlain || '',
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    }))
  }

  // ashby
  const data = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${source.slug}`) as
    { jobs?: { id: string; title: string; jobUrl: string; location?: string; descriptionPlain?: string; publishedAt?: string }[] } | null
  if (!data?.jobs) return null
  return data.jobs.map(j => ({
    externalId: j.id,
    role: j.title,
    jobUrl: j.jobUrl,
    location: j.location || null,
    description: j.descriptionPlain || '',
    postedAt: j.publishedAt || null,
  }))
}

const classifySystem = `You screen job postings for a curated board for Indian students and fresh graduates (0-2 years experience) seeking NON-TECH business roles.
Return ONLY a JSON array, no markdown fences, same length and order as the input array. Each element:
{"i": <index>, "keep": <boolean>, "domain": <"consulting"|"finance"|"marketing"|"bd"|"operations"|"founders_office"|"other">, "jd_summary": <string, max 30 words, plain language a student understands>}
keep=true ONLY if ALL hold:
1. Entry-level: 0-2 years, "fresher", "associate", "analyst", "executive", "trainee" — NOT senior/lead/manager roles.
2. A business role (consulting, finance, marketing, sales/BD, operations, strategy, founder's office) — NOT software/data/engineering/design.
3. Plausibly open to candidates in India: location in India, or remote with no conflicting geo restriction.
When unsure about seniority or geography, keep=false.`

export async function classifyPostings(company: string, postings: NormalizedPosting[]): Promise<Classification[]> {
  if (postings.length === 0) return []
  const payload = postings.map((p, i) => ({
    i,
    company,
    title: p.role,
    location: p.location,
    description: p.description.slice(0, 1200),
  }))
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    system: classifySystem,
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  })
  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const parsed = parseClaudeJson(raw)
  return Array.isArray(parsed) ? parsed : []
}

export async function syncSources(opts?: { maxSources?: number; maxNewPostings?: number }): Promise<SourceReport[]> {
  const maxSources = opts?.maxSources ?? 4
  let budget = opts?.maxNewPostings ?? 40
  const svc = serviceClient()
  const reports: SourceReport[] = []

  const { data: sources } = await svc
    .from('job_sources')
    .select('*')
    .eq('active', true)
    .order('last_synced_at', { ascending: true, nullsFirst: true })
    .limit(maxSources)

  for (const source of (sources || []) as JobSourceRow[]) {
    const report: SourceReport = { source: `${source.company} (${source.ats})`, fetched: 0, fresh: 0, kept: 0, expired: 0 }
    reports.push(report)
    try {
      const postings = await fetchAtsPostings(source)
      if (postings === null) {
        // fetch failed: no expiry, keep old last_synced_at so it retries first next run
        report.error = 'fetch failed'
        continue
      }
      report.fetched = postings.length

      const { data: existing } = await svc
        .from('jobs')
        .select('external_id, status')
        .eq('source_id', source.id)
      const knownIds = new Set((existing || []).map(j => j.external_id))
      const feedIds = new Set(postings.map(p => p.externalId))

      // candidates: unseen in this source, title passes the cheap filter, inside global budget
      let candidates = postings.filter(p => !knownIds.has(p.externalId) && p.role && !HARD_NO.test(p.role))
      if (candidates.length > 0) {
        const { data: urlClashes } = await svc
          .from('jobs')
          .select('job_url')
          .in('job_url', candidates.map(c => c.jobUrl))
        const takenUrls = new Set((urlClashes || []).map(r => r.job_url))
        candidates = candidates.filter(c => !takenUrls.has(c.jobUrl)).slice(0, Math.max(0, budget))
      }
      report.fresh = candidates.length
      budget -= candidates.length

      if (candidates.length > 0) {
        const classifications = await classifyPostings(source.company, candidates)
        const rows = classifications
          .filter(c => c.keep && candidates[c.i])
          .map(c => ({
            source_id: source.id,
            external_id: candidates[c.i].externalId,
            company: source.company,
            role: candidates[c.i].role,
            location: candidates[c.i].location,
            job_url: candidates[c.i].jobUrl,
            jd_summary: c.jd_summary || null,
            domain: c.domain || 'other',
            status: 'pending',
            posted_at: candidates[c.i].postedAt,
          }))
        if (rows.length > 0) {
          await svc.from('jobs').upsert(rows, { onConflict: 'job_url', ignoreDuplicates: true })
          report.kept = rows.length
        }
      }

      // expiry: only safe because the fetch succeeded
      const goneIds = (existing || [])
        .filter(j => j.status === 'published' && j.external_id && !feedIds.has(j.external_id))
        .map(j => j.external_id)
      if (goneIds.length > 0) {
        await svc.from('jobs').update({ status: 'expired' }).eq('source_id', source.id).in('external_id', goneIds)
        report.expired = goneIds.length
      }

      await svc.from('job_sources').update({ last_synced_at: new Date().toISOString() }).eq('id', source.id)
    } catch (e) {
      report.error = e instanceof Error ? e.message : 'unknown error'
    }
  }

  return reports
}

export interface ExtractedJob {
  company: string | null
  role: string | null
  location: string | null
  jd_summary: string | null
  domain: JobDomain
}

// Admin manual-add: same page-fetch recipe as the tracker extract route, but
// unmetered and service-side (admin is not a tracker user).
export async function extractJobFromContent(url: string | null, text: string | null): Promise<ExtractedJob | null> {
  let content = text
  if (!content && url) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
      })
      clearTimeout(timer)
      if (!res.ok) return null
      const html = await res.text()
      content = html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (content.length < 200) return null
    } catch {
      return null
    }
  }
  if (!content) return null

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: `You extract structured job data from a posting. Return ONLY valid JSON, no markdown fences:
{"company": <string or null>, "role": <string or null>, "location": <string or null>, "jd_summary": <string max 30 words>, "domain": <"consulting"|"finance"|"marketing"|"bd"|"operations"|"founders_office"|"other">}`,
      messages: [{ role: 'user', content: `${url ? `Job URL: ${url}\n\n` : ''}${content.slice(0, 8000)}` }],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    return parseClaudeJson(raw)
  } catch {
    return null
  }
}

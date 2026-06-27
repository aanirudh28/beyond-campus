export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { fetchAtsPostings, syncSources, extractJobFromContent, JobSourceRow } from '@/lib/jobs'

const ADMIN_PASSWORD = 'beyondcampus2024'
// Limited intern password — can add/review jobs only, never sees the rest of /admin.
const INTERN_PASSWORD = 'bcjobs2026'
// Actions reserved for the founder (pull from ATS APIs / spend AI tokens).
const ADMIN_ONLY_ACTIONS = ['add_source', 'toggle_source', 'sync_now']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const isAdmin = body.password === ADMIN_PASSWORD
    const isIntern = body.password === INTERN_PASSWORD
    if (!isAdmin && !isIntern) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAdmin && ADMIN_ONLY_ACTIONS.includes(body.action)) {
      return NextResponse.json({ error: 'This action needs the founder login.' }, { status: 403 })
    }
    const svc = serviceClient()

    switch (body.action) {
      case 'overview': {
        const [{ data: sources }, { data: pending }, { data: published }, expiredCount] = await Promise.all([
          svc.from('job_sources').select('*').order('company'),
          svc.from('jobs').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
          svc.from('jobs').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(100),
          svc.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'expired').then(r => r.count || 0),
        ])
        return NextResponse.json({
          sources: sources || [],
          pending: pending || [],
          published: published || [],
          counts: { pending: pending?.length || 0, published: published?.length || 0, expired: expiredCount },
        })
      }

      case 'add_source': {
        const { company, ats, slug } = body
        if (!company || !ats || !slug) return NextResponse.json({ error: 'company, ats, slug required' }, { status: 400 })
        // test-fetch first so bad slugs are caught immediately
        const probe = await fetchAtsPostings({ id: '', company, ats, slug: slug.trim(), active: true, last_synced_at: null } as JobSourceRow)
        if (probe === null) {
          return NextResponse.json({ error: `Could not fetch the ${ats} board for slug "${slug}". Check the slug.` }, { status: 422 })
        }
        const { data, error } = await svc.from('job_sources').insert({ company: company.trim(), ats, slug: slug.trim() }).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 409 })
        return NextResponse.json({ source: data, postingCount: probe.length })
      }

      case 'toggle_source': {
        await svc.from('job_sources').update({ active: body.active }).eq('id', body.id)
        return NextResponse.json({ ok: true })
      }

      case 'sync_now': {
        const report = await syncSources({ maxSources: 10, maxNewPostings: 40 })
        return NextResponse.json({ report })
      }

      case 'approve': {
        await svc.from('jobs').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', body.id)
        return NextResponse.json({ ok: true })
      }

      case 'reject': {
        await svc.from('jobs').update({ status: 'rejected' }).eq('id', body.id)
        return NextResponse.json({ ok: true })
      }

      case 'expire': {
        await svc.from('jobs').update({ status: 'expired' }).eq('id', body.id)
        return NextResponse.json({ ok: true })
      }

      case 'extract': {
        const extracted = await extractJobFromContent(body.url || null, body.text || null)
        if (!extracted) return NextResponse.json({ error: 'Could not extract — paste the JD text instead.' }, { status: 422 })
        return NextResponse.json(extracted)
      }

      case 'manual_add': {
        const { company, role, location, job_url, jd_summary, domain, publish } = body
        if (!company || !role || !job_url) return NextResponse.json({ error: 'company, role, job_url required' }, { status: 400 })
        const { data, error } = await svc.from('jobs').insert({
          source_id: null,
          company: company.trim(),
          role: role.trim(),
          location: location?.trim() || null,
          job_url: job_url.trim(),
          jd_summary: jd_summary?.trim() || null,
          domain: domain || 'other',
          status: publish ? 'published' : 'pending',
          published_at: publish ? new Date().toISOString() : null,
        }).select().single()
        if (error) {
          const dup = error.message.includes('duplicate') || error.code === '23505'
          return NextResponse.json({ error: dup ? 'That job URL is already on the board.' : error.message }, { status: dup ? 409 : 500 })
        }
        return NextResponse.json({ job: data })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin jobs error:', error)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}

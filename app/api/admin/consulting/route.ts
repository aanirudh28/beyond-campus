export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CASEBOOK_NAMES } from '@/lib/casebooks'

const ADMIN_PASSWORD = 'beyondcampus2024'

const DAILY_WINDOW = 30
const PAGE = 1000 // PostgREST's hard max-rows ceiling

// Walk .range() until a short page comes back. Needed anywhere we want actual
// rows rather than a count, because .limit(50000) does NOT defeat the 1000 cap.
async function fetchAllPages<T>(
  page: (from: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from)
    if (error || !data?.length) break
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}

// Bucket by IST day, not UTC — otherwise every evening's activity in India
// lands on the next day's bar and the chart reads 5.5 hours out of step.
const istDay = (iso: string) =>
  new Date(new Date(iso).getTime() + 5.5 * 3600000).toISOString().slice(0, 10)

// Dense day-by-day series across the whole window, so quiet days show up as
// real zeroes instead of silently collapsing the x-axis.
function dailySeries(
  downloads: { downloaded_at: string }[],
  leads: { created_at: string }[]
) {
  const dl: Record<string, number> = {}
  const ld: Record<string, number> = {}
  for (const r of downloads) dl[istDay(r.downloaded_at)] = (dl[istDay(r.downloaded_at)] || 0) + 1
  for (const r of leads) ld[istDay(r.created_at)] = (ld[istDay(r.created_at)] || 0) + 1

  const todayIst = istDay(new Date().toISOString())
  const out: { date: string; downloads: number; leads: number }[] = []
  for (let i = DAILY_WINDOW - 1; i >= 0; i--) {
    const d = new Date(`${todayIst}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, downloads: dl[key] || 0, leads: ld[key] || 0 })
  }
  return out
}

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const thirtyDaysAgo = new Date(Date.now() - DAILY_WINDOW * 86400000).toISOString()

    // NOTE: every count below is a server-side `exact` count with head:true —
    // never `rows.length`. PostgREST caps returned rows at 1000 no matter what
    // .limit() says, so tallying fetched rows silently under-reports once a
    // table passes 1000 (it read as "0 downloads" for five casebooks).
    const dl = () => svc.from('resource_downloads').select('*', { count: 'exact', head: true })
    const ld = () => svc.from('leads').select('*', { count: 'exact', head: true })

    const [
      totalDownloadsRes,
      downloads7dRes,
      totalLeadsRes,
      leads7dRes,
      { data: recentLeads },
      dlDaily,
      leadDaily,
      ...perResourceRes
    ] = await Promise.all([
      dl().in('resource_name', CASEBOOK_NAMES),
      dl().in('resource_name', CASEBOOK_NAMES).gte('downloaded_at', sevenDaysAgo),
      ld().in('resource', CASEBOOK_NAMES),
      ld().in('resource', CASEBOOK_NAMES).gte('created_at', sevenDaysAgo),
      svc.from('leads').select('email, resource, created_at').in('resource', CASEBOOK_NAMES).order('created_at', { ascending: false }).limit(25),
      // The daily series needs real timestamps, so it pages past the 1000 cap.
      fetchAllPages<{ downloaded_at: string }>(from =>
        svc.from('resource_downloads').select('downloaded_at')
          .in('resource_name', CASEBOOK_NAMES).gte('downloaded_at', thirtyDaysAgo)
          .order('downloaded_at', { ascending: true }).range(from, from + PAGE - 1)),
      fetchAllPages<{ created_at: string }>(from =>
        svc.from('leads').select('created_at')
          .in('resource', CASEBOOK_NAMES).gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true }).range(from, from + PAGE - 1)),
      ...CASEBOOK_NAMES.flatMap(name => [
        dl().eq('resource_name', name),
        ld().eq('resource', name),
      ]),
    ])

    const totalDownloads = totalDownloadsRes.count ?? 0
    const totalLeads = totalLeadsRes.count ?? 0

    return NextResponse.json({
      totalDownloads,
      downloads7d: downloads7dRes.count ?? 0,
      totalLeads,
      leads7d: leads7dRes.count ?? 0,
      captureRate: totalDownloads ? Math.round((totalLeads / totalDownloads) * 1000) / 10 : 0,
      daily: dailySeries(dlDaily, leadDaily),
      perResource: CASEBOOK_NAMES.map((name, i) => ({
        name,
        downloads: perResourceRes[i * 2].count ?? 0,
        leads: perResourceRes[i * 2 + 1].count ?? 0,
      })).sort((a, b) => b.downloads - a.downloads),
      recentLeads: recentLeads || [],
    })
  } catch (error) {
    console.error('Admin consulting error:', error)
    return NextResponse.json({ error: 'Failed to fetch casebook stats' }, { status: 500 })
  }
}

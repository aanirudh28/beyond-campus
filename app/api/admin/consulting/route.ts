export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CASEBOOK_NAMES } from '@/lib/casebooks'

const ADMIN_PASSWORD = 'beyondcampus2024'

const DAILY_WINDOW = 30

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

    const [
      { data: dlRows },
      { data: dlRows7d },
      { data: leadRows },
      { data: leadRows7d },
      { data: recentLeads },
      { data: dlDaily },
      { data: leadDaily },
    ] = await Promise.all([
      svc.from('resource_downloads').select('resource_name').in('resource_name', CASEBOOK_NAMES).limit(50000),
      svc.from('resource_downloads').select('resource_name').in('resource_name', CASEBOOK_NAMES).gte('downloaded_at', sevenDaysAgo).limit(50000),
      svc.from('leads').select('resource').in('resource', CASEBOOK_NAMES).limit(50000),
      svc.from('leads').select('resource').in('resource', CASEBOOK_NAMES).gte('created_at', sevenDaysAgo).limit(50000),
      svc.from('leads').select('email, resource, created_at').in('resource', CASEBOOK_NAMES).order('created_at', { ascending: false }).limit(25),
      svc.from('resource_downloads').select('downloaded_at').in('resource_name', CASEBOOK_NAMES).gte('downloaded_at', thirtyDaysAgo).limit(50000),
      svc.from('leads').select('created_at').in('resource', CASEBOOK_NAMES).gte('created_at', thirtyDaysAgo).limit(50000),
    ])

    // Per-resource tally, seeded so every casebook shows even at zero.
    const perResource: Record<string, { downloads: number; leads: number }> = {}
    for (const name of CASEBOOK_NAMES) perResource[name] = { downloads: 0, leads: 0 }
    for (const r of dlRows || []) if (perResource[r.resource_name]) perResource[r.resource_name].downloads++
    for (const r of leadRows || []) if (perResource[r.resource]) perResource[r.resource].leads++

    const totalDownloads = (dlRows || []).length
    const totalLeads = (leadRows || []).length

    return NextResponse.json({
      totalDownloads,
      downloads7d: (dlRows7d || []).length,
      totalLeads,
      leads7d: (leadRows7d || []).length,
      captureRate: totalDownloads ? Math.round((totalLeads / totalDownloads) * 1000) / 10 : 0,
      daily: dailySeries(dlDaily || [], leadDaily || []),
      perResource: CASEBOOK_NAMES.map(name => ({
        name,
        downloads: perResource[name].downloads,
        leads: perResource[name].leads,
      })).sort((a, b) => b.downloads - a.downloads),
      recentLeads: recentLeads || [],
    })
  } catch (error) {
    console.error('Admin consulting error:', error)
    return NextResponse.json({ error: 'Failed to fetch casebook stats' }, { status: 500 })
  }
}

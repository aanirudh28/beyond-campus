export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { CASEBOOK_NAMES } from '@/lib/casebooks'

const ADMIN_PASSWORD = 'beyondcampus2024'

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

    const [
      { data: dlRows },
      { data: dlRows7d },
      { data: leadRows },
      { data: leadRows7d },
      { data: recentLeads },
    ] = await Promise.all([
      svc.from('resource_downloads').select('resource_name').in('resource_name', CASEBOOK_NAMES).limit(50000),
      svc.from('resource_downloads').select('resource_name').in('resource_name', CASEBOOK_NAMES).gte('downloaded_at', sevenDaysAgo).limit(50000),
      svc.from('leads').select('resource').in('resource', CASEBOOK_NAMES).limit(50000),
      svc.from('leads').select('resource').in('resource', CASEBOOK_NAMES).gte('created_at', sevenDaysAgo).limit(50000),
      svc.from('leads').select('email, resource, created_at').in('resource', CASEBOOK_NAMES).order('created_at', { ascending: false }).limit(25),
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

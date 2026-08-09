export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'beyondcampus2024'
const LANES = ['big4', 'banking', 'fmcg', 'any', 'mba']

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
    const count = (q: PromiseLike<{ count: number | null }>) => q.then(r => r.count || 0)

    const [
      { data: profiles },
      { data: trackerRows },
      { data: setRows },
      totalAttempts, correctAttempts, attempts7d,
    ] = await Promise.all([
      svc.from('apti_profiles').select('user_id, email, lane, streak, whatsapp_optin, ratings, created_at').limit(100000),
      svc.from('tracker_profiles').select('user_id').limit(100000),
      svc.from('apti_daily_sets').select('user_id, completed_at').not('completed_at', 'is', null).limit(200000),
      count(svc.from('apti_attempts').select('id', { count: 'exact', head: true })),
      count(svc.from('apti_attempts').select('id', { count: 'exact', head: true }).eq('correct', true)),
      count(svc.from('apti_attempts').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo)),
    ])

    const profs = profiles || []
    const aptiIds = new Set(profs.map(p => p.user_id))
    const trackerIds = new Set((trackerRows || []).map(t => t.user_id))

    // Shared-login answer: who is here for what
    let both = 0
    for (const id of aptiIds) if (trackerIds.has(id)) both++
    const overlap = {
      aptiTotal: aptiIds.size,
      trackerTotal: trackerIds.size,
      both,
      aptiOnly: aptiIds.size - both,
      trackerOnly: trackerIds.size - both,
    }

    // Engagement from completed daily sets
    const activated = new Set<string>()      // ever completed ≥1 set
    const active7d = new Set<string>()        // completed a set in last 7d
    let sets7d = 0
    for (const s of setRows || []) {
      activated.add(s.user_id)
      if (s.completed_at && s.completed_at >= sevenDaysAgo) { active7d.add(s.user_id); sets7d++ }
    }

    // Profile-derived metrics
    let newUsers7d = 0, whatsappOptins = 0, onStreak = 0
    const laneBreakdown: Record<string, number> = Object.fromEntries([...LANES, 'unset'].map(l => [l, 0]))
    for (const p of profs) {
      if (p.created_at >= sevenDaysAgo) newUsers7d++
      if (p.whatsapp_optin) whatsappOptins++
      if ((p.streak || 0) > 0) onStreak++
      const lane = p.lane && LANES.includes(p.lane) ? p.lane : 'unset'
      laneBreakdown[lane]++
    }

    const topRating = (ratings: unknown) => {
      if (!ratings || typeof ratings !== 'object') return null
      const vals = Object.values(ratings as Record<string, number>).filter(v => typeof v === 'number')
      return vals.length ? Math.max(...vals) : null
    }

    const recentUsers = [...profs]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 50)
      .map(p => ({
        email: p.email,
        lane: p.lane || null,
        streak: p.streak || 0,
        topRating: topRating(p.ratings),
        alsoTracker: trackerIds.has(p.user_id),
        created_at: p.created_at,
      }))

    return NextResponse.json({
      totalUsers: aptiIds.size,
      newUsers7d,
      activatedUsers: activated.size,
      activeUsers7d: active7d.size,
      totalSets: (setRows || []).length,
      sets7d,
      totalAttempts,
      accuracy: totalAttempts ? Math.round((correctAttempts / totalAttempts) * 1000) / 10 : 0,
      attempts7d,
      onStreak,
      whatsappOptins,
      overlap,
      laneBreakdown,
      recentUsers,
    })
  } catch (error) {
    console.error('Admin apti-users error:', error)
    return NextResponse.json({ error: 'Failed to fetch apti user stats' }, { status: 500 })
  }
}

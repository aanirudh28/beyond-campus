export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'beyondcampus2024'
const STATUSES = ['saved', 'applied', 'replied', 'interview', 'offer', 'rejected']

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
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const count = (q: PromiseLike<{ count: number | null }>) => q.then(r => r.count || 0)

    const [
      totalUsers, newUsers7d, proUsers,
      totalApps, newApps7d,
      aiThisMonth, nurtureSent, nurtureSent7d, optouts,
      { data: statusRows }, { data: activeRows }, { data: recentUsers },
    ] = await Promise.all([
      count(svc.from('tracker_profiles').select('user_id', { count: 'exact', head: true })),
      count(svc.from('tracker_profiles').select('user_id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo)),
      count(svc.from('tracker_profiles').select('user_id', { count: 'exact', head: true }).eq('is_pro', true)),
      count(svc.from('applications').select('id', { count: 'exact', head: true })),
      count(svc.from('applications').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo)),
      count(svc.from('ai_generations').select('id', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString())),
      count(svc.from('nurture_sends').select('id', { count: 'exact', head: true })),
      count(svc.from('nurture_sends').select('id', { count: 'exact', head: true }).gte('sent_at', sevenDaysAgo)),
      count(svc.from('nurture_optouts').select('email', { count: 'exact', head: true })),
      svc.from('applications').select('status').limit(20000),
      svc.from('applications').select('user_id').gte('updated_at', sevenDaysAgo).limit(20000),
      svc.from('tracker_profiles').select('email, name, is_pro, created_at').order('created_at', { ascending: false }).limit(50),
    ])

    const byStatus: Record<string, number> = Object.fromEntries(STATUSES.map(s => [s, 0]))
    for (const row of statusRows || []) byStatus[row.status] = (byStatus[row.status] || 0) + 1

    const activeUsers7d = new Set((activeRows || []).map(r => r.user_id)).size

    return NextResponse.json({
      totalUsers,
      newUsers7d,
      proUsers,
      activeUsers7d,
      totalApps,
      newApps7d,
      byStatus,
      aiThisMonth,
      nurtureSent,
      nurtureSent7d,
      optouts,
      recentUsers: recentUsers || [],
    })
  } catch (error) {
    console.error('Admin tracker error:', error)
    return NextResponse.json({ error: 'Failed to fetch tracker stats' }, { status: 500 })
  }
}

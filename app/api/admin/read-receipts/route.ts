export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'beyondcampus2024'
const DAY = 86400000

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

    const [{ data: msgs }, { data: opens }] = await Promise.all([
      svc.from('rr_messages').select('tracking_id, label, subject, owner_email, user_id, created_at').order('created_at', { ascending: false }).limit(10000),
      svc.from('rr_opens').select('tracking_id, opened_at').limit(100000),
    ])

    const messages = msgs || []
    const sevenAgo = Date.now() - 7 * DAY

    // Tally opens per tracking_id.
    const byTracking: Record<string, { count: number; last: string }> = {}
    let opens7d = 0
    for (const o of opens || []) {
      const t = byTracking[o.tracking_id]
      if (!t) byTracking[o.tracking_id] = { count: 1, last: o.opened_at }
      else { t.count++; if (o.opened_at > t.last) t.last = o.opened_at }
      if (new Date(o.opened_at).getTime() >= sevenAgo) opens7d++
    }

    const users = new Set<string>()
    const activeUsers7d = new Set<string>()
    const byUser: Record<string, { email: string | null; tracked: number; opened: number }> = {}
    let tracked7d = 0
    let messagesOpened = 0

    for (const m of messages) {
      users.add(m.user_id)
      const created = new Date(m.created_at).getTime()
      if (created >= sevenAgo) { tracked7d++; activeUsers7d.add(m.user_id) }
      const op = byTracking[m.tracking_id]
      if (op) messagesOpened++
      const u = (byUser[m.user_id] ||= { email: m.owner_email, tracked: 0, opened: 0 })
      u.tracked++
      if (op) u.opened++
    }

    // Emails that are actually being opened, most recently opened first.
    const opened = messages
      .filter(m => byTracking[m.tracking_id])
      .map(m => ({
        label: m.label,
        subject: m.subject,
        owner_email: m.owner_email,
        opens: byTracking[m.tracking_id].count,
        lastOpened: byTracking[m.tracking_id].last,
        created_at: m.created_at,
      }))
      .sort((a, b) => (a.lastOpened < b.lastOpened ? 1 : -1))
      .slice(0, 100)

    const topUsers = Object.values(byUser)
      .sort((a, b) => b.tracked - a.tracked)
      .slice(0, 20)

    return NextResponse.json({
      totalUsers: users.size,
      activeUsers7d: activeUsers7d.size,
      totalTracked: messages.length,
      tracked7d,
      totalOpens: (opens || []).length,
      opens7d,
      openRate: messages.length ? Math.round((messagesOpened / messages.length) * 1000) / 10 : 0,
      opened,
      topUsers,
    })
  } catch (error) {
    console.error('Admin read-receipts error:', error)
    return NextResponse.json({ error: 'Failed to fetch read-receipts stats' }, { status: 500 })
  }
}

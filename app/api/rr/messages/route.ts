export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()

  // Free for now — no entitlement gate.
  const { data: msgs } = await svc
    .from('rr_messages')
    .select('id, tracking_id, label, subject, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(500)

  const messages = msgs || []
  const ids = messages.map(m => m.tracking_id)

  // Pull opens for this user's messages, then tally per tracking_id in JS.
  const opensByTracking: Record<string, { count: number; last: string }> = {}
  if (ids.length) {
    const { data: opens } = await svc
      .from('rr_opens')
      .select('tracking_id, opened_at')
      .in('tracking_id', ids)
      .order('opened_at', { ascending: false })
      .limit(20000)
    for (const o of opens || []) {
      const t = opensByTracking[o.tracking_id]
      if (!t) opensByTracking[o.tracking_id] = { count: 1, last: o.opened_at }
      else t.count++
    }
  }

  return NextResponse.json({
    entitled: true,
    messages: messages.map(m => ({
      id: m.id,
      label: m.label,
      subject: m.subject,
      created_at: m.created_at,
      opens: opensByTracking[m.tracking_id]?.count || 0,
      lastOpened: opensByTracking[m.tracking_id]?.last || null,
    })),
  })
}

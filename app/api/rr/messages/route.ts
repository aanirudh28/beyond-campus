export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

const DAY = 86400000

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()

  const [{ data: msgs }, { data: pref }] = await Promise.all([
    svc.from('rr_messages')
      .select('id, tracking_id, label, subject, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
    svc.from('rr_prefs').select('email_alerts, followups').eq('user_id', user.id).maybeSingle(),
  ])

  const messages = msgs || []
  const ids = messages.map(m => m.tracking_id)

  // Every open for this user's messages, newest first, grouped per tracking_id.
  const opensBy: Record<string, { opened_at: string; client: string | null; city: string | null }[]> = {}
  if (ids.length) {
    const { data: opens } = await svc
      .from('rr_opens')
      .select('tracking_id, opened_at, client, city')
      .in('tracking_id', ids)
      .or('event_type.is.null,event_type.eq.open') // genuine opens only (self/bot excluded)
      .order('opened_at', { ascending: false })
      .limit(20000)
    for (const o of opens || []) {
      (opensBy[o.tracking_id] ||= []).push({ opened_at: o.opened_at, client: o.client, city: o.city })
    }
  }

  const now = Date.now()
  return NextResponse.json({
    entitled: true,
    prefs: { email_alerts: pref?.email_alerts !== false, followups: pref?.followups !== false },
    messages: messages.map(m => {
      const tl = opensBy[m.tracking_id] || []
      const ageDays = (now - new Date(m.created_at).getTime()) / DAY
      // A hint for the UI's follow-up highlight.
      const status = tl.length > 0
        ? (ageDays >= 3 ? 'follow_up' : 'opened')
        : (ageDays >= 2 ? 'no_open' : 'waiting')
      return {
        id: m.id,
        label: m.label,
        subject: m.subject,
        created_at: m.created_at,
        opens: tl.length,
        lastOpened: tl[0]?.opened_at || null,
        status,
        timeline: tl.slice(0, 12),
      }
    }),
  })
}

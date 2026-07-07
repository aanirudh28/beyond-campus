export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

// Client-side product events (doc 06 §3). apti_events has no client insert
// policy, so browser code funnels through here. Server-generated events
// (tutor use, grading milestones) insert directly in their own routes.
const ALLOWED_EVENTS = [
  'share_card_generated',
  'cohort_cta_clicked',
  'paywall_viewed',
  'question_flagged',
]
const MAX_PROPS_BYTES = 1024

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; props?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (!body.name || !ALLOWED_EVENTS.includes(body.name)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
  }
  const props = body.props && typeof body.props === 'object' ? body.props : {}
  if (JSON.stringify(props).length > MAX_PROPS_BYTES) {
    return NextResponse.json({ error: 'Props too large' }, { status: 400 })
  }

  await serviceClient().from('apti_events').insert({
    user_id: user.id,
    name: body.name,
    props,
  })
  return NextResponse.json({ ok: true })
}

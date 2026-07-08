export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { istDateString } from '@/lib/apti-engine'

// One poke a day per circle. We don't message anyone directly (no WhatsApp API);
// we hand back a ready nudge line the poker drops into their own group chat.
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { circleId?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
  if (!body.circleId) return NextResponse.json({ error: 'Missing circle' }, { status: 400 })

  const svc = serviceClient()
  const { data: membership } = await svc.from('apti_circle_members')
    .select('display_name, last_poke_at').eq('circle_id', body.circleId).eq('user_id', user.id).maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 404 })

  const today = istDateString()
  if (membership.last_poke_at && istDateString(new Date(membership.last_poke_at)) === today) {
    return NextResponse.json({ error: 'You already poked today — one a day keeps it friendly' }, { status: 429 })
  }

  const { data: circle } = await svc.from('apti_circles').select('name').eq('id', body.circleId).single()

  await Promise.all([
    svc.from('apti_circle_members').update({ last_poke_at: new Date().toISOString() })
      .eq('circle_id', body.circleId).eq('user_id', user.id),
    svc.from('apti_circle_pokes').insert({ circle_id: body.circleId, from_user: user.id }),
  ])

  const shareText = `${membership.display_name} poked ${circle?.name ?? 'the circle'} 👊 Have you done today's Apti set yet? 12 minutes. https://www.beyond-campus.in/practice`
  return NextResponse.json({ ok: true, shareText })
}

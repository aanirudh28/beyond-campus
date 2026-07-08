export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { MAX_MEMBERS, MAX_CIRCLES } from '@/lib/apti-circles'

// Join a circle by its invite code (WhatsApp-shared).
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { code?: string; displayName?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const code = (body.code ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const displayName = (typeof body.displayName === 'string' ? body.displayName.trim().replace(/\s+/g, ' ') : '')
    .slice(0, 24) || (user.email ?? 'You').split('@')[0].slice(0, 24)
  if (code.length !== 6) return NextResponse.json({ error: 'That code does not look right' }, { status: 400 })

  const svc = serviceClient()
  const { data: circle } = await svc.from('apti_circles').select('id, name').eq('invite_code', code).maybeSingle()
  if (!circle) return NextResponse.json({ error: 'No circle found for that code' }, { status: 404 })

  const [{ data: existing }, { count: memberCount }, { count: myCircles }] = await Promise.all([
    svc.from('apti_circle_members').select('user_id').eq('circle_id', circle.id).eq('user_id', user.id).maybeSingle(),
    svc.from('apti_circle_members').select('user_id', { count: 'exact', head: true }).eq('circle_id', circle.id),
    svc.from('apti_circle_members').select('circle_id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])
  if (existing) return NextResponse.json({ ok: true, circleId: circle.id }) // already in — idempotent
  if ((memberCount ?? 0) >= MAX_MEMBERS) return NextResponse.json({ error: 'This circle is full' }, { status: 409 })
  if ((myCircles ?? 0) >= MAX_CIRCLES) return NextResponse.json({ error: `You're in the max of ${MAX_CIRCLES} circles already` }, { status: 409 })

  await svc.from('apti_circle_members').insert({ circle_id: circle.id, user_id: user.id, display_name: displayName })
  return NextResponse.json({ ok: true, circleId: circle.id, name: circle.name })
}

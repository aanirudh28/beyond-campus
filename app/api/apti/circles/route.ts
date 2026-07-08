export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { loadCirclesForUser, generateInviteCode, MAX_CIRCLES } from '@/lib/apti-circles'

const cleanName = (s: unknown, max: number) =>
  typeof s === 'string' ? s.trim().replace(/\s+/g, ' ').slice(0, max) : ''

// GET: the caller's circles with live scoreboards.
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const circles = await loadCirclesForUser(user.id)
    return NextResponse.json({ circles })
  } catch {
    // table not created yet → feature simply stays empty
    return NextResponse.json({ circles: [], unavailable: true })
  }
}

// POST: create a circle and join it as the first member.
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; displayName?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const name = cleanName(body.name, 40)
  const displayName = cleanName(body.displayName, 24) || (user.email ?? 'You').split('@')[0].slice(0, 24)
  if (!name) return NextResponse.json({ error: 'Give your circle a name' }, { status: 400 })

  const svc = serviceClient()
  const { count } = await svc.from('apti_circle_members')
    .select('circle_id', { count: 'exact', head: true }).eq('user_id', user.id)
  if ((count ?? 0) >= MAX_CIRCLES) {
    return NextResponse.json({ error: `You're in the max of ${MAX_CIRCLES} circles already` }, { status: 409 })
  }

  // create with a unique code (retry the rare collision)
  let circleId: string | null = null
  for (let attempt = 0; attempt < 5 && !circleId; attempt++) {
    const { data, error } = await svc.from('apti_circles')
      .insert({ name, invite_code: generateInviteCode(), created_by: user.id })
      .select('id').single()
    if (!error && data) circleId = data.id
    else if (error && error.code !== '23505') {
      return NextResponse.json({ error: 'Could not create the circle' }, { status: 500 })
    }
  }
  if (!circleId) return NextResponse.json({ error: 'Could not create the circle' }, { status: 500 })

  await svc.from('apti_circle_members').insert({ circle_id: circleId, user_id: user.id, display_name: displayName })
  return NextResponse.json({ ok: true, circleId })
}

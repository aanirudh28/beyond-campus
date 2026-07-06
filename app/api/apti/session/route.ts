export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/tracker'
import { buildTopicSession, buildReviewSession } from '@/lib/apti'

// Starts an on-demand practice session (beyond the daily set):
//   { kind: 'topic', skillId } — 8 flow-band questions on one skill
//   { kind: 'review' }         — clear the due redemption backlog
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { kind?: string; skillId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  if (body.kind === 'topic') {
    if (!body.skillId) return NextResponse.json({ error: 'skillId required' }, { status: 400 })
    const set = await buildTopicSession(user.id, body.skillId)
    if ('error' in set) return NextResponse.json({ error: set.error }, { status: 409 })
    return NextResponse.json({ setId: set.id })
  }
  if (body.kind === 'review') {
    const set = await buildReviewSession(user.id)
    if ('error' in set) return NextResponse.json({ error: set.error }, { status: 409 })
    return NextResponse.json({ setId: set.id })
  }
  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

const ERROR_TYPES = ['concept', 'calc', 'misread', 'trap', 'time']

// The one-tap "What happened?" after a wrong answer. Tags the attempt and the
// question's live redemption card (the tag modulates its return intervals).
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { attemptId?: number; errorType?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (!body.attemptId || !ERROR_TYPES.includes(body.errorType ?? '')) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const svc = serviceClient()
  const { data: attempt } = await svc
    .from('apti_attempts').select('id, user_id, question_id')
    .eq('id', body.attemptId).single()
  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
  }

  await Promise.all([
    svc.from('apti_attempts').update({ error_type: body.errorType }).eq('id', attempt.id),
    svc.from('apti_review_cards')
      .update({ error_type: body.errorType })
      .eq('user_id', user.id)
      .eq('question_id', attempt.question_id)
      .eq('redeemed', false),
  ])

  return NextResponse.json({ ok: true })
}

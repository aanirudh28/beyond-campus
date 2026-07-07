export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { gradeMockAttempt, type MockSectionRow } from '@/lib/apti-mocks'

// Grades a whole mock in one shot (test realism: no feedback until now).
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { attemptId?: string; answers?: Record<string, string>; perQSeconds?: Record<string, number> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (!body.attemptId) return NextResponse.json({ error: 'Missing attemptId' }, { status: 400 })

  const svc = serviceClient()
  const { data: attempt } = await svc.from('apti_mock_attempts')
    .select('*').eq('id', body.attemptId).maybeSingle()
  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (attempt.submitted_at) {
    return NextResponse.json({ report: attempt.report, score: attempt.score, maxScore: attempt.max_score })
  }

  const report = await gradeMockAttempt(
    user.id,
    { id: attempt.id, sections: attempt.sections as MockSectionRow[], deadline_at: attempt.deadline_at },
    body.answers ?? {},
    body.perQSeconds ?? {},
  )

  await svc.from('apti_mock_attempts').update({
    answers: body.answers ?? {},
    per_q_seconds: body.perQSeconds ?? {},
    score: report.score,
    max_score: report.maxScore,
    section_scores: report.sections,
    report,
    submitted_at: new Date().toISOString(),
  }).eq('id', attempt.id)

  return NextResponse.json({ report, score: report.score, maxScore: report.maxScore })
}

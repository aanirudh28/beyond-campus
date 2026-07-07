export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { loadCurriculum, loadSetQuestions, clientSafeQuestion } from '@/lib/apti'
import { blueprintBySlug, type MockSectionRow } from '@/lib/apti-mocks'

// Loads one owned mock attempt. Before submission: stems/options only, no
// answers anywhere near the wire. After submission: the report.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const svc = serviceClient()
  const { data: attempt } = await svc.from('apti_mock_attempts').select('*').eq('id', id).maybeSingle()
  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const blueprint = blueprintBySlug(attempt.blueprint_slug)
  const base = {
    id: attempt.id,
    kind: attempt.kind,
    name: blueprint?.name ?? attempt.blueprint_slug,
    startedAt: attempt.started_at,
    deadlineAt: attempt.deadline_at,
    submittedAt: attempt.submitted_at,
  }

  if (attempt.submitted_at) {
    return NextResponse.json({ ...base, report: attempt.report, score: attempt.score, maxScore: attempt.max_score })
  }

  const sections = attempt.sections as MockSectionRow[]
  const ids = sections.flatMap((s) => s.question_ids)
  const [questions, curriculum] = await Promise.all([loadSetQuestions(ids), loadCurriculum()])
  const safe = new Map(questions.map((q) => [q.id, clientSafeQuestion(q, curriculum)]))
  return NextResponse.json({
    ...base,
    sections: sections.map((s) => ({
      name: s.name,
      seconds: s.seconds,
      questions: s.question_ids.map((qid) => safe.get(qid)).filter(Boolean),
    })),
  })
}

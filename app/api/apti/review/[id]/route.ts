export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import {
  getOwnedSet, loadSetQuestions, loadCurriculum,
  type QuestionRow, type Curriculum,
} from '@/lib/apti'
import { blueprintBySlug, type MockSectionRow } from '@/lib/apti-mocks'

// Post-hoc review of already-graded work. The trust boundary stays intact:
// solutions leave the server only for questions whose grading is done —
// attempted questions in a practice set, everything in a SUBMITTED mock.
// (An unsubmitted mock 404s here; its answers must never ship early.)

interface ReviewItem {
  questionId: string
  index: number
  section: string | null
  skillName: string
  domain: string
  type: string
  stemMd: string
  options: { key: string; text: string }[]
  answerKeys: string[] | null
  answerValue: number | null
  tolerance: number | null
  chosenKey: string | null
  chosenValue: number | null
  status: 'correct' | 'wrong' | 'skipped'
  timeMs: number | null
  benchmarkSec: number
  confidence: string | null
  assisted: boolean
  errorType: string | null
  trapExplanation: string | null
  solutionMd: string
  shortcutMd: string | null
  ratingDelta: number | null
}

function baseItem(q: QuestionRow, curriculum: Curriculum) {
  const skill = curriculum.skillById.get(q.skill_id)
  return {
    questionId: q.id,
    type: q.type,
    stemMd: q.payload.stem_md,
    options: (q.payload.options ?? []).map((o) => ({ key: o.key, text: o.text })),
    answerKeys: q.payload.answer.keys ?? null,
    answerValue: q.payload.answer.value ?? null,
    tolerance: q.payload.answer.tolerance ?? null,
    solutionMd: q.payload.solution_md,
    shortcutMd: q.payload.shortcut_md ?? null,
    benchmarkSec: q.time_benchmark_sec,
    skillName: skill?.name ?? '',
    domain: curriculum.domainOfSkill(q.skill_id),
  }
}

function trapExplanationFor(q: QuestionRow, chosenKey: string | null): string | null {
  if (!chosenKey) return null
  const opt = (q.payload.options ?? []).find((o) => o.key === chosenKey)
  return opt?.trap ? q.payload.trap_explanations?.[opt.trap] ?? null : null
}

interface AttemptRow {
  question_id: string
  correct: boolean
  chosen: { key?: string | null; value?: number | null } | null
  time_ms: number
  confidence: string | null
  assisted: boolean
  error_type: string | null
  rating_before: number | null
  rating_after: number | null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const scope = new URL(request.url).searchParams.get('type') === 'mock' ? 'mock' : 'set'
  const svc = serviceClient()

  if (scope === 'mock') {
    const { data: attempt } = await svc.from('apti_mock_attempts').select('*').eq('id', id).maybeSingle()
    if (!attempt || attempt.user_id !== user.id || !attempt.submitted_at) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const sections = attempt.sections as MockSectionRow[]
    const ids = sections.flatMap((s) => s.question_ids)
    const [questions, curriculum] = await Promise.all([loadSetQuestions(ids), loadCurriculum()])
    const byId = new Map(questions.map((q) => [q.id, q]))
    const answers = (attempt.answers ?? {}) as Record<string, string>
    const perQSeconds = (attempt.per_q_seconds ?? {}) as Record<string, number>

    let index = 0
    const items: ReviewItem[] = []
    for (const sec of sections) {
      for (const qid of sec.question_ids) {
        const q = byId.get(qid)
        if (!q) continue
        index++
        const chosen = answers[qid] ?? null
        // mirror gradeMockAttempt exactly: key membership, skipped ≠ wrong
        const correct = !!chosen && (q.payload.answer.keys ?? []).includes(chosen)
        items.push({
          ...baseItem(q, curriculum),
          index,
          section: sections.length > 1 ? sec.name : null,
          chosenKey: chosen,
          chosenValue: null,
          status: correct ? 'correct' : chosen ? 'wrong' : 'skipped',
          // mirror gradeMockAttempt's clamp on raw client-reported seconds
          timeMs: perQSeconds[qid] != null
            ? Math.round(Math.max(0, Math.min(perQSeconds[qid], 1800)) * 1000)
            : null,
          confidence: null,
          assisted: false,
          errorType: null,
          trapExplanation: correct ? null : trapExplanationFor(q, chosen),
          ratingDelta: null,
        })
      }
    }
    const blueprint = blueprintBySlug(attempt.blueprint_slug)
    return NextResponse.json({
      meta: {
        scope: 'mock',
        kind: attempt.kind,
        name: blueprint?.name ?? attempt.blueprint_slug,
        date: attempt.submitted_at,
        completed: true,
        total: items.length,
        attempted: items.filter((i) => i.status !== 'skipped').length,
        correct: items.filter((i) => i.status === 'correct').length,
      },
      items,
    })
  }

  // ---- practice set (daily / topic / review / comeback) ----
  const set = await getOwnedSet(user.id, id)
  if (!set) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: attemptRows }, questions, curriculum] = await Promise.all([
    svc.from('apti_attempts')
      .select('question_id, correct, chosen, time_ms, confidence, assisted, error_type, rating_before, rating_after')
      .eq('user_id', user.id).eq('set_id', set.id)
      .order('created_at', { ascending: true }),
    loadSetQuestions(set.question_ids),
    loadCurriculum(),
  ])

  // one attempt per question (cursor enforces it); keep the first on the
  // off chance a network retry double-wrote
  const attemptByQ = new Map<string, AttemptRow>()
  for (const a of (attemptRows ?? []) as AttemptRow[]) {
    if (!attemptByQ.has(a.question_id)) attemptByQ.set(a.question_id, a)
  }
  const questionById = new Map(questions.map((q) => [q.id, q]))

  const items: ReviewItem[] = []
  set.question_ids.forEach((qid, i) => {
    const attempt = attemptByQ.get(qid)
    const q = questionById.get(qid)
    if (!attempt || !q) return // unanswered → solution stays server-side
    const chosenKey = attempt.chosen?.key ?? null
    items.push({
      ...baseItem(q, curriculum),
      index: i + 1,
      section: null,
      chosenKey,
      chosenValue: attempt.chosen?.value ?? null,
      status: attempt.correct ? 'correct' : 'wrong',
      timeMs: attempt.time_ms,
      confidence: attempt.confidence,
      assisted: attempt.assisted,
      errorType: attempt.error_type,
      trapExplanation: attempt.correct ? null : trapExplanationFor(q, chosenKey),
      ratingDelta: attempt.rating_before != null && attempt.rating_after != null
        ? attempt.rating_after - attempt.rating_before
        : null,
    })
  })

  return NextResponse.json({
    meta: {
      scope: 'set',
      kind: set.kind,
      name: null,
      date: set.created_at,
      completed: !!set.completed_at,
      total: set.question_ids.length,
      attempted: items.length,
      correct: items.filter((i) => i.status === 'correct').length,
    },
    items,
  })
}

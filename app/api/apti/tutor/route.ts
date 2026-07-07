export const runtime = 'nodejs'
export const maxDuration = 60

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  getAuthedUser, serviceClient, syncProEntitlement, getAiUsage, FREE_AI_CAP,
} from '@/lib/tracker'
import { loadCurriculum, type QuestionRow } from '@/lib/apti'
import type { MockSectionRow } from '@/lib/apti-mocks'
import {
  buildTutorSystemPrompt, sanitizeTutorMessages,
  type TutorAttempt, type TutorQuestion,
} from '@/lib/apti-tutor'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-haiku-4-5-20251001' // same pin as the admin console

interface TutorBody {
  scope?: 'set' | 'mock'
  attemptId?: number
  mockId?: string
  questionId?: string
  messages?: unknown
}

// The AI Tutor (docs/aptitude/10): "explain this differently / where did MY
// reasoning go wrong", anchored to one already-graded attempt. Metering unit
// is one conversation per attempt, drawing on the same 5/month ai_generations
// pool as Tracker AI; the ₹299 pack (tracker Pro) makes it unlimited.
// Trust boundary: the question context is resolved server-side from the
// graded attempt — client text never selects or describes a question.
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: TutorBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const messages = sanitizeTutorMessages(body.messages)
  if (!messages) return NextResponse.json({ error: 'Bad conversation' }, { status: 400 })

  const svc = serviceClient()

  // ---- resolve the graded attempt + its question, server-side only ----
  let question: QuestionRow | null = null
  let attempt: TutorAttempt | null = null
  let ref: string

  if (body.scope === 'mock') {
    if (!body.mockId || !body.questionId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const { data: mock } = await svc
      .from('apti_mock_attempts').select('*').eq('id', body.mockId).maybeSingle()
    // unsubmitted mocks never reach the tutor — same rule as the review route
    if (!mock || mock.user_id !== user.id || !mock.submitted_at) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const inMock = (mock.sections as MockSectionRow[])
      .some((s) => s.question_ids.includes(body.questionId!))
    if (!inMock) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: q } = await svc
      .from('apti_questions').select('*').eq('id', body.questionId).single()
    if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    question = q as QuestionRow

    const chosen = ((mock.answers ?? {}) as Record<string, string>)[body.questionId] ?? null
    const seconds = ((mock.per_q_seconds ?? {}) as Record<string, number>)[body.questionId]
    attempt = {
      chosenKey: chosen,
      chosenValue: null,
      correct: !!chosen && (question.payload.answer.keys ?? []).includes(chosen),
      timeMs: seconds != null ? Math.round(Math.max(0, Math.min(seconds, 1800)) * 1000) : null,
      confidence: null,
      errorType: null,
      assisted: false,
    }
    ref = `mock:${body.mockId}:${body.questionId}`
  } else {
    if (typeof body.attemptId !== 'number') {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const { data: row } = await svc
      .from('apti_attempts').select('*').eq('id', body.attemptId).maybeSingle()
    if (!row || row.user_id !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: q } = await svc
      .from('apti_questions').select('*').eq('id', row.question_id).single()
    if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    question = q as QuestionRow
    attempt = {
      chosenKey: row.chosen?.key ?? null,
      chosenValue: row.chosen?.value ?? null,
      correct: row.correct,
      timeMs: row.time_ms,
      confidence: row.confidence,
      errorType: row.error_type,
      assisted: row.assisted,
    }
    ref = `set:${body.attemptId}`
  }

  // ---- metering: one conversation per attempt against the shared pool ----
  const unlimited = await syncProEntitlement(user.id, user.email ?? '')
  let used = 0
  if (!unlimited) {
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const [{ data: existing }, usage] = await Promise.all([
      svc.from('ai_generations').select('id')
        .eq('user_id', user.id).eq('kind', 'apti_tutor')
        .eq('output->>ref', ref)
        .gte('created_at', monthStart.toISOString())
        .limit(1),
      getAiUsage(user.id),
    ])
    used = usage
    const alreadyOpen = (existing ?? []).length > 0
    if (!alreadyOpen) {
      if (used >= FREE_AI_CAP) {
        return NextResponse.json(
          { error: 'quota', usage: { used, cap: FREE_AI_CAP, unlimited: false } },
          { status: 402 }
        )
      }
      await svc.from('ai_generations').insert({
        user_id: user.id,
        kind: 'apti_tutor',
        output: { ref, qid: question.id },
      })
      used++
    }
  }

  // ---- build prompt + call the model (non-streaming; Haiku is fast) ----
  const curriculum = await loadCurriculum()
  const skill = curriculum.skillById.get(question.skill_id)
  const tutorQuestion: TutorQuestion = {
    stemMd: question.payload.stem_md,
    options: (question.payload.options ?? []).map((o) => ({ key: o.key, text: o.text, trap: o.trap })),
    answerKeys: question.payload.answer.keys ?? null,
    answerValue: question.payload.answer.value ?? null,
    tolerance: question.payload.answer.tolerance ?? null,
    solutionMd: question.payload.solution_md,
    shortcutMd: question.payload.shortcut_md ?? null,
    trapExplanations: question.payload.trap_explanations ?? null,
    skillName: skill?.name ?? '',
    domain: curriculum.domainOfSkill(question.skill_id),
    benchmarkSec: question.time_benchmark_sec,
  }

  try {
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: buildTutorSystemPrompt(tutorQuestion, attempt),
      messages: messages.map((m) => ({ role: m.role, content: m.text })),
    })
    const reply = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // server-side event insert (doc 06); awaited — Vercel may freeze the
    // function right after the response, silently dropping stray writes
    await svc.from('apti_events').insert({
      user_id: user.id,
      name: 'ai_tutor_used',
      props: {
        qid: question.id,
        ref,
        turn: messages.filter((m) => m.role === 'user').length,
        quota_used: unlimited ? null : used,
      },
    })

    return NextResponse.json({
      reply,
      usage: { used, cap: FREE_AI_CAP, unlimited },
    })
  } catch {
    return NextResponse.json({ error: 'The tutor is briefly unavailable — try again.' }, { status: 502 })
  }
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import {
  loadCurriculum, rowToSkillState, recomputeDomainRating,
  type QuestionRow, type DailySetRow,
} from '@/lib/apti'
import {
  attemptScore, eloUpdate, pushWindow, computeMastery,
  nextCardState, nextStreak, istDateString,
  type Confidence, type SkillState,
} from '@/lib/apti-engine'

interface AnswerBody {
  setId: string
  questionId: string
  chosenKey?: string
  chosenValue?: number
  timeMs: number
  confidence?: Confidence
  assisted?: boolean
}

const CONFIDENCES = ['sure', 'thinkso', 'guessing']

// Grades one answer server-side and applies every state change: Elo (user
// skill + question), rolling windows, mastery, review cards, set cursor,
// streak on completion. Returns the full reveal payload.
export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: AnswerBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (!body.setId || !body.questionId || typeof body.timeMs !== 'number') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const timeMs = Math.max(500, Math.min(body.timeMs, 30 * 60_000)) // clamp junk timers
  const confidence = CONFIDENCES.includes(body.confidence ?? '') ? body.confidence : null
  const assisted = !!body.assisted

  const svc = serviceClient()

  // ---- validate the set + position ----
  const { data: setRow } = await svc
    .from('apti_daily_sets').select('*').eq('id', body.setId).single()
  const set = setRow as DailySetRow | null
  if (!set || set.user_id !== user.id) {
    return NextResponse.json({ error: 'Set not found' }, { status: 404 })
  }
  if (set.completed_at) {
    return NextResponse.json({ error: 'Set already completed' }, { status: 409 })
  }
  if (set.question_ids[set.cursor] !== body.questionId) {
    return NextResponse.json({ error: 'Out of order', expected: set.cursor }, { status: 409 })
  }

  const { data: qRow } = await svc
    .from('apti_questions').select('*').eq('id', body.questionId).single()
  const question = qRow as QuestionRow | null
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  // ---- grade ----
  const answer = question.payload.answer
  let correct = false
  let chosen: Record<string, unknown> = {}
  if (question.type === 'numeric') {
    const tol = answer.tolerance ?? 0
    correct = typeof body.chosenValue === 'number' &&
      typeof answer.value === 'number' &&
      Math.abs(body.chosenValue - answer.value) <= tol
    chosen = { value: body.chosenValue ?? null }
  } else {
    correct = !!body.chosenKey && (answer.keys ?? []).includes(body.chosenKey)
    chosen = { key: body.chosenKey ?? null }
  }

  // ---- skill state + Elo ----
  const curriculum = await loadCurriculum()
  const skill = curriculum.skillById.get(question.skill_id)
  if (!skill) return NextResponse.json({ error: 'Skill not found' }, { status: 500 })
  const domain = curriculum.domainOfSkill(question.skill_id)

  const { data: stateRow } = await svc
    .from('apti_skill_state').select('*')
    .eq('user_id', user.id).eq('skill_id', question.skill_id).maybeSingle()
  const state: SkillState = rowToSkillState(stateRow)
  const masteryBefore = state.mastery

  const score = attemptScore(correct, timeMs, question.time_benchmark_sec)
  // hinted answers never move ratings (mastery credit is halved instead)
  const { userDelta, questionDelta } = assisted
    ? { userDelta: 0, questionDelta: 0 }
    : eloUpdate({
        userRating: state.rating,
        userAttempts: state.attempts,
        questionRating: question.rating,
        questionAttempts: question.attempts,
        ratingLocked: question.rating_locked,
        score,
      })

  const nextState: SkillState = {
    rating: state.rating + userDelta,
    attempts: state.attempts + 1,
    correct: state.correct + (correct ? 1 : 0),
    rolling: pushWindow(state.rolling, correct ? (assisted ? 0.5 : 1) : 0),
    timesMs: pushWindow(state.timesMs, timeMs),
    mastery: state.mastery,
    probeStreak: state.probeStreak,
  }
  nextState.mastery = computeMastery(nextState, {
    benchmarkRating: skill.benchmark_rating,
    benchmarkSeconds: skill.benchmark_seconds,
  })

  await svc.from('apti_skill_state').upsert({
    user_id: user.id,
    skill_id: question.skill_id,
    rating: nextState.rating,
    attempts: nextState.attempts,
    correct: nextState.correct,
    rolling: nextState.rolling,
    times_ms: nextState.timesMs,
    mastery: nextState.mastery,
    probe_streak: nextState.probeStreak,
    last_practiced: new Date().toISOString(),
  }, { onConflict: 'user_id,skill_id' })

  await svc.from('apti_questions').update({
    rating: question.rating + questionDelta,
    attempts: question.attempts + 1,
    correct: question.correct + (correct ? 1 : 0),
  }).eq('id', question.id)

  // ---- attempt log ----
  const isReviewSlot = set.review_card_ids.length > 0 && set.cursor < 2
  const { data: attemptRow } = await svc.from('apti_attempts').insert({
    user_id: user.id,
    question_id: question.id,
    set_id: set.id,
    context: isReviewSlot ? 'review' : 'daily',
    correct,
    chosen,
    time_ms: timeMs,
    confidence,
    assisted,
    rating_before: state.rating,
    rating_after: nextState.rating,
  }).select('id').single()

  // ---- review cards ----
  let redemption: { isReview: boolean; redeemed: boolean } | null = null
  const { data: card } = await svc
    .from('apti_review_cards').select('*')
    .eq('user_id', user.id).eq('question_id', question.id).eq('redeemed', false)
    .maybeSingle()
  if (card) {
    const next = nextCardState(
      { intervalDays: Number(card.interval_days), correctStreak: card.correct_streak },
      correct,
      card.error_type
    )
    await svc.from('apti_review_cards').update({
      interval_days: next.intervalDays,
      correct_streak: next.correctStreak,
      redeemed: next.redeemed,
      due_at: new Date(Date.now() + next.intervalDays * 86_400_000).toISOString(),
    }).eq('id', card.id)
    redemption = { isReview: true, redeemed: next.redeemed }
  } else if (!correct) {
    // first miss on this question → it joins the redemption queue for tomorrow
    await svc.from('apti_review_cards').insert({
      user_id: user.id,
      question_id: question.id,
      skill_id: question.skill_id,
      interval_days: 1,
      due_at: new Date(Date.now() + 86_400_000).toISOString(),
    })
  }

  // ---- domain rating on the profile ----
  const domainRating = await recomputeDomainRating(user.id, domain)
  const { data: profile } = await svc
    .from('apti_profiles').select('*').eq('user_id', user.id).single()
  const ratings: Record<string, number> = { ...(profile?.ratings ?? {}) }
  const domainBefore = ratings[domain] ?? null
  if (domainRating !== null) ratings[domain] = domainRating

  // ---- advance the set / complete ----
  const newCursor = set.cursor + 1
  const done = newCursor >= set.question_ids.length
  let summary: Record<string, unknown> | null = null
  let streak = profile?.streak ?? 0

  if (done) {
    const today = istDateString()
    streak = nextStreak({ streak: profile?.streak ?? 0, lastSetDate: profile?.last_set_date ?? null }, today)
    const { data: setAttempts } = await svc
      .from('apti_attempts').select('correct, context').eq('set_id', set.id)
    const correctCount = (setAttempts ?? []).filter((a: { correct: boolean }) => a.correct).length + 0
    const ratingDeltas: Record<string, number> = {}
    for (const [d, r] of Object.entries(ratings)) {
      const startR = (set.ratings_at_start ?? {})[d]
      if (typeof startR === 'number') ratingDeltas[d] = r - startR
      else ratingDeltas[d] = 0
    }
    summary = {
      correct: correctCount,
      total: set.question_ids.length,
      ratingDeltas,
      streak,
    }
    await svc.from('apti_profiles').update({
      ratings,
      streak,
      longest_streak: Math.max(profile?.longest_streak ?? 0, streak),
      last_set_date: today,
    }).eq('user_id', user.id)
  } else {
    await svc.from('apti_profiles').update({ ratings }).eq('user_id', user.id)
  }

  await svc.from('apti_daily_sets').update({
    cursor: newCursor,
    ...(done ? { completed_at: new Date().toISOString(), summary } : {}),
  }).eq('id', set.id)

  // ---- reveal payload (the ONLY place answers leave the server) ----
  const chosenOption = (question.payload.options ?? []).find((o) => o.key === body.chosenKey)
  const trapName = !correct && chosenOption?.trap ? chosenOption.trap : null
  return NextResponse.json({
    attemptId: attemptRow?.id ?? null,
    correct,
    answerKeys: answer.keys ?? null,
    answerValue: answer.value ?? null,
    trap: trapName,
    trapExplanation: trapName ? question.payload.trap_explanations?.[trapName] ?? null : null,
    solutionMd: question.payload.solution_md,
    shortcutMd: question.payload.shortcut_md ?? null,
    benchmarkSec: question.time_benchmark_sec,
    timeMs,
    skill: {
      slug: skill.slug,
      name: skill.name,
      ratingBefore: state.rating,
      ratingAfter: nextState.rating,
      masteryBefore,
      mastery: nextState.mastery,
    },
    domain: { name: domain, before: domainBefore, after: domainRating },
    redemption,
    set: { cursor: newCursor, total: set.question_ids.length, done, summary },
  })
}

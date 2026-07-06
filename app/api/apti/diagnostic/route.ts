export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { ensureAptiProfile, loadCurriculum, clientSafeQuestion, type QuestionRow } from '@/lib/apti'

// Adaptive placement diagnostic (docs/aptitude/05 §2): an 8-question
// difficulty ladder alternating quant/logical. Stateless — the client sends
// its answer history each call; the server re-grades everything (answers
// never reach the client), walks the estimate, and returns the next
// question or the final result.
//
// Estimate walk: start 1100; correct climbs, wrong descends, with a
// shrinking step so it converges (binary-search flavour).

const START_EST = 1100
const STEPS = [160, 140, 120, 100, 80, 70, 60, 50]
const TOTAL = 8

interface DiagAnswer { questionId: string; chosenKey?: string; timeMs?: number }
interface DiagBody {
  answers: DiagAnswer[]
  context?: { degree?: string; lane?: string; timelineMonths?: number | null }
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: DiagBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const answers = (body.answers ?? []).slice(0, TOTAL)

  const svc = serviceClient()
  const [profile, curriculum, { data: bankRows }] = await Promise.all([
    ensureAptiProfile(user.id, user.email!),
    loadCurriculum(),
    svc.from('apti_questions').select('*').eq('status', 'approved'),
  ])
  const bank = (bankRows ?? []) as QuestionRow[]
  const byId = new Map(bank.map((q) => [q.id, q]))

  // ---- replay the ladder over the submitted history ----
  let est = START_EST
  let lastCorrect: boolean | null = null
  const used = new Set<string>()
  const domainStats: Record<string, { asked: number; correct: number }> = {}
  const graded: { q: QuestionRow; correct: boolean; chosenKey: string | null; timeMs: number }[] = []

  for (let i = 0; i < answers.length; i++) {
    const a = answers[i]
    const q = byId.get(a.questionId)
    if (!q || used.has(q.id)) return NextResponse.json({ error: 'Invalid history' }, { status: 400 })
    used.add(q.id)
    const correct = !!a.chosenKey && (q.payload.answer.keys ?? []).includes(a.chosenKey)
    const domain = curriculum.domainOfSkill(q.skill_id)
    domainStats[domain] = domainStats[domain] ?? { asked: 0, correct: 0 }
    domainStats[domain].asked += 1
    if (correct) domainStats[domain].correct += 1
    est += (correct ? 1 : -1) * STEPS[Math.min(i, STEPS.length - 1)]
    lastCorrect = correct
    graded.push({ q, correct, chosenKey: a.chosenKey ?? null, timeMs: Math.max(500, Math.min(a.timeMs ?? 30_000, 300_000)) })
  }

  // ---- still mid-ladder: pick the next question nearest the estimate ----
  if (answers.length < TOTAL) {
    const wantDomain = answers.length % 2 === 0 ? 'quant' : 'logical'
    let pool = bank.filter((q) => !used.has(q.id) && curriculum.domainOfSkill(q.skill_id) === wantDomain)
    if (pool.length === 0) pool = bank.filter((q) => !used.has(q.id))
    if (pool.length === 0) return NextResponse.json({ error: 'Bank exhausted' }, { status: 500 })
    pool.sort((a, b) => Math.abs(a.rating - est) - Math.abs(b.rating - est) || a.id.localeCompare(b.id))
    const next = pool[0]
    return NextResponse.json({
      done: false,
      index: answers.length,
      total: TOTAL,
      lastCorrect,
      runningEstimate: est,
      next: clientSafeQuestion(next, curriculum),
    })
  }

  // ---- ladder complete: persist and reveal ----
  const finalRating = Math.max(800, Math.min(1600, Math.round(est / 5) * 5))

  // attempts log (telemetry + 60-day seen-exclusion so the daily set doesn't repeat these)
  await svc.from('apti_attempts').insert(graded.map((g) => ({
    user_id: user.id,
    question_id: g.q.id,
    context: 'diagnostic',
    correct: g.correct,
    chosen: { key: g.chosenKey },
    time_ms: g.timeMs,
    rating_before: null,
    rating_after: null,
  })))

  // seed every quant/logical skill's starting rating so the adaptive set
  // builder meets the student at their level from day 1 (attempts stay 0 —
  // mastery is earned, never granted by a diagnostic)
  const touchedDomains = Object.keys(domainStats)
  const seedSkills = curriculum.skills.filter((s) =>
    touchedDomains.includes(curriculum.domainOfSkill(s.id)))
  if (seedSkills.length > 0) {
    await svc.from('apti_skill_state').upsert(
      seedSkills.map((s) => ({ user_id: user.id, skill_id: s.id, rating: finalRating })),
      { onConflict: 'user_id,skill_id', ignoreDuplicates: true }
    )
  }

  const ratings: Record<string, number> = { ...(profile.ratings ?? {}) }
  for (const d of touchedDomains) ratings[d] = finalRating

  const profileUpdate: Record<string, unknown> = { ratings }
  if (body.context?.degree) profileUpdate.degree = body.context.degree
  if (body.context?.lane) profileUpdate.lane = body.context.lane
  if (typeof body.context?.timelineMonths === 'number') {
    const t = new Date()
    t.setMonth(t.getMonth() + body.context.timelineMonths)
    profileUpdate.timeline = t.toISOString().slice(0, 10)
  }
  await svc.from('apti_profiles').update(profileUpdate).eq('user_id', user.id)

  const perDomain = Object.fromEntries(
    Object.entries(domainStats).map(([d, s]) => [d, { asked: s.asked, correct: s.correct }])
  )
  return NextResponse.json({
    done: true,
    lastCorrect,
    result: { rating: finalRating, perDomain },
  })
}

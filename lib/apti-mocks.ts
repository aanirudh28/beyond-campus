// Mock engine + readiness score (docs/aptitude/07 + 08).
// Blueprints live here as code; attempts live in apti_mock_attempts.

import { serviceClient } from '@/lib/tracker'
import { loadCurriculum, type QuestionRow } from '@/lib/apti'
import { expectedScore } from '@/lib/apti-engine'
import { COMPANIES, type CompanyPattern } from '@/lib/apti-companies'

// ---------------- blueprints (the fear ladder, rungs 1–2) ----------------

export interface BlueprintSection {
  name: string
  domain?: string          // restrict to one domain; omit = mixed
  count: number            // target; adapts down if the bank is thinner
  seconds: number
}
export interface Blueprint {
  slug: string
  kind: 'checkpoint' | 'section' | 'mixed'
  name: string
  tagline: string
  sections: BlueprintSection[]
  unlockNote?: string
}

export const BLUEPRINTS: Blueprint[] = [
  {
    slug: 'checkpoint',
    kind: 'checkpoint',
    name: 'Checkpoint',
    tagline: '15 minutes. Calibration, not judgment — your first real readiness data.',
    sections: [{ name: 'Mixed', count: 10, seconds: 900 }],
  },
  {
    slug: 'section-quant',
    kind: 'section',
    name: 'Quant Section Test',
    tagline: 'One section, test pacing. Find your quant rhythm before the real thing.',
    sections: [{ name: 'Quantitative', domain: 'quant', count: 12, seconds: 1080 }],
  },
  {
    slug: 'section-logical',
    kind: 'section',
    name: 'Logical Section Test',
    tagline: 'Pure reasoning under the clock.',
    sections: [{ name: 'Logical', domain: 'logical', count: 12, seconds: 1080 }],
  },
]

export function blueprintBySlug(slug: string): Blueprint | undefined {
  return BLUEPRINTS.find((b) => b.slug === slug)
}

// ---------------- attempt construction ----------------

export interface MockSectionRow { name: string; question_ids: string[]; seconds: number }

// Picks questions near the user's level (nearest to P(correct)=0.7), fresh
// first, spread across skills so a section isn't five clones of one pattern.
export async function buildMockAttempt(userId: string, blueprint: Blueprint) {
  const svc = serviceClient()
  const curriculum = await loadCurriculum()
  const [{ data: bank }, { data: states }, { data: recent }] = await Promise.all([
    svc.from('apti_questions').select('id, skill_id, rating').eq('status', 'approved'),
    svc.from('apti_skill_state').select('skill_id, rating').eq('user_id', userId),
    svc.from('apti_attempts').select('question_id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 86_400_000).toISOString()),
  ])
  const ratingOf = new Map((states ?? []).map((s) => [s.skill_id, s.rating]))
  const seen = new Set((recent ?? []).map((a) => a.question_id))

  const used = new Set<string>()
  const sections: MockSectionRow[] = []
  let totalSeconds = 0

  for (const sec of blueprint.sections) {
    const pool = (bank ?? []).filter((q) =>
      !used.has(q.id) &&
      (!sec.domain || curriculum.domainOfSkill(q.skill_id) === sec.domain))
    const closeness = (q: { skill_id: string; rating: number }) =>
      Math.abs(expectedScore(ratingOf.get(q.skill_id) ?? 1000, q.rating) - 0.7)
    const ranked = [
      ...pool.filter((q) => !seen.has(q.id)).sort((a, b) => closeness(a) - closeness(b)),
      ...pool.filter((q) => seen.has(q.id)).sort((a, b) => closeness(a) - closeness(b)),
    ]
    // round-robin across skills for variety
    const bySkill = new Map<string, typeof ranked>()
    for (const q of ranked) {
      bySkill.set(q.skill_id, [...(bySkill.get(q.skill_id) ?? []), q])
    }
    const picked: string[] = []
    const skillQueues = [...bySkill.values()]
    let idx = 0
    while (picked.length < Math.min(sec.count, pool.length) && skillQueues.length > 0) {
      const queue = skillQueues[idx % skillQueues.length]
      const q = queue.shift()
      if (q) { picked.push(q.id); used.add(q.id) }
      if (!queue.length) skillQueues.splice(idx % skillQueues.length, 1)
      else idx++
    }
    // scale time down if the bank couldn't fill the section
    const seconds = Math.round(sec.seconds * (picked.length / sec.count))
    sections.push({ name: sec.name, question_ids: picked, seconds })
    totalSeconds += seconds
  }

  const total = sections.reduce((a, s) => a + s.question_ids.length, 0)
  if (total < 5) return { error: 'The bank is too thin for this test yet — practice more topics first.' }

  const { data: created, error } = await svc.from('apti_mock_attempts').insert({
    user_id: userId,
    blueprint_slug: blueprint.slug,
    kind: blueprint.kind,
    sections,
    max_score: total,
    deadline_at: new Date(Date.now() + totalSeconds * 1000 + 5000).toISOString(),
  }).select('*').single()
  if (error || !created) return { error: 'Could not start the test' }
  return { attempt: created }
}

// ---------------- grading & report ----------------

export interface MockReport {
  score: number
  maxScore: number
  correct: number
  total: number
  sections: { name: string; correct: number; total: number }[]
  timeSinks: { stem: string; seconds: number; correct: boolean }[]
  weakSkills: { id: string; slug: string; name: string; correct: number; total: number }[]
  redemptionsQueued: number
  overtime: boolean
}

export async function gradeMockAttempt(
  userId: string,
  attempt: { id: string; sections: MockSectionRow[]; deadline_at: string },
  answers: Record<string, string>,
  perQSeconds: Record<string, number>
): Promise<MockReport> {
  const svc = serviceClient()
  const curriculum = await loadCurriculum()
  const allIds = attempt.sections.flatMap((s) => s.question_ids)
  const { data: qRows } = await svc.from('apti_questions').select('*').in('id', allIds)
  const byId = new Map((qRows ?? []).map((q: QuestionRow) => [q.id, q]))

  const perSkill = new Map<string, { correct: number; total: number }>()
  const sectionScores: MockReport['sections'] = []
  const sinkCandidates: MockReport['timeSinks'] = []
  const attemptRows: Record<string, unknown>[] = []
  const missIds: string[] = []
  let correct = 0

  for (const sec of attempt.sections) {
    let secCorrect = 0
    for (const qid of sec.question_ids) {
      const q = byId.get(qid)
      if (!q) continue
      const chosen = answers[qid] ?? null
      const isCorrect = !!chosen && (q.payload.answer.keys ?? []).includes(chosen)
      if (isCorrect) { correct++; secCorrect++ }
      else if (chosen) missIds.push(qid)     // skipped questions don't enter redemption
      const agg = perSkill.get(q.skill_id) ?? { correct: 0, total: 0 }
      agg.total++; if (isCorrect) agg.correct++
      perSkill.set(q.skill_id, agg)
      const secs = Math.max(0, Math.min(perQSeconds[qid] ?? 0, 1800))
      sinkCandidates.push({ stem: q.payload.stem_md.slice(0, 90), seconds: secs, correct: isCorrect })
      attemptRows.push({
        user_id: userId, question_id: qid, set_id: attempt.id, context: 'mock',
        correct: isCorrect, chosen: { key: chosen }, time_ms: Math.max(500, secs * 1000),
      })
    }
    sectionScores.push({ name: sec.name, correct: secCorrect, total: sec.question_ids.length })
  }

  // misses join the redemption queue (skip ones that already have a live card)
  let redemptionsQueued = 0
  if (missIds.length > 0) {
    const { data: existingCards } = await svc.from('apti_review_cards')
      .select('question_id').eq('user_id', userId).eq('redeemed', false).in('question_id', missIds)
    const have = new Set((existingCards ?? []).map((c) => c.question_id))
    const fresh = missIds.filter((id) => !have.has(id))
    if (fresh.length > 0) {
      await svc.from('apti_review_cards').insert(fresh.map((qid) => ({
        user_id: userId,
        question_id: qid,
        skill_id: byId.get(qid)?.skill_id,
        interval_days: 1,
        due_at: new Date(Date.now() + 86_400_000).toISOString(),
      })))
      redemptionsQueued = fresh.length
    }
  }
  if (attemptRows.length > 0) await svc.from('apti_attempts').insert(attemptRows)

  const weakSkills = [...perSkill.entries()]
    .filter(([, v]) => v.total >= 2 && v.correct / v.total < 0.6)
    .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
    .slice(0, 3)
    .map(([skillId, v]) => {
      const s = curriculum.skillById.get(skillId)
      return { id: skillId, slug: s?.slug ?? '', name: s?.name ?? 'Unknown', correct: v.correct, total: v.total }
    })

  return {
    score: correct,
    maxScore: allIds.length,
    correct,
    total: allIds.length,
    sections: sectionScores,
    timeSinks: [...sinkCandidates].sort((a, b) => b.seconds - a.seconds).slice(0, 3),
    weakSkills,
    redemptionsQueued,
    overtime: Date.now() > new Date(attempt.deadline_at).getTime() + 30_000,
  }
}

// ---------------- readiness (docs/aptitude/08 formula) ----------------

const MASTERY_VALUE: Record<string, number> = {
  unseen: 0, learning: 0.25, familiar: 0.5, proficient: 0.85, mastered: 1, rusty: 0.6,
}

export interface ReadinessResult {
  slug: string
  name: string
  tier: string
  vendor: string
  sectionsLine: string
  negativeMarking: boolean
  season: string
  cutoffNote: string
  confidence: string
  score: number
  band: 'Foundation' | 'Building' | 'Almost there' | 'Test-ready'
  mockCapped: boolean
  levers: { label: string; skillId?: string }[]
}

export async function computeReadiness(userId: string, targets?: string[]): Promise<ReadinessResult[]> {
  const svc = serviceClient()
  const curriculum = await loadCurriculum()
  const [{ data: states }, { data: mocks }] = await Promise.all([
    svc.from('apti_skill_state').select('skill_id, mastery, times_ms').eq('user_id', userId),
    svc.from('apti_mock_attempts').select('score, max_score')
      .eq('user_id', userId).not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false }).limit(5),
  ])
  const skillBySlug = new Map(curriculum.skills.map((s) => [s.slug, s]))
  const stateBySkill = new Map((states ?? []).map((s) => [s.skill_id, s]))

  const bestMockRatio = (mocks ?? []).reduce((best, m) =>
    m.max_score > 0 ? Math.max(best, Number(m.score) / Number(m.max_score)) : best, -1)
  const mockFactor = bestMockRatio >= 0 ? 0.75 + 0.25 * bestMockRatio : 0.75
  const mockCapped = bestMockRatio < 0

  const list = targets && targets.length > 0
    ? COMPANIES.filter((c) => targets.includes(c.slug))
    : COMPANIES

  return list.map((company: CompanyPattern) => {
    let weightSum = 0, coverage = 0
    const gaps: { w: number; gap: number; label: string; skillId?: string }[] = []
    for (const [slug, w] of Object.entries(company.skillWeights)) {
      const skill = skillBySlug.get(slug)
      if (!skill) continue
      weightSum += w
      const st = stateBySkill.get(skill.id)
      const mastery = MASTERY_VALUE[st?.mastery ?? 'unseen'] ?? 0
      // speed factor: median vs benchmark, 1 → 0.6 linear beyond 1.25×
      let speed = 1
      const times = (st?.times_ms as number[] | undefined) ?? []
      if (times.length >= 3) {
        const sorted = [...times].sort((a, b) => a - b)
        const median = sorted[Math.floor(sorted.length / 2)]
        const ratio = median / (skill.benchmark_seconds * 1000)
        speed = ratio <= 1.25 ? 1 : Math.max(0.6, 1 - (ratio - 1.25) * 0.5)
      }
      const skillScore = mastery * speed
      coverage += w * skillScore
      gaps.push({ w, gap: w * (1 - skillScore), label: skill.name, skillId: skill.id })
    }
    const cov = weightSum > 0 ? coverage / weightSum : 0
    const score = Math.round(100 * cov * mockFactor)
    const band: ReadinessResult['band'] =
      score >= 80 ? 'Test-ready' : score >= 65 ? 'Almost there' : score >= 40 ? 'Building' : 'Foundation'

    const levers: ReadinessResult['levers'] = gaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, mockCapped ? 2 : 3)
      .filter((g) => g.gap > 0.05)
      .map((g) => ({ label: `Level up ${g.label}`, skillId: g.skillId }))
    if (mockCapped) levers.push({ label: 'Take your first Checkpoint — readiness is capped until you do' })

    return {
      slug: company.slug, name: company.name, tier: company.tier, vendor: company.vendor,
      sectionsLine: company.sectionsLine, negativeMarking: company.negativeMarking,
      season: company.season, cutoffNote: company.cutoffNote, confidence: company.confidence,
      score, band, mockCapped, levers,
    }
  }).sort((a, b) => b.score - a.score)
}

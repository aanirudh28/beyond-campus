// Panic Mode (docs/aptitude/14 #24): "my test is in N days." An honest,
// compressed triage plan — coverage over perfection, never false hope. It pools
// each skill's readiness impact across the student's target companies (the same
// weight × gap the readiness score uses), orders foundations before dependents,
// and allocates the highest-impact skills across the days that remain. The rest
// are cut on purpose, guilt-free.

import { serviceClient } from '@/lib/tracker'
import { loadCurriculum, type Curriculum } from '@/lib/apti'
import { COMPANIES } from '@/lib/apti-companies'
import { computeReadiness, MASTERY_VALUE } from '@/lib/apti-mocks'

const READY = new Set(['familiar', 'proficient', 'mastered'])

export interface PanicSkill {
  skillId: string
  skillName: string
  topicName: string
  domain: string
  mastery: string
  sharePct: number       // share of the total remaining gap this skill represents
  day: number
}

export interface PanicPlan {
  daysLeft: number
  perDay: number
  avgScore: number
  targets: { slug: string; name: string; score: number; band: string }[]
  plan: PanicSkill[]
  cut: { skillName: string; topicName: string }[]
  summary: string
}

interface Ranked { id: string; name: string; topicId: string; impact: number }

// unmet prerequisites (that are themselves in the plan pool) must come first —
// no point drilling Profit & Loss on the last day if Percentages is still weak
function prereqOrder(ranked: Ranked[], curriculum: Curriculum, masteryById: Map<string, string>): Ranked[] {
  const byId = new Map(ranked.map((r) => [r.id, r]))
  const unmetPrereqs = (id: string) =>
    (curriculum.prereqBySkillId[id] ?? []).filter((p) => byId.has(p) && !READY.has(masteryById.get(p) ?? 'unseen'))
  const visited = new Set<string>()
  const out: Ranked[] = []
  const visit = (r: Ranked) => {
    if (visited.has(r.id)) return
    visited.add(r.id)
    for (const p of unmetPrereqs(r.id)) { const pr = byId.get(p); if (pr) visit(pr) }
    out.push(r)
  }
  for (const r of ranked) visit(r)
  return out
}

function buildSummary(daysLeft: number, avgScore: number, planN: number, cutN: number): string {
  const d = daysLeft <= 0 ? 'Your test is basically here' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} to go`
  if (daysLeft <= 5 && avgScore < 55) {
    return `${d}. Let's be honest — that won't master everything, so we triage. The ${planN} skill${planN === 1 ? '' : 's'} below move your readiness the most; do them in order and skip the rest without guilt.${cutN > 0 ? ` We've set aside ${cutN} lower-impact one${cutN === 1 ? '' : 's'} for after the test.` : ''} Coverage beats perfection under a clock.`
  }
  if (avgScore >= 65) {
    return `${d}, and you're closer than the nerves suggest. This plan defends your strong areas and closes the few gaps that still matter.`
  }
  return `${d} — enough to move the needle where it counts. Highest-impact first, ${planN} skill${planN === 1 ? '' : 's'} across the runway, roughly ${daysLeft <= 4 ? 3 : 2} a day.`
}

export async function computePanicPlan(userId: string, daysLeft: number, targets?: string[]): Promise<PanicPlan> {
  const svc = serviceClient()
  const curriculum = await loadCurriculum()
  const [{ data: states }, readiness] = await Promise.all([
    svc.from('apti_skill_state').select('skill_id, mastery, times_ms').eq('user_id', userId),
    computeReadiness(userId, targets && targets.length > 0 ? targets : undefined),
  ])
  const stateBySkill = new Map((states ?? []).map((s) => [s.skill_id, s]))
  const masteryById = new Map((states ?? []).map((s) => [s.skill_id, s.mastery as string]))
  const skillBySlug = new Map(curriculum.skills.map((s) => [s.slug, s]))
  const topicById = new Map(curriculum.topics.map((t) => [t.id, t]))

  const list = targets && targets.length > 0 ? COMPANIES.filter((c) => targets.includes(c.slug)) : COMPANIES

  // pool each skill's gap-impact (weight × how far from solid) across targets
  const impactById = new Map<string, Ranked>()
  for (const company of list) {
    for (const [slug, w] of Object.entries(company.skillWeights)) {
      const skill = skillBySlug.get(slug)
      if (!skill) continue
      const st = stateBySkill.get(skill.id)
      const mastery = MASTERY_VALUE[st?.mastery ?? 'unseen'] ?? 0
      let speed = 1
      const times = (st?.times_ms as number[] | undefined) ?? []
      if (times.length >= 3) {
        const sorted = [...times].sort((a, b) => a - b)
        const median = sorted[Math.floor(sorted.length / 2)]
        const ratio = median / (skill.benchmark_seconds * 1000)
        speed = ratio <= 1.25 ? 1 : Math.max(0.6, 1 - (ratio - 1.25) * 0.5)
      }
      const gap = w * (1 - mastery * speed)
      const cur = impactById.get(skill.id) ?? { id: skill.id, name: skill.name, topicId: skill.topic_id, impact: 0 }
      cur.impact += gap
      impactById.set(skill.id, cur)
    }
  }

  let ranked = [...impactById.values()].filter((r) => r.impact > 0.15).sort((a, b) => b.impact - a.impact)
  ranked = prereqOrder(ranked, curriculum, masteryById)
  const totalImpact = ranked.reduce((a, r) => a + r.impact, 0) || 1

  const perDay = daysLeft <= 4 ? 3 : 2
  const planCount = Math.min(ranked.length, Math.max(3, daysLeft * perDay), 16)
  const plan: PanicSkill[] = ranked.slice(0, planCount).map((r, i) => ({
    skillId: r.id,
    skillName: r.name,
    topicName: topicById.get(r.topicId)?.name ?? '',
    domain: curriculum.domainOfSkill(r.id),
    mastery: masteryById.get(r.id) ?? 'unseen',
    sharePct: Math.round((r.impact / totalImpact) * 100),
    day: Math.floor(i / perDay) + 1,
  }))
  const cut = ranked.slice(planCount).map((r) => ({ skillName: r.name, topicName: topicById.get(r.topicId)?.name ?? '' }))

  const avgScore = readiness.length > 0 ? Math.round(readiness.reduce((a, r) => a + r.score, 0) / readiness.length) : 0

  return {
    daysLeft,
    perDay,
    avgScore,
    targets: readiness.map((r) => ({ slug: r.slug, name: r.name, score: r.score, band: r.band })),
    plan,
    cut,
    summary: buildSummary(daysLeft, avgScore, plan.length, cut.length),
  }
}

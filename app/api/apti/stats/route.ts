export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { loadCurriculum } from '@/lib/apti'
import { median } from '@/lib/apti-engine'

// Student analytics aggregates (docs/aptitude/06). Server-side because
// mapping attempts → skills crosses the questions table, which is
// deliberately unreadable from the client (it holds answer keys).
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()
  const [curriculum, { data: attempts }, { data: qRows }, { data: states }] = await Promise.all([
    loadCurriculum(),
    svc.from('apti_attempts')
      .select('question_id, correct, time_ms, confidence, error_type, context, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: true }).limit(2000),
    svc.from('apti_questions').select('id, skill_id, time_benchmark_sec'),
    svc.from('apti_skill_state').select('skill_id, rating, mastery').eq('user_id', user.id),
  ])

  const skillOfQuestion = new Map((qRows ?? []).map((q) => [q.id, q.skill_id]))
  const benchOfQuestion = new Map((qRows ?? []).map((q) => [q.id, q.time_benchmark_sec]))
  const stateBySkill = new Map((states ?? []).map((s) => [s.skill_id, s]))

  // ---- per-skill aggregates ----
  const perSkill = new Map<string, { attempts: number; correct: number; times: number[]; benchTimes: number[] }>()
  const errorMix: Record<string, number> = {}
  const calibration: Record<string, { n: number; correct: number }> = {
    sure: { n: 0, correct: 0 }, thinkso: { n: 0, correct: 0 }, guessing: { n: 0, correct: 0 },
  }
  const activeDays = new Set<string>()
  let totalCorrect = 0

  for (const a of attempts ?? []) {
    activeDays.add(String(a.created_at).slice(0, 10))
    if (a.correct) totalCorrect++
    if (a.confidence && calibration[a.confidence]) {
      calibration[a.confidence].n++
      if (a.correct) calibration[a.confidence].correct++
    }
    if (a.error_type) errorMix[a.error_type] = (errorMix[a.error_type] ?? 0) + 1

    const skillId = skillOfQuestion.get(a.question_id)
    if (!skillId) continue
    const agg = perSkill.get(skillId) ?? { attempts: 0, correct: 0, times: [], benchTimes: [] }
    agg.attempts++
    if (a.correct) agg.correct++
    agg.times.push(a.time_ms)
    agg.benchTimes.push((benchOfQuestion.get(a.question_id) ?? 60) * 1000)
    perSkill.set(skillId, agg)
  }

  const skillsOut = [...perSkill.entries()].map(([skillId, agg]) => {
    const skill = curriculum.skillById.get(skillId)
    const acc = agg.correct / agg.attempts
    const medMs = median(agg.times)
    const medBench = median(agg.benchTimes)
    const fast = medMs <= medBench * 1.25
    const accurate = acc >= 0.75
    const zone = accurate && fast ? 'ready' : accurate ? 'slow-sure' : fast ? 'rushing' : 'gap'
    return {
      slug: skill?.slug ?? skillId,
      name: skill?.name ?? 'Unknown skill',
      domain: skill ? curriculum.domainOfSkill(skillId) : 'quant',
      attempts: agg.attempts,
      accuracy: Math.round(acc * 100),
      medianSec: Math.round(medMs / 1000),
      benchSec: Math.round(medBench / 1000),
      zone,
      rating: stateBySkill.get(skillId)?.rating ?? null,
      mastery: stateBySkill.get(skillId)?.mastery ?? 'learning',
    }
  }).sort((a, b) => a.accuracy - b.accuracy)

  const totalAttempts = (attempts ?? []).length
  return NextResponse.json({
    totals: {
      attempts: totalAttempts,
      accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
      activeDays: activeDays.size,
    },
    skills: skillsOut,
    errorMix,
    calibration,
  })
}

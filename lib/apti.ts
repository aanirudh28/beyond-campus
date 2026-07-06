// Apti server helpers — service-role data access + orchestration around the
// pure engine (lib/apti-engine.ts). Only API routes import this.
// Trust boundary: answers/solutions/traps NEVER leave via clientSafeQuestion;
// they are returned only in the grading response after an answer is locked.

import { serviceClient } from '@/lib/tracker'
import {
  buildDailySet, chooseFocusSkills, istDateString, expectedScore,
  type CandidateQuestion, type DueReview, type Mastery, type SkillState,
  DEFAULT_SKILL_STATE,
} from '@/lib/apti-engine'

export interface QuestionOption { key: string; text: string; trap: string | null }
export interface QuestionPayload {
  stem_md: string
  options?: QuestionOption[]
  answer: { keys?: string[]; value?: number; tolerance?: number }
  solution_md: string
  shortcut_md?: string
  trap_explanations?: Record<string, string>
  hints?: string[]
}
export interface QuestionRow {
  id: string
  skill_id: string
  type: string
  payload: QuestionPayload
  rating: number
  rating_locked: boolean
  attempts: number
  correct: number
  time_benchmark_sec: number
}
export interface SkillRow {
  id: string
  topic_id: string
  slug: string
  name: string
  ord: number
  benchmark_rating: number
  benchmark_seconds: number
}
export interface TopicRow { id: string; domain: string; slug: string; name: string; ord: number }
export interface DailySetRow {
  id: string
  user_id: string
  set_date: string
  kind: string
  question_ids: string[]
  review_card_ids: string[]
  cursor: number
  ratings_at_start: Record<string, number>
  completed_at: string | null
  summary: Record<string, unknown> | null
}
export interface AptiProfile {
  user_id: string
  email: string
  ratings: Record<string, number>
  streak: number
  longest_streak: number
  freezes_left: number
  last_set_date: string | null
}

export interface ClientQuestion {
  id: string
  type: string
  stem_md: string
  options: { key: string; text: string }[]
  // hints are progressive nudges only — never the answer or solution — so the
  // ladder can render instantly client-side. Taking one flags the attempt as
  // assisted (no rating movement), which the client reports on submit.
  hints: string[]
  skill_name: string
  domain: string
}

export function clientSafeQuestion(q: QuestionRow, curriculum: Curriculum): ClientQuestion {
  const skill = curriculum.skillById.get(q.skill_id)
  return {
    id: q.id,
    type: q.type,
    stem_md: q.payload.stem_md,
    options: (q.payload.options ?? []).map((o) => ({ key: o.key, text: o.text })),
    hints: q.payload.hints ?? [],
    skill_name: skill?.name ?? '',
    domain: curriculum.domainOfSkill(q.skill_id),
  }
}

export async function ensureAptiProfile(userId: string, email: string): Promise<AptiProfile> {
  const svc = serviceClient()
  await svc.from('apti_profiles').upsert(
    { user_id: userId, email },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )
  const { data } = await svc.from('apti_profiles').select('*').eq('user_id', userId).single()
  return data as AptiProfile
}

export interface Curriculum {
  topics: TopicRow[]
  skills: SkillRow[]
  skillById: Map<string, SkillRow>
  domainOfSkill: (skillId: string) => string
}

const DOMAIN_ORDER = ['quant', 'logical', 'verbal', 'di', 'business']
function domainRank(domain: string): number {
  const i = DOMAIN_ORDER.indexOf(domain)
  return i === -1 ? DOMAIN_ORDER.length : i
}

// Module-level cache: the curriculum changes only when the founder edits
// content, and a 5-minute staleness window is invisible to students. Saves
// 2 Supabase round trips on every answer.
const CURRICULUM_TTL_MS = 5 * 60_000
let curriculumCache: { data: Curriculum; at: number } | null = null

export async function loadCurriculum(): Promise<Curriculum> {
  const cached = curriculumCache
  if (cached && Date.now() - cached.at < CURRICULUM_TTL_MS) return cached.data

  const svc = serviceClient()
  const [{ data: topics }, { data: skills }] = await Promise.all([
    svc.from('apti_topics').select('*').order('ord'),
    svc.from('apti_skills').select('*').order('ord'),
  ])
  const topicById = new Map((topics ?? []).map((t: TopicRow) => [t.id, t]))
  // Curriculum order: foundation loop first — quant arithmetic before logical
  // before verbal (docs/aptitude/03 sequencing), then topic ord, then skill ord.
  const orderedSkills = [...(skills ?? [])].sort((a: SkillRow, b: SkillRow) => {
    if (a.topic_id === b.topic_id) return a.ord - b.ord
    const ta = topicById.get(a.topic_id) as TopicRow, tb = topicById.get(b.topic_id) as TopicRow
    return domainRank(ta.domain) - domainRank(tb.domain) || ta.ord - tb.ord || ta.slug.localeCompare(tb.slug)
  })
  const domainBySkill = new Map(
    orderedSkills.map((s: SkillRow) => [s.id, (topicById.get(s.topic_id) as TopicRow).domain])
  )
  const data: Curriculum = {
    topics: (topics ?? []) as TopicRow[],
    skills: orderedSkills as SkillRow[],
    skillById: new Map(orderedSkills.map((s: SkillRow) => [s.id, s])),
    domainOfSkill: (skillId: string) => domainBySkill.get(skillId) ?? 'quant',
  }
  curriculumCache = { data, at: Date.now() }
  return data
}

export function rowToSkillState(row: Record<string, unknown> | null): SkillState {
  if (!row) return { ...DEFAULT_SKILL_STATE }
  return {
    rating: row.rating as number,
    attempts: row.attempts as number,
    correct: row.correct as number,
    rolling: (row.rolling as number[]) ?? [],
    timesMs: (row.times_ms as number[]) ?? [],
    mastery: row.mastery as Mastery,
    probeStreak: (row.probe_streak as number) ?? 0,
  }
}

export async function getOrBuildTodaySet(userId: string, profile: AptiProfile): Promise<DailySetRow> {
  const svc = serviceClient()
  const today = istDateString()

  const { data: existing } = await svc
    .from('apti_daily_sets').select('*')
    .eq('user_id', userId).eq('set_date', today).eq('kind', 'daily')
    .maybeSingle()
  if (existing) return existing as DailySetRow

  const curriculum = await loadCurriculum()

  const [{ data: stateRows }, { data: dueCards }, { data: recentAttempts }, { data: bank }] =
    await Promise.all([
      svc.from('apti_skill_state').select('*').eq('user_id', userId),
      svc.from('apti_review_cards')
        .select('id, question_id, skill_id')
        .eq('user_id', userId).eq('redeemed', false)
        .not('question_id', 'is', null)
        .lte('due_at', new Date().toISOString())
        .order('due_at').limit(6),
      svc.from('apti_attempts')
        .select('question_id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 60 * 86_400_000).toISOString()),
      svc.from('apti_questions')
        .select('id, skill_id, rating')
        .eq('status', 'approved'),
    ])

  const seen = new Set((recentAttempts ?? []).map((a: { question_id: string }) => a.question_id))
  // due review questions enter through their cards, not the adaptive pool
  const dueQuestionIds = new Set((dueCards ?? []).map((c: { question_id: string }) => c.question_id))
  const candidates: CandidateQuestion[] = (bank ?? [])
    .filter((q: { id: string }) => !seen.has(q.id) && !dueQuestionIds.has(q.id))
    .map((q: { id: string; skill_id: string; rating: number }) => ({ id: q.id, skillId: q.skill_id, rating: q.rating }))

  const skillRatings: Record<string, number> = {}
  const masteryBySkill: Record<string, { mastery: Mastery }> = {}
  const practiced: string[] = []
  for (const row of stateRows ?? []) {
    skillRatings[row.skill_id] = row.rating
    masteryBySkill[row.skill_id] = { mastery: row.mastery }
    if (row.attempts > 0) practiced.push(row.skill_id)
  }

  const focus = chooseFocusSkills(curriculum.skills.map((s) => s.id), masteryBySkill)
  const dueReviews: DueReview[] = (dueCards ?? []).map(
    (c: { id: string; question_id: string; skill_id: string }) => ({
      cardId: c.id, questionId: c.question_id, skillId: c.skill_id,
    })
  )

  // Day 1 is a gentler 8; every other day is the full 10.
  const isFirstDay = (stateRows ?? []).length === 0
  const plan = buildDailySet({
    dueReviews,
    candidates,
    skillRatings,
    focusSkillIds: focus,
    practicedSkillIds: practiced,
    size: isFirstDay ? 8 : 10,
  })

  const { data: created, error } = await svc
    .from('apti_daily_sets')
    .insert({
      user_id: userId,
      set_date: today,
      kind: 'daily',
      question_ids: plan.questionIds,
      review_card_ids: plan.reviewCardIds,
      ratings_at_start: profile.ratings ?? {},
    })
    .select('*')
    .single()
  if (error) {
    // race with a parallel request: unique(user_id, set_date, kind) → refetch
    const { data: raced } = await svc
      .from('apti_daily_sets').select('*')
      .eq('user_id', userId).eq('set_date', today).eq('kind', 'daily').single()
    return raced as DailySetRow
  }
  return created as DailySetRow
}

export async function loadSetQuestions(ids: string[]): Promise<QuestionRow[]> {
  if (ids.length === 0) return []
  const svc = serviceClient()
  const { data } = await svc.from('apti_questions').select('*').in('id', ids)
  const byId = new Map((data ?? []).map((q: QuestionRow) => [q.id, q]))
  return ids.map((id) => byId.get(id)).filter(Boolean) as QuestionRow[]
}

export async function getOwnedSet(userId: string, setId: string): Promise<DailySetRow | null> {
  const svc = serviceClient()
  const { data } = await svc.from('apti_daily_sets').select('*').eq('id', setId).maybeSingle()
  const set = data as DailySetRow | null
  return set && set.user_id === userId ? set : null
}

// On-demand skill session (from the mastery map): 8 questions hugging the
// student's flow band. Prefers unseen questions; with a young bank, falls
// back to least-recently relevant seen ones rather than refusing to practice.
export async function buildTopicSession(userId: string, skillId: string): Promise<DailySetRow | { error: string }> {
  const svc = serviceClient()
  const [{ data: profile }, { data: state }, { data: bank }, { data: recent }] = await Promise.all([
    svc.from('apti_profiles').select('ratings').eq('user_id', userId).single(),
    svc.from('apti_skill_state').select('rating').eq('user_id', userId).eq('skill_id', skillId).maybeSingle(),
    svc.from('apti_questions').select('id, rating').eq('status', 'approved').eq('skill_id', skillId),
    svc.from('apti_attempts').select('question_id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 60 * 86_400_000).toISOString()),
  ])
  if (!bank || bank.length === 0) return { error: 'No questions for this skill yet' }

  const userRating = state?.rating ?? 1000
  const seen = new Set((recent ?? []).map((a: { question_id: string }) => a.question_id))
  const closeness = (q: { rating: number }) => Math.abs(expectedScore(userRating, q.rating) - 0.75)
  const unseen = bank.filter((q) => !seen.has(q.id)).sort((a, b) => closeness(a) - closeness(b))
  const fallback = bank.filter((q) => seen.has(q.id)).sort((a, b) => closeness(a) - closeness(b))
  const ids = [...unseen, ...fallback].slice(0, 8).map((q) => q.id)

  const { data: created, error } = await svc.from('apti_daily_sets').insert({
    user_id: userId,
    set_date: istDateString(),
    kind: 'topic',
    question_ids: ids,
    ratings_at_start: profile?.ratings ?? {},
  }).select('*').single()
  if (error) {
    return { error: error.code === '23505'
      ? 'One extra session per day for now — paste supabase/apti-upgrade-1.sql to unlock unlimited sessions.'
      : 'Could not start the session' }
  }
  return created as DailySetRow
}

// "Clear your backlog" session: everything due in the redemption queue, up to 8.
export async function buildReviewSession(userId: string): Promise<DailySetRow | { error: string }> {
  const svc = serviceClient()
  const [{ data: profile }, { data: due }] = await Promise.all([
    svc.from('apti_profiles').select('ratings').eq('user_id', userId).single(),
    svc.from('apti_review_cards')
      .select('id, question_id')
      .eq('user_id', userId).eq('redeemed', false)
      .not('question_id', 'is', null)
      .lte('due_at', new Date().toISOString())
      .order('due_at').limit(8),
  ])
  if (!due || due.length === 0) return { error: 'Nothing due — your backlog is clear' }

  const { data: created, error } = await svc.from('apti_daily_sets').insert({
    user_id: userId,
    set_date: istDateString(),
    kind: 'review',
    question_ids: due.map((c: { question_id: string }) => c.question_id),
    review_card_ids: due.map((c: { id: string }) => c.id),
    ratings_at_start: profile?.ratings ?? {},
  }).select('*').single()
  if (error) {
    return { error: error.code === '23505'
      ? 'One extra session per day for now — paste supabase/apti-upgrade-1.sql to unlock unlimited sessions.'
      : 'Could not start the session' }
  }
  return created as DailySetRow
}

// Powers the Today page's "next up" cards: what's due, and where you're weakest.
export async function getNextUp(userId: string) {
  const svc = serviceClient()
  const curriculum = await loadCurriculum()
  const [{ count: dueCount }, { data: states }] = await Promise.all([
    svc.from('apti_review_cards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('redeemed', false)
      .not('question_id', 'is', null)
      .lte('due_at', new Date().toISOString()),
    svc.from('apti_skill_state').select('skill_id, attempts, correct, mastery').eq('user_id', userId),
  ])
  let weakest: { id: string; slug: string; name: string; accuracy: number } | null = null
  for (const s of states ?? []) {
    if (s.attempts < 4) continue
    const acc = s.correct / s.attempts
    if (acc >= 0.8) continue
    if (!weakest || acc < weakest.accuracy) {
      const skill = curriculum.skillById.get(s.skill_id)
      if (skill) weakest = { id: skill.id, slug: skill.slug, name: skill.name, accuracy: acc }
    }
  }
  return {
    dueReviews: dueCount ?? 0,
    weakestSkill: weakest ? { ...weakest, accuracy: Math.round(weakest.accuracy * 100) } : null,
  }
}

// Attempt-weighted mean of skill ratings within one domain. Pure — the
// answer route passes rows it already holds (with the fresh rating patched
// in) instead of re-querying.
export function computeDomainRating(
  rows: { skill_id: string; rating: number; attempts: number }[],
  curriculum: Curriculum,
  domain: string
): number | null {
  const inDomain = rows.filter((r) => curriculum.domainOfSkill(r.skill_id) === domain)
  if (inDomain.length === 0) return null
  let weight = 0, sum = 0
  for (const r of inDomain) {
    const w = Math.max(1, r.attempts)
    weight += w
    sum += r.rating * w
  }
  return Math.round(sum / weight)
}

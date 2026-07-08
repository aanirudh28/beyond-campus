// Apti pure engine: Elo, spaced repetition, mastery, daily-set builder.
// No I/O, no Next/Supabase imports — runnable under `node --test` directly
// and imported by the API routes. Design: docs/aptitude/04-question-engine.md.

export type Mastery = 'unseen' | 'learning' | 'familiar' | 'proficient' | 'mastered' | 'rusty'
export type Confidence = 'sure' | 'thinkso' | 'guessing'
export type ErrorType = 'concept' | 'calc' | 'misread' | 'trap' | 'time'

export interface SkillState {
  rating: number
  attempts: number
  correct: number
  rolling: number[]      // last 10 outcomes: 1 correct, 0 wrong, 0.5 assisted-correct
  timesMs: number[]      // last 10 solve times
  mastery: Mastery
  probeStreak: number
}

export const DEFAULT_SKILL_STATE: SkillState = {
  rating: 1000, attempts: 0, correct: 0, rolling: [], timesMs: [], mastery: 'unseen', probeStreak: 0,
}

// ---------- Elo ----------

export function expectedScore(userRating: number, questionRating: number): number {
  return 1 / (1 + Math.pow(10, (questionRating - userRating) / 400))
}

// Correct-but-slow (beyond 2× benchmark) earns partial credit: right answers
// that would time out in a real test aren't test-ready.
export function attemptScore(correct: boolean, timeMs: number, benchmarkSec: number): number {
  if (!correct) return 0
  return timeMs > benchmarkSec * 2000 ? 0.7 : 1
}

export function eloUpdate(opts: {
  userRating: number
  userAttempts: number      // attempts on this skill, pre-update
  questionRating: number
  questionAttempts: number
  ratingLocked: boolean
  score: number             // from attemptScore
}): { userDelta: number; questionDelta: number } {
  const kUser = opts.userAttempts < 30 ? 32 : 16
  const kQuestion = opts.ratingLocked ? 0 : opts.questionAttempts > 200 ? 2 : 8
  const e = expectedScore(opts.userRating, opts.questionRating)
  return {
    userDelta: Math.round(kUser * (opts.score - e)),
    questionDelta: Math.round(-kQuestion * (opts.score - e)),
  }
}

// ---------- rolling windows / mastery ----------

export function pushWindow(window: number[], value: number, cap = 10): number[] {
  const next = [...window, value]
  return next.length > cap ? next.slice(next.length - cap) : next
}

export function windowAccuracy(rolling: number[]): number {
  if (rolling.length === 0) return 0
  return rolling.reduce((a, b) => a + b, 0) / rolling.length
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

// Promotion-only along the learning path (mastered comes from probes, rusty
// from decay — both decided by the caller). Criteria published in-product.
export function computeMastery(
  state: SkillState,
  skill: { benchmarkRating: number; benchmarkSeconds: number }
): Mastery {
  if (state.mastery === 'mastered' || state.mastery === 'rusty') return state.mastery
  const acc = windowAccuracy(state.rolling)
  const medianMs = median(state.timesMs)
  const proficient =
    state.attempts >= 15 &&
    acc >= 0.8 &&
    state.rating >= skill.benchmarkRating &&
    (medianMs === 0 || medianMs <= skill.benchmarkSeconds * 1250) // 1.25× benchmark
  if (proficient) return 'proficient'
  if (state.attempts >= 8 && acc >= 0.6) {
    // never demote proficient → familiar on a bad day
    return state.mastery === 'proficient' ? 'proficient' : 'familiar'
  }
  if (state.attempts >= 1) return state.mastery === 'proficient' || state.mastery === 'familiar' ? state.mastery : 'learning'
  return 'unseen'
}

// ---------- spaced repetition (SM-2-lite) ----------

export const REDEMPTION_STEPS = [1, 3, 7, 21] as const

export function errorIntervalModifier(errorType?: ErrorType | null): number {
  if (errorType === 'concept') return 0.75          // concept gaps come back sooner
  if (errorType === 'misread' || errorType === 'time') return 1.25
  return 1
}

export interface CardState {
  intervalDays: number
  correctStreak: number
}

// Returns the card's next state after a review attempt.
export function nextCardState(
  card: CardState,
  correct: boolean,
  errorType?: ErrorType | null
): CardState & { redeemed: boolean } {
  if (!correct) {
    return { intervalDays: 1, correctStreak: 0, redeemed: false }
  }
  const streak = card.correctStreak + 1
  if (streak >= 2) return { intervalDays: card.intervalDays, correctStreak: streak, redeemed: true }
  // advance to the next base step above the current interval
  const nextBase = REDEMPTION_STEPS.find((d) => d > card.intervalDays) ?? REDEMPTION_STEPS[REDEMPTION_STEPS.length - 1]
  return {
    intervalDays: Math.round(nextBase * errorIntervalModifier(errorType) * 100) / 100,
    correctStreak: streak,
    redeemed: false,
  }
}

// ---------- streaks (IST-day based) ----------

export function istDateString(now: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now)
}

export function nextStreak(prev: { streak: number; lastSetDate: string | null }, todayIst: string): number {
  if (prev.lastSetDate === todayIst) return prev.streak // already ticked today
  if (!prev.lastSetDate) return 1
  const prevDate = new Date(prev.lastSetDate + 'T00:00:00Z').getTime()
  const today = new Date(todayIst + 'T00:00:00Z').getTime()
  const gapDays = Math.round((today - prevDate) / 86_400_000)
  return gapDays === 1 ? prev.streak + 1 : 1
}

// ---------- daily-set builder ----------

export interface CandidateQuestion {
  id: string
  skillId: string
  rating: number
}

export interface DueReview {
  cardId: string
  questionId: string
  skillId: string
}

export interface DailySetPlan {
  questionIds: string[]
  reviewCardIds: string[]
  composition: { review: number; focus: number; interleave: number; stretch: number }
}

const FLOW_BAND: [number, number] = [0.65, 0.85]
const WIDE_BAND: [number, number] = [0.55, 0.9]
const STRETCH_BAND: [number, number] = [0.4, 0.55]

function inBand(p: number, [lo, hi]: [number, number]): boolean {
  return p >= lo && p <= hi
}

function takeRandom<T>(pool: T[], n: number, rng: () => number): T[] {
  const copy = [...pool]
  const out: T[] = []
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(rng() * copy.length)
    out.push(copy.splice(i, 1)[0])
  }
  return out
}

// Slots: 2 review · 5 focus-adaptive · 2 interleave · 1 stretch (doc 02 §2/§5).
// Degrades gracefully when queues are empty (day 1: all slots fill adaptively).
export function buildDailySet(opts: {
  dueReviews: DueReview[]                    // sorted oldest-due first
  candidates: CandidateQuestion[]            // approved, not recently seen
  skillRatings: Record<string, number>       // user rating per skill (absent → 1000)
  focusSkillIds: string[]
  practicedSkillIds: string[]                // skills with ≥1 attempt (interleave pool)
  size?: number
  rng?: () => number
}): DailySetPlan {
  const size = opts.size ?? 10
  const rng = opts.rng ?? Math.random
  const ratingOf = (skillId: string) => opts.skillRatings[skillId] ?? 1000
  const pOf = (q: CandidateQuestion) => expectedScore(ratingOf(q.skillId), q.rating)

  const picked = new Set<string>()
  const pick = (qs: CandidateQuestion[]) => {
    for (const q of qs) picked.add(q.id)
    return qs
  }
  const unpicked = (qs: CandidateQuestion[]) => qs.filter((q) => !picked.has(q.id))

  // 1) review slots
  const reviews = opts.dueReviews.slice(0, 2)
  for (const r of reviews) picked.add(r.questionId)

  // 2) focus-adaptive slots
  const focusPool = unpicked(opts.candidates.filter((q) => opts.focusSkillIds.includes(q.skillId)))
  const focusTarget = 5
  let focus = takeRandom(focusPool.filter((q) => inBand(pOf(q), FLOW_BAND)), focusTarget, rng)
  if (focus.length < focusTarget) {
    const widen = focusPool.filter((q) => !focus.includes(q) && inBand(pOf(q), WIDE_BAND))
    focus = focus.concat(takeRandom(widen, focusTarget - focus.length, rng))
  }
  if (focus.length < focusTarget) {
    const rest = focusPool
      .filter((q) => !focus.includes(q))
      .sort((a, b) => Math.abs(pOf(a) - 0.75) - Math.abs(pOf(b) - 0.75))
    focus = focus.concat(rest.slice(0, focusTarget - focus.length))
  }
  pick(focus)

  // 3) interleave slots (previously practiced, non-focus skills)
  const interleavePool = unpicked(
    opts.candidates.filter(
      (q) => opts.practicedSkillIds.includes(q.skillId) && !opts.focusSkillIds.includes(q.skillId)
    )
  )
  let interleave = takeRandom(interleavePool.filter((q) => inBand(pOf(q), WIDE_BAND)), 2, rng)
  if (interleave.length < 2) {
    interleave = interleave.concat(
      takeRandom(interleavePool.filter((q) => !interleave.includes(q)), 2 - interleave.length, rng)
    )
  }
  pick(interleave)

  // 4) stretch slot
  const stretchPool = unpicked(opts.candidates)
  let stretch = takeRandom(stretchPool.filter((q) => inBand(pOf(q), STRETCH_BAND)), 1, rng)
  if (stretch.length === 0) {
    // nearest question below the flow band ≈ closest thing to a stretch
    // (highest P under 0.65 — never the brutal extreme of the bank)
    const below = stretchPool.filter((q) => pOf(q) < FLOW_BAND[0]).sort((a, b) => pOf(b) - pOf(a))
    stretch = below.slice(0, 1)
  }
  pick(stretch)

  // 5) fill any shortfall with best-remaining adaptive candidates
  let ids = [
    ...reviews.map((r) => r.questionId),
    ...focus.map((q) => q.id),
    ...interleave.map((q) => q.id),
    ...stretch.map((q) => q.id),
  ]
  if (ids.length < size) {
    const filler = unpicked(opts.candidates)
      .sort((a, b) => Math.abs(pOf(a) - 0.75) - Math.abs(pOf(b) - 0.75))
      .slice(0, size - ids.length)
    // fillers sit before the stretch question so the set still ends on the stretch
    const stretchIds = stretch.map((q) => q.id)
    ids = ids.filter((id) => !stretchIds.includes(id)).concat(filler.map((q) => q.id)).concat(stretchIds)
  }
  ids = ids.slice(0, size)

  return {
    questionIds: ids,
    reviewCardIds: reviews.map((r) => r.cardId),
    composition: {
      review: reviews.length,
      focus: focus.length,
      interleave: interleave.length,
      stretch: stretch.length,
    },
  }
}

// ---------- daily challenge ----------

// Everyone gets the same 3 questions each IST day (doc 09: ambient community;
// doc 11: the Wordle share loop). One per domain where the bank allows, mid
// band so it's fair across levels, nothing repeated from recent challenges.
export const CHALLENGE_BAND: [number, number] = [1100, 1350]
export const CHALLENGE_SIZE = 3

export function pickChallengeQuestions(
  candidates: { id: string; domain: string; rating: number }[],
  recentIds: Set<string>,
  rng: () => number = Math.random
): string[] {
  const inBand = (q: { rating: number }) =>
    q.rating >= CHALLENGE_BAND[0] && q.rating <= CHALLENGE_BAND[1]
  const fresh = candidates.filter((q) => !recentIds.has(q.id))
  const pool = fresh.filter(inBand).length >= CHALLENGE_SIZE ? fresh.filter(inBand) : fresh

  const byDomain = new Map<string, { id: string; domain: string; rating: number }[]>()
  for (const q of pool) {
    const list = byDomain.get(q.domain) ?? []
    list.push(q)
    byDomain.set(q.domain, list)
  }

  const picked: string[] = []
  for (const domain of ['quant', 'logical', 'verbal']) {
    const list = (byDomain.get(domain) ?? []).filter((q) => !picked.includes(q.id))
    if (list.length > 0 && picked.length < CHALLENGE_SIZE) {
      picked.push(list[Math.floor(rng() * list.length)].id)
    }
  }
  // young banks may not cover all three domains — fill from anywhere
  const rest = pool.filter((q) => !picked.includes(q.id))
  while (picked.length < CHALLENGE_SIZE && rest.length > 0) {
    picked.push(rest.splice(Math.floor(rng() * rest.length), 1)[0].id)
  }
  return picked
}

// First not-yet-proficient skill in curriculum order is the focus; the next
// one rides along so the pool never starves.
export function chooseFocusSkills(
  orderedSkillIds: string[],
  states: Record<string, Pick<SkillState, 'mastery'>>
): string[] {
  const open = orderedSkillIds.filter((id) => {
    const m = states[id]?.mastery ?? 'unseen'
    return m !== 'proficient' && m !== 'mastered'
  })
  return open.slice(0, 2)
}

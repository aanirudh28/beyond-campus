import type {
  Card,
  CardOption,
  ChapterMeta,
  ChoiceRecord,
  Condition,
  EndingMatch,
  GameState,
  Profile,
  Stats,
} from './types'
import { chapterRng, mulberry32, seededShuffle } from './rng'
import { ALL_CARDS, CHAPTERS } from './content/chapters'
import { ENDINGS } from './content/endings'
export { buildLifeReport } from './content/report'

// Pure, deterministic engine. Same (seed, profile, choices) always produces
// the same life, in the browser and in the server-side validator.

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const round1 = (v: number) => Math.round(v * 10) / 10

export function createInitialState(profile: Profile, seed: number): GameState {
  const stats: Stats = {
    salary: 0,
    savings: 0.3,
    skills: 30,
    network: 20,
    reputation: 20,
    burnout: 20,
    family: 65,
  }
  if (profile.stream === 'bba') stats.network += 5
  if (profile.stream === 'bcom') stats.skills += 5
  if (profile.city === 'metro') {
    stats.network += 10
    stats.family -= 5
  }
  if (profile.city === 'tier3') {
    stats.network -= 5
    stats.family += 10
  }
  if (profile.ambition === 'money') stats.network += 5
  if (profile.ambition === 'stability') {
    stats.family += 8
    stats.burnout -= 5
  }
  if (profile.ambition === 'impact') {
    stats.reputation += 5
    stats.skills += 5
  }
  return {
    seed,
    profile,
    chapter: 0,
    age: CHAPTERS[0].ageFrom,
    year: CHAPTERS[0].yearFrom,
    stats,
    flags: {},
    history: [],
    trail: [
      {
        age: CHAPTERS[0].ageFrom,
        year: CHAPTERS[0].yearFrom,
        salary: stats.salary,
        savings: stats.savings,
        burnout: stats.burnout,
      },
    ],
  }
}

export function checkCondition(cond: Condition | undefined, state: GameState): boolean {
  if (!cond) return true
  if (cond.flag && !state.flags[cond.flag]) return false
  if (cond.notFlag && state.flags[cond.notFlag]) return false
  if (cond.ambition && state.profile.ambition !== cond.ambition) return false
  if (cond.city && state.profile.city !== cond.city) return false
  if (cond.stream && state.profile.stream !== cond.stream) return false
  if (cond.minStat) {
    for (const [k, v] of Object.entries(cond.minStat)) {
      if (state.stats[k as keyof Stats] < (v as number)) return false
    }
  }
  if (cond.maxStat) {
    for (const [k, v] of Object.entries(cond.maxStat)) {
      if (state.stats[k as keyof Stats] > (v as number)) return false
    }
  }
  return true
}

// Deal the chapter as seen from the CURRENT state: the cards already
// answered this chapter (in order), then a reactive plan for the remaining
// slots. Conditions are re-evaluated on every deal, so each choice can
// change what the rest of the chapter asks — and arc cards (flag-gated
// continuations of something you chose) jump the queue ahead of generic
// cards. Deterministic given (seed, profile, history): the priority order
// is one seeded shuffle per chapter, and re-dealing after each choice
// always reproduces the same answered prefix from history.
export function dealChapter(state: GameState): Card[] {
  const meta = CHAPTERS[state.chapter]
  const pool = ALL_CARDS[state.chapter]
  const rng = chapterRng(state.seed, state.chapter)
  const order = seededShuffle(pool, rng)

  const seq: Card[] = []
  const used = new Set<string>()
  for (const rec of state.history) {
    if (rec.c !== state.chapter) continue
    const card = pool.find((c) => c.id === rec.cardId)
    if (!card) break
    seq.push(card)
    used.add(card.id)
  }

  // Bonus slot: arc cards earn extra room, one per chapter. A life whose
  // choices keep triggering consequences gets a LONGER chapter, not fewer
  // generic cards. Counted over arcs already dealt plus arcs currently
  // eligible, so the total is stable across re-deals.
  const isArc = (c: Card) => c.condition?.flag !== undefined
  const arcsDealt = seq.filter(isArc).length
  const arcsWaiting = pool.filter(
    (c) => isArc(c) && !used.has(c.id) && checkCondition(c.condition, state),
  ).length
  const bonus = Math.min(1, arcsDealt + arcsWaiting)
  const total = meta.decisions + meta.events + bonus
  let events = seq.filter((c) => c.kind === 'event').length
  // Events land at the same stable positions as before: 2, 5, 8...
  const eventSlot = (i: number) => Math.min(2 + i * 3, meta.decisions + i)

  const pick = (kind: Card['kind']): Card | undefined => {
    const cands = order.filter(
      (c) => c.kind === kind && !used.has(c.id) && checkCondition(c.condition, state),
    )
    if (kind === 'event') {
      const forced = cands.find((c) => c.forced)
      if (forced) return forced
    }
    // A card that exists because of a flag you set is always more yours
    // than a generic one: consequences chase their choices.
    return cands.find((c) => c.condition?.flag !== undefined) ?? cands[0]
  }

  while (seq.length < total) {
    const wantEvent = events < meta.events && seq.length >= eventSlot(events)
    const card = wantEvent ? (pick('event') ?? pick('decision')) : (pick('decision') ?? pick('event'))
    if (!card) break
    if (card.kind === 'event') events++
    used.add(card.id)
    seq.push(card)
  }
  return seq
}

// How many cards of the current chapter the state has already answered.
export function answeredInChapter(state: GameState): number {
  let n = 0
  for (const rec of state.history) if (rec.c === state.chapter) n++
  return n
}

function applyEffects(stats: Stats, option: CardOption): Stats {
  const next = { ...stats }
  const fx = option.effects
  if (fx.salary !== undefined) {
    next.salary =
      typeof fx.salary === 'number'
        ? fx.salary === 0
          ? 0
          : round1(next.salary + fx.salary)
        : round1(next.salary * fx.salary.mult)
  }
  if (fx.savings !== undefined) next.savings = round1(next.savings + fx.savings)
  for (const k of ['skills', 'network', 'reputation', 'burnout', 'family'] as const) {
    const delta = fx[k]
    if (delta !== undefined) next[k] = clamp(next[k] + delta, 0, 100)
  }
  next.savings = Math.max(next.savings, -30) // debt floor
  return next
}

export function applyChoice(state: GameState, card: Card, option: CardOption): GameState {
  const flags = { ...state.flags }
  for (const f of option.setFlags ?? []) flags[f] = true
  return {
    ...state,
    stats: applyEffects(state.stats, option),
    flags,
    history: [...state.history, { c: state.chapter, cardId: card.id, optionId: option.id }],
  }
}

// Passive time between chapters: appraisals, savings from salary, burnout decay.
// Uses its own seeded stream so it never collides with card-selection draws.
export function advanceChapter(state: GameState): GameState {
  const meta = CHAPTERS[state.chapter]
  const years = meta.ageTo - meta.ageFrom
  const rng = mulberry32((state.seed ^ ((state.chapter + 1) * 0x85ebca6b)) >>> 0)
  const stats = { ...state.stats }

  // Everyone is employed somehow by 23. If no job card fired, land a baseline role.
  if (state.chapter === 0 && stats.salary === 0) {
    stats.salary = round1(state.flags['exam_track'] ? 4.8 : 3.2 + rng() * 1.2)
  }

  if (stats.salary > 0) {
    const appraisal = Math.pow(1.05 + rng() * 0.04, years)
    stats.salary = round1(stats.salary * appraisal)
  }
  stats.savings = round1(stats.savings + stats.salary * years * 0.2)
  // Chapters run longer since the bonus arc slots, so the between-chapter
  // recovery is one point deeper to keep the burnout economy balanced.
  stats.burnout = clamp(stats.burnout - 5, 0, 100)

  // Track the burnout ceiling for endings before the decay era hides it.
  const flags = state.flags
  const peaked = stats.burnout >= 85 || state.stats.burnout >= 85

  const nextChapter = state.chapter + 1
  const nextMeta: ChapterMeta | undefined = CHAPTERS[nextChapter]
  const age = nextMeta ? nextMeta.ageFrom : meta.ageTo
  const year = nextMeta ? nextMeta.yearFrom : meta.yearTo
  return {
    ...state,
    flags: peaked && !flags['burnout_peaked'] ? { ...flags, burnout_peaked: true } : flags,
    chapter: nextChapter,
    age,
    year,
    stats,
    trail: [
      ...state.trail,
      { age, year, salary: stats.salary, savings: stats.savings, burnout: stats.burnout },
    ],
  }
}

// Display helpers: age/year at a card position inside the current chapter.
export function ageAtCard(chapter: number, cardIndex: number, cardCount: number) {
  const meta = CHAPTERS[chapter]
  const t = cardCount > 1 ? cardIndex / (cardCount - 1) : 0
  return {
    age: Math.round(meta.ageFrom + t * (meta.ageTo - meta.ageFrom - 1)),
    year: Math.round(meta.yearFrom + t * (meta.yearTo - meta.yearFrom - 1)),
  }
}

export class ReplayError extends Error {}

// Rebuild state up to the entry of targetChapter from (seed, profile, choices).
// Re-deals after every choice, exactly like play. Throws ReplayError on any
// tampering or drift.
export function replayToChapter(
  seed: number,
  profile: Profile,
  choices: ChoiceRecord[],
  targetChapter: number,
): { state: GameState; consumed: number } {
  let state = createInitialState(profile, seed)
  let i = 0
  for (let ch = 0; ch < targetChapter; ch++) {
    for (;;) {
      const cards = dealChapter(state)
      const idx = answeredInChapter(state)
      if (idx >= cards.length) break
      const card = cards[idx]
      const choice = choices[i++]
      if (!choice || choice.c !== ch || choice.cardId !== card.id) {
        throw new ReplayError(`choice ${i - 1} does not match dealt card ${card.id}`)
      }
      const option = card.options.find((o) => o.id === choice.optionId)
      if (!option) throw new ReplayError(`invalid option ${choice.optionId} on ${card.id}`)
      state = applyChoice(state, card, option)
    }
    state = advanceChapter(state)
  }
  return { state, consumed: i }
}

// Server-side validator: rebuild the whole run. Every choice must be consumed.
export function replayRun(seed: number, profile: Profile, choices: ChoiceRecord[]): GameState {
  const { state, consumed } = replayToChapter(seed, profile, choices, CHAPTERS.length)
  if (consumed !== choices.length) throw new ReplayError('extra choices beyond the dealt cards')
  return state
}

function matchesEnding(m: EndingMatch, state: GameState): boolean {
  if (!checkCondition(m, state)) return false
  const s = state.stats
  if (m.minSalary !== undefined && s.salary < m.minSalary) return false
  if (m.maxSalary !== undefined && s.salary > m.maxSalary) return false
  if (m.minSavings !== undefined && s.savings < m.minSavings) return false
  if (m.maxSavings !== undefined && s.savings > m.maxSavings) return false
  if (m.allFlags && !m.allFlags.every((f) => state.flags[f])) return false
  if (m.anyFlags && !m.anyFlags.some((f) => state.flags[f])) return false
  if (m.noneFlags && m.noneFlags.some((f) => state.flags[f])) return false
  return true
}

export function selectEnding(state: GameState): string {
  // The Burnout ending honours the peak, not just the mellowed final number.
  const probe: GameState = state.flags['burnout_peaked']
    ? { ...state, stats: { ...state.stats, burnout: Math.max(state.stats.burnout, 80) } }
    : state
  for (const e of ENDINGS) {
    if (matchesEnding(e.match, probe)) return e.id
  }
  return 'the_open_road'
}

export interface GhostResult {
  forkCardId: string
  forkChapter: number
  takenLabel: string // what the player actually chose
  otherLabel: string // the road not taken
  endingId: string
  stats: Stats
}

// The roads not taken: replay the same seeded life, but flip one pivotal
// choice and let the consequences cascade. Where the alternate timeline deals
// a card the player never saw, a dedicated seeded stream picks for the ghost,
// so the result is fully deterministic and costs zero AI calls.
export function simulateGhost(
  seed: number,
  profile: Profile,
  choices: ChoiceRecord[],
  forkIndex: number,
): GhostResult | null {
  const fork = choices[forkIndex]
  if (!fork) return null
  const chosenByCard = new Map(choices.map((c) => [c.cardId, c.optionId]))
  const ghostRng = mulberry32((seed ^ 0xc0ffee) >>> 0)

  let state = createInitialState(profile, seed)
  let takenLabel = ''
  let otherLabel = ''
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    for (;;) {
      const cards = dealChapter(state)
      const idx = answeredInChapter(state)
      if (idx >= cards.length) break
      const card = cards[idx]
      let option: CardOption
      if (card.id === fork.cardId) {
        const taken = card.options.find((o) => o.id === fork.optionId)
        const other = card.options.find((o) => o.id !== fork.optionId)
        if (!taken || !other) return null
        takenLabel = taken.label
        otherLabel = other.label
        option = other
      } else {
        const known = card.options.find((o) => o.id === chosenByCard.get(card.id))
        option = known ?? card.options[Math.floor(ghostRng() * card.options.length)]
      }
      state = applyChoice(state, card, option)
    }
    state = advanceChapter(state)
  }
  if (!otherLabel) return null // the fork card never appeared in the ghost deal
  return {
    forkCardId: fork.cardId,
    forkChapter: fork.c,
    takenLabel,
    otherLabel,
    endingId: selectEnding(state),
    stats: state.stats,
  }
}

// The long-game option: what a disciplined player would pick, scored by
// compounding assets (skills, network, reputation) net of burnout, with a
// nod to salary multipliers. Deterministic; ties go to the first option.
export function disciplinedOption(card: Card): CardOption {
  let best = card.options[0]
  let bestScore = -Infinity
  for (const option of card.options) {
    const fx = option.effects
    const score =
      (fx.skills ?? 0) +
      (fx.network ?? 0) +
      (fx.reputation ?? 0) -
      (fx.burnout ?? 0) +
      (typeof fx.salary === 'object' ? (fx.salary.mult - 1) * 10 : 0)
    if (score > bestScore) {
      bestScore = score
      best = option
    }
  }
  return best
}

// The disciplined ghost: same seed, same luck, every choice the long game.
export function simulateDisciplined(seed: number, profile: Profile): GameState {
  let state = createInitialState(profile, seed)
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    for (;;) {
      const cards = dealChapter(state)
      const idx = answeredInChapter(state)
      if (idx >= cards.length) break
      state = applyChoice(state, cards[idx], disciplinedOption(cards[idx]))
    }
    state = advanceChapter(state)
  }
  return state
}

// Up to `max` fork points worth showing: pivotal decisions, earliest first.
export function ghostForkIndices(choices: ChoiceRecord[], max = 2): number[] {
  const indices: number[] = []
  for (let i = 0; i < choices.length; i++) {
    const card = ALL_CARDS[choices[i].c]?.find((c) => c.id === choices[i].cardId)
    if (card?.pivotal && card.options.length > 1) indices.push(i)
  }
  if (indices.length <= max) return indices
  // Spread across the life: first pivotal choice plus one from the middle years.
  const picks = [indices[0]]
  picks.push(indices[Math.floor(indices.length / 2)])
  return picks.slice(0, max)
}

// Pivotal choices as human-readable lines, for the AI epilogue digest.
export function pivotalMoments(state: GameState): string[] {
  const lines: string[] = []
  for (const rec of state.history) {
    const card = ALL_CARDS[rec.c].find((c) => c.id === rec.cardId)
    if (!card?.pivotal) continue
    const option = card.options.find((o) => o.id === rec.optionId)
    if (!option) continue
    const meta = CHAPTERS[rec.c]
    lines.push(`Around age ${meta.ageFrom}-${meta.ageTo}: "${card.title}" — chose "${option.label}"`)
  }
  return lines.slice(0, 10)
}

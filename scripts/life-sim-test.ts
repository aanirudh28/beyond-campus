// The 20 Years invariant suite (docs/20years/04 §4) — the release gate.
// Run: npx tsx scripts/life-sim-test.ts [--ci]
// --ci exits non-zero on any failed check; without it you still get the
// balance report. Checks: replay-identity, ending-reachability,
// distribution-bounds, profile-fairness, orphan-flags, effect-budgets,
// stat-sanity. (policy-stability and --baseline diffing: follow-up.)

import { readFileSync } from 'fs'
import { join } from 'path'
import { ALL_CARDS, CHAPTERS } from '../lib/life/content/chapters'
import { ENDINGS } from '../lib/life/content/endings'
import { FLAGS } from '../lib/life/content/flags'
import {
  advanceChapter,
  applyChoice,
  createInitialState,
  dealChapter,
  replayRun,
  selectEnding,
} from '../lib/life/engine'
import type { Card, ChoiceRecord, GameState, Profile, Stats } from '../lib/life/types'
import { mulberry32 } from '../lib/life/rng'

const CI = process.argv.includes('--ci')
const RUNS = 3000

const STREAMS = ['bba', 'bcom', 'other'] as const
const CITIES = ['metro', 'tier2', 'tier3'] as const
const AMBITIONS = ['money', 'stability', 'impact'] as const

interface CheckResult {
  name: string
  pass: boolean
  detail: string
}
const results: CheckResult[] = []
function check(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail })
}

// ---------- simulation ----------

const STAT_KEYS: (keyof Stats)[] = ['skills', 'network', 'reputation', 'burnout', 'family']
let statSanityError: string | null = null

function assertSane(state: GameState, where: string) {
  if (statSanityError) return
  const s = state.stats
  for (const k of STAT_KEYS) {
    const v = s[k]
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      statSanityError = `${k}=${v} escaped clamps at ${where}`
      return
    }
  }
  if (!Number.isFinite(s.salary) || s.salary < 0) statSanityError = `salary=${s.salary} at ${where}`
  if (!Number.isFinite(s.savings) || s.savings < -30) statSanityError = `savings=${s.savings} at ${where}`
}

function playRandom(seed: number, profile: Profile, pick: () => number) {
  let state = createInitialState(profile, seed)
  const choices: ChoiceRecord[] = []
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    // Re-deal after every choice, exactly like live play.
    for (;;) {
      const cards = dealChapter(state)
      const idx = choices.filter((c) => c.c === ch).length
      if (idx >= cards.length) break
      const card = cards[idx]
      const option = card.options[Math.floor(pick() * card.options.length)]
      choices.push({ c: ch, cardId: card.id, optionId: option.id })
      state = applyChoice(state, card, option)
      assertSane(state, `${card.id}:${option.id}`)
    }
    state = advanceChapter(state)
    assertSane(state, `advance ch${ch}`)
  }
  return { state, choices }
}

const endingCounts = new Map<string, number>()
const toneCounts = { good: 0, bad: 0, weird: 0 }
const profileStats = new Map<string, { total: number; bad: number }>()
let replayFailure: string | null = null
let cardsSeen = 0

const toneOf = new Map(ENDINGS.map((e) => [e.id, e.tone]))

for (let i = 0; i < RUNS; i++) {
  const pick = mulberry32(i * 7919 + 13)
  const profile: Profile = {
    stream: STREAMS[i % 3],
    city: CITIES[Math.floor(i / 3) % 3],
    ambition: AMBITIONS[Math.floor(i / 9) % 3],
  }
  const seed = (i * 2654435761) % 2 ** 31
  const { state, choices } = playRandom(seed, profile, pick)
  cardsSeen += choices.length

  if (!replayFailure) {
    const replayed = replayRun(seed, profile, choices)
    if (JSON.stringify(replayed) !== JSON.stringify(state)) {
      replayFailure = `run ${i} (seed ${seed}) did not replay byte-identically`
    }
  }

  const endingId = selectEnding(state)
  endingCounts.set(endingId, (endingCounts.get(endingId) ?? 0) + 1)
  const tone = toneOf.get(endingId) ?? 'weird'
  toneCounts[tone]++
  const key = `${profile.stream}/${profile.city}/${profile.ambition}`
  const ps = profileStats.get(key) ?? { total: 0, bad: 0 }
  ps.total++
  if (tone === 'bad') ps.bad++
  profileStats.set(key, ps)
}

// Second-generation runs: same engine, inherited start. Verify determinism
// and replay-identity with an inheritance in play.
let legacyFailure: string | null = null
const LEGACY_IDS = ['legacy_cushion', 'legacy_rebuild', 'legacy_echo'] as const
for (let i = 0; i < 300 && !legacyFailure; i++) {
  const pick = mulberry32(i * 104729 + 7)
  const profile: Profile = {
    stream: STREAMS[i % 3],
    city: CITIES[Math.floor(i / 3) % 3],
    ambition: AMBITIONS[Math.floor(i / 9) % 3],
  }
  const seed = (i * 48271 + 11) % 2 ** 31
  const inheritance = { o: LEGACY_IDS[i % 3], pe: 'the_founder' }
  let state = createInitialState(profile, seed, inheritance)
  const choices: ChoiceRecord[] = []
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    for (;;) {
      const cards = dealChapter(state)
      const idx = choices.filter((c) => c.c === ch).length
      if (idx >= cards.length) break
      const card = cards[idx]
      const option = card.options[Math.floor(pick() * card.options.length)]
      choices.push({ c: ch, cardId: card.id, optionId: option.id })
      state = applyChoice(state, card, option)
      assertSane(state, `legacy ${card.id}`)
    }
    state = advanceChapter(state)
  }
  const replayed = replayRun(seed, profile, choices, inheritance)
  if (JSON.stringify(replayed) !== JSON.stringify(state)) {
    legacyFailure = `legacy run ${i} did not replay byte-identically`
  }
  if (!state.flags[`origin_${inheritance.o}`] || !state.flags['second_generation']) {
    legacyFailure = `legacy run ${i} missing origin/second_generation flags`
  }
}

// ---------- checks ----------

// 1. replay-identity
check('replay-identity', !replayFailure, replayFailure ?? `${RUNS} runs replay byte-identically`)
check('legacy-replay', !legacyFailure, legacyFailure ?? '300 second-generation runs replay byte-identically')

// 2. stat-sanity
check('stat-sanity', !statSanityError, statSanityError ?? 'all states within clamps, no NaN')

// 3. ending-reachability
const unreachable = ENDINGS.filter((e) => !endingCounts.has(e.id)).map((e) => e.id)
check(
  'ending-reachability',
  unreachable.length === 0,
  unreachable.length ? `unreachable: ${unreachable.join(', ')}` : `all ${ENDINGS.length} endings occur`,
)

// 4. distribution-bounds (doc 02 §4.2-3)
const overMax = [...endingCounts.entries()]
  .map(([id, n]) => [id, (n / RUNS) * 100] as const)
  .filter(([, pct]) => pct > 12)
const catchAllPct =
  (((endingCounts.get('the_solid_middle') ?? 0) + (endingCounts.get('the_open_road') ?? 0)) / RUNS) * 100
const tonePct = {
  good: (toneCounts.good / RUNS) * 100,
  weird: (toneCounts.weird / RUNS) * 100,
  bad: (toneCounts.bad / RUNS) * 100,
}
const toneTarget = { good: 40, weird: 35, bad: 25 }
const toneOff = (Object.keys(toneTarget) as (keyof typeof toneTarget)[]).filter(
  (t) => Math.abs(tonePct[t] - toneTarget[t]) > 8,
)
const distProblems = [
  ...overMax.map(([id, pct]) => `${id} at ${pct.toFixed(1)}% (>12%)`),
  ...(catchAllPct > 20 ? [`catch-alls at ${catchAllPct.toFixed(1)}% (>20%)`] : []),
  ...toneOff.map((t) => `tone ${t} at ${tonePct[t].toFixed(1)}% (target ${toneTarget[t]}±8)`),
]
check(
  'distribution-bounds',
  distProblems.length === 0,
  distProblems.length
    ? distProblems.join('; ')
    : `max ending ${Math.max(...[...endingCounts.values()].map((n) => (n / RUNS) * 100)).toFixed(1)}% · tones ${tonePct.good.toFixed(0)}/${tonePct.weird.toFixed(0)}/${tonePct.bad.toFixed(0)}`,
)

// 5. profile-fairness (doc 02 §4.4)
const globalBad = (toneCounts.bad / RUNS) * 100
const unfair = [...profileStats.entries()]
  .map(([key, { total, bad }]) => [key, (bad / total) * 100] as const)
  .filter(([, rate]) => rate > globalBad + 15)
check(
  'profile-fairness',
  unfair.length === 0,
  unfair.length
    ? unfair.map(([k, r]) => `${k} bad-rate ${r.toFixed(0)}% (global ${globalBad.toFixed(0)}%)`).join('; ')
    : `no profile >15pp above global bad-rate ${globalBad.toFixed(1)}%`,
)

// 6. orphan-flags (doc 03 §5)
const allCards: Card[] = ALL_CARDS.flat()
// Engine-set flags: the burnout constitutional plus the six dealt origins.
const setNames = new Set<string>([
  'burnout_peaked',
  'origin_first_gen',
  'origin_loan',
  'origin_shop_family',
  'origin_topper',
  'origin_english',
  'origin_hustler',
  'origin_legacy_cushion',
  'origin_legacy_rebuild',
  'origin_legacy_echo',
  'second_generation',
])
const readNames = new Set<string>()
for (const card of allCards) {
  for (const opt of card.options) for (const f of opt.setFlags ?? []) setNames.add(f)
  if (card.condition?.flag) readNames.add(card.condition.flag)
  if (card.condition?.notFlag) readNames.add(card.condition.notFlag)
}
for (const e of ENDINGS) {
  const m = e.match
  if (m.flag) readNames.add(m.flag)
  if (m.notFlag) readNames.add(m.notFlag)
  for (const f of [...(m.anyFlags ?? []), ...(m.allFlags ?? []), ...(m.noneFlags ?? [])]) readNames.add(f)
}
// report.ts and engine.ts read flags inside functions: scan the source.
for (const file of ['../lib/life/content/report.ts', '../lib/life/engine.ts']) {
  const src = readFileSync(join(__dirname, file), 'utf8')
  for (const match of src.matchAll(/flags\['([a-z_0-9]+)'\]/g)) readNames.add(match[1])
}
const flagProblems: string[] = []
for (const name of [...setNames, ...readNames]) {
  if (!FLAGS[name]) flagProblems.push(`'${name}' not in the registry`)
}
for (const name of readNames) {
  if (name !== 'burnout_peaked' && !setNames.has(name)) flagProblems.push(`'${name}' read but never set`)
}
for (const name of setNames) {
  if (name === 'burnout_peaked') continue
  if (!readNames.has(name) && !FLAGS[name]?.narrative) {
    flagProblems.push(`'${name}' set but never read (mark narrative or add a reader)`)
  }
}
check(
  'orphan-flags',
  flagProblems.length === 0,
  flagProblems.length ? flagProblems.join('; ') : `${setNames.size} set / ${readNames.size} read, closed under the registry`,
)

// 7. effect-budgets (doc 02 §5; touched-stats cap relaxed to 6 for pivotal cards)
const budgetProblems: string[] = []
for (const card of allCards) {
  const statCap = card.pivotal ? 20 : 15
  const savingsCap = card.chapter === 4 && card.kind === 'event' ? 30 : 20
  for (const opt of card.options) {
    const fx = opt.effects
    const touched = Object.keys(fx).length
    if (touched > (card.pivotal ? 6 : 4)) {
      budgetProblems.push(`${card.id}:${opt.id} touches ${touched} stats`)
    }
    for (const k of STAT_KEYS) {
      const v = fx[k]
      if (typeof v === 'number' && Math.abs(v) > statCap) {
        budgetProblems.push(`${card.id}:${opt.id} ${k} ${v} (cap ±${statCap})`)
      }
    }
    if (fx.savings !== undefined && Math.abs(fx.savings) > savingsCap) {
      budgetProblems.push(`${card.id}:${opt.id} savings ${fx.savings} (cap ±${savingsCap})`)
    }
    if (typeof fx.salary === 'number' && fx.salary !== 0 && Math.abs(fx.salary) > 4) {
      budgetProblems.push(`${card.id}:${opt.id} salary +${fx.salary} (additive cap ±4)`)
    }
    if (typeof fx.salary === 'object' && (fx.salary.mult < 0.5 || fx.salary.mult > 1.6)) {
      budgetProblems.push(`${card.id}:${opt.id} salary mult ${fx.salary.mult} (bounds 0.5-1.6)`)
    }
    if ((opt.setFlags?.length ?? 0) > 2) {
      budgetProblems.push(`${card.id}:${opt.id} sets ${opt.setFlags!.length} flags (cap 2)`)
    }
  }
}
check(
  'effect-budgets',
  budgetProblems.length === 0,
  budgetProblems.length ? budgetProblems.join('; ') : `${allCards.length} cards within magnitude budgets`,
)

// ---------- report ----------

console.log(`\n20 YEARS INVARIANT SUITE · ${RUNS} runs · avg ${(cardsSeen / RUNS).toFixed(1)} cards/run\n`)
for (const r of results) {
  console.log(`  [${r.pass ? 'PASS' : 'FAIL'}] ${r.name.padEnd(22)} ${r.detail}`)
}

console.log('\nEnding distribution:')
for (const [id, n] of [...endingCounts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(((n / RUNS) * 100).toFixed(1)).padStart(5)}%  ${toneOf.get(id)?.padEnd(5)}  ${id}`)
}

const failed = results.filter((r) => !r.pass)
if (failed.length) {
  console.log(`\n✗ ${failed.length} check(s) failed`)
  if (CI) process.exit(1)
} else {
  console.log('\n✓ all checks pass')
}

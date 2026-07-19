import { ENDINGS } from './content/endings'
import { ALL_CARDS, CHAPTERS } from './content/chapters'
import type { Ending, EndingMatch, GameState, Stats } from './types'

// The doors you brushed past: endings that would have been yours with
// exactly ONE more thing — a savings gap, a stat gap, or a single choice
// never made. Fully deterministic from the final state and the ending
// matchers themselves, so it is always precisely true. This is the replay
// engine: the game tells you, to the rupee, how close the other life was.
//
// Only aspirational gaps count as doors (min thresholds and missing
// flags). If an ending failed because you overshot a maximum, that is not
// a door, it is a different life. Flag gaps never name the card: "a door
// around age 25-27 you never opened" is a hook, not a spoiler.

export interface NearMiss {
  endingId: string
  name: string
  emoji: string
  tone: Ending['tone']
  gap: string // "you finished ₹9L short" / "family 4 points short" / "a door around age 25-27..."
}

export interface NearMissResult {
  doors: NearMiss[] // aspirational: good/weird endings, max 2, rarest first
  closeCall: NearMiss | null // a bad ending you narrowly escaped
}

// How near is near: gaps beyond these are journeys, not doors.
const NEAR = { savings: 30, salary: 10, stat: 15 }

const STAT_LABEL: Record<keyof Stats, string> = {
  salary: 'salary',
  savings: 'savings',
  skills: 'skills',
  network: 'network',
  reputation: 'reputation',
  burnout: 'burnout',
  family: 'family',
}

// The earliest chapter where any card can set one of these flags.
function doorChapter(flags: string[]): number | null {
  let best: number | null = null
  for (const pool of ALL_CARDS) {
    for (const card of pool) {
      for (const option of card.options) {
        if (option.setFlags?.some((f) => flags.includes(f))) {
          if (best === null || card.chapter < best) best = card.chapter
        }
      }
    }
  }
  return best
}

function flagGap(flags: string[]): string | null {
  const ch = doorChapter(flags)
  if (ch === null) return null
  const meta = CHAPTERS[ch]
  return `a door around age ${meta.ageFrom}-${meta.ageTo} you never opened`
}

// Evaluate one matcher against the final state. Returns the single
// aspirational gap if exactly one requirement failed, undefined otherwise.
function singleGap(m: EndingMatch, state: GameState): string | undefined {
  const s = state.stats
  const gaps: string[] = []

  // Disqualifiers: requirements that failed in a non-aspirational
  // direction, or that this life cannot change (profile).
  if (m.notFlag && state.flags[m.notFlag]) return undefined
  if (m.ambition && state.profile.ambition !== m.ambition) return undefined
  if (m.city && state.profile.city !== m.city) return undefined
  if (m.stream && state.profile.stream !== m.stream) return undefined
  if (m.maxSalary !== undefined && s.salary > m.maxSalary) return undefined
  if (m.maxSavings !== undefined && s.savings > m.maxSavings) return undefined
  if (m.maxStat) {
    for (const [k, v] of Object.entries(m.maxStat)) {
      if (s[k as keyof Stats] > (v as number)) return undefined
    }
  }
  if (m.noneFlags?.some((f) => state.flags[f])) return undefined

  // Aspirational requirements: collect each miss as a gap.
  if (m.flag && !state.flags[m.flag]) {
    const g = flagGap([m.flag])
    if (!g) return undefined
    gaps.push(g)
  }
  if (m.minSalary !== undefined && s.salary < m.minSalary) {
    const d = Math.ceil((m.minSalary - s.salary) * 10) / 10
    if (d > NEAR.salary) return undefined
    gaps.push(`₹${d} LPA short on salary`)
  }
  if (m.minSavings !== undefined && s.savings < m.minSavings) {
    const d = Math.ceil(m.minSavings - s.savings)
    if (d > NEAR.savings) return undefined
    gaps.push(`you finished ₹${d}L short`)
  }
  if (m.minStat) {
    for (const [k, v] of Object.entries(m.minStat)) {
      const cur = s[k as keyof Stats]
      if (cur < (v as number)) {
        const d = Math.ceil((v as number) - cur)
        if (d > NEAR.stat) return undefined
        gaps.push(`${STAT_LABEL[k as keyof Stats]} ${d} point${d === 1 ? '' : 's'} short`)
      }
    }
  }
  const missingAll = (m.allFlags ?? []).filter((f) => !state.flags[f])
  if (missingAll.length === 1) {
    const g = flagGap(missingAll)
    if (!g) return undefined
    gaps.push(g)
  } else if (missingAll.length > 1) {
    return undefined
  }
  if (m.anyFlags && !m.anyFlags.some((f) => state.flags[f])) {
    const g = flagGap(m.anyFlags)
    if (!g) return undefined
    gaps.push(g)
  }

  return gaps.length === 1 ? gaps[0] : undefined
}

export function nearMissEndings(state: GameState, achievedId: string): NearMissResult {
  const doors: NearMiss[] = []
  let closeCall: NearMiss | null = null
  for (const e of ENDINGS) {
    if (e.id === achievedId || e.id === 'the_open_road') continue
    const gap = singleGap(e.match, state)
    if (!gap) continue
    const miss: NearMiss = { endingId: e.id, name: e.name, emoji: e.emoji, tone: e.tone, gap }
    if (e.tone === 'bad') {
      if (!closeCall) closeCall = miss
    } else if (doors.length < 2) {
      doors.push(miss)
    }
    if (doors.length === 2 && closeCall) break
  }
  return { doors, closeCall }
}

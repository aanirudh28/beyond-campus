import { CHAPTERS } from './content/chapters'
import type { GameState } from './types'

// Market weather: every seed generates its own economic history, fully
// deterministic. Chapters 1-4 (index 0-3) draw seeded weather, the
// Correction chapter (index 4) is always the crash (the set-piece), and
// the final chapter is the recovery era. Same seed = same market, so a
// challenge rival and the batchmate live the exact same cycle.
//
// The weather is real: advanceChapter compounds invested savings on these
// phases, salaries tilt with the cycle, and cards can condition on the
// phase via Condition.market.

export type MarketPhase = 'boom' | 'steady' | 'squeeze' | 'crash' | 'rebound'

function hash(seed: number, chapter: number): number {
  let h = (seed ^ 0x9e37a5b5) >>> 0
  h = Math.imul(h ^ (chapter + 0x7f4a7c15), 0x85ebca6b) >>> 0
  h ^= h >>> 13
  return (Math.imul(h, 0xc2b2ae35) >>> 0) / 4294967296
}

export function marketPhase(seed: number, chapter: number): MarketPhase {
  if (chapter === 4) return 'crash'
  if (chapter >= 5) return hash(seed, chapter) < 0.7 ? 'rebound' : 'steady'
  const r = hash(seed, chapter)
  if (r < 0.3) return 'boom'
  if (r < 0.75) return 'steady'
  return 'squeeze'
}

// Annual return on POSITIVE savings, by phase. "Invested" means the money
// is actually in the market (the SIP habit or the dip buy); idle cash
// earns FD rates in every weather.
export const MARKET_RETURN: Record<MarketPhase, { invested: number; idle: number }> = {
  boom: { invested: 0.05, idle: 0.01 },
  steady: { invested: 0.02, idle: 0.01 },
  squeeze: { invested: -0.02, idle: 0.01 },
  crash: { invested: -0.05, idle: 0.005 },
  rebound: { invested: 0.05, idle: 0.01 },
}

// Extra annual beta for dip-buyers during the recovery: the mechanical
// heart of the Recession Alchemist fantasy.
export const DIP_REBOUND_BONUS = 0.04

// Annual salary tilt: cycles move paychecks too, gently.
export const SALARY_TILT: Record<MarketPhase, number> = {
  boom: 0.01,
  steady: 0,
  squeeze: -0.01,
  crash: -0.015,
  rebound: 0.01,
}

export function isInvested(state: GameState): boolean {
  return state.flags['invested_early'] === true || state.flags['bought_dip'] === true
}

export const MARKET_LABEL: Record<MarketPhase, string> = {
  boom: 'BOOM YEARS',
  steady: 'STEADY YEARS',
  squeeze: 'THE SQUEEZE',
  crash: 'THE CRASH',
  rebound: 'THE RECOVERY',
}

// Montage headlines: what the years about to begin feel like from a desk.
const HEADLINES: Record<MarketPhase, string[]> = {
  boom: [
    'The index does not stop. The office chai group has quietly become a stock-tips group.',
    'Funding is loose, hiring is loud, and everyone around you is suddenly a genius. It is that kind of market.',
  ],
  steady: [
    'The market does nothing dramatic, which the wise will later call the best weather there is.',
    'Steady years. Increments arrive on schedule and the news stays boring, which is a blessing nobody screenshots.',
  ],
  squeeze: [
    'Hiring freezes creep across the industry. LinkedIn fills with green rings and brave captions.',
    'Budgets tighten everywhere at once. The word "restructuring" starts appearing in town halls, casually, like weather.',
  ],
  crash: [
    'It arrives slowly and then all at once. Funding freezes, floors go quiet, and the machines take the work of teams.',
  ],
  rebound: [
    'The recovery arrives the way recoveries do: quietly, and first for the prepared.',
    'Markets heal, memories shorten, and the people who kept their nerve start getting paid for it.',
  ],
}

export function marketHeadline(seed: number, chapter: number): string {
  const phase = marketPhase(seed, chapter)
  const pool = HEADLINES[phase]
  return `${CHAPTERS[chapter].yearFrom}: ${pool[Math.floor(hash(seed, chapter + 17) * pool.length)]}`
}

import type { Ending, Stats } from './types'
import type { Origin } from './origins'

// The Second Generation: an ending becomes an origin. When a completed run
// raises the next one, the child's dealt hand is not random — it is the
// parent's ledger, converted. Three legacy origins replace the seed-drawn
// six, chosen deterministically from the parent's final stats and tone.
//
// Inheritance is stored on the run row (life_runs.inheritance jsonb) so the
// server's anti-cheat replay reconstructs the exact same starting state.

export interface Inheritance {
  o: 'legacy_cushion' | 'legacy_rebuild' | 'legacy_echo'
  pe: string // parent ending id, for display and texture
}

export const LEGACY_ORIGINS: Origin[] = [
  {
    id: 'legacy_cushion',
    flag: 'origin_legacy_cushion',
    name: 'The Safety Net',
    blurb:
      'Your parent finished their fifteen years with real money in the bank, and your twenties will never know the particular fear theirs did. The net is real. So is its shadow: nothing you build will ever feel entirely yours to lose.',
    effects: { savings: 6, network: 4, family: 4, burnout: -2 },
    identity: 'The safety net',
    epiloguePhrase: 'a net your parent wove and a shadow that came with it',
  },
  {
    id: 'legacy_rebuild',
    flag: 'origin_legacy_rebuild',
    name: 'The Rebuild',
    blurb:
      'Your parent’s fifteen years ended thinner than they deserved, and the family ledger you inherit has more lessons than lakhs in it. You have watched what the wrong years do to good people. That knowledge is a strange kind of capital.',
    effects: { savings: -4, family: 6, skills: 3, burnout: 3 },
    identity: 'The rebuild',
    epiloguePhrase: 'a thin ledger and a very clear memory of why',
  },
  {
    id: 'legacy_echo',
    flag: 'origin_legacy_echo',
    name: 'The Echo',
    blurb:
      'Your parent’s name travels ahead of yours into every room that matters to you. The comparison arrives with the starters at every family dinner. You are not building from nothing. You are building next to something, which is harder to see clearly.',
    effects: { reputation: 4, network: 3, burnout: 4 },
    identity: 'The echo',
    epiloguePhrase: 'a name that entered rooms before you did',
  },
]

export const LEGACY_BY_ID: Record<Inheritance['o'], Origin> = Object.fromEntries(
  LEGACY_ORIGINS.map((o) => [o.id, o]),
) as Record<Inheritance['o'], Origin>

// The conversion: parent ledger and tone → child hand. Deterministic.
export function deriveInheritance(finalStats: Stats, tone: Ending['tone'], parentEndingId: string): Inheritance {
  const o: Inheritance['o'] =
    finalStats.savings < 25 || tone === 'bad'
      ? 'legacy_rebuild'
      : finalStats.savings >= 60
        ? 'legacy_cushion'
        : 'legacy_echo'
  return { o, pe: parentEndingId }
}

export function isInheritance(v: unknown): v is Inheritance {
  const i = v as Inheritance
  return !!i && typeof i.pe === 'string' && ['legacy_cushion', 'legacy_rebuild', 'legacy_echo'].includes(i?.o)
}

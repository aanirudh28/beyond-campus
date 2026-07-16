import type { GameState } from './types'
import { ALL_CARDS, CHAPTERS } from './content/chapters'
import { getEnding } from './content/endings'
import {
  ghostForkIndices,
  selectEnding,
  simulateDisciplined,
  simulateGhost,
} from './engine'

// Display-ready ghost summaries, built identically on the client (live run)
// and the server (persisted at completion for stored-render, doc 04 §3).
// Full display fields are stored so old share links never need content
// lookups after a CONTENT_VERSION bump.
//
// v2 (doc 07 §1): forks carry the card's name; the roster ends with the
// disciplined ghost, the version of you who always chose the long game.
export interface GhostSummary {
  kind?: 'fork' | 'disciplined' // absent on pre-v2 stored rows: treat as fork
  ageLine: string
  forkTitle?: string // the named fork, e.g. 'ONE FREE SUNDAY'
  takenLabel: string
  otherLabel: string
  endingId: string
  endingName: string
  emoji: string
  savingsDelta: number // ghost savings minus real savings, ₹ lakhs
}

export function buildGhostSummaries(finalState: GameState): GhostSummary[] {
  const views: GhostSummary[] = []
  const selfEnding = selectEnding(finalState)

  for (const fi of ghostForkIndices(finalState.history)) {
    const ghost = simulateGhost(finalState.seed, finalState.profile, finalState.history, fi)
    if (!ghost) continue
    const delta = Math.round(ghost.stats.savings - finalState.stats.savings)
    if (ghost.endingId === selfEnding && Math.abs(delta) < 5) continue // the road converged
    const meta = CHAPTERS[ghost.forkChapter]
    const ending = getEnding(ghost.endingId)
    const card = ALL_CARDS[ghost.forkChapter]?.find((c) => c.id === ghost.forkCardId)
    views.push({
      kind: 'fork',
      ageLine: `Around age ${meta.ageFrom}-${meta.ageTo}, you chose`,
      forkTitle: card?.title,
      takenLabel: ghost.takenLabel,
      otherLabel: ghost.otherLabel,
      endingId: ghost.endingId,
      endingName: ending.name,
      emoji: ending.emoji,
      savingsDelta: delta,
    })
  }

  // The disciplined ghost: same seed, same luck, zero indulgence.
  const disciplined = simulateDisciplined(finalState.seed, finalState.profile)
  const dEndingId = selectEnding(disciplined)
  const dDelta = Math.round(disciplined.stats.savings - finalState.stats.savings)
  if (dEndingId !== selfEnding || Math.abs(dDelta) >= 5) {
    const dEnding = getEnding(dEndingId)
    views.push({
      kind: 'disciplined',
      ageLine: '',
      takenLabel: '',
      otherLabel: '',
      endingId: dEndingId,
      endingName: dEnding.name,
      emoji: dEnding.emoji,
      savingsDelta: dDelta,
    })
  }

  return views
}

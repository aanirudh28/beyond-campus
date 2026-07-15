import type { GameState } from './types'
import { CHAPTERS } from './content/chapters'
import { getEnding } from './content/endings'
import { ghostForkIndices, selectEnding, simulateGhost } from './engine'

// Display-ready ghost summaries, built identically on the client (live run)
// and the server (persisted at completion for stored-render, doc 04 §3).
// Full display fields are stored so old share links never need content
// lookups after a CONTENT_VERSION bump.
export interface GhostSummary {
  ageLine: string
  takenLabel: string
  otherLabel: string
  endingId: string
  endingName: string
  emoji: string
  savingsDelta: number // ghost savings minus real savings, ₹ lakhs
}

export function buildGhostSummaries(finalState: GameState): GhostSummary[] {
  const views: GhostSummary[] = []
  for (const fi of ghostForkIndices(finalState.history)) {
    const ghost = simulateGhost(finalState.seed, finalState.profile, finalState.history, fi)
    if (!ghost) continue
    const sameEnding = ghost.endingId === selectEnding(finalState)
    const delta = Math.round(ghost.stats.savings - finalState.stats.savings)
    if (sameEnding && Math.abs(delta) < 5) continue // the road converged, not worth showing
    const meta = CHAPTERS[ghost.forkChapter]
    const ending = getEnding(ghost.endingId)
    views.push({
      ageLine: `Around age ${meta.ageFrom}-${meta.ageTo}, you chose`,
      takenLabel: ghost.takenLabel,
      otherLabel: ghost.otherLabel,
      endingId: ghost.endingId,
      endingName: ending.name,
      emoji: ending.emoji,
      savingsDelta: delta,
    })
  }
  return views
}

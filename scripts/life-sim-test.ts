// Dev harness: verifies the life engine is deterministic and shows the
// ending distribution over random playthroughs.
// Run: npx tsx scripts/life-sim-test.ts

import { CHAPTERS } from '../lib/life/content/chapters'
import {
  advanceChapter,
  applyChoice,
  createInitialState,
  dealChapter,
  replayRun,
  selectEnding,
} from '../lib/life/engine'
import type { ChoiceRecord, Profile } from '../lib/life/types'
import { mulberry32 } from '../lib/life/rng'

const STREAMS = ['bba', 'bcom', 'other'] as const
const CITIES = ['metro', 'tier2', 'tier3'] as const
const AMBITIONS = ['money', 'stability', 'impact'] as const

function playRandom(seed: number, profile: Profile, pick: () => number) {
  let state = createInitialState(profile, seed)
  const choices: ChoiceRecord[] = []
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    const cards = dealChapter(state)
    for (const card of cards) {
      const option = card.options[Math.floor(pick() * card.options.length)]
      choices.push({ c: ch, cardId: card.id, optionId: option.id })
      state = applyChoice(state, card, option)
    }
    state = advanceChapter(state)
  }
  return { state, choices }
}

const histogram: Record<string, number> = {}
let cardsSeen = 0
const RUNS = 2000

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

  // Determinism: server-side replay must reproduce the identical final state.
  const replayed = replayRun(seed, profile, choices)
  if (JSON.stringify(replayed) !== JSON.stringify(state)) {
    console.error('DETERMINISM FAILURE at run', i)
    process.exit(1)
  }

  const ending = selectEnding(state)
  histogram[ending] = (histogram[ending] ?? 0) + 1
}

console.log(`OK: ${RUNS} runs deterministic. Avg cards/run: ${(cardsSeen / RUNS).toFixed(1)}`)
console.log('\nEnding distribution:')
for (const [id, n] of Object.entries(histogram).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(((n / RUNS) * 100).toFixed(1)).padStart(5)}%  ${id}`)
}

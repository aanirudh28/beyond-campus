import type { Profile, Stats } from './types'
import {
  advanceChapter,
  answeredInChapter,
  applyChoice,
  createInitialState,
  dealChapter,
  selectEnding,
} from './engine'
import { CHAPTERS } from './content/chapters'
import { mulberry32 } from './rng'

// The Batchmate: a named rival from your section who lives their own
// twenty years alongside yours. Same seed, same market, their own choices
// (a seeded random walk through the same deck logic). Fully deterministic,
// zero AI, computed client-side and never stored. They surface in the
// between-chapter montages and get a final verdict on the ending screen.
//
// Every life in India is lived under comparison. Now the simulation is too.

const NAMES = [
  'Rohan',
  'Priya',
  'Arjun',
  'Sneha',
  'Aditya',
  'Kavya',
  'Rahul',
  'Ananya',
  'Vikram',
  'Ishita',
  'Karan',
  'Meera',
  'Siddharth',
  'Divya',
  'Nikhil',
  'Pooja',
] as const

// Third-person beats keyed on a flag the batchmate earned that chapter,
// in priority order: the most talked-about life events first. Voice:
// how batch WhatsApp groups actually narrate each other's lives.
const BEATS: [string, string][] = [
  ['sold_company', '{name} sold the company. The number is unconfirmed and grows with each retelling.'],
  ['exit_money', '{name}’s startup got acquired. The ESOPs everyone mocked just became a flat, paid in full.'],
  ['own_business', '{name} quit to start up. The batch group is split between admiration and concern.'],
  ['laid_off_once', 'The cut list had {name} on it. The batch group went quiet for a whole day.'],
  ['crisis_leader', 'When the layoffs came, {name} paid the team from their own savings. The story travels.'],
  ['went_abroad', '{name} took the Gulf package. "Tax-free," they said, from the airport.'],
  ['mba_done', '{name} cleared CAT. The farewell party doubled as a flex.'],
  ['govt_settled', '{name} cleared the bank exam. Their mother distributed sweets to three buildings.'],
  ['kid', '{name} has a kid now. Their display picture is a tiny fist holding a finger.'],
  ['engaged', '{name} got engaged. The photos occupied every group for a week.'],
  ['career_first', '{name} asked their person for time. The person eventually stopped waiting.'],
  ['bought_flat_peak', '{name} bought a 2BHK at the top of the market. The housewarming was glorious. The EMI is patient.'],
  ['bought_dip', '{name} bought into the crash while the group posted panic screenshots.'],
  ['fno_burn', '{name} discovered options trading. Then options trading discovered {name}.'],
  ['startup_leap', '{name} joined a six-person startup at a pay cut. "ESOPs," they keep saying. "ESOPs."'],
  ['hometown_builder', '{name} moved back and started building in their hometown. The reels are annoyingly wholesome.'],
  ['shop_empire', '{name} turned a cousin’s shop into a three-district business. On weekends, apparently.'],
  ['ai_native', '{name} rebuilt their whole workflow around the machines while everyone else debated them.'],
  ['ai_resisted', '{name} says the machines are a fad. Says it slightly louder every year.'],
  ['exam_track', '{name} filled the bank exam form. The colony approves loudly.'],
  ['took_early_job', '{name} took a ₹3.2 LPA startup job 1,400 km from home. Everyone said risky. They went.'],
  ['moved_metro', '{name} moved to Bangalore. Their stories have new vocabulary now.'],
  ['stayed_rooted', '{name} turned down the metro transfer. Says Sunday lunch is non-negotiable.'],
  ['moonlighted', '{name} runs a second laptop after 11 p.m. Everyone knows. Nobody says.'],
  ['invested_early', '{name} started a boring SIP with the first bonus and posts nothing about it.'],
  ['creator_track', '{name} posts every week now. One of them actually travelled.'],
  ['creator_spark', '{name} wrote about a rejection at 1 a.m. and woke up mildly famous.'],
  ['second_degree', '{name} enrolled for an evening LLB. Sleep is apparently optional.'],
  ['health_deferred', '{name} cancelled a third health check-up this year. "Big quarter," they said.'],
  ['gives_back', '{name} teaches a Saturday class for students from towns like theirs.'],
  ['people_leader', '{name} manages nine people now. Complains about meetings, glows a little too.'],
  ['excel_learned', '{name} spent a free Sunday learning pivot tables instead of coming on the trip.'],
  ['dm_courage', '{name} cold-messaged an alum and actually got a reply. It is all they talk about.'],
  ['held_out', '{name} declined an offer and went quiet. Brave or foolish, the batch cannot decide.'],
]

// When no headline flag landed that chapter, ordinary life continues.
const FALLBACK_BEATS = [
  '{name} is applying everywhere too. Some months the market answers, some months it does not.',
  '{name} got the appraisal everyone gets. The city keeps most of it.',
  '{name} looks tired in the reunion photos, and richer.',
  '{name}’s life happens in EMIs and school admission forms now, same as everyone’s.',
  '{name} survived the correction, changed jobs once, and stopped posting about work.',
]

export interface Batchmate {
  name: string
  beats: string[] // index = chapter just completed (0..4)
  finalStats: Stats
  endingId: string
}

export function simulateBatchmate(seed: number, profile: Profile): Batchmate {
  const name = NAMES[(seed >>> 3) % NAMES.length]
  const rng = mulberry32((seed ^ 0xba7c8a7e) >>> 0)

  let state = createInitialState(profile, seed)
  const beats: string[] = []
  for (let ch = 0; ch < CHAPTERS.length; ch++) {
    const flagsBefore = state.flags
    for (;;) {
      const cards = dealChapter(state)
      const idx = answeredInChapter(state)
      if (idx >= cards.length) break
      const card = cards[idx]
      state = applyChoice(state, card, card.options[Math.floor(rng() * card.options.length)])
    }
    if (ch < CHAPTERS.length - 1) {
      const beat = BEATS.find(([flag]) => state.flags[flag] && !flagsBefore[flag])
      beats.push((beat?.[1] ?? FALLBACK_BEATS[ch]).replaceAll('{name}', name))
    }
    state = advanceChapter(state)
  }

  return { name, beats, finalStats: state.stats, endingId: selectEnding(state) }
}

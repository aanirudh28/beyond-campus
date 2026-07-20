import type { GameState } from './types'

// The Reckoning: who you became, as a person, underneath the money. The
// ending names your career and your ledger; this names your character. It
// is built from the choices where doing right and doing well pulled in
// different directions — and it is deliberately separate from the money,
// because the whole point is that the two do not always agree.
//
// Deterministic, authored, from flags only. No new stat, no economy touch.

interface Trait {
  flag: string
  line: string
}

// Choices where you did right by people, often at a cost to yourself.
const HONORED: Trait[] = [
  { flag: 'credited_junior', line: 'You put a junior’s name on the work that was theirs.' },
  { flag: 'kept_clean', line: 'You reported the number straight and missed the target on purpose.' },
  { flag: 'honest_vouch', line: 'You vouched for a friend with the fine print attached.' },
  { flag: 'team_shield', line: 'You took the blame publicly to protect someone smaller.' },
  { flag: 'spoke_up', line: 'You reclaimed your stolen credit, calmly, in the room.' },
  { flag: 'scam_radar', line: 'You reported the offer-letter scam instead of using it.' },
  { flag: 'spoke_for_many', line: 'You put your name on the honest layoffs post.' },
  { flag: 'mentor_repaid', line: 'You showed up for your mentor when their luck turned.' },
  { flag: 'kingmaker', line: 'You gave the one senior seat to your protégé and meant it.' },
  { flag: 'legacy_giver', line: 'You funded and mentored the scholarship cohort.' },
  { flag: 'gives_back', line: 'You took the Saturday classroom for kids from towns like yours.' },
  { flag: 'showed_up', line: 'You chose the front row over the client review.' },
]

// Choices where you got ahead, and someone else paid part of the bill.
const COMPROMISED: Trait[] = [
  { flag: 'stole_junior_credit', line: 'You presented a junior’s breakthrough as your own.' },
  { flag: 'fudged_numbers', line: 'You rounded the number up to turn the quarter green.' },
  { flag: 'false_vouch', line: 'You vouched, warmly and without caveats, for a startup you knew was shaky.' },
  { flag: 'moonlighted', line: 'You ran the secret second laptop against the memo.' },
  { flag: 'swallowed_it', line: 'You let your stolen credit pass in silence.' },
  { flag: 'endured_toxic', line: 'You gave the screamer years, for the logo.' },
]

export interface Reckoning {
  verdict: string
  honored: string[]
  compromised: string[]
  score: number // honored minus compromised, for the tone of the verdict
}

export function buildReckoning(state: GameState, endingTone: 'good' | 'bad' | 'weird'): Reckoning {
  const honored = HONORED.filter((t) => state.flags[t.flag]).map((t) => t.line)
  const compromised = COMPROMISED.filter((t) => state.flags[t.flag]).map((t) => t.line)
  const score = honored.length - compromised.length

  let verdict: string
  if (compromised.length >= 3 && score < 0) {
    verdict =
      endingTone === 'good'
        ? 'The ending looks good on paper. You know, precisely, what it cost the people around you.'
        : 'You cut the corners that were there to cut. Some of them cut back, quietly, for years.'
  } else if (score >= 4 && honored.length >= 4) {
    verdict = 'You built the rarest asset there is: a name people trust with their backs turned.'
  } else if (score >= 2) {
    verdict = 'Mostly, you did right by people, and paid for it in ways that never showed on an appraisal.'
  } else if (score >= 0) {
    verdict = 'You kept the ledger of your conscience roughly balanced, with a few corners you still remember.'
  } else {
    verdict = 'You got ahead, and some of it was at other people’s expense. You know which parts.'
  }

  // A life with no dilemmas triggered gets an honest, gentle default.
  if (!honored.length && !compromised.length) {
    verdict = 'You were never really tested on the character front. That is its own kind of luck.'
  }

  return { verdict, honored: honored.slice(0, 3), compromised: compromised.slice(0, 2), score }
}

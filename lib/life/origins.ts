import type { Stats } from './types'

// Origins: the hand you were dealt. Profile (stream, city, ambition) is
// what you CHOSE at 21; the origin is what life handed you before any
// choosing began. Derived deterministically from the seed, never picked,
// exactly like the real thing. Same seed = same origin, so challenge-link
// rivals live the same dealt hand.
//
// Each origin: bends the starting stats, sets an engine-owned flag that
// the reactive dealer treats as an arc trigger (origin cards chase the
// player through the years), and colours the identity strip and epilogue.

export interface Origin {
  id: string
  flag: string // engine-set at birth; cards condition on it
  name: string // reveal-screen title
  blurb: string // reveal-screen text, second person
  effects: Partial<Stats> // applied to the starting stats
  identity: string // identity-strip fact
  epiloguePhrase: string // "You started at 21 with ..."
}

export const ORIGINS: Origin[] = [
  {
    id: 'first_gen',
    flag: 'origin_first_gen',
    name: 'First of the Line',
    blurb:
      'You are the first person in your family to hold a degree. Nobody at home can explain the corporate world to you, and everybody at home is watching you enter it. The network others inherited, you will have to build by hand.',
    effects: { network: -6, family: 4 },
    identity: 'First-gen',
    epiloguePhrase: 'a degree nobody at home could read',
  },
  {
    id: 'loan',
    flag: 'origin_loan',
    name: 'The Loan on Your Back',
    blurb:
      'The degree came with a ₹6 lakh education loan, and the moratorium ends six months after graduation. Every choice you make for the next few years will be co-signed by an EMI that has never heard of your dreams.',
    effects: { savings: -6, burnout: 4 },
    identity: 'Loan on the back',
    epiloguePhrase: 'a ₹6 lakh loan already ticking',
  },
  {
    id: 'shop_family',
    flag: 'origin_shop_family',
    name: 'The Shop at Home',
    blurb:
      'Your family runs a shop, and the shop runs the family. There is a counter with your name quietly reserved on it, any time the city thing does not work out. That safety net is real. So is its gravity.',
    effects: { family: 6, network: 2 },
    identity: 'Shop at home',
    epiloguePhrase: 'a shop at home that wanted you back',
  },
  {
    id: 'topper',
    flag: 'origin_topper',
    name: 'The Topper Tax',
    blurb:
      'You topped the college, and the college told everyone. Professors introduce you with your rank. Relatives forecast your salary at weddings. Expectation arrived before opportunity did, and it does not pay rent.',
    effects: { reputation: 6, burnout: 5 },
    identity: 'The topper',
    epiloguePhrase: 'a rank everyone expected magic from',
  },
  {
    id: 'english',
    flag: 'origin_english',
    name: 'English Arrived Late',
    blurb:
      'Your mind is sharp in your mother tongue and slower in the language interviews are conducted in. Every group discussion is a home game for someone else. The thoughts are first-class. The packaging is being unfairly priced.',
    effects: { reputation: -4, skills: 2 },
    identity: 'English came late',
    epiloguePhrase: 'English arriving five years after your ideas',
  },
  {
    id: 'hustler',
    flag: 'origin_hustler',
    name: 'Already Earning',
    blurb:
      'The meme page, the tuition batch, the commission gig: you have been making your own money since second year. Small money, real money. You know how to ask for it, which is rarer than any elective. The catch: it is very easy to stay small.',
    effects: { savings: 2, skills: 3, network: 2, family: -3 },
    identity: 'College hustler',
    epiloguePhrase: 'a side income before you had a salary',
  },
]

export function deriveOrigin(seed: number): Origin {
  return ORIGINS[(Math.imul(seed, 0x9e3779b1) >>> 8) % ORIGINS.length]
}

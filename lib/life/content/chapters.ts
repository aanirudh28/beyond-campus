import type { Card, ChapterMeta } from '../types'
import { CARDS_CH1 } from './cards-ch1'
import { CARDS_CH2 } from './cards-ch2'
import { CARDS_CH3 } from './cards-ch3'
import { CARDS_CH4 } from './cards-ch4'
import { CARDS_CH5 } from './cards-ch5'
import { CARDS_CH6 } from './cards-ch6'

// Bump whenever cards/conditions/engine math change: invalidates saved runs
// in localStorage, whose dealt decks would no longer replay.
export const CONTENT_VERSION = 16

export const CHAPTERS: ChapterMeta[] = [
  {
    index: 0,
    title: 'THE HUNT',
    ageFrom: 21,
    ageTo: 23,
    yearFrom: 2026,
    yearTo: 2028,
    growthYears: 2,
    intro:
      'Final year. Forty-three applications sent, two replies. The campus placement season came and went like a train you were not on. The off-campus market has doors, not walls. Nobody has shown you where the doors are yet.',
    decisions: 5,
    events: 1,
  },
  {
    index: 1,
    title: 'THE GRIND',
    ageFrom: 23,
    ageTo: 25,
    yearFrom: 2028,
    yearTo: 2030,
    growthYears: 3,
    intro:
      'You are somebody’s employee now. The salary is real, the rent is real, and the gap between people who drift through their twenties and people who build through them is invisible right up until it is enormous.',
    decisions: 5,
    events: 1,
  },
  {
    index: 2,
    title: 'THE FORK',
    ageFrom: 25,
    ageTo: 27,
    yearFrom: 2030,
    yearTo: 2032,
    growthYears: 3,
    intro:
      'The decade-defining questions arrive together, as they always do. MBA or momentum. Startup or safety. The person or the pace. Your parents are aging, your batchmates are choosing, and every fork closes quietly behind you.',
    decisions: 5,
    events: 1,
  },
  {
    index: 3,
    title: 'THE WEIGHT',
    ageFrom: 27,
    ageTo: 30,
    yearFrom: 2032,
    yearTo: 2035,
    growthYears: 4,
    intro:
      'The years when everything is heavy at once. Weddings, EMIs, promotions, parents, a body that has started sending invoices. Every rupee and every hour is now claimed by at least two futures.',
    decisions: 5,
    events: 2,
  },
  {
    index: 4,
    title: 'THE CORRECTION',
    ageFrom: 30,
    ageTo: 33,
    yearFrom: 2035,
    yearTo: 2038,
    growthYears: 5,
    intro:
      'The market turns and the machines arrive in the same season. Corrections do not create character, they reveal the balance sheet you actually built. Everything you compounded, or did not, reports for duty now.',
    decisions: 4,
    events: 2,
  },
  {
    index: 5,
    title: 'THE LEDGER',
    ageFrom: 33,
    ageTo: 36,
    yearFrom: 2038,
    yearTo: 2041,
    growthYears: 7,
    intro:
      'The final accounting. The titles, the money, the Sundays, the people. At 21 you thought this would feel like arriving. It feels, instead, like reading a ledger you wrote one entry at a time without looking.',
    decisions: 4,
    events: 2,
  },
]

export const ALL_CARDS: Card[][] = [
  CARDS_CH1,
  CARDS_CH2,
  CARDS_CH3,
  CARDS_CH4,
  CARDS_CH5,
  CARDS_CH6,
]

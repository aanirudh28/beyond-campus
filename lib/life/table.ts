import type { GameState } from './types'

// The Table at 36: the ending screen sets your dinner table from the life
// you actually lived. Money got a ledger and career got a timeline; this
// is the accounting for people. Fully deterministic from flags and stats,
// authored lines only, at most two empty chairs (they hit hardest when
// they are rare). Voice: second person where it looks at you, no em
// dashes, warm but unsentimental.

export interface Seat {
  emoji: string
  label: string
  line: string
  present: boolean
}

export function buildTable(state: GameState, batchmateName: string | null): Seat[] {
  const f = state.flags
  const seats: Seat[] = []

  // The person. Absence only when someone actually left; single-by-omission
  // is a life, not a tragedy, so no partner seat appears at all.
  if (f['engaged']) {
    seats.push({
      emoji: '💍',
      label: 'The person who stayed',
      line: f['repaired_us']
        ? 'Stayed through the quiet years too. The Sundays are guarded now, by both of you.'
        : f['kid']
          ? 'A decade of shared calendars and divided school runs, still trading book recommendations.'
          : 'Still here, still unimpressed by your job title, still the best decision on the ledger.',
      present: true,
    })
  } else if (f['career_first']) {
    seats.push({
      emoji: '💍',
      label: 'The person who stopped waiting',
      line: 'Left around 27. Happy now, someone mentioned. You did not ask for details.',
      present: false,
    })
  }

  if (f['kid']) {
    seats.push({
      emoji: '🪁',
      label: 'The kid',
      line:
        f['showed_up'] || f['anchored_home']
          ? 'Knows exactly which recitals you were in the front row for. Keeps the count somewhere permanent.'
          : 'Asks what you actually do at work. You are still refining the answer.',
      present: true,
    })
  }

  // The parents. The folder means the heaviest chair of all.
  if (f['the_folder']) {
    seats.push({
      emoji: '🫖',
      label: 'Your father',
      line: 'An empty chair, and a drawer of annotated clippings that prove he was keeping up all along.',
      present: false,
    })
  } else if (f['parents_home']) {
    seats.push({
      emoji: '🫖',
      label: 'Your parents',
      line: 'Down the corridor, complaining about the thermostat, gloriously present.',
      present: true,
    })
  } else if (f['moved_back'] || f['remote_roots'] || f['stayed_rooted'] || f['hometown_builder']) {
    seats.push({
      emoji: '🫖',
      label: 'Your parents',
      line: 'Twenty minutes away, as planned. Sunday lunch is a standing meeting neither side cancels.',
      present: true,
    })
  } else if (f['went_abroad'] && !f['returned_home']) {
    seats.push({
      emoji: '🫖',
      label: 'Your parents',
      line: 'On the good phone you bought them, at the usual hour. Distance became a ritual with its own warmth.',
      present: true,
    })
  } else if (f['parents_secured']) {
    seats.push({
      emoji: '🫖',
      label: 'Your parents',
      line: 'Retired properly, because someone finally said the plan out loud at dinner.',
      present: true,
    })
  } else {
    seats.push({
      emoji: '🫖',
      label: 'Your parents',
      line: 'Older now. Still asking if you have eaten, regardless of your designation.',
      present: true,
    })
  }

  // The mentor thread, if it was ever kept.
  if (f['board_seat']) {
    seats.push({
      emoji: '🧭',
      label: 'The first good manager',
      line: 'Chairs your board now. Fifteen years of monthly messages, still signed off the same way.',
      present: true,
    })
  } else if (f['mentor_repaid']) {
    seats.push({
      emoji: '🧭',
      label: 'The first good manager',
      line: 'You worked your network for him when his luck flipped. The thread now runs both directions.',
      present: true,
    })
  } else if (f['mentor_kept']) {
    seats.push({
      emoji: '🧭',
      label: 'The first good manager',
      line: 'The monthly thread never missed. Cheapest seat at this table, hardest to buy.',
      present: true,
    })
  }

  // The ones you lifted.
  if (f['elevator_returned']) {
    seats.push({
      emoji: '🌱',
      label: 'The ones you lifted',
      line: 'The row-three student came back with an advisor seat and your name in their origin story.',
      present: true,
    })
  } else if (f['gives_back'] || f['legacy_giver']) {
    seats.push({
      emoji: '🌱',
      label: 'The ones you lifted',
      line: 'Saturday students, some now colleagues, one now a founder. They bring the mithai.',
      present: true,
    })
  } else if (f['team_shield'] || f['kingmaker'] || f['mentored_rival']) {
    seats.push({
      emoji: '🌱',
      label: 'The ones you lifted',
      line: 'They remember exactly who took the blame, and say so in rooms you are not in.',
      present: true,
    })
  }

  // The cousin, if the shop became a shared story.
  if (f['sold_shop']) {
    seats.push({
      emoji: '🏪',
      label: 'The cousin',
      line: 'Bought the Fortuner with the rollup money. Still opens the old counter on Sundays, from habit.',
      present: true,
    })
  } else if (f['shop_empire'] || f['side_biz']) {
    seats.push({
      emoji: '🏪',
      label: 'The cousin',
      line: 'Your partner in the shop that outgrew its counter. Still settles accounts over chai.',
      present: true,
    })
  }

  // The batchmate: always at the table, in their particular way.
  if (batchmateName) {
    seats.push({
      emoji: '🎓',
      label: `${batchmateName}, from your section`,
      line: 'You check each other’s ledgers, politely, forever. Neither of you would call it a race out loud.',
      present: true,
    })
  }

  // Presence first, absences last (and capped at two by construction).
  return [...seats.filter((s) => s.present), ...seats.filter((s) => !s.present)].slice(0, 7)
}

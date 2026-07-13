import type { Card } from '../types'

// Chapter 6 · THE LEDGER · Age 38-45 · 2043-2050
// The final accounting: what was it all for, and who did you become.

export const CARDS_CH6: Card[] = [
  {
    id: 'ch6_cxo_push',
    chapter: 5,
    kind: 'decision',
    title: 'THE LAST CLIMB',
    pivotal: true,
    base: `The CXO track is finally, plausibly, yours. Two more years of airport lounges, dinner meetings that eat dinners, and politics played at a level where everyone is good at it. Or you could hold this altitude, do excellent work, and be home by seven. Both are victories. Only one gets a press release.`,
    condition: { minStat: { reputation: 55 } },
    options: [
      {
        id: 'push',
        label: 'Make the push. You did not come this far for base camp.',
        effects: { salary: { mult: 1.4 }, reputation: 10, burnout: 14, family: -8 },
        setFlags: ['cxo_push'],
        outcome:
          'The title lands eighteen months later. The view from the top floor is genuinely different. So is the air pressure, and the distance from ground level.',
      },
      {
        id: 'altitude',
        label: 'Hold altitude. Redefine winning on purpose.',
        effects: { burnout: -10, family: 12, salary: { mult: 1.05 } },
        setFlags: ['chose_enough'],
        outcome:
          'You learn the rarest senior skill: stopping on purpose. Some ex-colleagues pity you. You have seen their calendars, and you sleep fine.',
      },
    ],
  },
  {
    id: 'ch6_hometown_build',
    chapter: 5,
    kind: 'decision',
    title: 'THE RETURN TICKET',
    pivotal: true,
    base: `Your hometown has changed. Fibre internet, two new colleges, a small airport, and thousands of students exactly like you were, staring at the same wall you once stared at. With your capital and your network, you could build something real there. The metro will not miss you. The town might be transformed.`,
    condition: { minStat: { savings: 60 } },
    options: [
      {
        id: 'return',
        label: 'Go back and build where you began.',
        effects: { salary: { mult: 0.7 }, family: 16, reputation: 10, network: 5 },
        setFlags: ['moved_back', 'hometown_builder'],
        outcome:
          'The house has a courtyard again. Your work now has your town’s name in it. At weddings, elders you grew up fearing ask for your opinion and wait for the answer.',
      },
      {
        id: 'remain',
        label: 'Stay where the leverage is. Help from a distance.',
        effects: { savings: 5, network: 4 },
        outcome:
          'You fund two scholarships and visit twice a year. It is real help. The town stays a place you are from, rather than a place you are.',
      },
    ],
  },
  {
    id: 'ch6_elevator_down',
    chapter: 5,
    kind: 'decision',
    title: 'THE SCHOLARSHIP QUESTION',
    base: `An education NGO asks you to fund and mentor a cohort of ten students from small-town colleges. The cheque is ₹6 lakhs a year, real money even now. You remember exactly what one open door felt like at 21. You are being asked to become ten of them.`,
    options: [
      {
        id: 'fund',
        label: 'Fund the cohort. Put your name on the door.',
        effects: { savings: -6, reputation: 10, family: 6, burnout: -4 },
        setFlags: ['legacy_giver'],
        outcome:
          'The first batch calls it by your name without asking you. Twenty years of grinding, and this line item is the one your kids bring up at school.',
      },
      {
        id: 'not_yet',
        label: 'Not yet. The corpus needs five more years.',
        effects: { savings: 6 },
        outcome:
          'The math is defensible. The door stays closed a little longer, and doors, you know better than anyone, have their own schedules.',
      },
    ],
  },
  {
    id: 'ch6_body_reckoning',
    chapter: 5,
    kind: 'decision',
    title: 'THE SECOND INVOICE',
    pivotal: true,
    base: `The deferred maintenance comes due, as it was always going to. A cardiac scare in an airport lounge, mercifully minor, decisively loud. The doctor does not lecture. She just says, "You have maybe one more warning after this one, and most people do not get that many."`,
    condition: { flag: 'health_deferred' },
    options: [
      {
        id: 'rebuild',
        label: 'Rebuild everything around health, starting today.',
        effects: { burnout: -18, salary: { mult: 0.9 }, family: 10 },
        setFlags: ['health_rebuilt'],
        outcome:
          'You become the person with the walking meetings and the 10 p.m. phone curfew. It costs some velocity. It buys the decades where grandchildren live.',
      },
      {
        id: 'moderate',
        label: 'Half-measures. Some changes, same pace.',
        effects: { burnout: -5 },
        outcome:
          'Better than nothing, the doctor says, in the tone of someone updating a file she expects to see again.',
      },
    ],
  },
  {
    id: 'ch6_second_innings',
    chapter: 5,
    kind: 'decision',
    title: 'THE SECOND INNINGS',
    base: `Twenty years into one industry, a genuine fork: a respected institute wants you to design and run their new practical business program. Half the salary, triple the meaning, your accumulated scar tissue converted into curriculum. The corporate ladder still has rungs left, if you want them.`,
    condition: { minStat: { skills: 60 } },
    options: [
      {
        id: 'teach_build',
        label: 'Take the second innings. Convert scars to syllabus.',
        effects: { salary: { mult: 0.6 }, reputation: 12, family: 8, burnout: -10 },
        setFlags: ['second_innings'],
        outcome:
          'Your first batch graduates into jobs using frameworks with your fingerprints on them. The pay cut stops mattering the first time an ex-student sends you their offer letter.',
      },
      {
        id: 'ladder',
        label: 'Finish the corporate climb properly.',
        effects: { salary: { mult: 1.15 }, burnout: 5 },
        outcome:
          'There is honour in finishing what you started. The institute finds someone else. Their program is fine. Yours would have been better, and you know it.',
      },
    ],
  },
  {
    id: 'ch6_kids_or_calendar',
    chapter: 5,
    kind: 'decision',
    title: 'THE RECITAL AND THE REVIEW',
    base: `Your kid's annual day performance and the biggest client review of the year land on the same Thursday at the same hour. Your deputy could take the review, at some risk. Nobody can take the front-row seat. This exact Thursday, in different costumes, will repeat for the next ten years.`,
    condition: { flag: 'engaged' },
    options: [
      {
        id: 'recital',
        label: 'Front row at the recital. The deputy takes the review.',
        effects: { family: 12, reputation: -3, burnout: -4 },
        setFlags: ['showed_up'],
        outcome:
          'The client barely notices. The seven-year-old scanning the crowd from the stage notices instantly, and files it somewhere permanent.',
      },
      {
        id: 'review',
        label: 'Take the review. Provide, protect, apologise.',
        effects: { salary: { mult: 1.08 }, family: -10 },
        outcome:
          'The review goes brilliantly. The recital video someone shares has one empty chair in the front row, and it is very good camera work, and you watch it four times.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch6_ev_reunion',
    chapter: 5,
    kind: 'event',
    title: 'THE TWENTY-YEAR REUNION',
    base: `The college reunion happens in the same hall where you once queued for a placement that never came. The bank exam cousin is a branch manager, content. The funding batchmate sold his startup, then lost most of it, then found something quieter. Everyone compares lives all evening while pretending not to. Nobody's graph went the way they drew it at 21.`,
    options: [
      {
        id: 'toast',
        label: 'Raise a toast to the off-campus kids.',
        effects: { family: 5, network: 4, burnout: -3 },
        outcome:
          'For one evening, all the timelines make peace with each other. The DJ plays the same songs. Of course he does.',
      },
    ],
  },
  {
    id: 'ch6_ev_mentor_returns',
    chapter: 5,
    kind: 'event',
    title: 'THE THREAD THAT HELD',
    base: `Your first manager, the one you never stopped messaging, calls. He is chairing a board now and they need someone exactly like you for an advisor seat. "Twenty years of monthly messages," he laughs, "cheapest retainer I ever paid." Old threads, it turns out, are load-bearing.`,
    condition: { flag: 'mentor_kept' },
    options: [
      {
        id: 'accept_seat',
        label: 'Accept the seat. Harvest the long game.',
        effects: { salary: 6, reputation: 12, network: 8 },
        setFlags: ['board_seat'],
        outcome:
          'The advisor fee is nice. The letterhead is nicer. The proof that relationships compound harder than money is the nicest of all.',
      },
    ],
  },
  {
    id: 'ch6_ev_ai_dividend',
    chapter: 5,
    kind: 'event',
    title: 'THE LAST WORD ON THE MACHINES',
    base: `A decade after the correction, the verdict is in. The machines did eat the tasks. The people who redirected themselves toward judgment, relationships, and taste did not just survive, they got expensive. Your industry looks nothing like the one you joined, and you are still standing in it.`,
    condition: { flag: 'ai_native' },
    options: [
      {
        id: 'reflect',
        label: 'Write the post your 33-year-old self needed.',
        effects: { reputation: 6, network: 5 },
        outcome:
          'It travels further than anything you have written. The comment that stays with you is from a scared 24-year-old asking if it is too late. You reply: it was not too late for me at 33.',
      },
    ],
  },
]

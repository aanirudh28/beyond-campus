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
  {
    id: 'ch6_memoir',
    chapter: 5,
    kind: 'decision',
    title: 'THE CHANNEL WITH YOUR NAME ON IT',
    condition: { minStat: { reputation: 60 } },
    base: `Twenty years of scars and playbooks are sitting in your head, monetisable and mortal. A weekly channel, a newsletter, maybe the book your industry keeps not writing. Building an audience at 40 feels faintly ridiculous. So did cold-messaging an alum at 21.`,
    options: [
      {
        id: 'publish',
        label: 'Build the one-person channel. Ship weekly.',
        effects: { network: 12, reputation: 8, burnout: 5, savings: 4 },
        setFlags: ['one_person_channel'],
        outcome:
          'Episode one gets 400 views, mostly relatives. Episode forty gets quoted back to you in a boardroom. The distribution you rent all career, you finally start to own.',
      },
      {
        id: 'stay_private',
        label: 'Stay private. The work was the point.',
        effects: { burnout: -4, family: 3 },
        outcome:
          'The knowledge stays in rooms you are personally in. It is enough. It is also, a small voice notes, perishable.',
      },
    ],
  },
  {
    id: 'ch6_sell_or_build',
    chapter: 5,
    kind: 'decision',
    title: 'THE NUMBER ON THE TABLE',
    pivotal: true,
    condition: { flag: 'own_business' },
    base: `An acquirer puts a number on the table for the company you built out of the itch. It is not a fantasy number. It is a real one: enough to end every money question your family will ever have, in exchange for the thing you get up for. The founder forums have a saying: you sell twice, once for the money and once for the mornings.`,
    options: [
      {
        id: 'sell',
        label: 'Sell. Security is also a dream.',
        effects: { savings: 18, burnout: -8, family: 6 },
        setFlags: ['sold_company'],
        outcome:
          'The wire clears and the mornings go strange for a season. Then they refill: advisory seats, the kids, the long-postponed everything. The company thrives without you, which stings precisely once.',
      },
      {
        id: 'keep_building',
        label: 'Decline. The mornings are not for sale.',
        effects: { reputation: 6, burnout: 5 },
        outcome:
          'The acquirer builds a competitor, as they politely warned. Some quarters you regret it. Most mornings you do not, and mornings outnumber quarters.',
      },
    ],
  },
  {
    id: 'ch6_parents_move_in',
    chapter: 5,
    kind: 'decision',
    title: 'THE HOUSE REARRANGES',
    base: `The stairs in your parents' house have started writing cheques their knees cannot cash. The choice everyone dances around at dinner: they move in with you, or you set them up in a serviced flat ten minutes away. Both are love. They are different dialects of it, and the whole extended family has opinions in a third.`,
    options: [
      {
        id: 'move_in',
        label: 'They move in. One kitchen, one roof.',
        effects: { family: 12, burnout: 5 },
        setFlags: ['parents_home'],
        outcome:
          'The house gets louder, smaller, and warmer. Your kid absorbs a grandparent education no school sells. Some evenings you hide in the car for ten minutes, and that is fine too.',
      },
      {
        id: 'ten_minutes',
        label: 'The flat ten minutes away, fully set up.',
        effects: { family: 4, savings: -3 },
        outcome:
          'Independence with a safety net, dignity intact on all sides. The ten minutes get driven daily. It works, in the way engineered things work.',
      },
    ],
  },
  {
    id: 'ch6_half_price_rival',
    chapter: 5,
    kind: 'decision',
    title: 'THE 28-YEAR-OLD WHO COSTS HALF',
    base: `There is a 28-year-old in the org who does 80 percent of your job at 40 percent of your cost, and everyone can do that arithmetic, including you. The two moves on the board are old as guilds: hoard what only you know, or teach her everything and bet you can keep becoming the thing the org cannot yet name.`,
    options: [
      {
        id: 'teach_everything',
        label: 'Teach her everything. Outrun the arithmetic.',
        effects: { reputation: 8, network: 5, skills: 4 },
        setFlags: ['mentored_rival'],
        outcome:
          'She gets brilliant fast and tells everyone who made her so. You move up into the ambiguity that has no playbook yet, which was always the only defensible ground.',
      },
      {
        id: 'guard_moat',
        label: 'Guard the moat. Knowledge is the leverage.',
        effects: { reputation: -5, burnout: 5 },
        outcome:
          'The gatekeeping works for six quarters. Then a reorg routes around the gate entirely, the way water does, and the moat becomes a museum.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch6_ev_first_goodbye',
    chapter: 5,
    kind: 'event',
    title: 'THE FIRST OF THE BATCH',
    base: `The class group, dormant for months, lights up at 6 a.m. and you know before you open it. Cardiac, 43, the guy who organised every reunion. The funeral WhatsApp has 200 members by evening. For one shocked week, the entire batch starts morning walks, downloads meditation apps, and hugs their kids mid-homework.`,
    options: [
      {
        id: 'keep_walking',
        label: 'Be one of the few who keeps the walk.',
        effects: { burnout: -6, family: 6 },
        outcome:
          'Most of the batch stops walking by month two, as grief-fitness always goes. You keep the 6 a.m. loop, and you keep saying his name when people ask why.',
      },
    ],
  },
  {
    id: 'ch6_ev_idea_returns',
    chapter: 5,
    kind: 'event',
    title: 'THE NOTES APP OPENS ITSELF',
    condition: { flag: 'dream_shelved' },
    base: `A 26-year-old founder finds your decade-old conference talk and cold-emails you: she is building the exact thing you shelved, in a market that finally matured into it. She wants an hour a month and offers a sliver of advisor equity. The idea did not die. It waited for infrastructure, and for her.`,
    options: [
      {
        id: 'advise_her',
        label: 'Take the hour. Hand over the old notes.',
        effects: { savings: 4, reputation: 4, network: 3 },
        outcome:
          'Watching her dodge the mistakes you would have made is a strange, generous pleasure. The shelf, it turns out, was not a grave. It was a relay baton.',
      },
    ],
  },
  {
    id: 'ch6_ev_mentee_founder',
    chapter: 5,
    kind: 'event',
    title: 'ROW THREE, REVISITED',
    condition: { flag: 'gives_back' },
    base: `The quiet student from row three, the one whose offer-letter screenshot you framed, calls. She runs a forty-person company now. "I need an advisor I trust. Quarter percent equity, one call a month. You taught me the market has doors. Let me hold one open for you this time."`,
    options: [
      {
        id: 'accept_advisory',
        label: 'Accept. The elevator came back up.',
        effects: { savings: 8, reputation: 6, network: 6, burnout: -3 },
        setFlags: ['elevator_returned'],
        outcome:
          'The monthly calls are the best hour of your month. Somewhere in a small-town classroom, someone is sitting in row three of her Saturday session.',
      },
    ],
  },
  {
    id: 'ch6_ev_empty_chair',
    chapter: 5,
    kind: 'event',
    title: 'THE EMPTY CHAIR',
    base: `Your father does not see the end of this chapter. It is peaceful, and it is still the heaviest thing that has ever happened to you. In the drawer of his desk you find a folder with every newspaper cutting about your industry from twenty years, annotated in his handwriting. He was keeping up. He never once said so.`,
    options: [
      {
        id: 'carry_it',
        label: 'Keep the folder on your own desk.',
        effects: { family: 10, burnout: 6, reputation: 2 },
        setFlags: ['the_folder'],
        outcome:
          'Grief, it turns out, is love with nowhere urgent to go. You start calling your mother on Tuesdays, and you keep the clippings going in the same folder.',
      },
    ],
  },
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
        effects: { salary: 4, reputation: 12, network: 8 },
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

  // ---- arc cards: these exist only because of a choice made earlier ----
  {
    id: 'ch6_shop_exit',
    chapter: 5,
    kind: 'decision',
    title: 'THE ROLLUP COMES FOR THE SHOP',
    pivotal: true,
    condition: { flag: 'shop_empire' },
    base: `A Mumbai-funded distribution rollup has been buying networks like the one you and your cousin built, and now a term sheet is on the shop counter, next to the same steel dabba of chai that was there in year one. The number would change both families permanently. The cousin says "you decide, it was always your play". It was never only yours.`,
    options: [
      {
        id: 'sell',
        label: 'Sell. Twenty years of weekends, finally priced.',
        effects: { savings: 18, family: -4, reputation: 4 },
        setFlags: ['sold_shop'],
        outcome:
          'The signing happens in a lawyer’s office that smells of new paint. The cousin cries, then buys a Fortuner. The rollup’s CEO starts calling you before every tier-3 expansion, because spreadsheets cannot smell a market.',
      },
      {
        id: 'keep_family',
        label: 'Refuse. Some things are infrastructure, not inventory.',
        effects: { family: 9, savings: 2 },
        outcome:
          'The term sheet goes back signed with a polite no. The shop stays the place where nephews learn to work and the colony buys on trust. Some returns never touch a bank account.',
      },
    ],
  },
  {
    id: 'ch6_vrs_window',
    chapter: 5,
    kind: 'decision',
    title: 'THE VRS CIRCULAR',
    condition: { flag: 'govt_settled' },
    base: `The bank announces a voluntary retirement scheme, and for the first time the safe path has an exit door with a number on it. A fintech that lends to the same farmers you spent decades approving wants you as an advisor, "someone who knows how credit actually works outside a deck". The pension is eleven years away. The offer expires Friday.`,
    options: [
      {
        id: 'take_vrs',
        label: 'Take the VRS. Twenty years of judgment, finally priced.',
        effects: { salary: { mult: 1.2 }, skills: 6, reputation: 4, burnout: 3 },
        outcome:
          'The branch gives you a farewell with marigold garlands and a plaque. At the fintech, engineers half your age ask what defaults smell like before they happen. You know. It turns out that is rare.',
      },
      {
        id: 'pension_line',
        label: 'Serve to pension. You did not come this far for a gamble.',
        effects: { family: 5, burnout: -4 },
        outcome:
          'The circular expires, the ledger continues. Batch-mates who left send LinkedIn updates from glass offices. You send your daughter to college on a salary that has never once been late.',
      },
    ],
  },
  {
    id: 'ch6_after_the_sale',
    chapter: 5,
    kind: 'decision',
    title: 'THE FIRST MONDAY AFTER',
    condition: { flag: 'sold_company' },
    base: `The wire cleared, the earn-out is signed, and Monday 9 a.m. arrives with no standup, no payroll, no fires. You have bought back your mornings and they sit there, enormous and unstructured. Two ex-founder friends went two ways from this exact spot: one built a portfolio of first cheques and mentees, one perfected his golf swing and his restlessness.`,
    options: [
      {
        id: 'first_cheques',
        label: 'Become the person who backed you when nobody would.',
        effects: { network: 5, reputation: 4, savings: -5 },
        setFlags: ['gives_back'],
        outcome:
          'Your first cheque goes to a 24-year-old with a tile-shop accent and a working prototype. The mornings fill with other people’s beginnings, which turn out to be the best use of an ending.',
      },
      {
        id: 'drift',
        label: 'Rest first. You have earned an unscheduled year.',
        effects: { burnout: -8, family: 4, skills: -4 },
        outcome:
          'Six months of slow breakfasts and long drives. The restlessness arrives on schedule around month seven. You now understand why exited founders all look slightly haunted at weddings.',
      },
    ],
  },
  {
    id: 'ch6_ev_book_deal',
    chapter: 5,
    kind: 'event',
    title: 'THE PUBLISHER IN THE INBOX',
    condition: { flag: 'owned_audience' },
    base: `An editor at a serious publishing house has, it turns out, been reading your newsletter for three years. The email is short: "There is a book in what you write about work and small-town ambition. Nobody has written it honestly yet. Eighteen months, and we will not let you write a bad one."`,
    options: [
      {
        id: 'write_it',
        label: 'Write it. Eighteen months of Sunday mornings.',
        effects: { reputation: 6, network: 4, burnout: 4 },
        setFlags: ['one_person_channel'],
        outcome:
          'The book takes twenty-two months, because books do. It sells modestly and travels immodestly: colleges you have never visited teach a chapter of your Sundays.',
      },
      {
        id: 'decline_book',
        label: 'Decline. The newsletter is the book, one Sunday at a time.',
        effects: { burnout: -2 },
        outcome:
          'You write back with genuine thanks and keep the weekly rhythm. Somewhere out there the unwritten book sits on a shelf of its own, spine uncracked, patient.',
      },
    ],
  },
  {
    id: 'ch6_scar_check',
    chapter: 5,
    kind: 'decision',
    title: 'THE BACKGROUND CHECK, FINAL ROUND',
    condition: { flag: 'career_scar' },
    base: `The CXO offer is one signature away, and the email says "standard background verification, 2-3 weeks". You know what is in the file: the moonlighting invoice from a decade ago, already surfaced once. Verification firms find what has been found before. The only choice left is who tells the story first.`,
    options: [
      {
        id: 'preempt',
        label: 'Tell them yourself, today, before the report does.',
        effects: { reputation: 6, burnout: 3 },
        outcome:
          'A ten-minute call you rehearsed for two hours. The CHRO listens, asks one question, and says "we hire adults, not archives". The offer stands, and this time the file is closed by your own hand.',
      },
      {
        id: 'hope',
        label: 'Say nothing. Maybe this firm checks less.',
        effects: { reputation: -6, burnout: 6 },
        outcome:
          'Week two, the report lands and the silence changes temperature. The offer survives, barely, with a clause in it now. Trust, once itemised, is never quite trust again.',
      },
    ],
  },
]

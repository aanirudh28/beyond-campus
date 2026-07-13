import type { Card } from '../types'

// Chapter 4 · THE WEIGHT · Age 29-33 · 2034-2038
// Management, marriage math, EMIs, abroad, the business itch, the body's first invoice.

export const CARDS_CH4: Card[] = [
  {
    id: 'ch4_wedding_math',
    chapter: 3,
    kind: 'decision',
    title: 'THE WEDDING BUDGET',
    pivotal: true,
    base: `The wedding is happening. Both families have opinions and both families have relatives who count the paneer dishes. The venue your mother loves costs ₹14 lakhs. Your carefully built emergency fund is ₹16 lakhs. Your partner says quietly, "We could do it in ₹5 and put the rest down on a flat."`,
    condition: { flag: 'engaged' },
    options: [
      {
        id: 'grand',
        label: 'Give the families their day. ₹14 lakhs.',
        effects: { savings: -14, family: 16, burnout: 5 },
        outcome:
          'It is a beautiful three days and your grandmother cries with joy. Your bank balance also cries. The colony talks about it for a year.',
      },
      {
        id: 'simple',
        label: 'Small ceremony, ₹5 lakhs, flat down payment.',
        effects: { savings: -5, family: -8, reputation: 3 },
        setFlags: ['pragmatic_wedding'],
        outcome:
          'Two uncles are permanently offended. Years later, when the market turns, the money you kept working looks like quiet genius.',
      },
    ],
  },
  {
    id: 'ch4_people_manager',
    chapter: 3,
    kind: 'decision',
    title: 'THE MANAGER FORK',
    pivotal: true,
    base: `The promotion memo offers two ladders. Manage a team of six, own their appraisals, their fights, their resignations. Or go deeper as a senior individual contributor, the person who solves what others cannot. The company pretends both are equal. The org chart does not.`,
    options: [
      {
        id: 'manage',
        label: 'Take the team. Leverage lives in people.',
        effects: { salary: { mult: 1.25 }, network: 10, burnout: 10, skills: 4 },
        setFlags: ['people_leader'],
        outcome:
          'You stop doing the work and start growing the people who do it. Some days it feels like babysitting. Some days someone you hired does something extraordinary and it feels like the whole point.',
      },
      {
        id: 'ic',
        label: 'Go deep. Be the one they call for the hard thing.',
        effects: { salary: { mult: 1.15 }, skills: 14, reputation: 6 },
        setFlags: ['deep_expert'],
        outcome:
          'Your name becomes shorthand for a capability. The ceiling on this ladder is lower in most companies, and the floor is far more solid.',
      },
    ],
  },
  {
    id: 'ch4_flat_decision',
    chapter: 3,
    kind: 'decision',
    title: 'THE 2BHK QUESTION',
    pivotal: true,
    base: `Everyone at your stage is buying. The 2BHK costs ₹95 lakhs, which means a 20-year EMI that assumes the next 20 years go roughly to plan. Rent for the same flat is half the EMI. Your father says a man needs his own roof. The spreadsheet says the roof needs most of your optionality.`,
    options: [
      {
        id: 'buy',
        label: 'Buy the flat. Roots, pride, forced savings.',
        effects: { savings: -18, family: 10, burnout: 6 },
        setFlags: ['bought_flat_peak'],
        outcome:
          'The housewarming is glorious. The EMI arrives on the 5th of every month for the rest of your foreseeable life, patient as gravity.',
      },
      {
        id: 'rent',
        label: 'Keep renting. Invest the difference, keep the exits open.',
        effects: { savings: 6, family: -5 },
        setFlags: ['kept_liquid'],
        outcome:
          'Relatives ask about it at every function. Your money, meanwhile, stays deployable, and deployable money is what career risks are made of.',
      },
    ],
  },
  {
    id: 'ch4_gulf_offer',
    chapter: 3,
    kind: 'decision',
    title: 'THE DUBAI CALL',
    pivotal: true,
    base: `A Gulf offer lands: 1.7 times your package, tax-free, relocation paid. The money would reset your family's financial story in five years. It would also put you a flight away from every festival, every emergency, every ordinary Sunday that makes a family a family.`,
    condition: { minStat: { skills: 50 } },
    options: [
      {
        id: 'go',
        label: 'Take it. Five hard years, then options forever.',
        effects: { salary: { mult: 1.7 }, savings: 8, family: -14, network: 6, burnout: 8 },
        setFlags: ['went_abroad'],
        outcome:
          'The savings graph goes vertical. The video calls get very good at pretending distance is a solved problem.',
      },
      {
        id: 'stay',
        label: 'Decline. Build the life where the life is.',
        effects: { family: 8, reputation: 3 },
        outcome:
          'The recruiter is baffled. Your mother is not. Some returns do not show up in any statement.',
      },
    ],
  },
  {
    id: 'ch4_business_itch',
    chapter: 3,
    kind: 'decision',
    title: 'THE ITCH',
    pivotal: true,
    base: `You have seen the industry from inside for a decade now. You know exactly what is broken and exactly who would pay for the fix. Starting up means walking away from a salary that took ten years to build, with a runway of maybe eighteen months. The itch does not care about any of that. It just itches.`,
    condition: { minStat: { skills: 55 }, notFlag: 'startup_leap' },
    options: [
      {
        id: 'start',
        label: 'Quit and build it. Now, while you still can.',
        effects: { salary: 0, savings: -8, skills: 12, network: 8, burnout: 14, reputation: 4 },
        setFlags: ['own_business'],
        outcome:
          'Month one is euphoria. Month seven is invoices. You work harder for less money than ever before and cannot fully explain why it feels like breathing.',
      },
      {
        id: 'shelve',
        label: 'Shelve it. The timing is wrong, the EMIs are real.',
        effects: { savings: 3, burnout: 4 },
        setFlags: ['dream_shelved'],
        outcome:
          'The idea goes into a notes app. Two years later someone else builds a worse version of it and gets acquired. You do not check the acquisition amount. You check it twice.',
      },
    ],
  },
  {
    id: 'ch4_body_invoice',
    chapter: 3,
    kind: 'decision',
    title: 'THE FIRST INVOICE FROM YOUR BODY',
    base: `Borderline BP, a fatty liver reading, and a doctor who looks at your report and then at you, twice. "Nothing serious yet. Yet." Fixing it means an hour a day and actual sleep, taken from a calendar that has neither. Ignoring it means the body sends the next invoice with interest.`,
    options: [
      {
        id: 'fix',
        label: 'Fix it now. An hour a day, non-negotiable.',
        effects: { burnout: -15, skills: -2, family: 5 },
        setFlags: ['health_fixed'],
        outcome:
          'Six months of unsexy discipline. The numbers normalise. You start having energy at 7 p.m. again, which turns out to be where careers and marriages actually live.',
      },
      {
        id: 'later',
        label: 'After this quarter. The push is almost done.',
        effects: { burnout: 10 },
        setFlags: ['health_deferred'],
        outcome:
          'The quarter ends. Another begins. The body keeps the books quietly and never forgets a line item.',
      },
    ],
  },
  {
    id: 'ch4_parents_fund',
    chapter: 3,
    kind: 'decision',
    title: 'THE RETIREMENT NOBODY PLANNED',
    base: `Your parents' savings, you discover during a festival visit, are mostly a locker of gold and a plot dispute with a cousin. Their retirement plan, unspoken, is you. Formalising it means a monthly transfer that becomes untouchable. Not formalising it means pretending you have not seen the math.`,
    options: [
      {
        id: 'formalize',
        label: 'Set up the monthly transfer. Say it out loud.',
        effects: { savings: -4, family: 14 },
        setFlags: ['parents_secured'],
        outcome:
          'Your father protests for exactly one month, then stops. Something relaxes in the house that had been clenched for twenty years.',
      },
      {
        id: 'adhoc',
        label: 'Keep it informal. Help when asked.',
        effects: { savings: 1, family: -6 },
        outcome:
          'They rarely ask. That is not the same as rarely needing. The gap gets managed with pride on both sides.',
      },
    ],
  },
  {
    id: 'ch4_kids_fork',
    chapter: 3,
    kind: 'decision',
    title: 'THE NURSERY QUESTION',
    pivotal: true,
    condition: { flag: 'engaged' },
    base: `The conversation happens on an ordinary Tuesday over leftover dal. Now, or in three years when things are "more settled"? Everyone you ask gives the same useless answer: there is never a right time. The EMI, the promotion cycle, and your mother's hints all vote differently.`,
    options: [
      {
        id: 'now',
        label: 'Now. Things are never more settled.',
        effects: { family: 14, savings: -3, burnout: 7 },
        setFlags: ['kid'],
        outcome:
          'Sleep becomes a rumour and the promotion takes a year longer. A very small person laughs at your worst joke, and the org chart never fully recovers its importance.',
      },
      {
        id: 'wait',
        label: 'Three more years. Build the base first.',
        effects: { savings: 3, family: -5 },
        outcome:
          'The base gets built. The conversation returns, as it was always going to, on another ordinary Tuesday, with slightly older people having it.',
      },
    ],
  },
  {
    id: 'ch4_sabbatical_gate',
    chapter: 3,
    kind: 'decision',
    title: 'THE THREE-MONTH DOOR',
    condition: { minStat: { burnout: 60 } },
    base: `The company quietly allows unpaid sabbaticals, a policy nobody uses because using it looks like weakness. You have been running on fumes and cold coffee for six quarters. Three months would cost real money and real optics. It might also be the difference between a long career and a short one.`,
    options: [
      {
        id: 'take_it',
        label: 'Take the three months. Repair the machine.',
        effects: { burnout: -22, salary: { mult: 0.95 }, family: 8 },
        setFlags: ['reset_taken'],
        outcome:
          'Month one you sleep. Month two you remember what hobbies are. Month three you come back sharper than the version of you who would have stayed, and only the calendar knows the difference.',
      },
      {
        id: 'push_through',
        label: 'Push through. Momentum is fragile.',
        effects: { burnout: 9, salary: { mult: 1.05 } },
        outcome:
          'The quarter is saved and so is the optics. The fumes, however, are not a renewable resource, and the gauge keeps drifting left.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch4_ev_startup_exit',
    chapter: 3,
    kind: 'event',
    title: 'THE TERM SHEET',
    base: `The startup you joined as employee six gets acquired. Properly acquired, with bankers and champagne and a number in the press release. Your vested ESOPs convert to actual money: ₹26 lakhs after tax, wired to the same account that once trembled over a ₹4,999 scam deposit.`,
    condition: { flag: 'own_esops', minStat: { skills: 55 } },
    options: [
      {
        id: 'bank_it',
        label: 'Bank it. Let the number sink in slowly.',
        effects: { savings: 26, reputation: 6, burnout: -5 },
        setFlags: ['exit_money'],
        outcome:
          'The wire hits on a Wednesday morning. You check it eleven times. The risk you took at 27, the pay cut everyone called foolish, has finished its argument.',
      },
    ],
  },
  {
    id: 'ch4_ev_junior_star',
    chapter: 3,
    kind: 'event',
    title: 'THE JUNIOR WHO OVERTOOK',
    base: `A junior you once trained gets promoted above you in a restructure. The congratulations message takes you forty minutes to write and it is two lines long. This, nobody warns you, is a standard tax of the middle years.`,
    options: [
      {
        id: 'grace',
        label: 'Send it warmly. Then audit your own trajectory.',
        effects: { reputation: 5, network: 4, burnout: 3 },
        outcome:
          'He remembers the message. People always remember who was graceful when it was hard. The audit you run on yourself afterwards is worth more than the sting.',
      },
    ],
  },
  {
    id: 'ch4_ev_bull_run',
    chapter: 3,
    kind: 'event',
    title: 'THE MARKET REMEMBERS',
    base: `A long bull run lifts everything. The boring SIPs you started years ago have quietly doubled. The colleagues who mocked index funds are asking how to start. Time in the market, it turns out, was the whole trick.`,
    condition: { flag: 'invested_early' },
    options: [
      {
        id: 'stay_course',
        label: 'Change nothing. Let it compound.',
        effects: { savings: 8 },
        outcome:
          'The most profitable thing you do this year is nothing at all.',
      },
    ],
  },
  {
    id: 'ch4_ev_esop_paper',
    chapter: 3,
    kind: 'event',
    title: 'THE PAPER MONEY MOMENT',
    base: `The startup you joined as employee six raises a big round. On paper, your ESOPs are worth ₹1.4 crore. On paper. A secondary sale window opens for a fraction of it, real money for imaginary money.`,
    condition: { flag: 'own_esops' },
    options: [
      {
        id: 'sell_some',
        label: 'Sell 20 percent. De-risk, stay believing.',
        effects: { savings: 12, burnout: -4 },
        setFlags: ['esop_partial'],
        outcome:
          'Real money lands in a real account. Whatever happens to the cap table now, this much is yours and cooked.',
      },
      {
        id: 'hold_all',
        label: 'Hold everything. This rocket is still climbing.',
        effects: { burnout: 3 },
        setFlags: ['esop_diamond_hands'],
        outcome:
          'Maybe generational. Maybe wallpaper. The next few years get to decide, not you.',
      },
    ],
  },
  {
    id: 'ch4_ev_school_fees',
    chapter: 3,
    kind: 'event',
    title: 'THE ADMISSION INTERVIEW',
    base: `You are interviewed by a school. For a nursery seat. The fee structure has a term called "annual development charge" that costs more than your first year's salary did. Everyone in the waiting room has the same expression: how did this become normal?`,
    condition: { flag: 'engaged' },
    options: [
      {
        id: 'pay',
        label: 'Pay it. The compounding starts young, both kinds.',
        effects: { savings: -3, family: 6 },
        outcome:
          'The uniform is adorable. The invoice is not. Welcome to the twenty-year subscription you cannot cancel.',
      },
    ],
  },
]

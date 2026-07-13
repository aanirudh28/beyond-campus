import type { Card } from '../types'

// Chapter 5 · THE CORRECTION · Age 33-38 · 2038-2043
// The downturn plus the AI wave. Who compounds through it, who gets compounded.

export const CARDS_CH5: Card[] = [
  // Forced correction event, variant chosen by skills at chapter entry.
  {
    id: 'ch5_correction_strong',
    chapter: 4,
    kind: 'event',
    forced: true,
    title: 'THE CORRECTION OF 2039',
    pivotal: true,
    condition: { minStat: { skills: 60 } },
    base: `It arrives the way corrections do, slowly and then all at once. Funding freezes, hiring stops, and the AI systems that were "assistants" last year are quietly doing the work of entire teams this year. Your company cuts 20 percent. You are not on the list. You are in the room where the list is made.`,
    options: [
      {
        id: 'shield',
        label: 'Fight to save your best people, spend your capital.',
        effects: { reputation: 12, network: 10, burnout: 10 },
        setFlags: ['crisis_leader'],
        outcome:
          'You save four of six. The four never forget it, and neither does the industry grapevine, which is the only HR system that actually works.',
      },
      {
        id: 'comply',
        label: 'Execute the list cleanly. Protect your own seat.',
        effects: { salary: { mult: 1.1 }, reputation: -6, burnout: 8 },
        outcome:
          'The cut is surgical and you survive the year with a retention bonus. Some hallway conversations stop when you approach now.',
      },
    ],
  },
  {
    id: 'ch5_correction_exposed',
    chapter: 4,
    kind: 'event',
    forced: true,
    title: 'THE CORRECTION OF 2039',
    pivotal: true,
    condition: { maxStat: { skills: 59 } },
    base: `It arrives the way corrections do, slowly and then all at once. Funding freezes, hiring stops, and the AI systems that were "assistants" last year are quietly doing the work your role used to justify. The restructure email has a meeting invite attached. Your name is in the subject line.`,
    options: [
      {
        id: 'negotiate',
        label: 'Negotiate hard: severance, notice, references.',
        effects: { salary: { mult: 0.6 }, savings: 3, burnout: 12, reputation: 2 },
        setFlags: ['laid_off_once'],
        outcome:
          'You leave with four months of severance and your dignity intact. The next role takes five months to find and pays less. The lesson costs exactly that much.',
      },
      {
        id: 'internal',
        label: 'Beg for any internal seat. Survive inside.',
        effects: { salary: { mult: 0.75 }, reputation: -5, burnout: 14 },
        setFlags: ['demoted_survived'],
        outcome:
          'A sideways role in a forgotten team keeps the salary alive. It buys time. What you do with the time is now the entire question.',
      },
    ],
  },
  {
    id: 'ch5_ai_reskill',
    chapter: 4,
    kind: 'decision',
    title: 'THE TOOLS THAT ATE THE TOOLS',
    pivotal: true,
    base: `Half your team secretly fears the AI systems. The other half secretly runs their whole job through them. The people getting promoted are neither: they are the ones redesigning the work itself around the new tools. That skill is learnable, and almost nobody your age is learning it.`,
    options: [
      {
        id: 'native',
        label: 'Go deep. Become the person who redesigns the work.',
        effects: { skills: 16, salary: { mult: 1.2 }, burnout: 6 },
        setFlags: ['ai_native'],
        outcome:
          'You stop competing with the machine and start conducting it. Your output triples and, more usefully, becomes very hard to replace.',
      },
      {
        id: 'resist',
        label: 'Trust experience. Judgment cannot be automated.',
        effects: { skills: -6, reputation: -4 },
        setFlags: ['ai_resisted'],
        outcome:
          'You are half right. Judgment survives. But judgment that cannot drive the new tools gets priced like vinyl records: valued by collectors, ignored by the market.',
      },
    ],
  },
  {
    id: 'ch5_buy_the_dip',
    chapter: 4,
    kind: 'decision',
    title: 'BLOOD IN THE STREETS',
    pivotal: true,
    base: `Everything is cheap. Good companies at half price, good people unemployed, good office space begging. Everyone with money is scared and everyone brave has no money. You have some of both, which is rare, and temporary.`,
    condition: { minStat: { savings: 15 } },
    options: [
      {
        id: 'deploy',
        label: 'Deploy a third of your savings into the fear.',
        effects: { savings: -10, burnout: 4 },
        setFlags: ['bought_dip'],
        outcome:
          'Your hands shake a little clicking confirm. Fortunes are transferred in downturns, mostly from the impatient to the patient. You have chosen a side.',
      },
      {
        id: 'preserve',
        label: 'Preserve cash. Survival first, glory later.',
        effects: { burnout: -4 },
        outcome:
          'The war chest stays sealed. Whatever the market does, your family sleeps. That is also a return.',
      },
    ],
  },
  {
    id: 'ch5_teach_back',
    chapter: 4,
    kind: 'decision',
    title: 'THE SATURDAY CLASSROOM',
    base: `A college like your old one asks you to take weekend sessions for final-year students. No money worth mentioning. Just thirty kids from towns like yours, drowning in the same silence you once drowned in, asking how you got out.`,
    options: [
      {
        id: 'teach',
        label: 'Take the Saturdays. Send the elevator back down.',
        effects: { network: 8, reputation: 8, burnout: 4, family: 3 },
        setFlags: ['gives_back'],
        outcome:
          'Half of them just want the certificate of attendance. Four of them are on fire. You would trade a lot of quarters for what watching those four feels like.',
      },
      {
        id: 'decline',
        label: 'Decline gently. Your own tank is empty.',
        effects: { burnout: -6 },
        outcome:
          'The weekends stay yours, and you need them. The elevator waits. It is patient, but it does not send itself.',
      },
    ],
  },
  {
    id: 'ch5_second_income',
    chapter: 4,
    kind: 'decision',
    title: 'THE SECOND ENGINE',
    base: `The correction taught everyone the same lesson: one income is one point of failure. A consulting side practice in your niche could add ₹8-10 lakhs a year. It would also colonise the last unclaimed evenings of your week.`,
    condition: { minStat: { skills: 55 } },
    options: [
      {
        id: 'build',
        label: 'Build the practice. Redundancy is peace.',
        effects: { savings: 8, salary: 2, burnout: 8, family: -5 },
        setFlags: ['second_engine'],
        outcome:
          'Two retainer clients later, a strange calm arrives. Whatever any employer decides now, the lights stay on. You negotiate differently, forever.',
      },
      {
        id: 'focus',
        label: 'Stay single-threaded. Depth over hedges.',
        effects: { skills: 6, family: 4 },
        outcome:
          'The evenings stay human. The single thread holds, this time, and you choose not to think about the other timelines.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch5_ev_recovery',
    chapter: 4,
    kind: 'event',
    title: 'THE RECOVERY RALLY',
    base: `Eighteen months after the bottom, the recovery arrives without an announcement. The positions you bought while your hands were shaking have nearly tripled. The people who called you reckless are asking for tips at the same dinner where they called you reckless.`,
    condition: { flag: 'bought_dip' },
    options: [
      {
        id: 'harvest',
        label: 'Rebalance calmly. Take the win.',
        effects: { savings: 22, reputation: 3 },
        outcome:
          'The downturn, in the final accounting, was the single best financial event of your life. You say this at no dinner parties, because nobody enjoys the arithmetic of patience.',
      },
    ],
  },
  {
    id: 'ch5_ev_mentee',
    chapter: 4,
    kind: 'event',
    title: 'THE MESSAGE FROM ROW THREE',
    base: `One of your Saturday students, the quiet one from row three, sends a screenshot. An offer letter. Founder's office role, ₹9 LPA, off campus, first person in her family with a formal job. "Sir/Ma'am, you said the market has doors, not walls. You were right."`,
    condition: { flag: 'gives_back' },
    options: [
      {
        id: 'savor',
        label: 'Frame it. Some ROI does not fit in lakhs.',
        effects: { family: 6, burnout: -6, reputation: 4 },
        outcome:
          'You have signed offers worth crores in your career. This screenshot outranks all of them and it is not close.',
      },
    ],
  },
  {
    id: 'ch5_ev_acquihire',
    chapter: 4,
    kind: 'event',
    title: 'THE ACQUIHIRE CALL',
    base: `An AI-first firm is buying capability, not companies, and your name came up twice in their diligence. The offer is 1.5 times your package to lead a pod doing what you rebuilt yourself to do. Corrections end. Reputations built during them do not.`,
    condition: { flag: 'ai_native' },
    options: [
      {
        id: 'accept',
        label: 'Take it. This is what the reskilling was for.',
        effects: { salary: { mult: 1.5 }, reputation: 6, network: 6 },
        setFlags: ['correction_winner'],
        outcome:
          'The bet you made in the worst year pays out in the best one. The colleagues who waited for "things to settle" are still waiting.',
      },
      {
        id: 'leverage',
        label: 'Use it as leverage where you are.',
        effects: { salary: { mult: 1.25 }, reputation: 3 },
        outcome:
          'Your current employer suddenly discovers budget that did not exist last quarter. Funny how that works. You bank the raise and the knowledge.',
      },
    ],
  },
  {
    id: 'ch5_ev_esop_verdict',
    chapter: 4,
    kind: 'event',
    title: 'THE CAP TABLE VERDICT',
    base: `The startup whose paper crores you held through everything finally has its event. The downturn crushed the valuation, the recovery salvaged a sale. The paper money becomes real money at roughly one-third of the peak number you once screenshotted.`,
    condition: { flag: 'esop_diamond_hands' },
    options: [
      {
        id: 'accept_it',
        label: 'Bank it without bitterness. Paper was always paper.',
        effects: { savings: 18, burnout: -3 },
        outcome:
          'One third of a dream is still ₹45 lakhs of reality. You learn to hold both sentences at once.',
      },
    ],
  },
]

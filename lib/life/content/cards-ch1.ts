import type { Card } from '../types'

// Chapter 1 · THE HUNT · Age 21-23 · 2026-2028
// Final year and the first job. No em dashes in copy. Salaries in ₹ LPA.

export const CARDS_CH1: Card[] = [
  {
    id: 'ch1_family_verdict',
    chapter: 0,
    kind: 'decision',
    title: 'THE DINNER TABLE',
    pivotal: true,
    base: `Your father slides a newspaper cutting across the table. Bank PO exam, notification out. "Settled life, pension, respect in the colony." Your cousin cleared it two years ago and just bought a Swift. Meanwhile your off-campus applications sit at 43 sent, 2 replies. He is not angry. That somehow makes it worse.`,
    options: [
      {
        id: 'exam',
        label: 'Fill the bank exam form. Keep the peace.',
        effects: { family: 12, reputation: -4, burnout: 6, skills: -3 },
        setFlags: ['exam_track'],
        outcome:
          'You spend evenings on reasoning puzzles instead of cold emails. The house is calmer. Your LinkedIn goes quiet.',
      },
      {
        id: 'hustle',
        label: 'Show him the tracker. 43 applied, and a system.',
        effects: { family: -8, network: 5, reputation: 6 },
        setFlags: ['backed_self'],
        outcome:
          'He does not get it, but he sees the spreadsheet discipline and stops asking daily. The pressure moves underground. So do you, deeper into the hunt.',
      },
    ],
  },
  {
    id: 'ch1_excel_sunday',
    chapter: 0,
    kind: 'decision',
    title: 'ONE FREE SUNDAY',
    pivotal: true,
    base: `A senior from your college, now an analyst in a Gurgaon consulting firm's research team, posts: "Freshers who know VLOOKUP and pivot tables clear our screening 3x more often. Nobody teaches this in class." There is a free 6-hour Excel sprint this Sunday. There is also your best friend's farewell trip to Rishikesh, same Sunday.`,
    options: [
      {
        id: 'excel',
        label: 'Skip the trip. Learn Excel properly.',
        effects: { skills: 12, family: -5 },
        setFlags: ['excel_learned'],
        outcome:
          'The trip photos sting for a week. Six months later, a screening test asks you to build a pivot table and you smile.',
      },
      {
        id: 'trip',
        label: 'Go to Rishikesh. Excel can wait.',
        effects: { family: 9, burnout: -8 },
        outcome:
          'Some memories are worth more than a formula. Whether a recruiter agrees is a different question.',
      },
    ],
  },
  {
    id: 'ch1_first_offer',
    chapter: 0,
    kind: 'decision',
    title: 'THE FIRST OFFER',
    pivotal: true,
    base: `It finally happens. A 40-person startup offers you a BD role. ₹3.2 LPA, six-day weeks, and the office is 1,400 km from home. Your mother asks if it is "a real company." Your group chat says take anything, the market is brutal. A shinier brand might come. Or the season might simply end.`,
    options: [
      {
        id: 'take',
        label: 'Take it. Momentum beats brand at 21.',
        effects: { salary: 3.2, savings: 1, network: 8, family: -10, burnout: 8 },
        setFlags: ['took_early_job', 'moved_metro'],
        outcome:
          'You learn more in three months of quota panic than in three years of lectures. Home becomes a voice note you reply to late.',
      },
      {
        id: 'wait',
        label: 'Decline. Hold out for a stronger name.',
        effects: { reputation: 3, burnout: 10, savings: -0.5 },
        setFlags: ['held_out'],
        outcome:
          'Two more months of silence test you. Then a mid-size firm with a real training program says yes. The wait was a bet, and this time it paid.',
      },
    ],
  },
  {
    id: 'ch1_alum_dm',
    chapter: 0,
    kind: 'decision',
    title: 'THE MESSAGE YOU KEEP DELETING',
    pivotal: true,
    base: `There is an alum from your college in the exact team you want. You have rewritten the LinkedIn message four times. "Sir, I hope this message finds you well" feels wrong. Sending nothing feels worse. Referred candidates get read. Portal applications get filtered.`,
    options: [
      {
        id: 'send',
        label: 'Send the honest version. Two lines, no "sir".',
        effects: { network: 12, reputation: 4 },
        setFlags: ['dm_courage'],
        outcome:
          'He replies in a day: "Finally someone who did not paste their whole resume." He forwards your CV internally. Nothing may come of it. Everything may.',
      },
      {
        id: 'portal',
        label: 'Just apply on the portal like everyone else.',
        effects: { burnout: 4 },
        outcome:
          'Application number 8,347 enters the system. The system does not write back.',
      },
    ],
  },
  {
    id: 'ch1_attendance',
    chapter: 0,
    kind: 'decision',
    title: 'THE ATTENDANCE ULTIMATUM',
    base: `A live project with a D2C brand wants you three days a week. Real work, unpaid, real proof for the resume. Your college warns your attendance will dip below 65 percent and the internal marks will bleed. Your parents only see one of those two numbers.`,
    options: [
      {
        id: 'project',
        label: 'Take the project. Marks are a story, proof is proof.',
        effects: { skills: 10, reputation: 5, family: -6 },
        setFlags: ['proof_of_work'],
        outcome:
          'Your seventh-semester marksheet is unremarkable. Your interview stories stop being hypothetical.',
      },
      {
        id: 'marks',
        label: 'Protect the CGPA. Some doors screen on it.',
        effects: { skills: 3, family: 5 },
        outcome:
          'The 8.1 CGPA keeps certain listings open. The "tell me about a time" questions stay hard to answer.',
      },
    ],
  },
  {
    id: 'ch1_local_settle',
    chapter: 0,
    kind: 'decision',
    title: 'THE SAFE ₹2.4',
    base: `The college placement cell delivers its one big win: a back-office role in your own city. ₹2.4 LPA, 9 to 5, ten minutes from home. Your mother has already told the neighbours. The work is data entry with a better title. You know exactly what year three of this looks like.`,
    condition: { notFlag: 'took_early_job' },
    options: [
      {
        id: 'settle',
        label: 'Take it. Steady beats risky right now.',
        effects: { salary: 2.4, savings: 1, family: 10, skills: -4 },
        setFlags: ['settled_local'],
        outcome:
          'Life is comfortable and small. The commute is short. So, quietly, is the ceiling.',
      },
      {
        id: 'refuse',
        label: 'Refuse it. Keep hunting off campus.',
        effects: { family: -8, burnout: 8, reputation: 4 },
        setFlags: ['backed_self'],
        outcome:
          'The neighbours hear about the refusal too. You go back to the tracker and add ten more rows.',
      },
    ],
  },
  {
    id: 'ch1_cert_grind',
    chapter: 0,
    kind: 'decision',
    title: 'THE CERTIFICATE QUESTION',
    base: `Your feed is full of batchmates posting certificates. Six-week digital marketing course, ₹15,000, "guaranteed placement assistance." You have also seen a free path: run one small campaign for your uncle's tile shop and write about what happened.`,
    options: [
      {
        id: 'real',
        label: 'Run the tile shop campaign. Free, real, messy.',
        effects: { skills: 9, network: 3, savings: -0.1 },
        setFlags: ['proof_of_work'],
        outcome:
          'The campaign makes the shop ₹40,000 in a month. The one-page case study you write does more work than any certificate.',
      },
      {
        id: 'cert',
        label: 'Pay for the course. Structure has value too.',
        effects: { skills: 5, savings: -0.15 },
        outcome:
          'The course is fine. The placement assistance is a WhatsApp group. The certificate joins six others on your profile.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch1_english_tax',
    chapter: 0,
    kind: 'decision',
    title: 'THE ENGLISH TAX',
    condition: { city: 'tier3' },
    base: `In the mock group discussion, you had the best point in the room and said it last, quietly, in a sentence you rehearsed twice. The city kids talk in easy, careless English, like it costs them nothing. For you it costs something every time. There is a daily practice circle that meets online at 7 a.m. It is embarrassing. It works.`,
    options: [
      {
        id: 'grind',
        label: 'Join the 7 a.m. circle. Pay the tax now.',
        effects: { skills: 10, burnout: 4, network: 4 },
        setFlags: ['english_grind'],
        outcome:
          'For three months you are the worst speaker in a room of strangers. By placement season, interviewers stop noticing your English and start noticing your answers.',
      },
      {
        id: 'avoid',
        label: 'Avoid English-heavy rounds. Play to strengths.',
        effects: { burnout: -3, family: 2 },
        outcome:
          'There is comfort in the mother tongue and there is a toll booth on certain roads. You take the routes without one, and there are fewer of them.',
      },
    ],
  },
  {
    id: 'ch1_fest_hustle',
    chapter: 0,
    kind: 'decision',
    title: 'THE SPONSORSHIP DESK',
    base: `The college fest needs someone to raise sponsorships. Unpaid, thankless, and it means calling forty local businesses that mostly say no. It is also the closest thing to a real BD job that exists on this campus, and the coordinator title goes on the resume either way.`,
    options: [
      {
        id: 'hustle',
        label: 'Take the desk. Forty nos are forty reps.',
        effects: { network: 8, skills: 6, burnout: 4 },
        setFlags: ['proof_of_work'],
        outcome:
          'You close ₹1.8 lakhs from a gym, a cafe, and a coaching centre. In interviews, "tell me about a sale you made" stops being a trap.',
      },
      {
        id: 'skip_fest',
        label: 'Skip it. Applications need those hours.',
        effects: { skills: 3 },
        outcome:
          'The fest happens without you. So does the story you would have told for the next five years.',
      },
    ],
  },
  {
    id: 'ch1_ev_first_interview',
    chapter: 0,
    kind: 'event',
    title: 'THE FIRST REAL INTERVIEW',
    base: `It goes badly. Not movie-badly, just ordinary-badly: you blank on "walk me through your resume", laugh nervously at your own answer, and hear yourself say "I am a quick learner" twice. The interviewer is kind about it, which somehow stings more. Everyone's first one goes like this. Nobody says so.`,
    options: [
      {
        id: 'debrief',
        label: 'Write down every question the same night.',
        effects: { skills: 5, burnout: 3, reputation: 2 },
        setFlags: ['first_blood'],
        outcome:
          'The document is titled "never again.docx". Interview two is mediocre. Interview five is good. The compounding is invisible and absolutely real.',
      },
    ],
  },
  {
    id: 'ch1_ev_ghosting',
    chapter: 0,
    kind: 'event',
    title: 'THE SILENCE',
    base: `Eleven weeks. Four "we will get back to you" replies that never came back. One interviewer who took the call from a moving auto and hung up halfway. Nobody tells you the off-campus market runs on silence. You learn it one unread application at a time.`,
    options: [
      {
        id: 'absorb',
        label: 'Log it, close the laptop, apply again tomorrow.',
        effects: { burnout: 8, reputation: 2 },
        outcome:
          'Rejection stops being an event and becomes weather. You start carrying an umbrella.',
      },
    ],
  },
  {
    id: 'ch1_ev_scam',
    chapter: 0,
    kind: 'event',
    title: 'THE OFFER LETTER THAT ASKS FOR MONEY',
    base: `An email arrives with a logo that is almost right. "Congratulations! Pay ₹4,999 as refundable security deposit to confirm your offer." Your desperate month wants it to be real. Your gut knows companies pay you, not the other way around.`,
    options: [
      {
        id: 'report',
        label: 'Report it and warn the college group.',
        effects: { reputation: 4, network: 3 },
        setFlags: ['scam_radar'],
        outcome:
          'Two juniors were about to pay. Your warning saves them ₹10,000 and earns you something the resume cannot hold.',
      },
      {
        id: 'ignore',
        label: 'Delete it and move on quietly.',
        effects: {},
        outcome: 'One more tab closed. The hunt continues.',
      },
    ],
  },
  {
    id: 'ch1_ev_small_viral',
    chapter: 0,
    kind: 'event',
    title: 'THE POST THAT TRAVELLED',
    base: `At 1 a.m. you write an honest post about rejection number 67, no hashtags, no fake gratitude. By evening it has 900 reactions and three DMs from strangers, one of them a hiring manager who says "your writing is clearer than most MBAs I interview."`,
    options: [
      {
        id: 'lean_in',
        label: 'Keep writing one honest post a week.',
        effects: { network: 10, reputation: 5, burnout: 2 },
        setFlags: ['creator_spark'],
        outcome:
          'Most posts do nothing. Every fifth one brings a conversation money cannot buy.',
      },
      {
        id: 'one_off',
        label: 'Enjoy it and go back to applications.',
        effects: { network: 3 },
        outcome: 'A good day. The algorithm forgets you by Friday, as it forgets everyone.',
      },
    ],
  },
]

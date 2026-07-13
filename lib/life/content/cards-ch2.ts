import type { Card } from '../types'

// Chapter 2 · THE GRIND · Age 23-26 · 2028-2031
// First job reality: switches, managers, money habits, the metro question.

export const CARDS_CH2: Card[] = [
  {
    id: 'ch2_switch_or_stay',
    chapter: 1,
    kind: 'decision',
    title: 'THE 40 PERCENT CALL',
    pivotal: true,
    base: `Eighteen months in, a rival firm calls. Same work, 40 percent more money, joining bonus if you serve notice quietly. Your current manager just put your name forward for a team lead track. HR gave you a 6 percent appraisal and called it "market correction."`,
    options: [
      {
        id: 'switch',
        label: 'Switch. Loyalty is not a line item on payday.',
        effects: { salary: { mult: 1.4 }, reputation: -3, network: 5, burnout: 5 },
        setFlags: ['switched_early'],
        outcome:
          'The new badge feels the same by week three. The new salary does not. You learn that the biggest raises live between companies, not inside them.',
      },
      {
        id: 'stay',
        label: 'Stay. Cash in the lead track and the trust.',
        effects: { salary: { mult: 1.12 }, reputation: 8, skills: 5 },
        setFlags: ['loyal_arc'],
        outcome:
          'Six months later you are running two juniors and a client call alone. The money lags. The compounding has started somewhere else.',
      },
    ],
  },
  {
    id: 'ch2_manager_exit',
    chapter: 1,
    kind: 'decision',
    title: 'THE MANAGER WHO LEFT',
    pivotal: true,
    base: `Your first real manager, the one who rewrote your emails until they stopped sounding scared, resigns. Farewell cake, one group photo, and a "keep in touch, champ." Everyone says that. Almost nobody does it.`,
    options: [
      {
        id: 'keep',
        label: 'Actually keep in touch. A message every month.',
        effects: { network: 12, reputation: 3 },
        setFlags: ['mentor_kept'],
        outcome:
          'Most months it is two lines about work and cricket. You have no idea yet what this thread will be worth in a bad year.',
      },
      {
        id: 'fade',
        label: 'Let it fade. New manager, new chapter.',
        effects: { skills: 2 },
        outcome:
          'The photo stays in the gallery. The number stays in the phone. The relationship quietly stops existing.',
      },
    ],
  },
  {
    id: 'ch2_evening_hours',
    chapter: 1,
    kind: 'decision',
    title: 'WHAT THE EVENINGS ARE FOR',
    pivotal: true,
    base: `Office ends at seven. What happens between eight and eleven is your actual career. A structured SQL and analytics course wants those hours. So does a freelance gig writing product descriptions at ₹2 per word, money you can see immediately.`,
    options: [
      {
        id: 'skills',
        label: 'Take the analytics course. Build the deep skill.',
        effects: { skills: 14, savings: -0.3, burnout: 6 },
        setFlags: ['data_skills'],
        outcome:
          'Three months of ugly practice queries later, you automate a report your whole team hated. People start saying your name in rooms you are not in.',
      },
      {
        id: 'cash',
        label: 'Take the freelance money. Cash now is real.',
        effects: { savings: 2.5, burnout: 8, skills: 3 },
        setFlags: ['side_hustle'],
        outcome:
          'The extra ₹20,000 a month changes what the end of the month feels like. It buys breathing room, not leverage. Those are different purchases.',
      },
    ],
  },
  {
    id: 'ch2_stolen_credit',
    chapter: 1,
    kind: 'decision',
    title: 'YOUR SLIDE, HIS VOICE',
    base: `In the quarterly review, a senior presents your analysis with the pronoun swapped. "So I dug into the churn data..." Your manager nods along. You have thirty seconds to decide what kind of colleague you are going to be for the next twenty years.`,
    options: [
      {
        id: 'speak',
        label: 'Add to the point, calmly, owning the work.',
        effects: { reputation: 8, network: -3, burnout: 3 },
        setFlags: ['spoke_up'],
        outcome:
          '"Happy to walk through how I built that model." The room notices. The senior never tries it again. Neither do two others who were watching.',
      },
      {
        id: 'swallow',
        label: 'Let it go. Not worth the politics.',
        effects: { burnout: 8, reputation: -4 },
        setFlags: ['swallowed_it'],
        outcome:
          'The meeting moves on. Something in you files a small permanent note about what silence costs.',
      },
    ],
  },
  {
    id: 'ch2_metro_transfer',
    chapter: 1,
    kind: 'decision',
    title: 'THE BANGALORE QUESTION',
    pivotal: true,
    base: `The company offers you a transfer to the metro HQ. Bigger projects, visible leadership, rent that eats a third of your salary, and a train home that needs planning like a military operation. Your mother says "so far?" in a voice you will hear for years either way.`,
    condition: { notFlag: 'moved_metro' },
    options: [
      {
        id: 'move',
        label: 'Move. Careers compound where the action is.',
        effects: { salary: { mult: 1.15 }, network: 12, family: -10, savings: -1 },
        setFlags: ['moved_metro'],
        outcome:
          'The city is expensive, lonely, and electric. Within a year you know people who casually change what you think is possible.',
      },
      {
        id: 'stay_home',
        label: 'Stay close to home. Some roots matter more.',
        effects: { family: 12, savings: 1.5, network: -4 },
        setFlags: ['stayed_rooted'],
        outcome:
          'Sunday lunches stay real. You become the person who is always there. The big-league invitations get rarer, and quieter.',
      },
    ],
  },
  {
    id: 'ch2_first_bonus',
    chapter: 1,
    kind: 'decision',
    title: 'THE FIRST REAL BONUS',
    base: `₹1.1 lakh lands in your account, the first money that is not already spoken for. The phone in your pocket is two generations old and everyone at work has noticed. An index fund SIP calculator is open in another tab, showing what this becomes in twenty years.`,
    options: [
      {
        id: 'invest',
        label: 'Start the SIP. Boring money, deployed early.',
        effects: { savings: 1.1, reputation: 1 },
        setFlags: ['invested_early'],
        outcome:
          'Nothing visible changes. In the compounding math you just started, twenty-year-old you did forty-year-old you an enormous favour.',
      },
      {
        id: 'upgrade',
        label: 'Buy the phone. You earned this, visibly.',
        effects: { savings: 0.1, family: 3, burnout: -4 },
        outcome:
          'The camera is genuinely great. The joy is real and lasts about seven weeks, which is normal, and fine, once.',
      },
    ],
  },
  {
    id: 'ch2_speaking_club',
    chapter: 1,
    kind: 'decision',
    title: 'THE VOICE PROBLEM',
    base: `In client calls your ideas are good and your delivery is quiet. A colleague from a small town like yours got transformed by a weekly speaking club, two hours every Saturday morning. Saturday mornings are also the only time you truly rest.`,
    options: [
      {
        id: 'join',
        label: 'Join the club. Fluency is a career multiplier.',
        effects: { skills: 8, network: 6, burnout: 4 },
        setFlags: ['fluent_speaker'],
        outcome:
          'Month one is humiliating. Month six, a client asks your manager whether you could present the whole review. Your manager says yes without checking.',
      },
      {
        id: 'rest',
        label: 'Protect the rest. Burnout is also a career risk.',
        effects: { burnout: -8, family: 4 },
        outcome:
          'The Saturday sleep repairs things spreadsheets cannot see. The voice stays quiet a while longer.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch2_ev_appraisal',
    chapter: 1,
    kind: 'event',
    title: 'APPRAISAL SEASON',
    base: `The email says "Exceeds Expectations." The number says 7 percent. Inflation says 6. Your manager explains the "normalisation curve" with the face of a man reading someone else's homework. Half your team updates their resumes that night.`,
    options: [
      {
        id: 'note',
        label: 'Update yours too. Quietly. Just in case.',
        effects: { network: 3, burnout: 3 },
        outcome:
          'The resume sits ready in a folder named after a college assignment. Loaded weapons are calming, apparently.',
      },
    ],
  },
  {
    id: 'ch2_ev_wedding_season',
    chapter: 1,
    kind: 'event',
    title: 'WEDDING SEASON, ROUND ONE',
    base: `Four weddings in one winter. Two school friends, one cousin, one colleague. Between the outfits, gifts, and trains, the season quietly bills you ₹70,000. Everyone looks happy. Several of them ask when it is your turn, purely as a greeting.`,
    options: [
      {
        id: 'attend',
        label: 'Show up for all of it. This is the fabric.',
        effects: { savings: -0.7, family: 8, network: 4 },
        outcome:
          'On the dance floor at the third one you realise these people are your actual net worth. The bank disagrees, gently.',
      },
      {
        id: 'skip',
        label: 'Attend two, send warm excuses to two.',
        effects: { savings: -0.35, family: -4 },
        outcome:
          'The money stays. A school friend goes slightly formal with you and never fully comes back.',
      },
    ],
  },
  {
    id: 'ch2_ev_recruiter_ping',
    chapter: 1,
    kind: 'event',
    title: 'THE HEADHUNTER TEST',
    base: `A recruiter calls about a role one level up. You are not looking, but you take the call as practice. She asks your expected CTC and you hear yourself quote a number 20 percent below what she was ready to say. The silence afterwards is educational.`,
    options: [
      {
        id: 'learn',
        label: 'Research your real market rate this weekend.',
        effects: { skills: 4, reputation: 2 },
        setFlags: ['knows_worth'],
        outcome:
          'Three job portals and five awkward DMs later you have a number. Knowing it changes your posture in every room after.',
      },
    ],
  },
]

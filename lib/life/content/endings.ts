import type { Ending } from '../types'

// Ordered most-specific to most-generic. First match wins.
// selectEnding falls through to 'the_open_road', which matches everything.
// baselineRarity is an authored prior % used until real player counts exist.
// Balance-checked with scripts/life-sim-test.ts — rerun it after editing rules.

export const ENDINGS: Ending[] = [
  {
    id: 'the_recession_alchemist',
    name: 'The Recession Alchemist',
    emoji: '⚗️',
    tone: 'weird',
    blurb:
      'While everyone else hid from the worst market in a generation, you bought it. The correction that broke a thousand careers quietly built your fortune.',
    baselineRarity: 5,
    match: { allFlags: ['bought_dip'], minSavings: 140 },
  },
  {
    id: 'the_beautiful_failure',
    name: 'The Beautiful Failure',
    emoji: '🔥',
    tone: 'weird',
    blurb:
      'The business did not make it. You did. Everyone who watched you build, fail, and stand back up wants you on their team, and they are willing to pay for the scar tissue.',
    baselineRarity: 5,
    match: { allFlags: ['own_business'], maxSavings: 25 },
  },
  {
    id: 'the_founder',
    name: 'The Founder',
    emoji: '🚀',
    tone: 'good',
    blurb:
      'You quit the salary, survived the invoices, and built a thing that works. Not unicorn-famous. Something rarer: profitable, yours, and still standing at 36.',
    baselineRarity: 4,
    match: { allFlags: ['own_business'], minSavings: 75 },
  },
  {
    id: 'the_exit',
    name: 'The Exit',
    emoji: '💸',
    tone: 'weird',
    blurb:
      'Employee six, a pay cut everyone mocked, and years of doing five jobs badly. Then the term sheet landed and finished the argument. The risk was the resume.',
    baselineRarity: 2,
    match: { allFlags: ['exit_money'], minSavings: 105 },
  },
  {
    id: 'the_dukaan_empire',
    name: 'The Dukaan Empire',
    emoji: '🏪',
    tone: 'weird',
    blurb:
      'It started as a cousin’s shop and a weekend favour. It ended as a three-district distribution network with a Mumbai term sheet. The MBAs studied case studies. You became one.',
    baselineRarity: 2,
    match: { allFlags: ['sold_shop'], minSavings: 45 },
  },
  {
    id: 'the_hometown_king',
    name: 'The Hometown King',
    emoji: '🏡',
    tone: 'good',
    blurb:
      'You took everything the big cities taught you and planted it where you began. Your town has your fingerprints on it now, and your Sundays have a courtyard.',
    baselineRarity: 6,
    match: { allFlags: ['hometown_builder'], minStat: { family: 75 }, minSavings: 85 },
  },
  {
    id: 'the_golden_handcuffs',
    name: 'The Golden Handcuffs',
    emoji: '⛓️',
    tone: 'bad',
    blurb:
      'The package is spectacular and so is the emptiness around it. You bought everything except the Tuesday evenings, and those turned out to be the expensive part.',
    baselineRarity: 4,
    match: { minSalary: 40, maxStat: { family: 40 }, minStat: { burnout: 45 } },
  },
  {
    id: 'the_burnout',
    name: 'The Burnout',
    emoji: '🕯️',
    tone: 'bad',
    blurb:
      'You treated your body like a rental car and the lease came due. The career survived. What it ran on did not, and no appraisal cycle gives that back.',
    baselineRarity: 5,
    match: { minStat: { burnout: 78 } },
  },
  {
    id: 'the_emi_horizon',
    name: 'The EMI Horizon',
    emoji: '🧱',
    tone: 'bad',
    blurb:
      'The flat is beautiful and it owns you. Every risk you could not take, every leap you could not make, arrived on the 5th of the month wearing the same polite face.',
    baselineRarity: 4,
    match: { allFlags: ['bought_flat_peak'], maxSavings: 38 },
  },
  {
    id: 'the_screenshot_investor',
    name: 'The Screenshot Investor',
    emoji: '📉',
    tone: 'bad',
    blurb:
      'The market taught you at full price, more than once, and the tuition came out of your future. The colleagues with the boring SIPs never posted screenshots. They did not need to.',
    baselineRarity: 3,
    match: { allFlags: ['fno_burn'], maxSavings: 45 },
  },
  {
    id: 'the_ghost_of_linkedin',
    name: 'The Ghost of LinkedIn',
    emoji: '👻',
    tone: 'bad',
    blurb:
      'Ten thousand followers, four hundred connections, and a skill set that stopped compounding years ago. The audience showed up. The offers checked the work first.',
    baselineRarity: 3,
    match: { minStat: { network: 60 }, maxStat: { skills: 55 } },
  },
  {
    id: 'the_machine_left_behind',
    name: 'The One The Machines Passed',
    emoji: '📼',
    tone: 'bad',
    blurb:
      'You bet that experience alone would hold the line, and the line moved. Judgment without the new tools got priced like vinyl: admired by collectors, ignored by the market.',
    baselineRarity: 4,
    match: { allFlags: ['ai_resisted'], maxSalary: 28 },
  },
  {
    id: 'the_perpetual_student',
    name: 'The Perpetual Student',
    emoji: '📖',
    tone: 'weird',
    blurb:
      'The MBA, the certifications, the courses: you collected credentials the way others collect returns. Impeccably qualified, permanently preparing, still waiting to feel ready.',
    baselineRarity: 3,
    match: { anyFlags: ['mba_done', 'second_degree'], maxSalary: 25 },
  },
  {
    id: 'the_comfortable_trap',
    name: 'The Comfortable Trap',
    emoji: '🛋️',
    tone: 'bad',
    blurb:
      'It was never bad enough to leave, so you never left. Fifteen years of a job that fit like a warm chair, and a market value that quietly stopped being consulted.',
    baselineRarity: 5,
    match: { maxSalary: 27, maxStat: { skills: 58 } },
  },
  {
    id: 'married_to_the_work',
    name: 'Married to the Work',
    emoji: '💼',
    tone: 'weird',
    blurb:
      'The career got everything: the evenings, the decades, the person who stopped waiting. It paid magnificently, and it never once asked how you were doing.',
    baselineRarity: 3,
    match: { allFlags: ['career_first'], minSalary: 42, maxStat: { family: 55 } },
  },
  {
    id: 'the_knowledge_partner',
    name: 'The Knowledge Partner',
    emoji: '📚',
    tone: 'good',
    blurb:
      'You walked in through the research door nobody told your batch about, and then you kept walking. Your analysis now shapes decisions in rooms your college never dreamed of.',
    baselineRarity: 5,
    match: { allFlags: ['mbb_research_track'], minStat: { skills: 80, reputation: 55 } },
  },
  {
    id: 'the_board_whisperer',
    name: 'The Board Whisperer',
    emoji: '🪑',
    tone: 'good',
    blurb:
      'Fifteen years of monthly messages to one good mentor turned into the cheapest, longest, most valuable investment of your career. Relationships compounded harder than money.',
    baselineRarity: 5,
    match: { allFlags: ['board_seat'], minStat: { reputation: 70 } },
  },
  {
    id: 'the_corner_office',
    name: 'The Corner Office',
    emoji: '🏙️',
    tone: 'good',
    blurb:
      'You made the final climb and the title landed. The view from the top floor is real, the air is thin, and you earned every metre of the altitude.',
    baselineRarity: 4,
    match: { allFlags: ['cxo_push'], minStat: { reputation: 72 } },
  },
  {
    id: 'the_phoenix',
    name: 'The Phoenix',
    emoji: '🐦‍🔥',
    tone: 'good',
    blurb:
      'The correction put your name on a list and you refused to stay on it. The comeback took years and cost plenty, and it is the part of your story people ask about first.',
    baselineRarity: 3,
    match: { anyFlags: ['laid_off_once', 'demoted_survived'], minSalary: 30 },
  },
  {
    id: 'the_remittance_years',
    name: 'The Remittance Years',
    emoji: '✈️',
    tone: 'weird',
    blurb:
      'The Gulf years reset your family’s financial story, exactly as promised. The price was paid in festivals attended over video calls, exactly as feared. Both ledgers are real.',
    baselineRarity: 3,
    match: { allFlags: ['went_abroad'], minSavings: 50 },
  },
  {
    id: 'the_sandwich_generation',
    name: 'The Sandwich Generation',
    emoji: '🫓',
    tone: 'weird',
    blurb:
      'Parents on one side, a child on the other, and you in the middle holding both. No award exists for this. It is the most common heroism in India, and you did it without dropping either.',
    baselineRarity: 4,
    match: { allFlags: ['parents_secured', 'kid'], minStat: { family: 50 } },
  },
  {
    id: 'the_professor_of_practice',
    name: 'The Professor of Practice',
    emoji: '🎓',
    tone: 'good',
    blurb:
      'You converted fifteen years of scar tissue into a syllabus. Your students walk into interviews carrying frameworks with your fingerprints on them.',
    baselineRarity: 4,
    match: { allFlags: ['second_innings'], minStat: { skills: 68 } },
  },
  {
    id: 'the_door_opener',
    name: 'The Door Opener',
    emoji: '🚪',
    tone: 'good',
    blurb:
      'You remembered exactly what one open door felt like at 21, so you spent your forties building doors. The scholarship kids call it by your name. That is the whole trophy.',
    baselineRarity: 3,
    match: { anyFlags: ['legacy_giver'], allFlags: ['gives_back'] },
  },
  {
    id: 'the_present_parent',
    name: 'The Present Parent',
    emoji: '🪁',
    tone: 'good',
    blurb:
      'You were in the front row for the recitals, the scraped knees, and the ordinary Sundays. The org chart forgot you in a year. The people at your dinner table never will.',
    baselineRarity: 4,
    match: { allFlags: ['showed_up'], minStat: { family: 70 } },
  },
  {
    id: 'the_conductor',
    name: 'The Conductor',
    emoji: '🎛️',
    tone: 'good',
    blurb:
      'When the machines arrived you stopped competing and started conducting. The correction that erased whole floors made you expensive, and a decade later you are still the one they call.',
    baselineRarity: 5,
    match: { allFlags: ['ai_native'], minSalary: 40 },
  },
  {
    id: 'the_quiet_crorepati',
    name: 'The Quiet Crorepati',
    emoji: '🌱',
    tone: 'good',
    blurb:
      'No viral posts, no title worth bragging about, and a portfolio that crossed a crore while nobody was watching. Boring money, deployed early, left alone. The oldest trick, executed.',
    baselineRarity: 4,
    match: { minSavings: 90, maxStat: { burnout: 50 } },
  },
  {
    id: 'the_settled_one',
    name: 'The Settled One',
    emoji: '🏦',
    tone: 'weird',
    blurb:
      'The exam cleared, the posting came, and the colony got its respect. It is a smaller life than the one you sketched at 21, and on most Tuesdays it is enough. On most Tuesdays.',
    baselineRarity: 3,
    match: { allFlags: ['exam_track'], maxSalary: 25, minStat: { family: 55 } },
  },
  {
    id: 'the_quiet_pillar',
    name: 'The Quiet Pillar',
    emoji: '🌳',
    tone: 'good',
    blurb:
      'You never left, and it was a choice, not a failure to launch. Every family emergency for fifteen years found you already there. Some careers are measured in presence.',
    baselineRarity: 4,
    match: { allFlags: ['stayed_rooted'], minStat: { family: 65 } },
  },
  {
    id: 'the_one_person_channel',
    name: 'The One-Person Channel',
    emoji: '📡',
    tone: 'weird',
    blurb:
      'You spent fifteen years renting other people’s distribution, then built your own at an age everyone called too late. Now rooms you have never entered quote you inside them.',
    baselineRarity: 3,
    match: { allFlags: ['one_person_channel'], minStat: { network: 70 } },
  },
  {
    id: 'the_people_bank',
    name: 'The People Bank',
    emoji: '🤝',
    tone: 'good',
    blurb:
      'You spent fifteen years depositing into people: the intern you shielded, the mentor you kept, the students you taught. The dividends arrive daily now, in a currency that never inflates.',
    baselineRarity: 4,
    match: {
      anyFlags: ['team_shield', 'gives_back', 'mentor_kept'],
      minStat: { reputation: 65, network: 65 },
    },
  },
  {
    id: 'the_one_who_knew_when',
    name: 'The One Who Knew When',
    emoji: '⚖️',
    tone: 'good',
    blurb:
      'You learned the rarest senior skill: stopping on purpose. Enough money, enough title, actual evenings. Some ex-colleagues pity you. You have seen their calendars.',
    baselineRarity: 4,
    match: { allFlags: ['chose_enough'] },
  },
  {
    id: 'the_solid_middle',
    name: 'The Solid Middle',
    emoji: '🧭',
    tone: 'weird',
    blurb:
      'No famous wins, no famous wounds. You kept a family fed, a roof standing, and a career respectable through fifteen years that flattened plenty of louder people. Underrated. Deeply.',
    baselineRarity: 5,
    match: { minSalary: 18, minStat: { family: 55 } },
  },
  {
    id: 'the_open_road',
    name: 'The Open Road',
    emoji: '🛣️',
    tone: 'weird',
    blurb:
      'Your fifteen years refused every template, which is exactly why no template saw you coming. The story is unfinished, and unfinished is another word for still yours.',
    baselineRarity: 4,
    match: {},
  },
]

export function getEnding(id: string): Ending {
  return ENDINGS.find((e) => e.id === id) ?? ENDINGS[ENDINGS.length - 1]
}

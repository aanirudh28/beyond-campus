import type { GameState, LifeReportItem } from '../types'

// The Life Report: sliding-doors moments from the simulation mapped to
// real actions the player can take NOW, at 21. This is the conversion surface,
// so every item must feel earned by their run, not generic advice.

interface ReportRule {
  when: (s: GameState) => boolean
  item: LifeReportItem
}

const RULES: ReportRule[] = [
  {
    when: (s) => !s.flags['excel_learned'],
    item: {
      moment: 'At 22 you skipped the Excel sprint, and screening tests kept noticing for years.',
      lesson: 'In your simulation, the single cheapest skill you never bought kept taxing every application after it.',
      action: 'Excel and aptitude screening are the first real gate for BBA and BCom freshers. Clear it this month, not at 24.',
      cta: { label: 'Start aptitude practice free', href: '/aptitude' },
    },
  },
  {
    when: (s) => !s.flags['dm_courage'],
    item: {
      moment: 'You applied through portals and became application number 8,347.',
      lesson: 'Every timeline where you reached humans instead of databases moved faster. Referred candidates get read.',
      action: 'Send two honest, two-line messages to alumni this week. No "sir", no essay, no fear.',
      cta: { label: 'Track your outreach properly', href: '/tracker' },
    },
  },
  {
    when: (s) => s.flags['dm_courage'] === true,
    item: {
      moment: 'The message you almost deleted at 21 got your resume walked into a building.',
      lesson: 'Your network stat carried you through two downturns. It started with one uncomfortable send.',
      action: 'You clearly have the courage. Systematise it: five warm contacts a week beats fifty cold portals.',
      cta: { label: 'Run your hunt like a system', href: '/tracker' },
    },
  },
  {
    when: (s) => !s.flags['invested_early'],
    item: {
      moment: 'The first bonus went to a phone. The SIP calculator tab stayed closed.',
      lesson: 'By 45, the friends who started boring SIPs at 23 had a second engine you never built. Time in the market was the whole trick.',
      action: 'Whatever your first salary is, automate 10 percent before you can feel it. Start the habit before the money is big.',
      cta: { label: 'Get placed first, invest second', href: '/resources/resume-roast' },
    },
  },
  {
    when: (s) => !s.flags['mentor_kept'],
    item: {
      moment: 'Your first good manager said "keep in touch" and you both let it fade.',
      lesson: 'In the timelines where that thread survived, it became a board seat at 44. Relationships compound harder than money.',
      action: 'Pick the two most generous seniors you know. One short message a month, for years. That is the entire playbook.',
      cta: { label: 'Learn referral-first job hunting', href: '/resources/linkedin-scripts' },
    },
  },
  {
    when: (s) => s.flags['ai_resisted'] === true,
    item: {
      moment: 'When the tools changed at 34, you bet on experience alone. The market repriced you anyway.',
      lesson: 'The people who redesigned their work around new tools got expensive. The ones who resisted got automated around.',
      action: 'Make "first to learn the new tool" your identity from day one of your career. It is the cheapest moat that exists.',
      cta: { label: 'Build job-ready skills now', href: '/aptitude' },
    },
  },
  {
    when: (s) => (s.flags['health_deferred'] === true || s.stats.burnout >= 70) && !s.flags['health_rebuilt'],
    item: {
      moment: 'The body sent its first invoice at 31 and you marked it "after this quarter".',
      lesson: 'Burnout compounded like an EMI in your run. Careers are decided at 7 p.m., and yours had nothing left by then.',
      action: 'Sleep and one hour of movement are career infrastructure, not rewards. Install them at 21 when they are cheap.',
      cta: { label: 'Build a sustainable routine', href: '/guides' },
    },
  },
  {
    when: (s) => !s.flags['proof_of_work'] && !s.flags['creator_track'] && !s.flags['creator_spark'],
    item: {
      moment: 'Your applications carried certificates. The winning resumes carried receipts.',
      lesson: 'Every timeline that broke out early had one thing: visible proof of real work. A tile shop campaign beat a ₹15,000 certificate.',
      action: 'Do one small real project this semester and write one page about what happened. That page is worth more than your CGPA.',
      cta: { label: 'Get your resume roasted free', href: '/resources/resume-roast' },
    },
  },
  {
    when: (s) => s.flags['fno_burn'] === true,
    item: {
      moment: 'One colleague’s screenshots cost you a month of savings at 27.',
      lesson: 'The market charges full price for lessons that a rule would have made free.',
      action: 'Write the rule now, at 21, before you have money: index funds until you can explain, in writing, why not.',
      cta: { label: 'Read the money basics guide', href: '/guides' },
    },
  },
  {
    when: (s) => s.flags['swallowed_it'] === true,
    item: {
      moment: 'A senior presented your churn analysis with the pronoun swapped, and you let the room move on.',
      lesson: 'The quiet cost of that silence showed up in every appraisal after it. Visibility is not vanity, it is payroll.',
      action: 'Practice one sentence until it is reflex: "Happy to walk through how I built that." You will need it sooner than you think.',
      cta: { label: 'Learn to speak for your work', href: '/cohort' },
    },
  },
  {
    when: (s) => s.flags['gives_back'] === true || s.flags['legacy_giver'] === true,
    item: {
      moment: 'The screenshot from the student in row three outranked every offer letter you ever signed.',
      lesson: 'Meaning turned out to be the only stat that never crashed in your simulation.',
      action: 'You do not have to wait until 38. The senior helping you today was once exactly this scared. Join the chain early.',
      cta: { label: 'Join a student circle', href: '/practice' },
    },
  },
  {
    when: (s) => s.stats.salary >= 30 && s.stats.family <= 40,
    item: {
      moment: 'The package kept doubling. The dinner table kept shrinking.',
      lesson: 'By 45, your simulation had everything except someone to tell. No appraisal cycle refunds Tuesdays.',
      action: 'Decide your non-negotiables before the first offer letter, in writing. The career will take exactly what you let it.',
      cta: { label: 'Talk to a strategist, not a salesman', href: '/book' },
    },
  },
]

// Always-on closer: ties the simulation back to the one move that starts everything.
const CLOSER: LifeReportItem = {
  moment: 'Every strong timeline in your run started the same way: applications that reached humans, before March of final year.',
  lesson: 'The off-campus market has doors, not walls. The students who find them early compound for twenty years.',
  action: 'Your real 20 years start with the next 90 days. Fix the resume, build the tracker habit, reach ten humans.',
  cta: { label: 'Start with a free resume roast', href: '/resources/resume-roast' },
}

export function buildLifeReport(state: GameState): LifeReportItem[] {
  const items = RULES.filter((r) => r.when(state)).map((r) => r.item)
  return [...items.slice(0, 5), CLOSER]
}

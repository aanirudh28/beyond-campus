import type { GameState, LifeReportItem } from '../types'

// The Life Report v2 (doc 09 §3): sliding-doors moments from the simulation
// mapped to real actions the player can take NOW, at 21. This is the
// conversion surface, so every item must feel earned by their run.
//
// Three kinds of rule:
//   reckoning — a flag they set gets its honest bill (most personal)
//   gap       — a compounding habit their run never started (most actionable)
//   honor     — a choice that paid; reinforce it (most shareable)
// buildLifeReport composes up to 2 reckonings + 2 gaps + 1 honor, in that
// order of hunger, then the closer. Every CTA carries UTM attribution so
// /admin/life can answer "did the report actually move anyone".

type RuleKind = 'reckoning' | 'gap' | 'honor'

interface ReportRule {
  id: string
  kind: RuleKind
  when: (s: GameState) => boolean
  item: Omit<LifeReportItem, 'cta'> & { cta: { label: string; href: string } }
}

const utm = (href: string, campaign: string) =>
  `${href}?utm_source=20years&utm_medium=life_report&utm_campaign=${campaign}`

const RULES: ReportRule[] = [
  // ---------- reckonings: the bills their flags ran up ----------
  {
    id: 'moonlight_scar',
    kind: 'reckoning',
    when: (s) => s.flags['moonlighted'] === true,
    item: {
      moment: 'The second laptop at 25 seemed free. The background check at 35 disagreed.',
      lesson: 'Integrity compounds exactly like money, and its drawdowns arrive years after the withdrawal.',
      action: 'Decide your non-negotiables before anyone offers you ₹35,000 to bend one. Write them down this week.',
      cta: { label: 'Build a career that survives audits', href: utm('/guides', 'moonlight_scar') },
    },
  },
  {
    id: 'toxic_flinch',
    kind: 'reckoning',
    when: (s) => s.flags['endured_toxic'] === true,
    item: {
      moment: 'You gave the screamer two years for the logo, and kept the flinch far longer.',
      lesson: 'The brand went on your resume. The manager went into your nervous system. Only one of those has an exit date.',
      action: 'When you evaluate offers, interview the manager harder than they interview you. Ask their last two reports what Sunday evenings felt like.',
      cta: { label: 'Learn to vet a team before joining', href: utm('/resources/career-toolkit', 'toxic_flinch') },
    },
  },
  {
    id: 'fno_tuition',
    kind: 'reckoning',
    when: (s) => s.flags['fno_burn'] === true,
    item: {
      moment: 'One colleague’s screenshots cost you a month of savings at 27.',
      lesson: 'The market charges full price for lessons that a written rule would have made free.',
      action: 'Write the rule now, at 21, before you have money: index funds until you can explain, in writing, why not.',
      cta: { label: 'Read the money basics guide', href: utm('/guides', 'fno_tuition') },
    },
  },
  {
    id: 'silence_tax',
    kind: 'reckoning',
    when: (s) => s.flags['swallowed_it'] === true,
    item: {
      moment: 'A senior presented your churn analysis with the pronoun swapped, and you let the room move on.',
      lesson: 'The quiet cost of that silence showed up in every appraisal after it. Visibility is not vanity, it is payroll.',
      action: 'Practice one sentence until it is reflex: "Happy to walk through how I built that." You will need it sooner than you think.',
      cta: { label: 'Learn to speak for your work', href: utm('/cohort', 'silence_tax') },
    },
  },
  {
    id: 'body_invoice',
    kind: 'reckoning',
    when: (s) => (s.flags['health_deferred'] === true || s.stats.burnout >= 70) && !s.flags['health_rebuilt'],
    item: {
      moment: 'The body sent its first invoice at 31 and you marked it "after this quarter".',
      lesson: 'Burnout compounded like an EMI in your run. Careers are decided at 7 p.m., and yours had nothing left by then.',
      action: 'Sleep and one hour of movement are career infrastructure, not rewards. Install them at 21 when they are cheap.',
      cta: { label: 'Build a sustainable routine', href: utm('/guides', 'body_invoice') },
    },
  },
  {
    id: 'machine_bet',
    kind: 'reckoning',
    when: (s) => s.flags['ai_resisted'] === true,
    item: {
      moment: 'When the tools changed at 34, you bet on experience alone. The market repriced you anyway.',
      lesson: 'The people who redesigned their work around new tools got expensive. The ones who resisted got automated around.',
      action: 'Make "first to learn the new tool" your identity from day one of your career. It is the cheapest moat that exists.',
      cta: { label: 'Build job-ready skills now', href: utm('/aptitude', 'machine_bet') },
    },
  },
  {
    id: 'flat_anchor',
    kind: 'reckoning',
    when: (s) => s.flags['bought_flat_peak'] === true && s.stats.savings < 40,
    item: {
      moment: 'The 2BHK at 30 was pride and roots. It was also every risk you could not take afterwards.',
      lesson: 'The EMI did not just buy a flat. It bought your optionality, at peak prices, on a 20-year lock-in.',
      action: 'Before the buying pressure year arrives, learn the rent-vs-buy math cold, so the decision is yours and not the colony’s.',
      cta: { label: 'Read the money basics guide', href: utm('/guides', 'flat_anchor') },
    },
  },
  {
    id: 'two_doors',
    kind: 'reckoning',
    when: (s) => s.flags['exam_track'] === true && !s.flags['govt_settled'],
    item: {
      moment: 'You kept the exam door and the job door half-open for years. Half-open doors leak.',
      lesson: 'In your run, the split focus taxed both paths. The people who overtook you were not smarter. They were undivided.',
      action: 'Choose one hunt and go all in for six months. A full commitment to either path beats a decade of hedging both.',
      cta: { label: 'Pick your lane with data', href: utm('/aptitude', 'two_doors') },
    },
  },
  {
    id: 'credential_shelf',
    kind: 'reckoning',
    when: (s) => s.flags['second_degree'] === true && s.stats.salary < 30,
    item: {
      moment: 'The evening LLB joined the certificates on the wall. The market kept asking for receipts instead.',
      lesson: 'Your run collected qualifications the way anxious people collect umbrellas. Proof of work outhired all of them.',
      action: 'Before enrolling in anything, ask: would one real shipped project teach me more? It usually would, and it is free.',
      cta: { label: 'Build proof, not paper', href: utm('/resources/resume-roast', 'credential_shelf') },
    },
  },
  {
    id: 'rocket_receipt',
    kind: 'reckoning',
    when: (s) => s.flags['rocket_years'] === true,
    item: {
      moment: 'The fintech rocket paid magnificently and itemised nothing.',
      lesson: 'High-burn years are a legitimate trade, but only when priced consciously. Yours were priced by the offer letter.',
      action: 'If you ever board a rocket, set the exit condition on day one: the number, the date, or the symptom. Whichever comes first.',
      cta: { label: 'Plan the career, not just the job', href: utm('/book', 'rocket_receipt') },
    },
  },

  // ---------- gaps: the compounding they never started ----------
  {
    id: 'excel_gap',
    kind: 'gap',
    when: (s) => !s.flags['excel_learned'],
    item: {
      moment: 'At 22 you skipped the Excel sprint, and screening tests kept noticing for years.',
      lesson: 'In your simulation, the single cheapest skill you never bought kept taxing every application after it.',
      action: 'Excel and aptitude screening are the first real gate for BBA and BCom freshers. Clear it this month, not at 24.',
      cta: { label: 'Start aptitude practice free', href: utm('/aptitude', 'excel_gap') },
    },
  },
  {
    id: 'dm_gap',
    kind: 'gap',
    when: (s) => !s.flags['dm_courage'],
    item: {
      moment: 'You applied through portals and became application number 8,347.',
      lesson: 'Every timeline where you reached humans instead of databases moved faster. Referred candidates get read.',
      action: 'Send two honest, two-line messages to alumni this week. No "sir", no essay, no fear.',
      cta: { label: 'Steal the exact scripts', href: utm('/resources/linkedin-scripts', 'dm_gap') },
    },
  },
  {
    id: 'sip_gap',
    kind: 'gap',
    when: (s) => !s.flags['invested_early'],
    item: {
      moment: 'The first bonus went to a phone. The SIP calculator tab stayed closed.',
      lesson: 'By 45, the friends who started boring SIPs at 23 had a second engine you never built. Time in the market was the whole trick.',
      action: 'Whatever your first salary is, automate 10 percent before you can feel it. Start the habit before the money is big.',
      cta: { label: 'Get placed first, invest second', href: utm('/resources/resume-roast', 'sip_gap') },
    },
  },
  {
    id: 'mentor_gap',
    kind: 'gap',
    when: (s) => !s.flags['mentor_kept'],
    item: {
      moment: 'Your first good manager said "keep in touch" and you both let it fade.',
      lesson: 'In the timelines where that thread survived, it became a board seat at 44. Relationships compound harder than money.',
      action: 'Pick the two most generous seniors you know. One short message a month, for years. That is the entire playbook.',
      cta: { label: 'Learn referral-first hunting', href: utm('/resources/linkedin-scripts', 'mentor_gap') },
    },
  },
  {
    id: 'proof_gap',
    kind: 'gap',
    when: (s) => !s.flags['proof_of_work'] && !s.flags['creator_track'] && !s.flags['creator_spark'],
    item: {
      moment: 'Your applications carried certificates. The winning resumes carried receipts.',
      lesson: 'Every timeline that broke out early had one thing: visible proof of real work. A tile shop campaign beat a ₹15,000 certificate.',
      action: 'Do one small real project this semester and write one page about what happened. That page is worth more than your CGPA.',
      cta: { label: 'Get your resume roasted free', href: utm('/resources/resume-roast', 'proof_gap') },
    },
  },
  {
    id: 'voice_gap',
    kind: 'gap',
    when: (s) => !s.flags['creator_track'] && !s.flags['creator_spark'] && !s.flags['one_person_channel'],
    item: {
      moment: 'You knew things for twenty years. The internet never found out.',
      lesson: 'In your run, every opportunity had to be hunted because none could find you. Distribution is an asset, and you never opened the account.',
      action: 'One honest post a week about what you are learning. Most will do nothing. Every fifth one brings a conversation money cannot buy.',
      cta: { label: 'See what travels on LinkedIn', href: utm('/resources/linkedin-scripts', 'voice_gap') },
    },
  },
  {
    id: 'english_gap',
    kind: 'gap',
    when: (s) => s.profile.city === 'tier3' && !s.flags['english_grind'] && !s.flags['fluent_speaker'],
    item: {
      moment: 'Your best points kept arriving last, quietly, in rehearsed sentences.',
      lesson: 'The English tax is real and it is front-loaded: cheapest at 21, priciest in the rooms that decide things.',
      action: 'Thirty minutes of spoken practice daily, out loud, with strangers. Embarrassment now is fluency at every interview after.',
      cta: { label: 'Train with a circle', href: utm('/practice', 'english_gap') },
    },
  },
  {
    id: 'worth_gap',
    kind: 'gap',
    when: (s) => !s.flags['knows_worth'] && s.stats.salary < 30,
    item: {
      moment: 'A recruiter asked your expected CTC and you quoted 20 percent below her budget.',
      lesson: 'Across your whole run, the discounts you volunteered added up to more than any single raise you fought for.',
      action: 'Research your market rate before anyone asks. Knowing the number changes your posture in every room after.',
      cta: { label: 'Track offers like a system', href: utm('/tracker', 'worth_gap') },
    },
  },

  // ---------- honors: what they got right, reinforced ----------
  {
    id: 'dm_honor',
    kind: 'honor',
    when: (s) => s.flags['dm_courage'] === true,
    item: {
      moment: 'The message you almost deleted at 21 got your resume walked into a building.',
      lesson: 'Your network stat carried you through two downturns. It started with one uncomfortable send.',
      action: 'You clearly have the courage. Systematise it: five warm contacts a week beats fifty cold portals.',
      cta: { label: 'Run your hunt like a system', href: utm('/tracker', 'dm_honor') },
    },
  },
  {
    id: 'thread_honor',
    kind: 'honor',
    when: (s) => s.flags['mentor_kept'] === true,
    item: {
      moment: 'Two lines a month to one good manager became, twenty years later, a board seat.',
      lesson: 'Cheapest retainer you ever paid. Relationships were the only asset class in your run that never crashed.',
      action: 'Start the practice now, at 21, with whoever teaches you generously. Compounding needs decades, and you have them.',
      cta: { label: 'Learn referral-first hunting', href: utm('/resources/linkedin-scripts', 'thread_honor') },
    },
  },
  {
    id: 'dip_honor',
    kind: 'honor',
    when: (s) => s.flags['bought_dip'] === true,
    item: {
      moment: 'You deployed savings into the worst market in a generation with shaking hands.',
      lesson: 'Temperament, not timing, made that money. But the runway you had built earlier is what made temperament affordable.',
      action: 'Build the six-month runway first, from salary one. Courage is a budget line before it is a virtue.',
      cta: { label: 'Get the money order right', href: utm('/guides', 'dip_honor') },
    },
  },
  {
    id: 'repair_honor',
    kind: 'honor',
    when: (s) => s.flags['repaired_us'] === true,
    item: {
      moment: 'You noticed the quiet in the marriage before it got a room of its own, and you booked the trip.',
      lesson: 'Four awkward Sundays turned out to be the highest-return investment on your entire balance sheet.',
      action: 'Decide your non-negotiable hours before the first offer letter, in writing. The career takes exactly what you let it.',
      cta: { label: 'Plan a career with a life in it', href: utm('/book', 'repair_honor') },
    },
  },
  {
    id: 'giver_honor',
    kind: 'honor',
    when: (s) => s.flags['gives_back'] === true || s.flags['legacy_giver'] === true,
    item: {
      moment: 'The screenshot from the student in row three outranked every offer letter you ever signed.',
      lesson: 'Meaning turned out to be the only stat that never crashed in your simulation.',
      action: 'You do not have to wait until 38. The senior helping you today was once exactly this scared. Join the chain early.',
      cta: { label: 'Join a student circle', href: utm('/practice', 'giver_honor') },
    },
  },
  {
    id: 'angel_honor',
    kind: 'honor',
    when: (s) => s.flags['angel_cheque'] === true,
    item: {
      moment: 'You bet ₹5 lakhs on a person you had watched work since college, and the bet reported back.',
      lesson: 'The best investments in your run were underwritten by proximity: you could bet on her because you truly knew her.',
      action: 'Build a circle worth betting on. The people you grind with at 21 are the cap tables of your forties.',
      cta: { label: 'Find your circle', href: utm('/community', 'angel_honor') },
    },
  },
  {
    id: 'anchor_honor',
    kind: 'honor',
    when: (s) => s.flags['anchored_home'] === true || s.flags['showed_up'] === true,
    item: {
      moment: 'You were in the front row when it counted, and the org chart forgot you faster than the child ever will.',
      lesson: 'Your run proves the unfashionable math: presence is the only investment where the entire return is the principal.',
      action: 'Write down, now, which rows you will never give up a seat in. Decisions made in advance survive offer letters.',
      cta: { label: 'Talk it through with a strategist', href: utm('/book', 'anchor_honor') },
    },
  },
  {
    id: 'spoke_honor',
    kind: 'honor',
    when: (s) => s.flags['spoke_for_many'] === true || s.flags['spoke_up'] === true,
    item: {
      moment: 'You said the true thing with your name on it, in a room where silence was cheaper.',
      lesson: 'Reputation in your run was built in exactly three or four moments like that. Nobody remembers your quarters. They remember your spine.',
      action: 'Practice small honesty early: credit claimed calmly, disagreement voiced once, clearly. The big moments will find you rehearsed.',
      cta: { label: 'Build the voice that carries', href: utm('/cohort', 'spoke_honor') },
    },
  },
]

// Always-on closer: ties the simulation back to the one move that starts everything.
const CLOSER: LifeReportItem = {
  moment: 'Every strong timeline in your run started the same way: applications that reached humans, before March of final year.',
  lesson: 'The off-campus market has doors, not walls. The students who find them early compound for twenty years.',
  action: 'Your real 20 years start with the next 90 days. Fix the resume, build the tracker habit, reach ten humans.',
  cta: { label: 'Start with a free resume roast', href: utm('/resources/resume-roast', 'closer') },
}

// Compose: hungriest first. Reckonings cut deepest, gaps convert best,
// one honor keeps the report honest about what they did right.
export function buildLifeReport(state: GameState): LifeReportItem[] {
  const matched = RULES.filter((r) => r.when(state))
  const take = (kind: RuleKind, n: number) =>
    matched.filter((r) => r.kind === kind).slice(0, n).map((r) => r.item)
  const items = [...take('reckoning', 2), ...take('gap', 2), ...take('honor', 1)]
  return [...items, CLOSER]
}

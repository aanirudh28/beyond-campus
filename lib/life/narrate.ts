import type { Card, GameState } from './types'
import { ALL_CARDS } from './content/chapters'

// Deterministic scene continuity: the line above each card that proves the
// game remembers who you are. Zero AI. Candidates come from the life you are
// actually carrying (urgent stats first, then your most recent defining
// choices, then ambient stats, then who you were at 21), and a hash of
// (card id, seed) spreads different facts across the cards of a chapter so
// the same life never repeats itself card after card.
//
// Voice: second person, present tense, Indian texture, no em dashes,
// money in ₹ LPA / lakhs. One or two sentences, always under ~160 chars.

// Flag lines gate on minChapter where the phrasing implies elapsed years.
interface Fragment {
  line: string
  minChapter?: number
}

const FLAG_LINES: Record<string, Fragment> = {
  // identity & early tracks
  exam_track: { line: 'The reasoning workbook sits half solved on your desk, next to the cold emails you stopped sending.' },
  backed_self: { line: 'The tracker spreadsheet from that dinner table argument is still open in a tab. It has grown rows since.' },
  took_early_job: { line: 'Home is 1,400 km away now, a voice-note rhythm you answer late at night.' },
  held_out: { line: 'You still remember the two silent months after you said no to the first offer, and what a bet feels like.' },
  settled_local: { line: 'The local office knows your chai order. The industry does not know your name yet.' },
  govt_settled: { line: 'The posting letter is framed in the hall at home. The colony finally sends its respect.' },
  self_made_track: { line: 'No degree got added to the wall. The work is the resume now.', minChapter: 3 },

  // skills & proof
  excel_learned: { line: 'Pivot tables stopped scaring you long ago. The Rishikesh photos still sting a little.' },
  english_grind: { line: 'The 7 a.m. practice circle rewired your tongue. Interviews stopped being about accent.' },
  data_skills: { line: 'The course-night SQL shows in how fast you read a messy sheet.' },
  fluent_speaker: { line: 'Rooms listen when you talk now. The speaking club turned out to be the cheapest thing you ever bought.' },
  proof_of_work: { line: 'Your resume carries proof, not adjectives. Screeners can tell the difference.' },
  first_blood: { line: 'The never-again notes from that first disastrous interview still shape how you prepare.' },
  ai_native: { line: 'Half your workflow is machines now, and you are the one conducting them.' },
  ai_resisted: { line: 'You still do it the old way, on experience alone, and keep telling yourself it holds.' },

  // people & network
  dm_courage: { line: 'The alum who answered your two-line DM is still in your corner.' },
  mentor_kept: { line: 'The monthly message to your first good manager has never missed. It is quietly compounding.' },
  team_shield: { line: 'The intern you shielded tells that story to people. Reputation travels on foot.' },
  creator_spark: { line: 'That 1 a.m. rejection post still gets found. You kept writing.' },
  creator_track: { line: 'The weekly posts made you findable. Strangers open your DMs politely now.' },
  one_person_channel: { line: 'The newsletter is yours alone: no algorithm, no landlord.', minChapter: 5 },
  gives_back: { line: 'Saturday mornings belong to a classroom of kids from towns like yours.', minChapter: 4 },
  legacy_giver: { line: 'The scholarship cohort carries your fingerprints into rooms you never entered.', minChapter: 5 },
  board_seat: { line: 'The twenty-year mentor thread has a board seat at the end of it now.', minChapter: 5 },

  // career moves
  switched_early: { line: 'The 40 percent switch at 25 reset your base, and every appraisal since has paid on it.' },
  loyal_arc: { line: 'You stayed when the batch jumped. The lead track was the reward, and the risk.' },
  moved_metro: { line: 'The metro owns your weekdays. Home happens on a festival calendar.' },
  stayed_rooted: { line: 'Your parents are twenty minutes away. You chose that, and you remember choosing it.' },
  moved_back: { line: 'You engineered the move back. The monthly guilt tax stopped charging.' },
  returned_home: { line: 'You came home from the Gulf with the corpus, and the jet lag of years.' },
  remote_roots: { line: 'Remote-forever, back near your parents. The commute is a staircase.' },
  mba_done: { line: 'The MBA loan EMI ticks alongside the salary it bought. So far the trade holds.' },
  mbb_research_track: { line: 'You walked in through the research door nobody told your batch about.' },
  startup_leap: { line: 'Employee six. Five jobs, one desk, ESOPs you cannot spend yet.' },
  esop_diamond_hands: { line: 'The ESOPs are still all there, through the peak and the trough. Conviction or stubbornness, you will find out.' },
  exit_money: { line: 'The acquisition money is real and wired, and some mornings it still does not feel like yours.' },
  own_business: { line: 'The company is yours: the invoices, the payroll dates, the 2 a.m. arithmetic.' },
  went_abroad: { line: 'The Gulf salary lands tax-free on the 1st. The festivals happen on a phone screen.' },
  people_leader: { line: 'Your calendar is other people’s problems now. That is the job, and you picked it.' },
  deep_expert: { line: 'You are the one they call when it actually breaks.' },
  cxo_push: { line: 'The top floor is visibly close now. So is what the climb charges.', minChapter: 4 },
  chose_enough: { line: 'You stopped climbing on purpose. The evenings came back first.', minChapter: 4 },
  second_innings: { line: 'The syllabus you teach is made from your own scar tissue.', minChapter: 5 },
  laid_off_once: { line: 'The 2039 list had your name on it once. You negotiated out and kept the story.', minChapter: 4 },
  demoted_survived: { line: 'The sideways seat after the Correction still stings, and still pays.', minChapter: 4 },
  moonlighted: { line: 'The second laptop stays in the cupboard: ₹35,000 a month, and a secret with a shelf life.' },
  second_engine: { line: 'The side consulting practice hums after dinner. Two engines now.', minChapter: 4 },
  crisis_leader: { line: 'The people you carried through the winter remember it. That kind of ledger never needs auditing.', minChapter: 4 },
  side_biz: { line: 'The cousin’s shop sells online now. You built that on weekends.' },
  shop_empire: { line: 'The shop is three districts wide these days. The word "empire" gets used as a joke, decreasingly.' },
  sold_shop: { line: 'The shop network has a new owner, and both families have a new tax bracket.', minChapter: 5 },
  night_owl_years: { line: 'Your body lives in Eastern Standard Time. The premium lands on schedule; the mornings pay for it.' },
  owned_audience: { line: 'The email list is small and entirely yours. No algorithm gets a vote anymore.', minChapter: 4 },
  angel_cheque: { line: 'Your ₹5 lakh rides on a batchmate’s startup. You check their traction like weather.' },
  mission_track: { line: 'The impact lane pays less and reads better in the mirror.' },
  endured_toxic: { line: 'The screamer’s voice still lives somewhere under your ribs. The logo lives on your resume.' },
  rocket_years: { line: 'The 70-hour fintech weeks keep buying money and spending something else.' },
  second_degree: { line: 'The evening LLB adds letters after your name and subtracts hours before your mornings.' },

  // money
  invested_early: { line: 'The boring SIP from your first bonus keeps compounding while nobody claps.' },
  kept_liquid: { line: 'You still rent, and the money stays deployable. The aunties disapprove on schedule.' },
  bought_flat_peak: { line: 'The flat is beautiful. The EMI arrives on the 5th wearing the same polite face.' },
  fno_burn: { line: 'The F&O month is not something you talk about. The lesson stayed after the money left.' },
  bought_dip: { line: 'You bought into the fear at the bottom of the Correction. Now you wait.' , minChapter: 4 },

  // love, family, body
  engaged: { line: 'There is a person who stayed, and a home that is more than a PG now.' },
  love_early: { line: 'The office chai breaks became a person you plan around.' },
  career_first: { line: 'The person who was waiting eventually stopped. The work never noticed.' },
  kid: { line: 'Someone small calls at 6 p.m. and asks when you are coming home.' },
  parents_secured: { line: 'The monthly transfer to your parents is formal now. Saying the plan out loud changed the dinners.' },
  showed_up: { line: 'You were in the front row at the recital. The org chart survived without you for one afternoon.' },
  health_deferred: { line: 'The body’s first invoice sits marked "after this quarter". Quarters keep ending.' },
  health_rebuilt: { line: 'Since the airport scare, the day is built around the body first.', minChapter: 4 },
  reset_taken: { line: 'The three-month sabbatical repaired things no appraisal could see.', minChapter: 4 },
  repaired_us: { line: 'The Sundays are guarded now. The quiet marriage got louder in the good way.', minChapter: 4 },
  hometown_builder: { line: 'Your town has your fingerprints on it now.', minChapter: 4 },
  swallowed_it: { line: 'The stolen-credit meeting still replays on some commutes. You know the sentence you did not say.' },
  spoke_up: { line: 'Since the day you calmly took your work back in that review, rooms hesitate before testing you.' },
}

// Ambient stat lines: used when they are the loudest fact of this life.
function statLines(state: GameState): { urgent: string[]; mild: string[] } {
  const s = state.stats
  const urgent: string[] = []
  const mild: string[] = []
  if (s.burnout >= 70)
    urgent.push('You read this through a tired blur. Most days end with the phone face down and nothing left.')
  else if (s.burnout >= 55) mild.push('The tiredness has stopped being weekly and started being ambient.')
  if (s.savings < 0) urgent.push('The loan balance hums under every option below.')
  if (s.salary === 0 && state.chapter >= 1)
    urgent.push(
      state.flags['own_business']
        ? 'The company pays everyone except you, for now. Founders eat last.'
        : 'Off payroll. Every month costs, and nothing comes in.',
    )
  if (s.savings >= 100) mild.push('The portfolio crossed a crore a while back. Nobody at work knows.')
  if (s.family <= 30) mild.push('Home calls less often now. When it does, the conversations are short.')
  if (s.network >= 75 && state.chapter >= 3)
    mild.push('Your phone answers back these days. Years of deposits into people, paying interest.')
  return { urgent, mild }
}

// Chapter-1 texture before any flags exist: who you are at 21.
function profileLines(state: GameState): string[] {
  const lines: string[] = []
  const city = {
    metro: 'The city is full of people chasing the same six openings. At least the metro reaches the interviews.',
    tier2: 'Your city has three good companies, and everyone’s uncle knows someone in each.',
    tier3: 'The town is small enough that everyone knows you applied "outside". They are watching, kindly and otherwise.',
  }[state.profile.city]
  const ambition = {
    money: 'The number is the point. You have never pretended otherwise.',
    stability: 'You want the kind of life that does not shake when the market does.',
    impact: 'You keep asking what the work is for. The question does not pay yet, but it steers.',
  }[state.profile.ambition]
  if (city) lines.push(city)
  if (ambition) lines.push(ambition)
  return lines
}

// Flags in the order the player earned them, newest first, so continuity
// leans toward what just happened. Derived from history because the flags
// record itself is unordered.
function flagsByRecency(state: GameState): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const rec of state.history) {
    const card = ALL_CARDS[rec.c]?.find((c) => c.id === rec.cardId)
    const option = card?.options.find((o) => o.id === rec.optionId)
    for (const f of option?.setFlags ?? []) {
      if (!seen.has(f)) {
        seen.add(f)
        ordered.push(f)
      }
    }
  }
  return ordered.reverse()
}

// Small deterministic hash: same card in the same life always gets the same
// line, different cards spread across different facts.
function hash(str: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0
  }
  return h
}

export function narrateCard(card: Card, state: GameState): string | undefined {
  const { urgent, mild } = statLines(state)
  const candidates: string[] = [...urgent]

  for (const flag of flagsByRecency(state)) {
    const frag = FLAG_LINES[flag]
    if (!frag) continue
    if (frag.minChapter !== undefined && state.chapter < frag.minChapter) continue
    // Never echo a flag this very card is about to set: the base text
    // already tells that story in the present tense.
    if (card.options.some((o) => o.setFlags?.includes(flag))) continue
    candidates.push(frag.line)
  }

  candidates.push(...mild)
  if (state.chapter === 0) candidates.push(...profileLines(state))
  if (!candidates.length) return undefined

  // Rotate among the strongest few so a chapter's cards surface different
  // facts of the same life.
  const window = Math.min(candidates.length, 4)
  return candidates[hash(card.id, state.seed) % window]
}

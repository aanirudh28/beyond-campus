import type { Ending, GameState } from './types'
import { ALL_CARDS, CHAPTERS } from './content/chapters'
import { buildLifeReport } from './content/report'

// The authored epilogue: four paragraphs, fully deterministic, zero AI.
//   1. An opening scene at 36, written per ending.
//   2. The defining choices of THIS run, rebuilt from the pivotal history.
//   3. The ledger in words, from the final stats.
//   4. The turn to the real 21-year-old, borrowing the report's top action.
// Voice: second person, warm but unsentimental, Indian texture, no em
// dashes, ₹ LPA for salaries and lakhs for savings. Runs client and server.

interface EndingProse {
  opening: string
  oneLiner: string
}

const ENDING_PROSE: Record<string, EndingProse> = {
  the_recession_alchemist: {
    opening:
      'At 36 you still keep the screenshot from the worst week of the Correction, the one where your batch group went silent and you transferred the savings in anyway. People call it luck at parties. You let them, because explaining that fear was the discount would sound like bragging.',
    oneLiner: 'Everyone hid from the worst market in a generation. I bought it.',
  },
  the_beautiful_failure: {
    opening:
      'At 36 the company exists only as a folder of invoices and a WhatsApp group that never got deleted. And yet every serious room you walk into already knows the story, and every offer since has been priced on the scar tissue, not the degree. The business died. The builder did not.',
    oneLiner: 'The business failed. The person it built gets hired everywhere.',
  },
  the_founder: {
    opening:
      'At 36 you unlock the office yourself on Saturdays, not because you must but because it is still the best room you know. Payroll has cleared every month for seven years. Nobody writes headlines about profitable and boring. That was always the point.',
    oneLiner: 'Not unicorn-famous. Profitable, mine, and still standing at 36.',
  },
  the_exit: {
    opening:
      'At 36 you remember the exact font of the term sheet. Employee six, the pay cut your uncle called foolish, the five jobs you did badly for years. The wire hit on a Tuesday morning and you went to the same tapri for chai, because where else would you go.',
    oneLiner: 'They mocked the pay cut for nine years. Then the term sheet landed.',
  },
  the_dukaan_empire: {
    opening:
      'At 36 the rollup’s CEO still calls you before every small-town expansion, because you are the only person on the cap table who has sat in the shop at 6 a.m. waiting for the distributor’s truck. It began as a weekend favour to a cousin. Favours, compounded weekly for fifteen years, turn out to be a business model.',
    oneLiner: 'Started as my cousin’s shop. Ended with a Mumbai term sheet.',
  },
  the_hometown_king: {
    opening:
      'At 36 your morning walk crosses three things that exist because you came back: the office, the coaching room above the bank, the Sunday market stall run by your first hire. The metro taught you the trade. The town gave it a surname.',
    oneLiner: 'Took everything the big cities taught me and planted it where I began.',
  },
  the_golden_handcuffs: {
    opening:
      'At 36 the package is the kind people screenshot, and the flat is quiet in a way no interior designer can fix. You bought everything on the list. The Tuesday evenings, it turns out, were never on sale, and those were what the whole thing was for.',
    oneLiner: 'The salary is spectacular. So is the silence it bought.',
  },
  the_burnout: {
    opening:
      'At 36 you measure years by which hospital corridor they contained. The career survived every quarter you fed it. The body that carried it kept its own books the whole time, and its collection notice did not negotiate. You are learning, late, to rest without earning it first.',
    oneLiner: 'I treated my body like a rental car. The lease came due.',
  },
  the_emi_horizon: {
    opening:
      'At 36 the flat is finally, almost, nearly yours. It is beautiful. It has also sat at the table for every decision since 2033, politely vetoing the startup, the sabbatical, the switch. The 5th of the month has been the real boss of this life.',
    oneLiner: 'The flat is beautiful, and it has owned me since 2033.',
  },
  the_screenshot_investor: {
    opening:
      'At 36 you can still name the stocks. The colleague whose screenshots started it retired quietly on index funds he never posted about. The market taught you at full tuition, twice, and the fee came out of the years that were supposed to compound.',
    oneLiner: 'The colleagues with boring SIPs never posted screenshots. They did not need to.',
  },
  the_ghost_of_linkedin: {
    opening:
      'At 36 the follower count still ticks up, a lighthouse running on an empty coast. The posts perform. The DMs ask for referrals you cannot give, to teams that stopped calling after the third interview checked the work under the voice. The audience arrived. The craft had left.',
    oneLiner: 'Ten thousand followers. The offers checked the work first.',
  },
  the_machine_left_behind: {
    opening:
      'At 36 you are the one they consult about how things used to be done, in a tone reserved for museums. You bet that judgment alone would hold when the machines came. It held its dignity, not its price. The kids conduct the tools you refused, and the market pays conductors.',
    oneLiner: 'I bet experience alone would hold the line. The line moved.',
  },
  the_perpetual_student: {
    opening:
      'At 36 the shelf of certificates has its own spotlight, and the feeling of being ready has still not arrived. Somewhere between the MBA and the fourth certification, preparing became the career. Impeccably qualified, permanently warming up, while the less-prepared simply started.',
    oneLiner: 'Collected credentials like returns. Still waiting to feel ready.',
  },
  the_comfortable_trap: {
    opening:
      'At 36 the chair fits perfectly, which is exactly the problem. It was never bad enough to leave: the raise always adequate, the manager always tolerable, the years always one more. Then a Tuesday came when the market asked your price and could not find a recent quote.',
    oneLiner: 'It was never bad enough to leave, so I never left.',
  },
  married_to_the_work: {
    opening:
      'At 36 the work has been magnificent and punctual, the one relationship that never missed a date. It got the evenings, the festivals, the person who waited and then stopped waiting. It pays like a devoted spouse, and it has never once asked how you are doing.',
    oneLiner: 'The career got everything, and never once asked how I was doing.',
  },
  the_knowledge_partner: {
    opening:
      'At 36 your name travels stapled to analysis inside a big-three firm, into boardrooms your college never sent anyone. You came in through the research door nobody told your batch existed, and then you kept walking. The partners bill the hours. The thinking is yours.',
    oneLiner: 'Walked in through the research door nobody told my batch about.',
  },
  the_board_whisperer: {
    opening:
      'At 36 the longest thread in your phone is fifteen years old, one message a month to the first manager who saw you. It cost nothing. It became panel seats, rescue calls, and finally the board advisory role. The cheapest investment of your life outperformed every other.',
    oneLiner: 'One message a month for fifteen years. Relationships compounded harder than money.',
  },
  the_corner_office: {
    opening:
      'At 36 the badge opens the top floor and the window owns the skyline. You know the exact cost of every metre of this altitude: the reorg knife-fights, the airport years, the Sundays in slides. You made the climb because it was there, and you finished it. The air is thin and it is yours.',
    oneLiner: 'Made the final climb. Earned every metre of the altitude.',
  },
  the_phoenix: {
    opening:
      'At 36 the layoff email sits archived, never deleted, a monument you visit once a year. The list had your name and you refused to let it be the last line. The comeback took longer than the fall and rebuilt more than the salary. It is the first thing people ask about, and you tell it plainly.',
    oneLiner: 'The correction put my name on a list. I refused to stay on it.',
  },
  the_remittance_years: {
    opening:
      'At 36 the family balance sheet has your Gulf years written all over it: the loans closed, the house rebuilt, the sister settled. The other ledger is quieter, kept in missed weddings and festivals attended as a rectangle on a phone. Both ledgers are real. You signed both.',
    oneLiner: 'The Gulf reset my family’s money story. The price was paid in festivals.',
  },
  the_professor_of_practice: {
    opening:
      'At 36 you teach on Tuesdays and Thursdays, and the first slide of every course is a mistake you personally paid for. The institute pays a fraction of your old CTC and the students walk into interviews carrying frameworks with your fingerprints. The scars found their syllabus.',
    oneLiner: 'Converted fifteen years of scar tissue into a syllabus.',
  },
  the_door_opener: {
    opening:
      'At 36 you know exactly what one open door felt like at 21, because everything since came through it. So your forties became carpentry: the scholarship cohort, the Saturday classroom, the calls you take from kids whose colleges nobody ranks. They call the program by your name.',
    oneLiner: 'I remembered what one open door felt like at 21, so I built doors.',
  },
  the_present_parent: {
    opening:
      'At 36 you can list every recital you sat through in the front row and every review you handed to a deputy to be there. The org chart replaced you in a year, as org charts do. The person at your dinner table, telling you about their day in full paragraphs, never will.',
    oneLiner: 'The org chart forgot me in a year. My dinner table never will.',
  },
  the_conductor: {
    opening:
      'At 36 your job did not survive the machines. It became conducting them, which pays better. When the Correction erased whole floors you had already stopped competing with the tools and started directing the orchestra. Years later, when it truly breaks, you are still the call.',
    oneLiner: 'When the machines arrived I stopped competing and started conducting.',
  },
  the_quiet_crorepati: {
    opening:
      'At 36 nothing about you photographs well: mid-range car, rented-looking house you own, a title nobody envies. The portfolio crossed a crore on an ordinary Wednesday and you told exactly one person. Boring money, deployed at 24, left alone for a decade and a half. The oldest trick, executed.',
    oneLiner: 'The portfolio crossed a crore while nobody was watching. That was the plan.',
  },
  the_settled_one: {
    opening:
      'At 36 the nameplate says Officer and the colony finally pronounces your designation with respect. The exam your father slid across the table turned into a pension, a quarters posting, and evenings that actually end. It is a smaller life than the one you sketched at 21. On most Tuesdays it is enough.',
    oneLiner: 'The exam cleared, the colony got its respect. On most Tuesdays it is enough.',
  },
  the_quiet_pillar: {
    opening:
      'At 36 you have never lived more than twenty minutes from your parents, and it was a choice renewed every year, not a failure to launch. Every emergency of fifteen years found you already in the corridor. The career grew slower and the roots grew instead. Some lives are measured in presence.',
    oneLiner: 'I never left, and it was a choice. Every emergency found me already there.',
  },
  the_one_person_channel: {
    opening:
      'At 36 the newsletter goes out on Sunday nights to more people than your company employs. You spent fifteen years renting distribution from platforms and employers, then built your own at an age the internet called too late. Rooms you have never entered now quote you inside them.',
    oneLiner: 'Built my own channel at an age everyone called too late.',
  },
  the_sandwich_generation: {
    opening:
      'At 36 your calendar is a bridge: parents’ hospital reviews on one side, school PTMs on the other, you in the middle holding both ends. No award ceremony exists for this. It is the most common heroism in the country, and you did it without dropping either generation.',
    oneLiner: 'Parents on one side, a child on the other. Dropped neither.',
  },
  the_people_bank: {
    opening:
      'At 36 your net worth is distributed across people: the intern you shielded who now runs a team, the mentor thread that never broke, the students from the Saturday classroom who send wedding invites. The dividends arrive daily, in a currency that has never once inflated.',
    oneLiner: 'Spent fifteen years depositing into people. The dividends arrive daily.',
  },
  the_one_who_knew_when: {
    opening:
      'At 36 you did the rarest senior thing available: you stopped on purpose. Enough salary, enough title, actual evenings, and a calendar with white space that you defend like territory. Some ex-colleagues pity you at reunions. You have seen their calendars. The pity does not survive contact.',
    oneLiner: 'Learned the rarest senior skill: stopping on purpose.',
  },
  the_solid_middle: {
    opening:
      'At 36 there are no famous wins on your wall and no famous wounds either. A family fed, a roof standing, parents looked after, a career that held through fifteen years that flattened plenty of louder people. Nobody makes reels about this life. It carried everyone who leaned on it.',
    oneLiner: 'No famous wins, no famous wounds. I carried everyone who leaned on me.',
  },
  the_open_road: {
    opening:
      'At 36 your CV still confuses recruiters, in the way a map confuses people who only know highways. The life refused every template it was offered, which is exactly why no template saw you coming. The story is unfinished. Unfinished, you have learned, is another word for still yours.',
    oneLiner: 'My fifteen years refused every template. That is why none saw me coming.',
  },
}

const sentenceCase = (title: string) => title.charAt(0) + title.slice(1).toLowerCase()

// Up to three pivotal choices, spread across the life: the first, one from
// the middle, and the last, so the paragraph spans the whole run.
function definingChoices(state: GameState): string[] {
  const picks: { age: number; title: string; label: string }[] = []
  for (const rec of state.history) {
    const card = ALL_CARDS[rec.c]?.find((c) => c.id === rec.cardId)
    if (!card?.pivotal) continue
    const option = card.options.find((o) => o.id === rec.optionId)
    if (!option) continue
    picks.push({ age: CHAPTERS[rec.c].ageFrom, title: card.title, label: option.label })
  }
  if (picks.length <= 3) return picks.map(fmtChoice)
  return [picks[0], picks[Math.floor(picks.length / 2)], picks[picks.length - 1]].map(fmtChoice)
}

const fmtChoice = (p: { age: number; title: string; label: string }) =>
  `At ${p.age}, ${sentenceCase(p.title)} asked its question and you answered: "${p.label}"`

function moneyPhrase(state: GameState): string {
  const s = state.stats
  const salary =
    s.salary === 0
      ? 'no salary on the table, by design or by drift'
      : s.salary < 10
        ? `₹${s.salary.toFixed(1)} LPA, modest and hard-earned`
        : s.salary < 25
          ? `₹${s.salary.toFixed(1)} LPA, respectable by any honest measure`
          : s.salary < 45
            ? `₹${s.salary.toFixed(1)} LPA, more than the 21-year-old dared write down`
            : `₹${s.salary.toFixed(1)} LPA, a number your family quotes carefully`
  const savings =
    s.savings < 0
      ? 'debt still breathing on the ledger'
      : s.savings < 15
        ? `savings of ₹${Math.round(s.savings)} lakhs, thinner than the years deserve`
        : s.savings < 50
          ? `₹${Math.round(s.savings)} lakhs put away`
          : s.savings < 100
            ? `₹${Math.round(s.savings)} lakhs, quietly serious money`
            : 'a corpus past the crore mark'
  return `The ledger at 36 reads ${salary}, and ${savings}.`
}

function bodyAndHomePhrase(state: GameState): string {
  const s = state.stats
  const body =
    s.burnout >= 70
      ? 'The machine that earned all of it is running on fumes.'
      : s.burnout >= 45
        ? 'The body kept receipts for every year of it.'
        : 'And you are still standing easy, which is its own line item.'
  const home =
    s.family >= 70
      ? 'The people stayed close through everything, which shows up nowhere on the CV and everywhere in the evenings.'
      : s.family >= 45
        ? 'Home held, mostly, with patches you both pretend not to see.'
        : 'The people drifted to the edges of it. That was the quiet price.'
  return `${body} ${home}`
}

const TONE_CLOSER: Record<Ending['tone'], string> = {
  good: 'This ending is reachable. You just watched yourself reach it.',
  bad: 'This ending is avoidable. You just watched exactly where it bends.',
  weird: 'No template saw this life coming. Yours does not have to follow one either.',
}

export function composeEpilogue(
  state: GameState,
  ending: Ending,
): { epilogue: string; oneLiner: string } {
  const prose = ENDING_PROSE[ending.id]
  const opening = prose?.opening ?? ending.blurb

  const choices = definingChoices(state)
  const choicesPara = choices.length
    ? `It did not turn on one dramatic day. It turned on the ordinary ones. ${choices.join('. ')}. None of them felt like the big one at the time. They never do.`
    : 'It did not turn on one dramatic day. It turned on thirty-odd ordinary ones, none of which felt like the big one at the time. They never do.'

  const ledgerPara = `${moneyPhrase(state)} ${bodyAndHomePhrase(state)}`

  const action = buildLifeReport(state)[0].action
  const closerPara = `Now look up from the screen. You are not 36. You are 21, and every year of this is still unwritten. If one habit from this run matters most right now, it is this: ${action} ${TONE_CLOSER[ending.tone]}`

  return {
    epilogue: [opening, choicesPara, ledgerPara, closerPara].join('\n\n'),
    oneLiner: prose?.oneLiner ?? ending.blurb.split('. ')[0] + '.',
  }
}

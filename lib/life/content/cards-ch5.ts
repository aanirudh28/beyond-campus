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
  {
    id: 'ch5_gulf_return',
    chapter: 4,
    kind: 'decision',
    title: 'THE RETURN TICKET, PRICED',
    pivotal: true,
    condition: { flag: 'went_abroad' },
    base: `The Gulf project ends and the renewal is on the table: five more tax-free years, or home. The corpus is built. Your parents have aged in fast-forward through a phone screen. Your accent has changed and so has your daughter's, and hers is changing away from yours.`,
    options: [
      {
        id: 'return_home',
        label: 'Come home. The corpus is enough.',
        effects: { salary: { mult: 0.75 }, family: 15, burnout: -6 },
        setFlags: ['returned_home'],
        outcome:
          'The India salary stings for two quarters. Then a random Tuesday dinner with your parents happens, unremarkable and unrepeatable, and the math stops mattering.',
      },
      {
        id: 'extend',
        label: 'Five more years. Finish the mission.',
        effects: { savings: 12, family: -10, burnout: 6 },
        outcome:
          'The corpus grows past every target you ever set. Targets, you notice, have a way of moving the moment you reach them.',
      },
    ],
  },
  {
    id: 'ch5_protege_slot',
    chapter: 4,
    kind: 'decision',
    title: 'ONE SEAT, TWO NAMES',
    condition: { flag: 'people_leader' },
    base: `The post-correction org has one senior seat and two candidates: you, and the protégé you spent four years building. She is ready. So are you. The committee will take your recommendation, which is the cruellest form of power there is.`,
    options: [
      {
        id: 'sponsor_her',
        label: 'Put her name forward. Mean it.',
        effects: { reputation: 12, network: 8, salary: { mult: 1.05 }, burnout: 3 },
        setFlags: ['kingmaker'],
        outcome:
          'She gets the seat and never forgets the sentence you said in that room. Your title stays the same. Your standing, in the way that actually counts, does not.',
      },
      {
        id: 'take_it',
        label: 'Take the seat. You earned it first.',
        effects: { salary: { mult: 1.2 }, reputation: -5 },
        outcome:
          'The seat is yours and it fits. The protégé leaves within a year, the way the best ones do when the ceiling shows itself.',
      },
    ],
  },
  {
    id: 'ch5_raid_offer',
    chapter: 4,
    kind: 'decision',
    title: 'BRING YOUR PEOPLE',
    condition: { flag: 'people_leader' },
    base: `A rival firm's offer comes with an asterisk: "and we would love it if your best three came along." Poaching your own team from the company that is bleeding, using the trust you built managing them. The money assumes you say yes to the asterisk. So does the industry's long memory.`,
    options: [
      {
        id: 'go_alone',
        label: 'Take the offer. Leave the team out of it.',
        effects: { salary: { mult: 1.15 }, reputation: 5 },
        outcome:
          'You move alone and sleep fine. Two of the three find you a year later anyway, on their own steam, which is the version of loyalty that actually counts.',
      },
      {
        id: 'bring_three',
        label: 'Bring the three. Everyone eats better.',
        effects: { salary: { mult: 1.25 }, reputation: -8, network: -4 },
        setFlags: ['raided_team'],
        outcome:
          'The four of you land well and the money is real. The leadership that once sponsored you files the story under a word you do not get to choose.',
      },
    ],
  },
  {
    id: 'ch5_school_anchor',
    chapter: 4,
    kind: 'decision',
    title: 'THE SCHOOL YEAR VS THE DREAM ROLE',
    pivotal: true,
    condition: { flag: 'kid' },
    base: `The role you have wanted for a decade opens in another city, in the middle of your kid's school year, one year before the board-exam runway begins. Your own father moved you twice as a child and you still remember both goodbyes. The offer letter does not have a checkbox for any of this.`,
    options: [
      {
        id: 'take_role',
        label: 'Take it. The family adjusts, families do.',
        effects: { salary: { mult: 1.3 }, family: -9, burnout: 4 },
        outcome:
          'The role is everything the decade promised. The new school takes a year to feel like school. Everyone adjusts, which is true, and costs something, which is also true.',
      },
      {
        id: 'anchor_home',
        label: 'Decline. Some years belong to the child.',
        effects: { family: 9, reputation: 2 },
        setFlags: ['anchored_home'],
        outcome:
          'The role goes to someone else and stings for two quarters. The kid never knows the move almost happened, which is precisely the point of the decision.',
      },
    ],
  },
  {
    id: 'ch5_speak_for_them',
    chapter: 4,
    kind: 'decision',
    title: 'THE POST YOU DRAFT NINE TIMES',
    base: `The industry is pretending the layoffs are "performance-based" and everyone knows better. You are safe, employed, and holding a draft that says the honest thing, with your name on it. Publishing it helps thousands of people feel less gaslit. It also gets read by every future employer you will ever have.`,
    options: [
      {
        id: 'publish_it',
        label: 'Publish. Someone with a safe seat has to.',
        effects: { reputation: 9, network: 7, burnout: 3 },
        setFlags: ['spoke_for_many'],
        outcome:
          'It travels for a week. Two CHROs privately agree, one recruiter blacklists you, and a hundred strangers write "thank you for saying it". Net worth: unchanged. Worth: changed.',
      },
      {
        id: 'delete_draft',
        label: 'Delete draft nine. Feed your family first.',
        effects: { burnout: 4 },
        outcome:
          'A defensible silence; most silences are. The post someone else eventually writes says it worse and travels anyway.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch5_ev_insurance_dividend',
    chapter: 4,
    kind: 'event',
    title: 'THE FORM YOU FILLED AT 31',
    condition: { flag: 'parents_secured' },
    base: `Your mother's knee replacement, both sides, ₹7.4 lakhs. The super top-up you set up during that awkward formalising conversation years ago covers all but the taxi fare. Your father watches you not panic at the billing counter and understands, finally, what that monthly transfer was.`,
    options: [
      {
        id: 'walk_easy',
        label: 'Wheel her out. The paperwork already worked.',
        effects: { family: 8, burnout: -4, savings: -1 },
        outcome:
          'The scariest week of the year produces a bill you barely feel. Past-you, filling forms at 31, turns out to have been the richest person in the family.',
      },
    ],
  },
  {
    id: 'ch5_ev_uninsured_bill',
    chapter: 4,
    kind: 'event',
    title: 'THE BILL WITH NO NET',
    condition: { notFlag: 'parents_secured' },
    base: `Your mother's knee replacement, both sides, ₹7.4 lakhs. There is no policy because the conversation kept being postponed, so the corpus takes the hit directly, in one HDFC transfer with your thumb hovering over confirm. She apologises for the amount, which is the worst part by a distance.`,
    options: [
      {
        id: 'pay_it',
        label: 'Pay it. Then finally do the paperwork.',
        effects: { savings: -8, family: 5, burnout: 5 },
        outcome:
          'She walks fine by Diwali, which is everything. The policy gets bought the same month, years late, priced like a lesson.',
      },
    ],
  },
  {
    id: 'ch5_ev_angel_verdict',
    chapter: 4,
    kind: 'event',
    title: 'THE CHEQUE REPORTS BACK',
    condition: { flag: 'angel_cheque' },
    base: `The logistics startup you wrote ₹5 lakhs into at 31 sells to a freight major. Not a unicorn story, a workmanlike one: your cheque comes back as ₹17 lakhs and a cap-table PDF you keep forever. Angel math, the batchmate texts: one in ten pays for the nine. You were the one.`,
    options: [
      {
        id: 'bank_verdict',
        label: 'Bank it. Toast the founder properly.',
        effects: { savings: 12, network: 4 },
        outcome:
          'The return is nice. The decade of watching a company get built from one WhatsApp away, and being trusted inside it, was the actual dividend.',
      },
    ],
  },
  {
    id: 'ch5_ev_front_page',
    chapter: 4,
    kind: 'event',
    title: 'PAGE THREE, BOTTOM LEFT',
    condition: { flag: 'gives_back' },
    base: `The district newspaper runs a story on your Saturday classroom: one photo, four paragraphs, your name spelled almost right. Your father buys six copies from three different stalls so it does not look like one family clearing the stock. It absolutely looks like that.`,
    options: [
      {
        id: 'frame_page',
        label: 'Let him frame it. This one is his.',
        effects: { family: 6, reputation: 5, network: 3 },
        outcome:
          'The framed page goes up next to your graduation photo. Of everything you have built, this is the artefact he explains to guests first.',
      },
    ],
  },
  {
    id: 'ch5_ev_moonlight_bill',
    chapter: 4,
    kind: 'event',
    title: 'THE OLD INVOICE',
    condition: { flag: 'moonlighted' },
    base: `A routine background verification for a big role surfaces a nine-year-old agency invoice with your PAN on it. The recruiter is apologetic and firm. The offer is paused, then quietly withdrawn. The second laptop was closed years ago. Its bill, apparently, was not.`,
    options: [
      {
        id: 'absorb_it',
        label: 'Take the hit. Some tuition is retroactive.',
        effects: { reputation: -9, burnout: 6 },
        setFlags: ['career_scar'],
        outcome:
          'You tell the story honestly at the next interview before they can find it. Honesty converts about half the damage. The other half stays on the ledger.',
      },
    ],
  },
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

  // ---- arc cards: these exist only because of a choice made earlier ----
  {
    id: 'ch5_founder_winter',
    chapter: 4,
    kind: 'decision',
    title: 'THE CORRECTION REACHES YOUR INVOICES',
    pivotal: true,
    condition: { flag: 'own_business' },
    base: `Two of your three anchor clients pause "all discretionary spend" in the same fortnight. The company has six salaries, four months of runway, and a founder whose own house runs on the same bank account. Every founder WhatsApp group is suddenly a support group. The spreadsheet has one tab called "options" and none of them are painless.`,
    options: [
      {
        id: 'carry_them',
        label: 'Keep all six. Fund payroll from your own savings.',
        effects: { savings: -15, reputation: 8, burnout: 8 },
        setFlags: ['crisis_leader'],
        outcome:
          'You sell the mutual funds you swore were untouchable. Nobody is laid off. Years later, people who were in that room describe you to strangers with a word you cannot repeat without blushing.',
      },
      {
        id: 'cut_to_three',
        label: 'Cut to three. The company must outlive the winter.',
        effects: { savings: 2, reputation: -6, burnout: 6 },
        outcome:
          'Three hard conversations on a Friday. The company survives, leaner and quieter. The three who stayed work like people who have seen the trapdoor. So do you.',
      },
    ],
  },
  {
    id: 'ch5_channel_collapse',
    chapter: 4,
    kind: 'decision',
    title: 'THE ALGORITHM CHANGES ITS MIND',
    condition: { flag: 'creator_track' },
    base: `The platform where you built your audience changes its algorithm and your reach drops 90 percent overnight. Ten years of weekly posts, and the distribution was rented the whole time. The audience still exists somewhere behind the feed. The question is whether you go find them or let the lease quietly end.`,
    options: [
      {
        id: 'own_list',
        label: 'Build the email list. Move the audience somewhere you own.',
        effects: { network: 6, skills: 4, burnout: 4 },
        outcome:
          'One in twenty follows you to the newsletter, and they turn out to be the twenty that mattered. Owned distribution grows slower and cannot be taken away by a product manager in California.',
      },
      {
        id: 'let_fade',
        label: 'Let it fade. It was a chapter, not the book.',
        effects: { burnout: -4, network: -6, family: 3 },
        outcome:
          'The weekly writing habit dissolves into evenings that belong to you again. Occasionally someone says "you used to write, right?" in the past tense, and it lands somewhere between compliment and eulogy.',
      },
    ],
  },
  {
    id: 'ch5_weekday_batch',
    chapter: 4,
    kind: 'decision',
    title: 'THE CLASSROOM ASKS FOR MORE',
    condition: { flag: 'gives_back' },
    base: `The Saturday classroom worked too well. Three students cleared interviews this season, word reached the next town, and now there is a waitlist and a request: a weekday evening batch for final-years who cannot wait for the weekend. Your calendar looks at you. The waitlist looks at you harder.`,
    options: [
      {
        id: 'take_batch',
        label: 'Take the Tuesday batch too. The waitlist is real people.',
        effects: { reputation: 6, burnout: 6, family: -4 },
        outcome:
          'Tuesday 7 p.m. becomes sacred in a different way than Saturday. The season after, seven students clear. Your name starts appearing in other people’s origin stories at a rate you cannot track.',
      },
      {
        id: 'hold_saturday',
        label: 'Protect the Saturday. One deep batch beats two thin ones.',
        effects: { burnout: -2, reputation: 2 },
        outcome:
          'You train two of your first students to run the Tuesday batch instead. It is not the same, and it is also how classrooms outlive teachers. The waitlist moves, just not through you.',
      },
    ],
  },
]

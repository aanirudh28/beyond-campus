import type { Card } from '../types'

// Chapter 2 · THE GRIND · Age 23-25 · 2028-2030
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
    base: `In the quarterly review, a senior presents your analysis with the pronoun swapped. "So I dug into the churn data..." Your manager nods along. You have thirty seconds to decide what kind of colleague you are going to be for the next fifteen years.`,
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
    base: `₹1.1 lakh lands in your account, the first money that is not already spoken for. The phone in your pocket is two generations old and everyone at work has noticed. An index fund SIP calculator is open in another tab, showing what this becomes in fifteen years.`,
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
  {
    id: 'ch2_cousin_dukaan',
    chapter: 1,
    kind: 'decision',
    title: 'THE SHOP GOES ONLINE',
    condition: { city: 'tier3' },
    base: `Your cousin's electronics shop wants to go online and you are officially "the one who knows computers". He is offering weekend work and a slice of whatever the online sales become. It is unglamorous, it is family, and it is a real P&L with your decisions in it, which is more than your job gives you.`,
    options: [
      {
        id: 'build_it',
        label: 'Build it with him. A real P&L beats a title.',
        effects: { savings: 2, skills: 5, family: 6, burnout: 5 },
        setFlags: ['side_biz'],
        outcome:
          'Eight months later the shop does ₹3 lakhs a month online and your cousin introduces you as "my partner". You learn margins, returns fraud, and festival-season cash flow: an MBA nobody can bill you for.',
      },
      {
        id: 'stay_out',
        label: 'Stay out. Family and money is a known explosive.',
        effects: { burnout: -3, family: -3 },
        outcome:
          'A wise instinct, honestly. The shop finds a local agency, pays them badly, and grows anyway. Sunday lunches stay simple.',
      },
    ],
  },
  {
    id: 'ch2_csr_secondment',
    chapter: 1,
    kind: 'decision',
    title: 'SIX MONTHS OFF THE BILLABLES',
    condition: { ambition: 'impact' },
    base: `The company's foundation needs someone for a six-month skilling project in two districts. Same salary, zero career velocity, and the kind of work that made you pick "impact" when the form asked what pulls you. Your manager calls it "a detour". He is not wrong. Neither are you.`,
    options: [
      {
        id: 'second_me',
        label: 'Take the secondment. This is the point.',
        effects: { reputation: 8, skills: 4, family: 3 },
        setFlags: ['mission_track'],
        outcome:
          'Four hundred young people go through the program you rebuilt. The CSR head remembers your name for years, and so, more quietly, do you.',
      },
      {
        id: 'stay_billable',
        label: 'Stay on the billables. Impact can wait for leverage.',
        effects: { salary: { mult: 1.08 }, skills: 4 },
        outcome:
          'The appraisal cycle rewards the choice. The form where you once wrote "impact" stays filed somewhere, patient.',
      },
    ],
  },
  {
    id: 'ch2_psc_pressure',
    chapter: 1,
    kind: 'decision',
    title: 'THE EXAM RETURNS',
    condition: { ambition: 'stability', notFlag: 'exam_track' },
    base: `At 24, the state PSC notification lands in the family group with three thumbs-up before you have even seen it. "Last few attempts left at your age." The private job is going fine, which convinces nobody. Stability, in your house, has exactly one spelling and it is a government posting.`,
    options: [
      {
        id: 'weekend_prep',
        label: 'Prep on weekends. Keep both doors open.',
        effects: { family: 8, burnout: 6, skills: -4 },
        setFlags: ['exam_track'],
        outcome:
          'Two years of split focus. The house is peaceful, the weekends are mock tests, and both doors stay half-open, which is a strange way for doors to be.',
      },
      {
        id: 'firm_no',
        label: 'Say the final no, kindly.',
        effects: { family: -8, reputation: 3, burnout: -4 },
        setFlags: ['backed_self'],
        outcome:
          'The group chat goes quiet for a week. The decision, once actually made, releases hours and guilt you did not know you were paying interest on.',
      },
    ],
  },
  {
    id: 'ch2_toxic_brand',
    chapter: 1,
    kind: 'decision',
    title: 'THE SCREAMER WITH THE GOOD LOGO',
    base: `Your manager screams. Properly screams, in the open floor, twice a week, at whoever is nearest. The brand on your badge is the best you have ever had, and everyone says two years here changes your resume forever. HR calls his style "demanding excellence". Your Sunday-evening dread calls it something else.`,
    options: [
      {
        id: 'endure',
        label: 'Endure it for the brand. Two years, head down.',
        effects: { burnout: 9, reputation: 5, skills: 5 },
        setFlags: ['endured_toxic'],
        outcome:
          'The resume line is worth what they promised. The flinch when someone raises their voice takes longer to expense out than the two years did.',
      },
      {
        id: 'transfer_out',
        label: 'Engineer a transfer. No logo is worth the dread.',
        effects: { burnout: -9, network: -3, family: 3 },
        outcome:
          'The new team is calmer and slightly slower. Years later you learn half his team from your batch quit the industry entirely. You did not.',
      },
    ],
  },
  {
    id: 'ch2_moonlight_offer',
    chapter: 1,
    kind: 'decision',
    title: 'THE SECOND LAPTOP',
    base: `A friend runs an agency and offers you steady weekend work, ₹35,000 a month, invoiced to a company that competes vaguely with yours. Your contract has a clause about this. Half your batch does it anyway, on second laptops with the camera covered. The money would change your year. The clause does not care about your year.`,
    options: [
      {
        id: 'moonlight',
        label: 'Take it quietly. Everyone does it.',
        effects: { savings: 3.5, burnout: 8, skills: 3 },
        setFlags: ['moonlighted'],
        outcome:
          'The extra money is real and so is the low hum of a secret. You get very good at closing tabs quickly. Some bills, you learn, arrive years after the purchase.',
      },
      {
        id: 'decline',
        label: 'Pass. Sleep is worth more than ₹35,000.',
        effects: { reputation: 3, burnout: -3 },
        outcome:
          'The friend finds someone else. Your weekends stay yours and your background checks stay boring, which is the only way background checks should ever be.',
      },
    ],
  },
  {
    id: 'ch2_love_or_ladder',
    chapter: 1,
    kind: 'decision',
    title: 'THE PERSON IN THE ELEVATOR',
    base: `Someone at work laughs at your worst joke and remembers how you take your chai. It is becoming something. Office relationships are a genre with famous endings, good and bad, and your promotion cycle is four months away. Your grandmother, telepathically, has already started asking about "any good news".`,
    options: [
      {
        id: 'lean_in_love',
        label: 'Let it become something. Work is not a life.',
        effects: { family: 10, burnout: -6, reputation: -2 },
        setFlags: ['love_early'],
        outcome:
          'The chai breaks get longer and the bad days get shorter. HR raises an eyebrow. Your grandmother, six hundred kilometres away, somehow already knows.',
      },
      {
        id: 'ladder_first',
        label: 'Keep it professional. Bad timing.',
        effects: { skills: 4, burnout: 3 },
        outcome:
          'Clean, sensible, and slightly grey. They transfer to the Pune office next year. You think about the chai sometimes.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch2_ev_mentor_intro',
    chapter: 1,
    kind: 'event',
    title: 'THE THREAD PAYS EARLY',
    condition: { flag: 'mentor_kept' },
    base: `Your old manager, the one you never stopped messaging, calls out of nowhere. "There is a panel next month judging young talent in the industry. I put your name in. Do not embarrass me." This is what those two-line monthly messages were quietly buying.`,
    options: [
      {
        id: 'show_up',
        label: 'Prepare like it matters. It does.',
        effects: { reputation: 8, network: 8 },
        setFlags: ['mentor_dividend'],
        outcome:
          'You do not win the panel. You meet four people who remember you afterwards, which is a bigger prize wearing a smaller trophy.',
      },
    ],
  },
  {
    id: 'ch2_ev_ipo_flatmate',
    chapter: 1,
    kind: 'event',
    title: 'THE FLATMATE LOTTERY',
    base: `Your flatmate's startup lists. His ESOPs, which he complained about for two years while you split the electricity bill, are suddenly worth ₹3 crore on paper. He buys the good whisky and pays the full deposit on a new flat. The electricity bill in your name stays exactly the same size.`,
    options: [
      {
        id: 'process',
        label: 'Toast him. Luck is not a strategy, but it exists.',
        effects: { network: 3, burnout: 4 },
        outcome:
          'You are genuinely happy for him and genuinely rattled for a month. Both things are allowed. The lesson you keep: be somewhere upside is possible.',
      },
    ],
  },
  {
    id: 'ch2_ev_pf_awakening',
    chapter: 1,
    kind: 'event',
    title: 'THE MONEY YOU FORGOT YOU HAD',
    base: `A colleague's resignation paperwork reveals the thing nobody teaches: the PF account. Twelve percent of basic, matched, compounding quietly since day one. You log into the portal for the first time and find actual money with your name on it, built entirely out of your own inattention.`,
    options: [
      {
        id: 'wake_up',
        label: 'Read the payslip properly, once, finally.',
        effects: { savings: 0.8, skills: 2 },
        outcome:
          'Basic, HRA, gratuity vesting, the works. Thirty minutes of boring reading turns out to be the highest-paid half hour of your year.',
      },
    ],
  },
  {
    id: 'ch2_ev_salary_sheet',
    chapter: 1,
    kind: 'event',
    title: 'THE ANONYMOUS SPREADSHEET',
    base: `Someone from your batch makes an anonymous salary spreadsheet and it fills up in a day. Forty-one rows of exact CTCs. You are row 23. Above you: two people you carried through group projects. The sheet gets deleted by evening. What it did to everyone's Tuesday cannot be.`,
    options: [
      {
        id: 'use_it',
        label: 'Bookmark the numbers. Data over feelings.',
        effects: { network: 2, burnout: 3 },
        setFlags: ['knows_worth'],
        outcome:
          'The sting fades; the benchmark stays. At your next negotiation you quote the market like someone who has seen the market, because you have.',
      },
    ],
  },
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

  // ---- arc cards: these exist only because of a choice made earlier ----
  {
    id: 'ch2_night_shift',
    chapter: 1,
    kind: 'decision',
    title: 'THE US CLIENT WANTS A NIGHT OWL',
    condition: { flag: 'took_early_job' },
    base: `The startup lands its first US client and someone has to own the 9 p.m. to 5 a.m. window. The founder asks you directly, because you are the one who says yes to things. ₹2 LPA bump, a title with "lead" in it, and a body clock that will belong to Eastern Standard Time.`,
    options: [
      {
        id: 'own_it',
        label: 'Take the night. Sleep is a rookie metric.',
        effects: { salary: 2, burnout: 10, family: -5, reputation: 4 },
        setFlags: ['night_owl_years'],
        outcome:
          'You learn more about clients in six months of 2 a.m. calls than most learn in three years. Breakfast becomes a meal you eat alone at 4 p.m.',
      },
      {
        id: 'decline',
        label: 'Decline, and propose a rotation instead.',
        effects: { reputation: 2, family: 3 },
        outcome:
          'The founder blinks, then agrees the rotation is fairer. Someone else becomes the client favourite. You keep your mornings and wonder, occasionally, what they cost.',
      },
    ],
  },
  {
    id: 'ch2_sheet_person',
    chapter: 1,
    kind: 'decision',
    title: 'YOU ARE NOW THE SHEET PERSON',
    condition: { flag: 'excel_learned' },
    base: `Word spread that you can make Excel sing, and now every report in the department lands on your desk "since you are so quick". You have become infrastructure. Infrastructure does not get promoted; it gets depended on. There are two ways to play a monopoly.`,
    options: [
      {
        id: 'teach',
        label: 'Automate it, template it, teach the team.',
        effects: { skills: 8, reputation: 5, burnout: 3 },
        outcome:
          'Your templates outlive your tenure on that desk. The manager starts introducing you as "the one who fixed reporting", which is a sentence promotions can attach to.',
      },
      {
        id: 'hoard',
        label: 'Keep the formulas to yourself. Leverage is leverage.',
        effects: { skills: 3, reputation: -4, network: -3 },
        outcome:
          'For a year you are irreplaceable, which is another word for stuck. The team routes around you eventually. Monopolies age badly in open offices.',
      },
    ],
  },
  {
    id: 'ch2_second_laptop_hours',
    chapter: 1,
    kind: 'decision',
    title: 'THE SIDE CLIENT WANTS DAYLIGHT',
    condition: { flag: 'moonlighted' },
    base: `The ₹35,000 side client is thrilled with your work, which is the problem. They want calls at 3 p.m., revisions by "EOD", and have started saying "our team" in emails. Your actual employer's HR just circulated a memo about dual employment with the word "termination" in bold.`,
    options: [
      {
        id: 'wind_down',
        label: 'Wind it down. The memo is not bluffing.',
        effects: { savings: -3, burnout: -6 },
        outcome:
          'The client is gracious, the extra income stops, and your evenings return like a tide. The cupboard laptop goes cold. Relief has a slightly boring taste.',
      },
      {
        id: 'juggle',
        label: 'Juggle harder. Lunch hours exist for a reason.',
        effects: { savings: 5, burnout: 9, family: -4 },
        outcome:
          'You become a person with two phones and one story per phone. The money stacks. Somewhere in a shared drive, an invoice with your name on it waits patiently for the future.',
      },
    ],
  },
  {
    id: 'ch2_local_restless',
    chapter: 1,
    kind: 'decision',
    title: 'THE BATCHMATE ON THE OTHER SIDE',
    pivotal: true,
    condition: { flag: 'settled_local' },
    base: `A batchmate who took the Bangalore leap posts a team photo from an office with a slide in it. Then he DMs you: "we are hiring, I can refer, but you would have to move". The local job is warm and known. Your desk has a plant on it now. The plant is doing better than your resume.`,
    options: [
      {
        id: 'jump',
        label: 'Take the referral. The plant will survive without you.',
        effects: { salary: { mult: 1.25 }, network: 8, family: -8 },
        setFlags: ['moved_metro'],
        outcome:
          'Your mother packs pickle jars like you are going to war. The metro is loud, expensive, and completely indifferent to you, which turns out to be a kind of freedom.',
      },
      {
        id: 'stay',
        label: 'Stay. Roots are a strategy too, if you choose them.',
        effects: { family: 6, reputation: 2 },
        setFlags: ['stayed_rooted'],
        outcome:
          'You reply "not right now, but keep me in mind" and mean half of it. Sunday lunch happens at the family table. The plant gets a bigger pot.',
      },
    ],
  },

  // ---- origin cards: the hand you were dealt, playing itself out ----
  {
    id: 'ch2_og_shop_call',
    chapter: 1,
    kind: 'decision',
    title: 'THE SHOP NEEDS HANDS',
    condition: { flag: 'origin_shop_family' },
    base: `Your father's knee surgery lands in wedding season, the shop's biggest quarter. Your mother is managing the counter, the suppliers, and her worry, in that order. You are two hours away with a job. The shop has run for twenty-two years. It has never once run short-handed.`,
    options: [
      {
        id: 'take_orders_online',
        label: 'Take over: put the shop online, run orders after work.',
        effects: { family: 6, burnout: 5 },
        setFlags: ['side_biz'],
        outcome:
          'You build a WhatsApp catalogue in one weekend and the shop discovers delivery. Your father recovers to find his ledger has a dashboard. He pretends to disapprove for exactly one week.',
      },
      {
        id: 'fund_helper',
        label: 'Hire a helper with your salary. Presence by proxy.',
        effects: { savings: -3, family: 3 },
        outcome:
          'The boy you hire is good, and the money is real help. On the phone your mother says "beta, it is handled" in the voice that means something else was wanted. The quarter survives.',
      },
    ],
  },

  // ---- market weather cards: the economy you are living through ----
  {
    id: 'ch2_mkt_tips_group',
    chapter: 1,
    kind: 'decision',
    title: 'THE CHAI GROUP BECOMES A TIPS GROUP',
    condition: { market: 'boom' },
    base: `The market has been going up long enough that the office chai group is now a stock-tips group. A colleague doubled his money in three weeks and has become unbearable and possibly right. Your salary account has ₹80,000 doing nothing. Everyone is a genius right now. That is usually the tell.`,
    options: [
      {
        id: 'quiet_sip',
        label: 'Start a boring index SIP. Ignore the geniuses.',
        effects: { savings: 2, reputation: 2 },
        setFlags: ['invested_early'],
        outcome:
          'You automate the money and mute the group. Your returns will never be a story at chai. That is the entire strategy, and it only looks slow from the inside of a boom.',
      },
      {
        id: 'ride_tips',
        label: 'Ride the tips. The water is obviously warm.',
        effects: { savings: 4, burnout: 4 },
        setFlags: ['fno_burn'],
        outcome:
          'The first three trades work, which is the most expensive thing that can happen to a beginner. You are now emotionally load-bearing on stocks you cannot explain.',
      },
    ],
  },
  {
    id: 'ch2_mkt_joining_freeze',
    chapter: 1,
    kind: 'event',
    title: 'THE OFFER GOES QUIET',
    condition: { market: 'squeeze' },
    base: `The switch you had lined up goes quiet, then formal: "joining deferred by two quarters due to business conditions." The offer letter is real, the start date is fiction, and the resignation you almost submitted is still in drafts. The squeeze does not care about your plans.`,
    options: [
      {
        id: 'hold_both',
        label: 'Stay put, keep the deferred offer warm.',
        effects: { burnout: 5, family: -2 },
        outcome:
          'Two quarters of working one job while emotionally living in another. The offer eventually lands, smaller than promised. You take the lesson: in a squeeze, signed means started.',
      },
      {
        id: 'walk_away',
        label: 'Release it. Recommit fully where you stand.',
        effects: { reputation: 4, skills: 3 },
        outcome:
          'You email a polite withdrawal and stop refreshing. Your current manager notices the recommitment without knowing its cause. When the market thaws, you negotiate from strength, not from waiting.',
      },
    ],
  },

  // ---- second-generation exclusive: the parent is a character now ----
  {
    id: 'ch2_lg_the_call',
    chapter: 1,
    kind: 'decision',
    title: 'THE ADVICE YOU DID NOT ASK FOR',
    condition: { flag: 'second_generation' },
    base: `Your parent calls at 10 p.m. with career advice shaped entirely by the fifteen years they lived. Some of it is gold. Some of it is a detailed map of a country that no longer exists. They mean every word, and they are watching, quietly, to see whether you listen.`,
    options: [
      {
        id: 'listen',
        label: 'Take the wisdom, filter the outdated parts.',
        effects: { skills: 5, family: 5, network: 2 },
        outcome:
          'You keep the pattern-recognition and gently drop the specifics. They feel heard, which was half the point, and you are sharper for it, which was the other half.',
      },
      {
        id: 'own_way',
        label: 'Thank them, then do it entirely your own way.',
        effects: { reputation: 4, family: -5, burnout: 2 },
        outcome:
          'You build without the manual. A few of their warnings you will rediscover the expensive way. The independence costs a handful of dinners and buys something you cannot name yet.',
      },
    ],
  },
]

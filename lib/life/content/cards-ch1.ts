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
      {
        id: 'negotiate',
        label: 'Counter: ₹3.8 LPA and a joining date after results.',
        effects: { salary: 3.8, reputation: 3, family: -10, burnout: 7 },
        setFlags: ['took_early_job', 'moved_metro'],
        outcome:
          'Your voice shakes on the call and they say yes anyway, because nobody else asked. You join two weeks later at a number you chose. The lesson outlasts the job: everything is a conversation.',
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
    id: 'ch1_commission_weekend',
    chapter: 0,
    kind: 'decision',
    title: 'THE VARIABLE LIFE',
    condition: { ambition: 'money' },
    base: `An edtech sales team wants weekend closers. Pure commission, ₹800 per converted demo, and the top guy last month made more than your professor. It is also eleven hours of hearing "we will think about it" from parents who will not think about it. Money has an apprenticeship, and this is what it looks like.`,
    options: [
      {
        id: 'close',
        label: 'Take the weekends. Learn to ask for money.',
        effects: { savings: 1.5, network: 6, skills: 5, burnout: 5 },
        setFlags: ['commission_blood'],
        outcome:
          'You get hung up on forty times and close nine. Something permanent changes in how you walk into rooms: rejection stops being about you and starts being arithmetic.',
      },
      {
        id: 'protect',
        label: 'Skip it. Protect the final-year focus.',
        effects: { skills: 4, burnout: -3 },
        outcome:
          'The grades hold and the weekends stay whole. The first time someone says "no" to you professionally is still ahead, waiting.',
      },
    ],
  },
  {
    id: 'ch1_fellowship_fork',
    chapter: 0,
    kind: 'decision',
    title: 'THE ELEVEN-MONTH DETOUR',
    pivotal: true,
    condition: { ambition: 'impact' },
    base: `A teaching fellowship in rural Rajasthan. Eleven months, a stipend that rounds to nothing, and the kind of work you actually said you wanted when the college asked for your "vision". Your batch will be eleven months of CTC ahead when you return. Some doors this opens do not exist anywhere else. Some doors it delays are the ones your family is watching.`,
    options: [
      {
        id: 'go_teach',
        label: 'Take the fellowship. Do the real thing first.',
        effects: { skills: 8, reputation: 8, family: -6, network: 5 },
        setFlags: ['mission_year'],
        outcome:
          'Eleven months in a village school rearrange what you think a hard problem is. Interviewers lean forward at this story for the rest of your life.',
      },
      {
        id: 'corporate_first',
        label: 'Corporate first. Impact needs a war chest.',
        effects: { skills: 4, family: 4 },
        outcome:
          'The sensible sequence. The fellowship batch photos arrive on Instagram all year, and you look at them slightly too long.',
      },
    ],
  },
  {
    id: 'ch1_loan_shadow',
    chapter: 0,
    kind: 'decision',
    title: 'THE EMI THAT GRADUATES WITH YOU',
    condition: { city: 'tier2' },
    base: `The education loan's moratorium ends six months after graduation, employed or not. ₹9,400 a month, addressed to a person who does not have a job yet. Evening tuition batches would cover it. They would also eat the exact hours the job hunt lives in.`,
    options: [
      {
        id: 'tuition',
        label: 'Take the tuition batches. Owe no one.',
        effects: { savings: 1.2, family: 5, burnout: 4, skills: 2 },
        setFlags: ['loan_fighter'],
        outcome:
          'Teaching class 11 accounts at 7 a.m. funds the EMI and, unexpectedly, teaches you to explain things simply. Two skills for one grind.',
      },
      {
        id: 'ask_time',
        label: 'Ask your father to cover six more months.',
        effects: { family: -6, skills: 4 },
        outcome:
          'He says yes before you finish the sentence, which is somehow heavier than a no. The hunt gets your full hours. The debt gets a face.',
      },
    ],
  },
  {
    id: 'ch1_circle_fee',
    chapter: 0,
    kind: 'decision',
    title: 'THE ROOMS WITH A COVER CHARGE',
    condition: { city: 'metro' },
    base: `A "young professionals circle" meets monthly at a five-star lobby. ₹6,000 a year, mostly juniors from famous colleges practising firm handshakes. Two members got referrals out of it last quarter. The city runs on rooms like this, and rooms like this run on people who showed up.`,
    options: [
      {
        id: 'pay_in',
        label: 'Pay it. Rooms compound.',
        effects: { network: 9, savings: -0.1, reputation: 3 },
        outcome:
          'Meeting four is where you stop rehearsing your introduction. Meeting seven is where someone says "send me your CV" and actually means it.',
      },
      {
        id: 'library',
        label: 'Skip it. The library is free.',
        effects: { skills: 6 },
        outcome:
          'The preparation deepens. The rooms keep meeting, with one fewer chair filled, and nobody notices, which is exactly the problem.',
      },
    ],
  },
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
    id: 'ch1_ev_topper_unplaced',
    chapter: 0,
    kind: 'event',
    title: 'THE TOPPER IS ALSO WAITING',
    base: `The department topper, 9.4 CGPA, the one your mother compares you to, is also unplaced. You find out at the chai stall and feel two things at once: relief you are ashamed of, and a colder realisation. The game is not marks. It never was. Nobody updated the syllabus about that.`,
    options: [
      {
        id: 'recalibrate',
        label: 'Let it sink in. Play the actual game.',
        effects: { reputation: 3, burnout: -4, skills: 2 },
        outcome:
          'You stop preparing for the exam that ended and start preparing for the market that never announces its pattern. The topper, to his credit, figures it out too, eventually.',
      },
    ],
  },
  {
    id: 'ch1_ev_resume_farm',
    chapter: 0,
    kind: 'event',
    title: 'THE JOB THAT NEVER EXISTED',
    base: `The perfect listing: your city, your profile, "urgent hiring". You apply within the hour. Weeks later a senior explains that half these posts are resume farms: agencies harvesting fresher CVs to pad their databases, no job behind the door. The listing is still up. It has 4,000 applicants now.`,
    options: [
      {
        id: 'wise_up',
        label: 'Learn to smell them. Warn the group.',
        effects: { skills: 3, network: 3 },
        outcome:
          'You develop the checklist: no company name, no named human, salary "as per industry standards". The market has weather, and you are learning to read the sky.',
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

  // ---- arc cards: these exist only because of a choice made earlier ----
  {
    id: 'ch1_exam_hall',
    chapter: 0,
    kind: 'decision',
    title: 'THREE MONTHS INTO THE SYLLABUS',
    condition: { flag: 'exam_track' },
    base: `Three months of reasoning puzzles and your mock scores have parked themselves mid-table. Two lakh people are writing this exam for four thousand seats. Meanwhile a walk-in drive for management trainees is happening Saturday, two bus routes away. Your father has already told the colony you are preparing.`,
    options: [
      {
        id: 'commit',
        label: 'Double down. Mid-table at month three means nothing.',
        effects: { family: 4, skills: -2, burnout: 5 },
        outcome:
          'You cancel everything that is not the syllabus. The house arranges itself around your timetable, quietly proud, quietly watching.',
      },
      {
        id: 'walkin',
        label: 'Slip out Saturday. Keep the exam as the official story.',
        effects: { network: 6, family: -6 },
        setFlags: ['backed_self'],
        outcome:
          'You tell them it is a friend’s errand. The interviewer likes your spreadsheet answer. Living two versions of yourself has a cost, and also, sometimes, a payoff.',
      },
    ],
  },
  {
    id: 'ch1_referral_interview',
    chapter: 0,
    kind: 'decision',
    title: 'THE FORWARDED CV RINGS BACK',
    condition: { flag: 'dm_courage' },
    base: `The alum was not being polite. HR calls: first round tomorrow, 11 a.m., thirty minutes. Your internal exams are also tomorrow, 10 to 1, and the professor taking attendance is the one who already calls you "the absent entrepreneur". A referral interview slot, once moved, has a way of never coming back.`,
    options: [
      {
        id: 'stairwell',
        label: 'Take the call from the library stairwell at 11.',
        effects: { skills: 4, reputation: 5, burnout: 4 },
        outcome:
          'You whisper your way through a case question next to a fire extinguisher. The interviewer laughs at the echo and asks the follow-up anyway. You make round two. The exam gets a supplementary date.',
      },
      {
        id: 'reschedule',
        label: 'Ask HR to move it. Exams are exams.',
        effects: { family: 4, network: -3, burnout: 2 },
        outcome:
          'HR says "of course" in the tone that means probably not. The slot dissolves into next quarter. Your mother is relieved about the exam. The alum never mentions it again.',
      },
    ],
  },
  {
    id: 'ch1_pivot_proof',
    chapter: 0,
    kind: 'decision',
    title: 'THE TEST YOU PREPARED FOR',
    condition: { flag: 'excel_learned' },
    base: `The screening test opens and there it is: build a pivot table, find the leaking region. Six months ago this would have ended you. Today it is a formality. Then your hostel mate pings from two rows back: "bro share screen for 5 min, my placement depends on this". The invigilator is on his phone.`,
    options: [
      {
        id: 'refuse',
        label: 'Mute him. Finish your own test clean.',
        effects: { reputation: 4, network: -3 },
        outcome:
          'He does not talk to you for a month. Your score lands in the top decile, and it is entirely, provably yours. Some prices are just visible earlier than others.',
      },
      {
        id: 'help',
        label: 'Share the screen. Five minutes, one friend.',
        effects: { network: 5, reputation: -5 },
        outcome:
          'He clears it and buys you dinner. Two years later he tells the story at a party as a joke, with your name in it, in front of someone from that company.',
      },
    ],
  },
  {
    id: 'ch1_hold_the_line',
    chapter: 0,
    kind: 'decision',
    title: 'MONTH TWO OF THE SILENCE',
    condition: { flag: 'held_out' },
    base: `Sixty days since you declined the offer. The inbox is a desert. At your cousin's wedding an uncle asks, loudly, near the buffet, "beta, anything yet?" Your batch WhatsApp celebrates someone's joining bonus. The bet you made needs either doubling or folding, and the wedding season has opinions about both.`,
    options: [
      {
        id: 'spray',
        label: 'Fold. Apply to sixty portals this week.',
        effects: { burnout: 8, skills: -2, network: 2 },
        outcome:
          'Volume feels like motion. Three auto-rejections arrive before breakfast for a month. Something eventually bites, though it looks a lot like the offer you declined.',
      },
      {
        id: 'system',
        label: 'Hold. Ten targeted companies, one alum each, every week.',
        effects: { skills: 4, burnout: 4, family: -4 },
        outcome:
          'You build a tracker instead of a panic. Week five, a reply. Week seven, a shortlist. The uncle at the next wedding gets a company name he has actually heard of.',
      },
    ],
  },

  // ---- origin cards: the hand you were dealt, playing itself out ----
  {
    id: 'ch1_og_form_filler',
    chapter: 0,
    kind: 'decision',
    title: 'THE COLONY’S FORM FILLER',
    condition: { flag: 'origin_first_gen' },
    base: `Because you are the one with the degree, you are now the colony's official form-filler: pension papers, scholarship portals, a neighbour's insurance claim. It eats your evenings in twenty-minute pieces. It also means every family in three lanes knows your name and says it warmly.`,
    options: [
      {
        id: 'keep_helping',
        label: 'Keep the door open. This is also a network.',
        effects: { network: 6, burnout: 3, family: 3 },
        outcome:
          'The sweet shop uncle whose GST forms you filed has a nephew in an HR team. Nothing about your network is inherited, and all of it answers your calls.',
      },
      {
        id: 'boundaries',
        label: 'Tuesdays only. The job hunt needs the evenings.',
        effects: { skills: 4, family: -4 },
        outcome:
          'Two aunties are offended on principle. Your application count doubles. The colony adjusts, the way colonies do, and keeps a shorter list of favours.',
      },
    ],
  },
  {
    id: 'ch1_og_moratorium',
    chapter: 0,
    kind: 'decision',
    title: 'SIX MONTHS TO THE FIRST EMI',
    condition: { flag: 'origin_loan' },
    base: `The education loan moratorium ends six months after graduation, employed or not. ₹11,400 a month, the bank does not do feelings. A 7 a.m. tuition batch would cover most of it. So would taking literally any offer that comes first, which is exactly how the loan wants you to think.`,
    options: [
      {
        id: 'tuition',
        label: 'Take the 7 a.m. batches. Buy the search some time.',
        effects: { savings: 3, burnout: 6 },
        setFlags: ['loan_fighter'],
        outcome:
          'Teaching class 11 accounts at dawn pays the EMI and, unexpectedly, teaches you to explain things under pressure. Interviewers notice that muscle without knowing where it came from.',
      },
      {
        id: 'restructure',
        label: 'Restructure with the bank. Hunt with a clear head.',
        effects: { skills: 4, savings: -2 },
        outcome:
          'One awkward branch visit converts panic into a payment plan. The search gets your full brain. The interest meter, patient as ever, keeps counting.',
      },
    ],
  },
  {
    id: 'ch1_og_public_rejection',
    chapter: 0,
    kind: 'decision',
    title: 'THE TOPPER GETS A NO',
    condition: { flag: 'origin_topper' },
    base: `The company that came to campus rejected you and selected two backbenchers, and by evening the whole college knows. Your professor looks personally betrayed. The rank that opened every door so far has just discovered a door it cannot open, publicly, with an audience.`,
    options: [
      {
        id: 'hide',
        label: 'Say nothing. Toppers do not explain.',
        effects: { burnout: 7, family: -3 },
        outcome:
          'The silence protects the reputation and corrodes the sleep. The rank becomes a thing you defend instead of a thing you use.',
      },
      {
        id: 'post_it',
        label: 'Write about it honestly, rank and rejection both.',
        effects: { reputation: 5, network: 5 },
        setFlags: ['creator_spark'],
        outcome:
          'The post travels beyond the college by midnight. Strangers reply with their own rejections. It turns out the most shareable thing a topper can publish is a failure.',
      },
    ],
  },
  {
    id: 'ch1_og_gd_language',
    chapter: 0,
    kind: 'decision',
    title: 'THE GD IS A HOME GAME FOR SOMEONE ELSE',
    condition: { flag: 'origin_english' },
    base: `In the group discussion, a boy from a city school says less than you know in better English than you have, and the moderator writes something down. Your ideas arrive complete and leave untranslated. There is a 7 a.m. practice circle that fixes exactly this, and there is your pride.`,
    options: [
      {
        id: 'circle',
        label: 'Join the circle. Pay the English tax early.',
        effects: { skills: 4, burnout: 4 },
        setFlags: ['english_grind'],
        outcome:
          'Three months of stumbling in front of strangers at dawn. Then one morning you hear yourself disagree with someone, fluently, and forget to be surprised.',
      },
      {
        id: 'written_lane',
        label: 'Compete where you are strong: written work, portfolios.',
        effects: { skills: 5, network: -4 },
        outcome:
          'Your case submissions start winning what your GDs keep losing. It is a real lane. It is also a narrower one, and you know which rooms you are avoiding.',
      },
    ],
  },
  {
    id: 'ch1_og_page_or_placement',
    chapter: 0,
    kind: 'decision',
    title: 'THE PAGE THAT PAYS',
    condition: { flag: 'origin_hustler' },
    base: `The meme page you run clears ₹15,000 a month in promotions, which is more than some job offers on campus. Placement season wants your full attention. The page wants tonight's post. Everyone advising you to shut it down has a salary. Everyone telling you to scale it has never had one.`,
    options: [
      {
        id: 'run_both',
        label: 'Run both. Sleep is negotiable, income is not.',
        effects: { savings: 3, burnout: 7 },
        outcome:
          'You interview by day and schedule posts by night. The bank balance grows either way, which quietly changes how you sit in interviews: like someone with options.',
      },
      {
        id: 'pause_page',
        label: 'Pause the page. Hunt with everything.',
        effects: { skills: 3, family: 3, burnout: -2 },
        outcome:
          'The followers drift, the sleep returns, the applications sharpen. The page sits in drafts like a folded shop shutter. You could reopen it. That thought is worth something.',
      },
    ],
  },

  // ---- market weather cards: the economy you graduated into ----
  {
    id: 'ch1_mkt_placement_winter',
    chapter: 0,
    kind: 'decision',
    title: 'GRADUATING INTO A SQUEEZE',
    condition: { market: 'squeeze' },
    base: `Your batch graduated into a tightening market, which nobody consulted you about. Companies that took twelve people last year are taking three. Seniors one year up got offers your batch will not see. The timing is not your fault. The response to it is entirely yours.`,
    options: [
      {
        id: 'lower_anchor',
        label: 'Take what exists. A squeeze salary beats no salary.',
        effects: { salary: 2.6, burnout: 4, reputation: -2 },
        setFlags: ['took_early_job'],
        outcome:
          'You sign for less than last year’s batch and start compounding anyway. Markets recover faster than gaps on resumes do. It is not fair. It is just true.',
      },
      {
        id: 'upskill_wait',
        label: 'Use the winter: certifications, projects, patience.',
        effects: { skills: 7, savings: -1, family: -3 },
        outcome:
          'While the market sulks, you build. When hiring thaws, you interview as a sharper candidate than the squeeze ever met. The bet is that the thaw comes before the rent does.',
      },
    ],
  },

  // ---- second-generation cards: the inheritance, playing itself out ----
  {
    id: 'ch1_lg_net_visible',
    chapter: 0,
    kind: 'decision',
    title: 'THE NET EVERYONE CAN SEE',
    condition: { flag: 'origin_legacy_cushion' },
    base: `Your flatmate eats dal chawal for the last week of every month, and both of you know you never will. The net under you is real, and it changes the questions people ask: would you have taken that risk without it? Would you take a real one now, precisely because falling is survivable?`,
    options: [
      {
        id: 'use_net',
        label: 'Use it deliberately: take the riskier, better path.',
        effects: { skills: 5, reputation: 3, family: -3 },
        outcome:
          'You pick the harder internship over the safer stipend, because you can. Privilege spent on growth is the only version of it that compounds into something yours.',
      },
      {
        id: 'prove_clean',
        label: 'Refuse it quietly. Prove you can stand without it.',
        effects: { skills: 3, burnout: 5, family: 3 },
        outcome:
          'You live on your own stipend to the rupee and tell nobody about the net. It is a little theatrical. It also builds a spine the net could never have given you.',
      },
    ],
  },
  {
    id: 'ch1_lg_lessons_ledger',
    chapter: 0,
    kind: 'decision',
    title: 'THE LEDGER YOU DID NOT SIGN',
    condition: { flag: 'origin_legacy_rebuild' },
    base: `You watched a correction eat your parent's best years from a front-row seat at the dinner table. Now every offer you evaluate gets audited twice: once for what it pays, once for how it dies. Your batch calls you paranoid. Your batch did not grow up reading the same ledger.`,
    options: [
      {
        id: 'armor_up',
        label: 'Let the lesson lead: emergency fund before anything.',
        effects: { savings: 3, burnout: 2, network: -2 },
        setFlags: ['runway_built'],
        outcome:
          'Six months of runway before your first festival bonus. It is not fear, you tell yourself, it is memory with a plan. Both things are true.',
      },
      {
        id: 'refuse_fear',
        label: 'Refuse the fear. Their crash is not your forecast.',
        effects: { skills: 4, reputation: 3, family: -4 },
        outcome:
          'You take the bolder path your parent never could afford to. At dinner they say nothing, and pack you extra pickle, which in this house means both worry and blessing.',
      },
    ],
  },
  {
    id: 'ch1_lg_the_comparison',
    chapter: 0,
    kind: 'decision',
    title: 'THE COMPARISON COURSE',
    condition: { flag: 'origin_legacy_echo' },
    base: `An interviewer looks at your surname, then at you, and asks the question you have answered your whole life: "so, following in the footsteps?" Whatever you say next becomes your positioning for years. The name opens this door. It also stands in it.`,
    options: [
      {
        id: 'own_lane',
        label: 'Claim a different lane, politely and permanently.',
        effects: { reputation: 4, network: -3, burnout: 2 },
        outcome:
          'You say "different mountain, same work ethic" and watch them recalibrate. Building beside a monument means every brick of yours gets counted twice. You have chosen to be counted.',
      },
      {
        id: 'use_name',
        label: 'Use the name. Doors are doors.',
        effects: { network: 6, reputation: -2 },
        outcome:
          'The name gets you the meeting, the second meeting, the internship. Somewhere in year three you will need to become the reason people stay in the room. You know this. The door is still open.',
      },
    ],
  },
]

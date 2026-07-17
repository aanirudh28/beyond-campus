import type { Card } from '../types'

// Chapter 3 · THE FORK · Age 26-29 · 2031-2034
// The decade-defining forks: MBA, startups, love, parents, the brand of you.

export const CARDS_CH3: Card[] = [
  {
    id: 'ch3_mba_fork',
    chapter: 2,
    kind: 'decision',
    title: 'THE CAT QUESTION',
    pivotal: true,
    base: `Everyone from your batch is either preparing for CAT or explaining loudly why they are not. A good MBA means two years out, a ₹25 lakh loan, and a shot at rooms that still check pedigrees. Your current trajectory means slower, compounding, unglamorous progress. Both paths work. Both cost something real.`,
    options: [
      {
        id: 'mba',
        label: 'Take the plunge. Prep seriously, go all in.',
        effects: { salary: { mult: 1.6 }, savings: -12, skills: 10, network: 15, burnout: 10 },
        setFlags: ['mba_done'],
        outcome:
          'Two brutal years, one loan that follows you like a pet, and a placement day that resets your salary graph. The badge opens doors. The EMI keeps you honest.',
      },
      {
        id: 'work',
        label: 'Skip it. Let the work itself be the degree.',
        effects: { salary: { mult: 1.2 }, skills: 8, savings: 2 },
        setFlags: ['self_made_track'],
        outcome:
          'While batchmates study cases, you live them. No campus, no badge, no loan. Your proof has to be louder because your pedigree is quieter.',
      },
    ],
  },
  {
    id: 'ch3_startup_six',
    chapter: 2,
    kind: 'decision',
    title: 'EMPLOYEE NUMBER SIX',
    pivotal: true,
    base: `A founder you half-know from LinkedIn is building in a space you understand. She offers you a seat as employee six. Thirty percent pay cut, a title that means nothing yet, and equity that is either toilet paper or a house deposit. "I need someone who can do five jobs badly until we can hire five people."`,
    condition: { notFlag: 'mba_done' },
    options: [
      {
        id: 'leap',
        label: 'Take the leap. Asymmetric bets need a young back.',
        effects: { salary: { mult: 0.7 }, skills: 15, network: 10, burnout: 12, reputation: 5 },
        setFlags: ['startup_leap', 'own_esops'],
        outcome:
          'You do sales on Monday, ops on Tuesday, and a pitch deck at 2 a.m. on Thursday. You age a year every quarter and grow three.',
      },
      {
        id: 'safe',
        label: 'Pass. The EMI-free life has its own equity.',
        effects: { salary: { mult: 1.1 }, savings: 2 },
        outcome:
          'You watch the startup from the outside with a feeling you cannot name. Two years later you still check their careers page sometimes.',
      },
    ],
  },
  {
    id: 'ch3_knowledge_door',
    chapter: 2,
    kind: 'decision',
    title: 'THE DOOR NOBODY TOLD YOU ABOUT',
    pivotal: true,
    base: `A recruiter from one of the big three consulting firms messages you. Not for the consultant track, for their knowledge and research team. Real McKinsey-grade problems, global teams, and a door that can open into the main practice for people who are exceptional. Most of your batch does not even know this team exists.`,
    condition: { minStat: { skills: 55 } },
    options: [
      {
        id: 'join',
        label: 'Join the research team. Get inside the building.',
        effects: { salary: { mult: 1.3 }, skills: 12, reputation: 10, network: 8 },
        setFlags: ['mbb_research_track'],
        outcome:
          'Your work now travels in decks that CEOs read. The brand on your profile changes what every future conversation assumes about you.',
      },
      {
        id: 'decline',
        label: 'Stay on your current track. Depth over brand.',
        effects: { skills: 6, salary: { mult: 1.1 } },
        outcome:
          'You keep building where you are. The recruiter says "keep in touch." This time it might even be true.',
      },
    ],
  },
  {
    id: 'ch3_relationship',
    chapter: 2,
    kind: 'decision',
    title: 'THE PERSON WHO STAYED',
    pivotal: true,
    base: `Someone has been in your corner through two job changes and one very bad quarter. The families have started using the word "settle." Your calendar says the next two years are the steepest part of your climb. Their patience is real, and it is not infinite.`,
    options: [
      {
        id: 'commit',
        label: 'Commit. Build the climb around the person.',
        effects: { family: 15, burnout: -5, savings: -1 },
        setFlags: ['engaged'],
        outcome:
          'The engagement photos flood three family groups. Some ambitions get renegotiated, not abandoned. A teammate for the long game.',
      },
      {
        id: 'career_first',
        label: 'Ask for time. The next two years decide everything.',
        effects: { family: -12, skills: 5, burnout: 5 },
        setFlags: ['career_first'],
        outcome:
          'Some people wait. This one, after eight months, stops waiting. You get very good at working late.',
      },
      {
        id: 'long_distance',
        label: 'Propose the middle path: together, two cities, two years.',
        effects: { family: 4, burnout: 6, network: 2 },
        outcome:
          'Video calls at 11 p.m., tickets booked six weeks out, a shared calendar with two colours. It holds, barely, on scheduling software and stubbornness. Some middles are bridges. Some are just long.',
      },
    ],
  },
  {
    id: 'ch3_father_bp',
    chapter: 2,
    kind: 'decision',
    title: 'THE PHONE CALL AT 11 PM',
    pivotal: true,
    base: `Your father's health scare turns out to be manageable, this time. But the call rearranges something permanent in your chest. Your parents are aging in a city you left. Money can buy nurses and flights. It cannot buy Tuesday evenings.`,
    condition: { flag: 'moved_metro' },
    options: [
      {
        id: 'move_back',
        label: 'Engineer a move closer to home within a year.',
        effects: { family: 18, salary: { mult: 0.85 }, network: -5 },
        setFlags: ['moved_back'],
        outcome:
          'The remote-friendly role pays less and means more. You are there for the small emergencies that never make it to the family group.',
      },
      {
        id: 'send_money',
        label: 'Stay. Send money, systems, and weekend flights.',
        effects: { savings: -2, family: 4, burnout: 6 },
        setFlags: ['provider_guilt'],
        outcome:
          'You set up the health insurance, the help, the pharmacy account. It is genuinely useful. It is also not the same thing, and everyone politely pretends otherwise.',
      },
    ],
  },
  {
    id: 'ch3_public_writing',
    chapter: 2,
    kind: 'decision',
    title: 'THE COMPOUND INTEREST OF SAYING THINGS',
    base: `You know things now. Actual, earned, specific things about your industry. Writing them publicly once a week would cost four hours and a little embarrassment. Everyone senior who you admire seems to have paid that price years ago.`,
    options: [
      {
        id: 'write',
        label: 'Publish weekly. Become findable.',
        effects: { network: 14, reputation: 8, burnout: 4 },
        setFlags: ['creator_track'],
        outcome:
          'Eight months in, a conference invite arrives. A year in, candidates mention your posts in interviews with you. The internet knows your name in a small, useful way.',
      },
      {
        id: 'private',
        label: 'Keep your head down. Let the work speak.',
        effects: { skills: 5 },
        outcome:
          'The work does speak, to the eleven people who see it. They are good people. There are eleven of them.',
      },
    ],
  },
  {
    id: 'ch3_team_shield',
    chapter: 2,
    kind: 'decision',
    title: 'THE INTERN AND THE BLAME',
    base: `A client deliverable goes out with a wrong number. The intern who made the slide is terrified. The client is furious. Your director asks, in the open channel, "who owns this?" You reviewed that deck. Technically the intern built it. Technically.`,
    options: [
      {
        id: 'own',
        label: 'Own it. "My review, my miss."',
        effects: { reputation: 10, network: 6, burnout: 3 },
        setFlags: ['team_shield'],
        outcome:
          'The director is cold for a week. The intern would now walk into fire for you, and interns become directors faster than anyone expects.',
      },
      {
        id: 'precise',
        label: 'Be precise about who built what.',
        effects: { reputation: -6, burnout: 2 },
        outcome:
          'The facts are accurate. The team hears something else entirely. People start double-checking things near you, quietly.',
      },
    ],
  },
  {
    id: 'ch3_evening_llb',
    chapter: 2,
    kind: 'decision',
    title: 'THE BACKUP DEGREE',
    condition: { ambition: 'stability' },
    base: `An evening LLB. Three years of 6-to-9 classes, one more qualification for the wall, one more moat against a world that keeps rearranging itself. Or the same three years of evenings spent going dangerously deep in the field you already work in. Safety by accumulation, or safety by mastery.`,
    options: [
      {
        id: 'enroll',
        label: 'Enroll. Nobody can take a degree away.',
        effects: { skills: 2, burnout: 6, savings: -1.5 },
        setFlags: ['second_degree'],
        outcome:
          'Three years of evening lectures produce a real degree and a strange discovery: the classmates are the actual asset. Half of them are mid-career hedgers exactly like you.',
      },
      {
        id: 'go_deep',
        label: 'Go deep instead. Mastery is the moat.',
        effects: { skills: 9, reputation: 3 },
        outcome:
          'The evenings compound into the kind of depth that gets you called into rooms. No certificate. Just the reputation of someone who actually knows.',
      },
    ],
  },
  {
    id: 'ch3_fintech_heat',
    chapter: 2,
    kind: 'decision',
    title: 'THE ROCKET WITH YOUR NAME ON IT',
    condition: { ambition: 'money' },
    base: `The hottest fintech in the country is hiring for growth, and they move fast: one call, one case, one offer at a number that makes you re-read the email. The catch is public knowledge: 70-hour weeks, quarterly layoffs of the bottom decile, and a CEO who tweets at 3 a.m. Money is on the table. So is everything else.`,
    options: [
      {
        id: 'board_rocket',
        label: 'Board the rocket. Earn while the earning is good.',
        effects: { salary: { mult: 1.45 }, burnout: 9, network: 6 },
        setFlags: ['rocket_years'],
        outcome:
          'The money is real and so is the ringing in your ears. You learn more about growth in eighteen months than most learn in eight years, at a price the payslip does not itemise.',
      },
      {
        id: 'let_it_pass',
        label: 'Pass. Sustainable beats spectacular.',
        effects: { salary: { mult: 1.1 }, burnout: -4 },
        outcome:
          'Half the people who joined that round were gone in two years, rich and hollow-eyed. The other half are rich. You chose not to flip that particular coin.',
      },
    ],
  },
  {
    id: 'ch3_social_arm',
    chapter: 2,
    kind: 'decision',
    title: 'THE PAY CUT WITH A PURPOSE',
    condition: { ambition: 'impact' },
    base: `A social enterprise doing livelihood work wants you to run their partnerships. Twenty percent pay cut, a title that means something to you and nothing at weddings, and outcomes measured in families instead of quarters. The version of you from the college vision statement is watching this decision closely.`,
    options: [
      {
        id: 'take_cut',
        label: 'Take the cut. Buy the meaning.',
        effects: { salary: { mult: 0.8 }, reputation: 9, family: -3, skills: 5 },
        setFlags: ['mission_track'],
        outcome:
          'The work is slower, harder to measure, and the first time a beneficiary family names their shop after the scheme you built, no appraisal letter ever compares again.',
      },
      {
        id: 'fund_instead',
        label: 'Stay corporate, fund the work instead.',
        effects: { savings: -2, reputation: 4 },
        outcome:
          'The monthly transfer to their donor program is real help. It is also, a quiet voice notes, outsourcing the version of you that form was about.',
      },
    ],
  },
  {
    id: 'ch3_sister_wedding',
    chapter: 2,
    kind: 'decision',
    title: 'THE ELDER SIBLING TAX',
    base: `Your sister's wedding is fixed and your father's numbers, which he shows nobody, do not close. He has not asked. He will not ask. You know the gap is about ₹3 lakhs because your mother mentioned the caterer's quote twice, which in this family is a siren.`,
    options: [
      {
        id: 'close_gap',
        label: 'Transfer the ₹3 lakhs before he has to ask.',
        effects: { savings: -3, family: 12 },
        outcome:
          'He accepts it with a nod and never mentions it again. At the wedding he stands straighter than you have seen in years, and you understand exactly what you bought.',
      },
      {
        id: 'token_help',
        label: 'Give ₹50,000 and protect your own runway.',
        effects: { savings: -0.5, family: -7 },
        outcome:
          'The wedding happens, slightly smaller. Your runway stays intact. Some ledgers in a family are never spoken of and never, ever closed.',
      },
    ],
  },
  {
    id: 'ch3_exam_verdict',
    chapter: 2,
    kind: 'decision',
    title: 'THE LAST ATTEMPT',
    pivotal: true,
    condition: { flag: 'exam_track' },
    base: `Attempt three of the bank exam is in four months. The first two missed by margins small enough to haunt. You are older now than most of the coaching batch, and your private-sector salary has quietly grown past what the posting would pay. Your father still keeps the newspaper cutting. So do you, somewhere.`,
    options: [
      {
        id: 'all_in',
        label: 'One real, final, all-in attempt.',
        effects: { salary: 4, family: 12, skills: -4, burnout: 6 },
        setFlags: ['govt_settled'],
        outcome:
          'You clear it. The colony hears the same day. The posting is two towns over, the pension is real, and a particular argument at a particular dinner table ends forever, in your favour and his.',
      },
      {
        id: 'close_chapter',
        label: 'Let it go. The exam was his dream.',
        effects: { family: -6, burnout: -6, reputation: 4 },
        setFlags: ['backed_self'],
        outcome:
          'You frame nothing and announce nothing, just stop renewing the test series. Years later your father tells a relative "the private line worked out" with something close to pride.',
      },
    ],
  },
  {
    id: 'ch3_rishta_season',
    chapter: 2,
    kind: 'decision',
    title: 'RISHTA SEASON',
    condition: { city: 'tier3', notFlag: 'engaged' },
    base: `An aunt has "a very good family" on hold, the way other people hold parking spots. Photos have been exchanged without your knowledge. You are 27, which in your town's arithmetic is not early. The meeting is just chai, everyone insists. Nothing is ever just chai.`,
    options: [
      {
        id: 'meet',
        label: 'Go for the chai. Keep an open mind.',
        effects: { family: 12, burnout: 2 },
        setFlags: ['engaged'],
        outcome:
          'The third meeting, unsupervised at your insistence, is the one where you both stop performing. It becomes, against your expectations, something real.',
      },
      {
        id: 'not_yet',
        label: '"Not yet." Hold the line, again.',
        effects: { family: -9, reputation: 2 },
        outcome:
          'The aunt is wounded in a way that will require two festivals to repair. The parking spot is given to someone else. Your timeline stays yours.',
      },
    ],
  },
  // ---- events ----
  {
    id: 'ch3_ev_visa_call',
    chapter: 2,
    kind: 'event',
    title: 'THE TORONTO CALL',
    base: `Your best friend gets Canadian PR and calls you from the airport, giddy and slightly guilty. The group chat becomes flight prices and snow photos. Everyone asks when you are applying, in the tone of people asking why you are still standing on the platform after the train came.`,
    options: [
      {
        id: 'stay_course',
        label: 'Wish him well. Your compounding is here.',
        effects: { burnout: 4, network: 3, family: 3 },
        outcome:
          'The pull is real for a season. So is the math you did: your equity, your network, your parents, all denominated in a country you understand. Different trains, both moving.',
      },
    ],
  },
  {
    id: 'ch3_ev_mentor_stumbles',
    chapter: 2,
    kind: 'event',
    title: 'THE THREAD REVERSES',
    condition: { flag: 'mentor_kept' },
    base: `Your old manager, the one you message monthly, gets restructured out at 41. For the first time in the relationship, he sounds unsure. You realise, mid-call, that your network now contains doors he needs. The mentorship has quietly become a two-way street.`,
    options: [
      {
        id: 'send_leads',
        label: 'Work your network for him, hard, for a month.',
        effects: { network: 6, reputation: 5, family: 2 },
        setFlags: ['mentor_repaid'],
        outcome:
          'Two of your introductions become his interviews; one becomes his job. He never says thank you in so many words. He says it in every reference call for the rest of your career.',
      },
    ],
  },
  {
    id: 'ch3_ev_creator_deal',
    chapter: 2,
    kind: 'event',
    title: 'THE FIRST BRAND EMAIL',
    condition: { flag: 'creator_track' },
    base: `A fintech brand emails: they want three posts from you, ₹75,000, full disclosure tags. Two years of writing honestly for free, and the internet has decided your voice is worth renting. The audience you built to find a job has become a small business of its own.`,
    options: [
      {
        id: 'take_deal',
        label: 'Take it, disclose it, stay honest in it.',
        effects: { savings: 0.75, reputation: 5, network: 5 },
        setFlags: ['creator_paid'],
        outcome:
          'The posts perform because they do not pretend. More emails arrive. Distribution, you now understand, is an asset that compounds like money.',
      },
    ],
  },
  {
    id: 'ch3_ev_dashboard_award',
    chapter: 2,
    kind: 'event',
    title: 'THE QUERY THAT GOT FAMOUS',
    condition: { flag: 'data_skills' },
    base: `The reporting automation you built on those course-night evenings wins the internal ops award. The CFO asks who built it. For one strange week, you are the most famous analyst on your floor, and two team leads start a small polite war over your next posting.`,
    options: [
      {
        id: 'leverage_it',
        label: 'Convert the moment into the better team.',
        effects: { salary: { mult: 1.08 }, reputation: 8, skills: 4 },
        outcome:
          'You pick the team with the harder problems. The award gathers dust. The skills that won it never do.',
      },
    ],
  },
  {
    id: 'ch3_ev_fno',
    chapter: 2,
    kind: 'event',
    title: 'THE F&O SEMESTER',
    base: `A colleague doubles his salary in three weeks of options trading and cannot stop talking about it. The screenshots are real. What he does not post is month four. Ninety percent of retail F&O traders lose money, and all of them saw the same screenshots you are seeing.`,
    options: [
      {
        id: 'skip',
        label: 'Stay boring. SIPs and sleep.',
        effects: { savings: 1, burnout: -2 },
        outcome:
          'You miss the rush and the crash. The colleague goes quiet about trading around Diwali and sells his bike in March.',
      },
      {
        id: 'dabble',
        label: 'Put in one month of savings. Just to learn.',
        effects: { savings: -2.5, burnout: 6 },
        setFlags: ['fno_burn'],
        outcome:
          'The market teaches the lesson at full price, as it does. The "just to learn" money is gone, and technically, you did learn.',
      },
    ],
  },
  {
    id: 'ch3_ev_batchmate_funding',
    chapter: 2,
    kind: 'event',
    title: 'THE FUNDING ANNOUNCEMENT',
    base: `A batchmate who copied your assignments raises ₹8 crore for a startup. The article calls him a visionary. Your feed becomes unlivable for a week. Comparison arrives, as it always does, dressed as motivation.`,
    options: [
      {
        id: 'congratulate',
        label: 'Congratulate him and mean it. Run your own race.',
        effects: { network: 5, burnout: -3, family: 2 },
        outcome:
          'He replies with a voice note and an open door. Envy converted to a bridge, which is the only useful thing envy can become.',
      },
    ],
  },
  {
    id: 'ch3_ev_layoff_rumor',
    chapter: 2,
    kind: 'event',
    title: 'THE TOWN HALL THAT SAYS NOTHING',
    base: `A "strategic realignment" town hall. Leadership uses the word "family" twice, which is never good. Nothing is announced. Everyone updates their profiles that evening anyway. The office plant guy knows more than HR will confirm.`,
    options: [
      {
        id: 'prepare',
        label: 'Build a 6-month runway and a warm network, now.',
        effects: { savings: 1.5, network: 6, burnout: 4 },
        setFlags: ['runway_built'],
        outcome:
          'The cut, when it comes, misses your team. The runway stays. So does the new habit of never being surprised.',
      },
      {
        id: 'ignore',
        label: 'Rumors are noise. Keep shipping.',
        effects: { skills: 3 },
        outcome:
          'This round spares your floor. The lesson gets rescheduled rather than cancelled.',
      },
    ],
  },

  // ---- arc cards: these exist only because of a choice made earlier ----
  {
    id: 'ch3_posting_orders',
    chapter: 2,
    kind: 'decision',
    title: 'THE POSTING ORDERS',
    condition: { flag: 'govt_settled' },
    base: `The bank's letter arrives with a district you have to look up on a map: 400 km away, a branch with eleven staff and one working AC. The alternative is a written request for a hometown posting, which everyone files and which works exactly often enough to keep hope administratively alive.`,
    options: [
      {
        id: 'go',
        label: 'Take the far posting. Rural credit is where officers get made.',
        effects: { savings: 4, family: -8, reputation: 5 },
        outcome:
          'You learn lending by looking farmers in the eye. The quarters are spartan, the work is real, and your confidential report starts using the word "promising".',
      },
      {
        id: 'request',
        label: 'File the hometown request. Some maps are non-negotiable.',
        effects: { family: 8, reputation: -3 },
        outcome:
          'Eight months and one well-placed phone call later, you are behind a counter twenty minutes from home. The ambitious batch calls it settling. Your grandmother calls it Tuesday lunch.',
      },
    ],
  },
  {
    id: 'ch3_bschool_placement',
    chapter: 2,
    kind: 'decision',
    title: 'DAY ZERO, SECOND TIME AROUND',
    pivotal: true,
    condition: { flag: 'mba_done' },
    base: `B-school placement week, and this time you are inside the room you once read about. Two offers: a consulting firm famous for weekends that do not exist, at nearly double, or an FMCG leadership rotation with a town posting and a boss who mentions "sustainable pace" unironically. The loan EMI watches you decide.`,
    options: [
      {
        id: 'consulting',
        label: 'Consulting. The EMI wants the bigger number.',
        effects: { salary: { mult: 1.35 }, burnout: 12, skills: 6 },
        outcome:
          'The work is brutal and the learning curve is vertical. You see six industries in two years and your own bed roughly as often. The EMI, at least, stops feeling heavy.',
      },
      {
        id: 'fmcg',
        label: 'FMCG rotation. Build slower, live somewhere.',
        effects: { salary: { mult: 1.15 }, family: 5, burnout: 2, skills: 4 },
        outcome:
          'You learn distribution in mandis and general trade in the heat. The consulting batch out-earns you for now. You out-sleep them by roughly a decade.',
      },
    ],
  },
  {
    id: 'ch3_founder_shadow',
    chapter: 2,
    kind: 'decision',
    title: 'THE LIST WITH ONE NAME ON IT',
    condition: { flag: 'startup_leap' },
    base: `Series A diligence wants costs down, and the founder slides the list across: one name, the junior you hired and trained. "You brought them in, you should do it. Investors are watching how we handle this." Employee six duties were never written down, but apparently they include this.`,
    options: [
      {
        id: 'do_it',
        label: 'Do it yourself, kindly, with two months of runway.',
        effects: { reputation: -2, skills: 4, burnout: 6 },
        outcome:
          'You give them notice, a reference letter, and three intros. They land somewhere better inside a month and never quite look at you the same way. Neither do you.',
      },
      {
        id: 'push_back',
        label: 'Push back. Cut marketing spend, keep the person.',
        effects: { reputation: 5, network: -3, burnout: 3 },
        outcome:
          'The founder is annoyed for a week, then quietly relieved someone in the room has a spine. The junior never finds out how close it came. The investors get their number a quarter late.',
      },
    ],
  },
  {
    id: 'ch3_night_owl_bill',
    chapter: 2,
    kind: 'decision',
    title: 'THE CLOCK PRESENTS ITS BILL',
    condition: { flag: 'night_owl_years' },
    base: `Two years of Eastern Standard Time. You fell asleep at your cousin's engagement, upright, mid-conversation, and the video is in three family groups. The US client loves you enough to offer a choice: lead the new daytime pod at a small haircut, or keep the night window and its premium. Your mother has stopped asking. That is worse than asking.`,
    options: [
      {
        id: 'day_pod',
        label: 'Take the day pod. Rejoin the timezone you live in.',
        effects: { salary: -1, burnout: -8, family: 6 },
        outcome:
          'Sunlight, dinners, a body that stops feeling borrowed. The premium goes to whoever says yes next. You stop doing the maths on it after a few months, mostly.',
      },
      {
        id: 'keep_night',
        label: 'Keep the night. The corpus is compounding.',
        effects: { salary: 2, burnout: 9, family: -5 },
        setFlags: ['health_deferred'],
        outcome:
          'The account grows on schedule. So does something quieter. You put the annual health check "after this quarter" and the quarter, as always, agrees to wait.',
      },
    ],
  },
  {
    id: 'ch3_shop_scale',
    chapter: 2,
    kind: 'decision',
    title: 'THE DISTRIBUTOR CALLS THE SHOP',
    condition: { flag: 'side_biz' },
    base: `The cousin's shop you put online is now doing numbers a regional distributor has noticed. He offers exclusivity for three districts if you can double the catalogue in a quarter. The cousin is ecstatic. Your weekends, already mortgaged, would need to file for bankruptcy.`,
    options: [
      {
        id: 'scale',
        label: 'Take the deal. Build the catalogue at night.',
        effects: { savings: 6, burnout: 8, family: -3 },
        setFlags: ['shop_empire'],
        outcome:
          'Three districts, two phones, one exhausted person doing product photography at midnight. The shop’s turnover crosses the family’s old annual income. Something real is growing here.',
      },
      {
        id: 'handover',
        label: 'Hand the playbook to the cousin. Advisor, not operator.',
        effects: { family: 5, savings: 1, burnout: -3 },
        outcome:
          'You write the SOPs, train his brother-in-law on the ads, and step back to a Sunday phone call. The shop grows slower and stays theirs. Your name stays on the origin story.',
      },
    ],
  },
]

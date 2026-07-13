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
        effects: { salary: { mult: 1.7 }, savings: -12, skills: 10, network: 15, burnout: 10 },
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
  // ---- events ----
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
]

// The flag registry (doc 03 §5). Every flag name that appears anywhere in
// the content graph (setFlags, card conditions, ending matchers, report
// rules) MUST have an entry here — the harness fails on unregistered names,
// on flags read but never set, and on non-narrative flags set but never read.
//
// `narrative: true` marks flags that intentionally have no mechanical reader
// (yet): they exist for future endings/report rules and for the epilogue's
// texture. Promote them by adding a reader, not by deleting them.
//
// Naming: snake_case, verb-or-state phrased from the player's life,
// no chapter prefixes (flags outlive chapters).

export interface FlagDef {
  desc: string
  narrative?: true
}

export const FLAGS: Record<string, FlagDef> = {
  // ---- identity & early tracks ----
  exam_track: { desc: 'Chose the bank/govt exam path at the family dinner table' },
  backed_self: { desc: 'Refused the safe default and bet on the off-campus hunt', narrative: true },
  took_early_job: { desc: 'Took the first ₹3.2 LPA startup offer instead of waiting' },
  held_out: { desc: 'Declined the first offer and waited for a stronger name', narrative: true },
  settled_local: { desc: 'Took the safe local back-office job near home', narrative: true },
  govt_settled: { desc: 'Cleared the bank exam on the final attempt', narrative: true },
  self_made_track: { desc: 'Skipped the MBA and let the work be the degree', narrative: true },

  // ---- skills & proof ----
  excel_learned: { desc: 'Skipped the trip and learned Excel properly at 22' },
  english_grind: { desc: 'Paid the English tax early via the 7 a.m. practice circle', narrative: true },
  data_skills: { desc: 'Built SQL/analytics depth on course nights' },
  fluent_speaker: { desc: 'Joined the speaking club and fixed the delivery gap', narrative: true },
  proof_of_work: { desc: 'Built visible real-work proof (live project, fest sponsorships, tile shop)' },
  first_blood: { desc: 'Debriefed the disastrous first interview into never-again notes', narrative: true },
  ai_native: { desc: 'Rebuilt the work around the AI tools during the Correction' },
  ai_resisted: { desc: 'Bet that experience alone would survive the AI wave' },

  // ---- people & network ----
  dm_courage: { desc: 'Sent the honest two-line alum DM at 21' },
  mentor_kept: { desc: 'Kept the monthly thread with the first good manager alive' },
  mentor_dividend: { desc: 'The kept thread paid early: panel invite and four contacts', narrative: true },
  spoke_up: { desc: 'Calmly reclaimed stolen credit in the quarterly review', narrative: true },
  swallowed_it: { desc: 'Let the stolen-credit moment pass in silence' },
  team_shield: { desc: 'Took the blame publicly to protect the intern' },
  creator_spark: { desc: 'The 1 a.m. rejection post travelled; kept writing weekly' },
  creator_track: { desc: 'Published weekly and became findable' },
  creator_paid: { desc: 'First paid brand collaboration on the audience', narrative: true },
  one_person_channel: { desc: 'Built the owned channel/newsletter at 40' },
  kingmaker: { desc: 'Gave the one senior seat to the protégé and meant it', narrative: true },
  gives_back: { desc: 'Took the Saturday classroom for students from towns like yours' },
  legacy_giver: { desc: 'Funded and mentored the scholarship cohort' },
  elevator_returned: { desc: 'The row-three student came back with an advisor seat', narrative: true },
  board_seat: { desc: 'The twenty-year mentor thread became a board advisor seat' },
  knows_worth: { desc: 'Researched real market rate after the headhunter call', narrative: true },

  // ---- career moves ----
  switched_early: { desc: 'Took the 40 percent switch at 25', narrative: true },
  loyal_arc: { desc: 'Stayed for the lead track instead of the 40 percent switch', narrative: true },
  moved_metro: { desc: 'Moved to the metro where the action is' },
  stayed_rooted: { desc: 'Chose to stay close to home, on purpose' },
  moved_back: { desc: 'Engineered a move back near the parents', narrative: true },
  returned_home: { desc: 'Came home from the Gulf with the corpus', narrative: true },
  mba_done: { desc: 'Took the CAT plunge: two years, one loan, reset trajectory' },
  mbb_research_track: { desc: 'Joined the big-three knowledge/research team' },
  startup_leap: { desc: 'Joined the seed startup as employee six' },
  own_esops: { desc: 'Holds early-employee ESOPs from the startup leap' },
  esop_partial: { desc: 'Sold 20 percent in the secondary; de-risked, stayed believing', narrative: true },
  esop_diamond_hands: { desc: 'Held every ESOP through the peak and the trough' },
  exit_money: { desc: 'The acquisition converted ESOPs into real wired money' },
  own_business: { desc: 'Quit the salary and started the company' },
  dream_shelved: { desc: 'Shelved the startup idea; watched someone else build it', narrative: true },
  went_abroad: { desc: 'Took the Gulf package: 1.7x, tax-free, far' },
  people_leader: { desc: 'Chose the people-manager ladder' },
  deep_expert: { desc: 'Chose the senior IC ladder: the one they call', narrative: true },
  cxo_push: { desc: 'Made the final climb for the top-floor title' },
  chose_enough: { desc: 'Held altitude on purpose; redefined winning' },
  second_engine: { desc: 'Built the consulting side practice after the Correction', narrative: true },
  second_innings: { desc: 'Took the institute role; converted scars to syllabus' },
  crisis_leader: { desc: 'Spent capital saving people during the 2039 cut', narrative: true },
  laid_off_once: { desc: 'Was on the 2039 list; negotiated out with severance' },
  demoted_survived: { desc: 'Survived the Correction in a sideways seat' },
  correction_winner: { desc: 'The reskilling bet paid: acquihired upward in the recovery', narrative: true },
  moonlighted: { desc: 'Ran the secret second laptop for ₹35,000 a month' },
  career_scar: { desc: 'The old moonlighting invoice surfaced in a background check', narrative: true },
  side_hustle: { desc: 'Took freelance cash over course nights', narrative: true },

  // ---- money ----
  invested_early: { desc: 'Started the boring SIP with the first bonus' },
  kept_liquid: { desc: 'Kept renting; kept the money deployable', narrative: true },
  bought_flat_peak: { desc: 'Bought the 2BHK at peak prices; EMI as gravity' },
  pragmatic_wedding: { desc: 'Chose the ₹5 lakh wedding and the down payment', narrative: true },
  fno_burn: { desc: 'Paid the F&O tuition: one month of savings, gone' },
  runway_built: { desc: 'Built the 6-month runway when the town hall said "family"', narrative: true },
  bought_dip: { desc: 'Deployed savings into the fear at the bottom of the Correction' },
  scam_radar: { desc: 'Spotted and reported the pay-for-offer-letter scam', narrative: true },

  // ---- love, family, body ----
  engaged: { desc: 'Committed to the person who stayed' },
  career_first: { desc: 'Asked for time; the person eventually stopped waiting' },
  love_early: { desc: 'Let the office chai breaks become something real', narrative: true },
  kid: { desc: 'Had the kid on an ordinary Tuesday timeline' },
  parents_secured: { desc: 'Formalised the monthly transfer; said the retirement plan out loud' },
  provider_guilt: { desc: 'Stayed away and sent money, systems, and weekend flights', narrative: true },
  showed_up: { desc: 'Front row at the recital; the deputy took the review' },
  the_folder: { desc: 'Kept the father’s annotated clippings folder going', narrative: true },
  health_fixed: { desc: 'Paid the body’s first invoice on time at 31', narrative: true },
  health_deferred: { desc: 'Marked the body’s first invoice "after this quarter"' },
  health_rebuilt: { desc: 'Rebuilt everything around health after the airport scare' },
  reset_taken: { desc: 'Took the three-month sabbatical and repaired the machine', narrative: true },
  hometown_builder: { desc: 'Went back and built something real in the hometown' },

  // ---- engine-owned ----
  burnout_peaked: { desc: 'Burnout crossed 85 at some chapter end (set by the engine; constitutional for the Burnout ending)' },
}

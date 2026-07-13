# 02 — Simulation Design Theory

The design science of a fair, replayable, believable deterministic life-sim.
This is the pedagogy doc of this suite: no card, ending, or tuning change
ships unless it satisfies the rules here. Doc 12 turns these rules into an
authoring SOP; doc 04 turns the invariants into harness checks.

## 1. The economy: seven stats, closed loop

As built in `lib/life/types.ts` / `engine.ts`:

| Stat | Unit | Sources | Sinks | Role |
|---|---|---|---|---|
| `salary` | ₹ LPA | switches (`{mult}`), appraisals, promotions | layoffs, sabbaticals, exam/founder tracks | the scoreboard everyone watches |
| `savings` | ₹ lakhs net worth | salary accrual between chapters, investing early, exits | EMIs, F&O burn, weddings, business losses (floor −30) | the scoreboard that actually decides endings |
| `skills` | 0–100 | learning cards, AI adoption, hard projects | stagnation (comfortable-trap paths) | future salary optionality |
| `network` | 0–100 | DMs, mentors, alumni, giving back | neglect | crisis insurance + door-opener |
| `reputation` | 0–100 | visible work, speaking up, shipping | credit theft accepted, ethics shortcuts | seniority gate (CXO, board) |
| `burnout` | 0–100 (high = bad) | overwork choices, sandwich years | rest, boundaries, `chose_enough` | the tax on every "optimal" path |
| `family` | 0–100 | showing up, staying rooted, boundaries | metro grind, career-first flags | the ending-tone decider |

**The core tension is the salary–burnout–family trilemma.** Any card that
raises salary meaningfully should cost burnout or family (or a flag that
matters later). Cards that raise a stat for free are balance bugs.

**Passive time is part of the economy.** Between chapters the engine applies
appraisals, savings accrual, and burnout decay from a seeded stream separate
from card draws. Tuning passive rates changes every run — treat them as
constitutional (doc 04 §5).

## 2. Difficulty theory: there is no losing

The sim never says "game over." Bad endings are *tonal outcomes*, and they
must feel **earned, not punitive**:

- Every bad ending must be traceable to ≥2 player choices (never a single
  card, never pure passive drift). The epilogue digest of pivotal moments is
  how the player audits this.
- Bad endings get the best writing. "The Comfortable Trap" should sting with
  recognition, not mockery. The player being roasted must want to screenshot
  the roast (litmus rule, doc 01 §6).
- **First-run protection:** across the profile grid, a player making
  middle-of-the-road choices should land in a weird or good ending, not a bad
  one. Target: first-run bad-tone rate ≤30% under the harness's
  random-choice simulation (§4).

## 3. Believability rules

Numbers must survive contact with a commerce student who knows what freshers
earn.

- **Salary bands are real.** Fresher off-campus BBA/BCom: ₹3–5 LPA (2026).
  Anchors at 30: ₹8–20 LPA typical, ₹25+ exceptional. At 45: ₹15–60 LPA span,
  with founder/exit paths above.
- **Inflation model:** the sim spans 2026–2050. Treat all ₹ as
  nominal-with-drift: passive appraisal rates (~4–8%/yr baked into
  between-chapter accrual) *are* the inflation model — do not add a separate
  CPI mechanic. Displayed money stays in LPA/lakhs; never show paise-level
  precision.
- **City multipliers** exist only at initialization (profile priors in
  `createInitialState`) and in card availability (conditions), never as a
  hidden ongoing modifier. What you see on a card is the whole effect.
- **The Correction (chapter 5) is a forced event**, not a random one — every
  cohort faces the downturn+AI decade; only their preparation differs. This
  is a load-bearing design statement about fairness: luck decides texture,
  never the test itself.

## 4. Ending-distribution fairness

The 32 endings (`lib/life/content/endings.ts`) are an ordered first-match
list with `the_open_road` as universal fallback. Authored `baselineRarity`
priors seed the rarity display until real data arrives (doc 08 §5). The
distribution itself is governed by these invariants — enforced by the
harness (`scripts/life-sim-test.ts`, extended per doc 04 §4):

1. **Reachability:** every ending must occur at least once in a 2,000-run
   random simulation across the full profile grid. An unreachable ending is a
   content bug (dead matcher or orphan flag).
2. **No monoculture:** no single ending may exceed **12%** of simulated runs.
   `the_solid_middle` and `the_open_road` (the generic catch-alls) may not
   *together* exceed 20% — if they do, the specific matchers above them are
   too narrow.
3. **Tone mix:** simulated runs should land ≈ **40% good / 35% weird / 25%
   bad** (±8pp per bucket). Current authored set is 15 good / 10 weird /
   7 bad by *count*; the harness measures by *frequency*, which is what
   players experience.
4. **Profile fairness:** no profile combination (stream × city × ambition)
   may have a bad-tone rate >15pp above the global rate. A tier-3 player must
   not be structurally doomed — that would be both bad design and off-brand
   for a platform whose whole thesis is that tier-3 students can win.
5. **Burnout honesty:** the burnout-peak override in `selectEnding` (peak ≥85
   forces the Burnout probe) is constitutional — a player who redlined must
   not be laundered into a good ending by late-game rest.

## 5. Effect-magnitude budgets (authoring guardrails)

Doc 12's pipeline enforces these per card; they exist so no single card can
dominate a life.

| Rule | Budget |
|---|---|
| Per-option 0–100 stat effect | within ±15 (pivotal cards ±20) |
| Per-option salary | additive within ±4 LPA, or one `{mult}` in 0.5–1.6 |
| Per-option savings | within ±20 lakhs (Correction-chapter events ±30) |
| Per-option total touched stats | ≤4 stats (keep choices legible) |
| Per-chapter net drift | median simulated run's stats move ≤25 points per 0–100 stat per chapter |
| Flags per option | ≤2 `setFlags`, all registered in doc 03 §5 |

Options within a card must be *tradeoffs*, not a right answer and a trap: the
expected long-run value of a card's options (harness-measured, doc 12 §3)
should differ by texture and tone more than by raw totals — except where a
card deliberately teaches a lesson (e.g. F&O), and then the punished option
must telegraph its risk in the copy.

## 6. Replayability model

Why run 2 happens (target: ≥35% of completers start a second life):

1. **The ghost is the bait.** The ending screen shows the life you didn't
   live; the replay button is the response.
2. **Profile permutation:** 27 profile combinations gate different cards and
   ending conditions — a bcom/tier3/stability life is genuinely different
   content, not reskinned text.
3. **Deck variance:** each chapter deals 4–5 of a larger conditional pool per
   seed; depth expansion (doc 03 §2) raises unseen-card share per run.
4. **The collection:** "7 of 32 discovered" with rarity percentages. New
   endings ship monthly (doc 12 cadence) so the denominator grows.
5. **Challenges:** playing a friend's exact deck is a different game — same
   luck, your choices (doc 07).

**Randomness philosophy:** the seed decorates, the player decides. Seeds
choose *which* dilemmas appear and passive-drift texture; they must never
decide tone. Harness check: for any fixed choice-policy, ending-tone variance
across 100 seeds must be small (same policy ⇒ same fate class). If a seed can
flip a disciplined life into a bad ending, a card's effects are too large
(§5) or an event is too swingy.

## 7. Chapter pacing (as built, now constitutional)

`lib/life/content/chapters.ts`: THE HUNT (5+1) → THE GRIND (5+1) → THE FORK
(5+1) → THE WEIGHT (5+2) → THE CORRECTION (4+2) → THE LEDGER (4+2) = 37
choices. Stakes escalate; events crowd in as life stops asking permission.
Chapter count is **frozen at 6** and the age span at 21–45 (doc 03 §6). The
per-chapter deal counts may only change with a CONTENT_VERSION bump and a
full rebalance.

## 8. Anti-goals

- No difficulty settings, no "easy mode" — the profile *is* the difficulty
  texture, and fairness invariant §4.4 keeps it honest.
- No meta-progression that changes the economy (unlockable stat boosts etc.).
  The collection unlocks nothing but pride.
- No moralizing copy. The sim shows consequences; the Life Report draws
  lessons; cards never wag fingers.

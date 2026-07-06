# 02 — Pedagogy: Learning Science → Product Mechanics

Every principle below maps to a *specific, buildable* mechanic. No principle is
listed unless it changes what we build.

## 1. Retrieval practice & active recall
**Science:** Testing beats re-reading by large effect sizes (Roediger & Karpicke).
**Mechanic:** The platform has almost no "reading mode." Even concept learning is
question-first: a topic's "Learn" tab is a sequence of worked examples where the
student attempts each step before it's revealed (see Learn Cards below). Formula
sheets exist but every formula card has a "drill me" button that quizzes instead
of showing.

## 2. Spaced repetition
**Science:** Expanding intervals flatten the forgetting curve.
**Mechanic:** Two queues share one scheduler (SM-2-lite, see 04 §6):
- **Redemption queue** — wrong answers return at 1d/3d/7d/21d until solved
  correctly twice spaced. Self-tagged error type modulates intervals (concept
  errors return sooner than misreads).
- **Maintenance queue** — mastered skills get 1 probe question at 7d/21d/60d.
  Fail a probe → skill drops to Rusty and re-enters the daily mix.
Both queues feed slots 1–2 of the Daily Set, so review requires zero separate
willpower. **Design rule: the student never has to *choose* to revise.**

## 3. Interleaving
**Science:** Blocked practice (30 percentage questions in a row) inflates
short-term performance and gut-punches transfer. Interleaved practice feels
worse and works better.
**Mechanic:** Daily Set slots 8–9 are always from *previously touched, different*
topics. Topic-focused practice sessions cap at 15 questions before the UI
suggests a mixed set ("tests never ask 30 of the same thing — mix it up").
We deliberately let students feel the (productive) difficulty and explain why:
transparency converts frustration into buy-in.

## 4. Immediate, elaborated feedback
**Science:** Feedback must be immediate and explain *why wrong*, not just what's right.
**Mechanic:** Answer reveal shows, in order: (1) correct/incorrect + time vs
benchmark, (2) **the trap you fell into** — every distractor is authored with a
`trap_map` explaining the exact mistake that produces it ("you computed 20% of
the *new* price — classic base-switching trap"), (3) full solution, (4) shortcut
method, (5) "solve it two ways" toggle. Mock mode defers feedback to submission
(test realism), then walks every question.

## 5. Deliberate practice & the flow band
**Science:** Growth happens at the edge of ability; flow needs challenge ≈ skill.
**Mechanic:** Adaptive engine targets **~75% success probability** (Elo-matched,
04 §4). Below 60% predicted success → easier question or a hint-scaffolded one;
above 90% → skip ahead. The 1 daily "stretch" question (~50% success) is labeled
as such — a stretch you *expect* to be hard doesn't damage confidence, it
gamifies reach.

## 6. Error-based learning
**Science:** Errors followed by correction produce stronger encoding than errorless
success — *if* the error is processed, not buried.
**Mechanic:** After a wrong answer, one required tap: **"What happened?"** —
`Didn't know the method / Calculation slip / Misread the question / Fell for the
trap / Ran out of time`. This (a) forces 3 seconds of metacognition, (b) tags the
redemption card, (c) powers the analytics error-mix chart, (d) tells us whether
to serve a Learn Card (concept gap) or a speed drill (execution gap). One tap.
Never a text box.

## 7. Mastery learning
**Science:** Advancing with gaps compounds failure (Bloom).
**Mechanic:** Explicit, published mastery criteria per skill (04 §5). The map
*recommends* mastering prerequisites (percentages before profit-loss before
partnership) but never locks — adults with 6 weeks to a test get guidance, not
gates. Prerequisite edges are stored in the skill graph and drive
recommendations ("your Profit & Loss accuracy is low *and* Percentages is
Familiar-not-Proficient — fix the base first").

## 8. Micro-learning & the 12-minute unit
**Science:** Habit formation needs a low-friction, bounded, repeatable unit.
**Mechanic:** The Daily Set is ~12 minutes because that survives a commute, a
class gap, a hostel evening. Sessions never *require* more. Extra practice is
always available but the daily contract is 10 questions. Finish → immediate
closure screen (rating delta, mastery moves, streak) → clean exit point. We
engineer the *stopping point* as carefully as the starting point.

## 9. Habit formation (cue → routine → reward)
- **Cue:** WhatsApp nudge (opt-in) with one-tap deep link + streak-at-risk framing
  ("Day 11 needs 12 minutes"); in-app widget-like homepage — the set IS the homepage.
- **Routine:** the Daily Set, same shape every day.
- **Reward:** variable + honest — rating delta (varies naturally), mastery
  state changes (intermittent), redemption moments ("you beat the question that
  beat you on Tuesday" — genuinely felt victory), streak tick.
- **Identity:** copy consistently frames the user as "someone who practices
  daily," not "someone using an app": "11 days. You're the kind of person
  placements can't surprise."

## 10. Motivation psychology (SDT: autonomy, competence, relatedness)
- **Autonomy:** the set is recommended, never forced; students can swap up to 3
  questions ("not today" on a topic), pick focus topics, set their own target
  companies. Every recommendation shows "why this" (transparency = perceived control).
- **Competence:** rating, mastery states, redemptions — all evidence-based, all
  earned. No participation trophies; the reward *is* the visible competence.
- **Relatedness:** phase-2 study circles (5 friends, shared streak board),
  college leaderboards, "437 BBA students did today's set."

## 11. Behavioral economics applied
- **Loss aversion:** streaks + freeze economy (2 freezes/month; a freeze used is
  shown, not hidden — honesty rule).
- **Fresh-start effect:** Monday "week plan" reset; post-break "comeback set"
  (slightly easier, explicitly framed: "let's warm up") instead of shame.
- **Goal gradient:** readiness score progress bars accelerate visually near
  targets; "2 skills from Deloitte-ready" framing.
- **Commitment devices:** placement-date countdown set at onboarding drives all
  pacing ("6 weeks out → your plan needs 5 sets/week").
- **Defaults:** everything important is a default (review in the daily set,
  calibration tap, error tagging). Willpower is spent only on showing up.

## 12. Confidence calibration (metacognition)
**Science:** Students are systematically overconfident on recently-studied
material; calibration training improves study allocation and test-taking
decisions (attempt vs skip under negative marking).
**Mechanic:** Pre-reveal tap (Sure / Think so / Guessing) on every question.
Calibration curve in analytics. In company sims with negative marking, the
post-mock report computes "your Guessing attempts cost you X marks — skipping
them would have moved you above the cutoff." This is a genuinely novel,
genuinely useful mechanic — treat it as a flagship.

## 13. Cognitive load management
- One question per screen. Zero chrome during solving (timer collapsible —
  anxiety varies; benchmark shown *after* answering by default, live pacing bar
  opt-in).
- Learn Cards: worked examples in steps (completion-problem method — student
  supplies the next step from 2–3 choices), fading scaffold across the card
  sequence (worked example → completion → full problem). This is the
  evidence-backed way to teach procedures fast (Sweller).
- Explanations layered: answer → trap → solution → shortcut → alternative. Each
  layer collapsed by default after the first two. Never a wall of text.

## 14. Gamification: what's in, what's out
**In (mastery-honest):** rating, mastery states, streaks+freezes, redemption
moments, milestone cards (shareable), speed-round personal bests, percentile
vs same-degree peers.
**Out (Skinner-box):** points for logging in, gems/currency, random chests,
decorative badges, leaderboards ranked by *volume* (only rating/accuracy-based
boards, opt-in), anything that rewards time-spent over learning.
**Litmus test:** would a student who ignores the mechanic entirely still get the
full learning value? If removing it makes learning worse, it's pedagogy. If
removing it only makes retention worse, it must at least be honest.

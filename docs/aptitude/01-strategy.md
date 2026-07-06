# 01 — Strategy & First Principles

## The real problem (not the stated one)

The stated problem: "aptitude websites are ugly and outdated."
The real problem: **aptitude prep has no feedback loop, no end state, and no daily unit of work.**

A BBA student who decides to "prepare for placements" faces:

- **A bottomless task.** "Prepare aptitude" has no visible edge. Bottomless tasks
  get procrastinated indefinitely (behavioral econ: ambiguity aversion + present bias).
- **No progress signal.** Solving 50 IndiaBix questions produces zero evidence of
  improvement. Effort without feedback extinguishes behavior within days.
- **Identity-threatening measurement.** A mock test can tell you you're bad. Students
  avoid mocks not from laziness but from *ego protection* — no data feels safer
  than bad data. So they practice blind and walk into SHL tests cold.
- **Evaporating mistakes.** The wrong answer that cost them the Deloitte cutoff was
  made — and forgotten — three weeks earlier in practice. Nothing brings it back.
- **Content chaos.** ~60 topics with no sequence. They either grind Percentages
  forever (comfort practice) or bounce randomly (no consolidation).
- **Solitude.** Prep is invisible. Nobody sees the streak, nobody notices when they
  stop.

Every design decision in this platform is an answer to one of these six.

## The seven core mechanics (the spine of the product)

Everything else in these documents hangs off these seven. If a feature doesn't
strengthen one of them, cut it.

### 1. The Daily Set — the atomic unit of prep
Ten adaptive questions, ~12 minutes, one button: **"Start today's 10."**
Composition (see 02-pedagogy): 2 spaced-review, 5 current-focus adaptive,
2 interleaved from older topics, 1 stretch question above current rating.
This converts "prepare for placements" (bottomless) into "do today's set"
(bounded, finishable, daily). Duolingo's lesson, Wordle's puzzle, chess.com's
daily puzzle — the entire habit architecture compresses into this one unit.

### 2. Apti Rating — one legible number that moves
An Elo-style rating per domain (Quant / Logical / Verbal / DI) plus a composite.
Every question also carries a rating; each attempt updates both (details in
04-question-engine). Why Elo and not "percent complete":
- It moves **every single session**, up or down — a live progress signal.
- It self-calibrates question difficulty at scale with zero manual effort.
- It creates identity ("I'm a 1420 in Quant") the way chess ratings do.
- It enables honest percentiles: *vs other BBA/BCom students*, not vs IIT CS.

### 3. Mistake Bank ("Redemption Queue")
Every wrong answer becomes a card that returns at 1d / 3d / 7d / 21d until solved
correctly twice, spaced. Mistakes stop evaporating; the platform's memory replaces
the student's. Error-based learning is the single highest-leverage pedagogy we can
implement (see 02) and **nobody in this market does it**.

### 4. Mastery Map
Khan-Academy-style skill states per skill: Unseen → Learning → Familiar →
Proficient → Mastered → (decays to) Rusty. No locks, no gating — pure guidance.
Answers "what do I study next?" permanently. Mastery criteria are explicit and
published (see 04), so progress feels earned, not gamified.

### 5. The Mock Fear Ladder
You never ask a scared student to sit a 60-minute mock. The ladder:
daily set (no stakes) → 15-min Checkpoint (framed as practice, gives partial
readiness data) → 30-min Section Test → full Company Simulation (real timing,
real navigation rules, real pressure). Each rung normalizes measurement before
raising stakes. Post-mock output is never just a score — it's a 20-minute fix
plan (see 07).

### 6. Readiness Score — the end state
Per company/track: **"Deloitte readiness: 62/100"** with "what moves it: Master
Percentages (+5), complete 1 checkpoint (+4)." Computed from skill mastery
weighted by that company's actual test pattern × speed compliance × mock
evidence (math in 08). This gives prep an *edge* — a finish line — which is the
antidote to bottomlessness. It is also the single most shareable and most
cohort-funnel-relevant number in the product.

### 7. Confidence Calibration
Before revealing the answer: one tap — Sure / Think so / Guessing. Over time the
student sees their calibration curve ("when you say Sure, you're right 71% of
the time"). Trains metacognition (strongly evidence-backed), directly relevant
to negative-marking tests (skip vs attempt decisions), and is a differentiator
literally no aptitude product has.

## Positioning

- **Against IndiaBix/PrepInsta**: they are question dumps; we are a coach. Their
  question archive is bigger for years — we never compete on count, we compete on
  *"know exactly what to do today and whether you're ready."*
- **Against paid test series (TIME, IMS, Career Launcher)**: they serve MBA
  aspirants with money; we serve the BBA student with a placement test in 6 weeks
  and ₹0 budget. Free is the moat.
- **Against Duolingo-style gamified apps**: we borrow their habit science but our
  gamification is *mastery-honest* (rating, not gems). Our users have a real
  deadline; fake progress would betray them and they'd feel it in the test hall.
- **For Beyond Campus**: the tracker captures students *while applying*; aptitude
  captures them 3–6 months *earlier*, at higher frequency (daily vs weekly). It is
  the top of the funnel and the trust engine. A student who improved their rating
  by 300 points with us for free does not need to be "sold" a ₹2,500 cohort.

## Business philosophy, operationalized

"90% value / 10% conversion" becomes concrete rules:

1. No question, explanation, mock, or analytics view is ever paywalled.
2. Metered only where marginal cost accrues: AI tutor chat (Haiku), consistent
   with the tracker's 5/month pattern.
3. Cohort surface area: exactly three, all contextual and dismissible —
   (a) post-mock fix plan footer, (b) readiness plateau nudge ("your rating has
   been flat 3 weeks — this is usually a strategy problem, not a practice
   problem"), (c) a quiet "Mentorship" nav item. No popups, no timers, no fake
   scarcity, ever.
4. The upgrade moment is *earned trust at a moment of felt need*, not
   interruption.

## Success metrics tree

North star: **weekly practicing students** (completed ≥3 daily sets in the week).
Everything else decomposes:

- Acquisition: SEO sessions → signup rate; share-card clicks; ambassador signups
- Activation: % of signups completing first daily set within 24h (target 60%)
- Habit: D7 retention of activated users (target 35%); median streak; sets/week
- Learning (the honest ones): rating delta over 30 days; mistake-redemption rate;
  calibration error trend; time-to-benchmark compliance
- Outcome: mock completion rate; self-reported test clears (collect it — it powers
  the cutoff estimator, doc 08); placement stories
- Business: aptitude-user → cohort conversion (expect 1–3%); ₹549 call bookings
  sourced from post-mock plans

Vanity metrics we will not celebrate: total questions in DB, total registered
users, total questions attempted.

## Why students quit — and the specific counter-design

| Quit reason | Counter-mechanic |
|---|---|
| No visible progress | Rating moves every session; mastery states change weekly |
| Doesn't know what to do | One button: today's set. Map answers "next" |
| Mock fear | Fear ladder; checkpoints framed as practice |
| Repeats same mistakes | Redemption queue; trap-mapped distractors (04) |
| Boredom | Adaptive difficulty targets ~75% success (flow band); interleaving; variety of formats |
| Life interrupts, streak dies, shame, quit | Streak freeze (2/month), "comeback" framing not guilt framing; honest streaks (only completed sets count) |
| Feels alone | Study circles, college boards (09) — phase 2 |
| Finishes syllabus, drifts | There is no "finished": readiness targets, decay/rusty states, company sims create perpetual purposeful work |

## What we are explicitly NOT building (v1)

- Video lessons (cost/effort black hole; text+visual explanations first; video is a
  later layer on proven content)
- Live classes (that's the cohort)
- A mobile app (PWA-quality mobile web first; app when habit metrics justify it)
- Forums (question-level discussion threads come in phase 3, moderated)
- Government-exam-specific tracks (overlap topics serve them incidentally; focused
  positioning wins)
- AI-generated-on-the-fly questions served to users (AI drafts → human review →
  fixed bank; quality and dedupe are unmanageable otherwise, see 13)

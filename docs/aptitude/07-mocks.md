# 07 — Mock Test System: The Fear Ladder

## Design thesis

Students fear mocks because a mock can *prove they're bad*. The system's job is
to make measurement feel like practice at the bottom of the ladder and like the
real thing at the top — and to make every result actionable within 20 minutes.

## The ladder

| Rung | Format | Stakes framing | Unlock |
|---|---|---|---|
| 0. Daily set | 10 Q adaptive | none — "practice" | always |
| 1. **Checkpoint** | 15 min · 12 Q mixed, fixed (non-adaptive) | "calibration, not judgment" | after 3 daily sets |
| 2. **Section Test** | 25–30 min · one domain, test UI | "find your section pace" | after 1 checkpoint |
| 3. **Mixed Mock** | 45–60 min · full pattern, generic | real timing, palette navigation, no feedback until submit | after 2 section tests |
| 4. **Company Simulation** | exact pattern of target (sections, counts, time/section, negative marking, no-back-navigation if applicable) | "the dress rehearsal" | after 1 mixed mock, or force-unlock with a "test in <14 days" declaration |
| Side | **Speed Round** | 60s single skill, arcade framing, personal bests | always |
| Side | **Daily/Weekly Challenge** | same 5 Q for everyone that day/week; percentile of participants | always |

"Unlocks" are the one place we gate — deliberately, to sequence exposure. Each
rung's first completion is celebrated regardless of score ("Most students never
take a single mock. You've taken one. That's already an edge.").

## Mock engine specifics

- **Blueprints** (`mocks.blueprint jsonb`): section list, per-section question
  filters (skills, rating band, count), time, marking scheme, navigation rules.
  Mocks are *generated from blueprints* against the bank (fresh selection per
  attempt, seen-question exclusion) except Challenges (fixed set for fairness).
- **Test-day realism at rung 3+:** full-screen, palette (answered/marked/
  skipped), per-section locks where the real test has them, on-screen calculator
  only if the target test provides one, warning modal styled like real
  proctoring UIs. Familiarity is a real score booster — say so in copy.
- **Timing telemetry:** per-question time recorded → post-mock "where your
  minutes went" bar (time sinks are usually 3 questions that ate 9 minutes).
- **Percentiles:** vs all attempts of that blueprint, and vs same-degree cohort.
  Cold-start (<200 attempts): show rating-derived expected band instead;
  label honestly ("early data").

## The post-mock report (the product's best 5 screens)

Never just a score. Structure:
1. **Score + context** — marks, sectional cutoff pass/fail vs target company's
  estimated cutoffs, percentile.
2. **Where minutes went** — time allocation bar; the 3 time-sink questions.
3. **The 20-minute fix plan** — auto-generated, concrete: "① Redo these 4
   (trap errors) — 8 min. ② Alligation drill — your two slowest correct answers
   were mixture problems — 7 min. ③ Read: skipping strategy — your 'Guessing'
   attempts cost 3.5 marks under negative marking — 5 min." One-tap start.
4. **Attempt strategy analysis** — attempted/accuracy/skipped matrix; the
   negative-marking calibration insight (doc 04 §calibration): "skip your
   'Guessing' answers and your score rises from 61 → 66, above cutoff."
5. **Readiness delta** — "Deloitte readiness 58 → 64."
Footer (the ONE conversion surface, quiet): "Want a human to walk this report
with you? ₹549 strategy call — credited to any cohort."

## Anxiety design details

- Rung 1–2 results lead with deltas and diagnosis, score visually secondary.
- Never red-splash a failed cutoff; amber + "gap: 4 marks = ~2 skills."
- Abandoned mock → saved, resumable 24h, then auto-scored as "incomplete —
  doesn't count toward readiness" (a mock that *counts against you* when
  abandoned teaches avoidance).
- Pre-mock ritual screen (30s): breathing cue + strategy reminder card
  ("skip anything >90s on first pass"). Small, weirdly differentiating.
- "Ghost mode" (v2): re-attempt an old mock racing your own previous timing —
  beat-your-past-self is motivating with zero social threat.

## Challenge cadence (community heartbeat, doc 09)

Daily Challenge (5 Q, everyone gets the same, midnight IST reset) — the water-
cooler feature; share card shows time+score without revealing answers. Weekly
Challenge (15 Q, Sunday) with college-level aggregation → college leaderboard
fuel. Monthly "Placement Readiness Test" (full mixed mock, fixed) → the
recurring event ambassadors promote on campus.

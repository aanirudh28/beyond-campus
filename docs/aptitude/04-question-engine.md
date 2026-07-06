# 04 — Question Engine

## 1. Question schema (canonical JSON, stored in Postgres `questions`)

```jsonc
{
  "id": "uuid",
  "skill_id": "uuid",                 // exactly one primary skill
  "secondary_tags": ["di-percent"],   // cross-links
  "type": "mcq_single",               // see §2
  "stem_md": "A shopkeeper marks up by 40% and offers 25% discount...",
  "assets": [{ "kind": "table|chart|image", "data": {...} }],  // structured, render client-side (charts as data, not images — crisp, dark-mode native)
  "options": [
    { "key": "A", "text_md": "5% profit", "trap": null },
    { "key": "B", "text_md": "15% profit", "trap": "subtracted-percents" },
    { "key": "C", "text_md": "5% loss",  "trap": "swapped-base" },
    { "key": "D", "text_md": "No profit no loss", "trap": "assumed-cancel" }
  ],
  "answer": { "keys": ["A"] },        // or {"value": 42, "tolerance": 0} for numeric
  "solution_md": "Step-by-step, layered (see §7)",
  "shortcut_md": "Multiplying factors: 1.4 × 0.75 = 1.05 → 5%",
  "alt_method_md": null,
  "trap_explanations": {              // rendered when student picks that distractor
    "subtracted-percents": "You did 40 − 25 = 15. Percentages on different bases never subtract directly.",
    "swapped-base": "...",
    "assumed-cancel": "..."
  },
  "hints": ["What is the SP as a fraction of CP?", "Markup applies to CP; discount applies to MP.", "SP = CP × 1.4 × 0.75"],
  "rating": 1240,                     // Elo, drifts with attempts (§4)
  "rating_locked": false,             // lock after convergence (≥200 attempts)
  "time_benchmark_sec": 55,           // authored, then auto-tuned to attempt p60
  "difficulty_band": "medium",        // derived from rating; for display/SEO only
  "companies": ["deloitte", "ey", "icici"],  // "appears in tests like"
  "exams": ["placement", "cat-lite", "bank"],
  "calc_allowed": false,
  "status": "approved",               // draft → reviewed → approved → retired
  "version": 3,                       // append-only question_versions table
  "source": "original",               // original | adapted-pattern (never copied)
  "author": "haiku-draft+founder-review",
  "quality_score": 0.94,              // from user flags + discrimination stats (§8)
  "created_at": "...", "updated_at": "..."
}
```

Design rules:
- **Every distractor must be a named trap.** If you can't explain why a student
  would pick it, it's a filler option — rewrite it. This single rule is most of
  our explanation quality moat.
- Charts/tables ship as data + a house renderer, never screenshots.
- `stem_md` supports KaTeX; keep notation light for our audience.

## 2. Question types (v1 → v2)

| Type | v | Notes |
|---|---|---|
| `mcq_single` | v1 | The workhorse |
| `mcq_multi` | v1 | "Select all that apply" (modern SHL uses these) |
| `numeric` | v1 | Typed answer (TITA); kills option-elimination gaming; used for drills & calculator-ban training |
| `drill` | v1 | Rapid-fire micro-questions (8–15s each): fraction↔percent, tables, squares, approximations. Speed-scored |
| `ds` | v1 | Data sufficiency: fixed 5-option format + decision-tree UI walkthrough |
| `set` | v1 | DI/RC/puzzle: one shared context, 3–5 child questions, set-level timing |
| `range` | v2 | Guesstimates: answer scored by order-of-magnitude band, with expected-reasoning rubric shown after |
| `step_sequence` | v2 | Learn Cards: arrange/choose the next solution step (completion problems, 02 §13) |
| `judgment` | v2 | Decision-making: options scored best/acceptable/poor with rationale (XAT-style) |

## 3. The answer flow (per question)

1. Stem shown. Timer starts silently (pacing bar opt-in; benchmark hidden by
   default to avoid anxiety).
2. Optional hint ladder (§7). Taking hints marks the attempt `assisted` —
   affects mastery credit, not rating (rating only moves on unassisted).
3. Student answers → **calibration tap** (Sure / Think so / Guessing) → reveal.
4. Feedback layers (§7). If wrong: **error-type tap** (concept/calc/misread/
   trap/time) → card created in redemption queue.
5. Next question. Median full cycle target: <75 seconds.

## 4. Adaptive engine: Elo, per-skill

Chess.com/Duolingo-style. Chosen over IRT because it's incremental, online,
explainable, and self-calibrates question difficulty with zero psychometrician.

- Student has a rating per **skill** `R_s` (initialized from onboarding
  diagnostic; default 1000), aggregated to topic/domain ratings by
  attempt-weighted average. Displayed ratings are domain-level.
- Question has rating `R_q` (authored seed: easy 1000 / medium 1200 / hard 1400
  by the author's judgment; drifts with data).
- Expected score `E = 1 / (1 + 10^((R_q − R_s)/400))`.
- Update: `R_s += K_s (S − E)`, `R_q −= K_q (S − E)` where S ∈ {0,1};
  `K_s` = 32 for <30 attempts on the skill, then 16; `K_q` = 8, → 2 after 200
  attempts, 0 when locked. Time factor: a correct answer slower than 2× benchmark
  counts S = 0.7 (right but not test-ready).
- **Selection:** next adaptive question sampled from candidates with
  `P(correct) ∈ [0.65, 0.85]` (flow band), excluding: seen in last 60 days,
  same subtopic as previous question (interleave), flagged questions. Stretch
  slot samples `P ∈ [0.40, 0.55]`.
- Domain rating shown with a "provisional" tag until 50 attempts (RD proxy —
  full Glicko is unnecessary complexity for v1).

**Percentiles:** nightly materialized stats per degree-cohort (BBA/BCom/BA…,
collected at onboarding) → "top 18% of BBA students in Quant." Never compare
across degree cohorts by default.

## 5. Mastery model (per skill)

| State | Entry criteria |
|---|---|
| Unseen | no attempts |
| Learning | ≥1 attempt |
| Familiar | ≥8 attempts AND rolling-10 accuracy ≥ 60% |
| Proficient | ≥15 attempts AND rolling-10 accuracy ≥ 80% AND `R_s ≥ benchmark_rating` AND median time ≤ 1.25× benchmark |
| Mastered | Proficient + 2 maintenance probes correct (7d & 21d spaced) |
| Rusty | Mastered + failed probe OR 60 days untouched → re-enters daily mix |

Criteria are published in-product ("what does Mastered mean?") — earned progress
must be legible. Assisted (hinted) corrects count half toward accuracy windows.

## 6. Spaced repetition scheduler (SM-2-lite)

One scheduler, two queues (02 §2). Card = (user, question | skill-probe).

- Redemption card intervals: base `[1, 3, 7, 21]` days. Error type modulates:
  concept ×0.75 (sooner), misread/time ×1.25. Correct → next interval; wrong →
  reset to 1d and interval multiplier 0.8 on future steps. **Redeemed** after 2
  consecutive spaced corrects → celebrated in-session ("You beat the question
  that beat you on Tuesday"), card archived.
- Maintenance probes: 7d / 21d / 60d / 120d per mastered skill, served as one of
  the 2 review slots. Fail → skill → Rusty.
- **No cron needed:** `due_at` timestamps; the daily-set builder queries
  `due_at <= now()` at request time. Overflow (>2 due) → oldest first, rest wait;
  a "Clear your review backlog (7 due)" optional session appears when backlog >5.

## 7. Hints & explanation layers

Hint ladder (each tap reveals next): ① reframe/nudge → ② method name →
③ first step worked → ④ full solution (converts to a Learn-Card walkthrough).
Explanation layers post-answer, in order: result + your time → your trap (if
distractor picked) → solution steps → **Shortcut** → Alternative method →
"Ask AI" (metered) for a personalized follow-up ("explain step 2 like I'm
confused about why we multiply").

## 8. Quality signals (auto-curation)

Per question, computed nightly: discrimination (do high-rated users get it right
more than low-rated? negative discrimination = broken question → auto-flag),
option distribution (a distractor picked by <2% is dead weight), flag reports
(users: "wrong answer / unclear / typo"), time outliers. `quality_score` < 0.7
→ pulled from selection, queued for founder review in admin. This is the
self-healing loop that lets a solo founder run a 4,000-question bank.

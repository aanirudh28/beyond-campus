# 12 — Content Pipeline

The SOP that lets one founder ship a balanced monthly drop without breaking
ten thousand old lives. Assumes ~5+ hrs/week of founder content time
(confirmed): ~5 approved cards/week, one drop/month, two seasons/year.
The harness (doc 04 §4) is the playtester; docs 02 and 03 are the rulebook.

## 1. The authoring workflow (per card)

```
idea → theme-slot check (03 §2) → Haiku draft (prose only, §2)
     → economy budget check (02 §5) → flag registry (03 §5)
     → harness run + balance report (§3) → founder review (§4) → merge queue
```

A card idea that can't name its theme slot and its tradeoff in one sentence
each doesn't proceed. Target throughput: draft 8, approve 5, ship 5.

## 2. Haiku-assisted drafting (prose only — hard line)

AI drafts **text fields only**: `title`, `base`, option `label`s, `outcome`
lines, and (for endings) `blurb`. **Numbers are hand-authored, always** —
effects, conditions, thresholds, rarity priors. This is the same rule as
runtime (doc 05 §1) applied at authoring time: the economy is never
generated.

Draft prompt template (run via any Claude surface; not productized):

```
You draft cards for "20 Years in 60 Minutes", a career life-sim for Indian
BBA/BCom students. Voice: second person, present tense, Indian texture
(EMIs, Diwali bonuses, batchmates, "settle down" calls), ₹ LPA money, no em
dashes, never moralize — consequences speak.

Card spec:
- Chapter: {n} ({title}, ages {a}-{b}, years {y1}-{y2})
- Theme slot: {slot}   Dilemma: {one-sentence tradeoff}
- Pivotal: {yes/no}    Condition: {profile/flag gate or none}

Write: title (mono-label, <5 words), base narration (3-4 sentences),
2 option labels (<60 chars, both genuinely tempting), and an outcome line
per option (1-2 sentences, states the consequence plainly, works with NO
AI narration around it).
The reader must think "that's exactly what would happen to me."
```

Founder edits the draft, authors the numbers against the budget table
(doc 02 §5), registers flags, writes the `Card` object.

## 3. Balance QA: the harness is the playtester

Before review, run `npx tsx scripts/life-sim-test.ts --baseline master`.
The **balance report** (format owned by doc 04 §4) is the review artifact:

- All invariant checks green (reachability, distribution bounds, fairness,
  orphan flags, budgets, policy stability).
- Ending histogram before/after with per-ending drift flagged >1.5pp.
- The new card's option EV split and predicted pick contexts.
- For ending additions: which existing endings lose share to the new matcher
  (first-match order means every insertion steals from someone below it).

Real-world data closes the loop after shipping: the content-balance board
(doc 08 §4) compares predicted vs actual option splits; >80/20 real splits
send the card back to rewrite.

## 4. Review rubric (founder, per card/ending)

1. Litmus rule: recognizable → sendable? (doc 01 §6)
2. Both options genuinely tempting to *someone*? (no right answer + trap)
3. Outcome lines complete without AI narration? (doc 05 §5 fallback bar)
4. Numbers within budgets and consistent with salary-band reality? (02 §3, §5)
5. Flags registered, conditions minimal, theme slot not oversubscribed?
6. Voice: no em dashes, no moralizing, texture specific not costume?

## 5. The CONTENT_VERSION ritual (per drop)

Every content or engine-math change ships as one monthly drop with one
version bump (doc 04 §2 — there are no additive-safe changes):

1. Branch + PR; CI invariant gate green (doc 11 §4).
2. **Old-link protection sign-off:** confirm stored-render fields are being
   persisted by the `ending` route (doc 04 §3) — this is what makes bumps
   safe for every existing share link.
3. Bump `CONTENT_VERSION` in `chapters.ts`; changelog entry appended below
   the constant: `// v3 (2026-08): +6 ch3 cards, +2 endings (money family),
   rebalanced fno_burn`. The changelog is the version history — keep it.
4. Merge → auto-deploy. In-flight saves invalidate with the doc 06 §6 copy
   ("your world updated"); accepted cost, at most 24h of saves.
5. Post-drop: watch the balance board for a week; drift beyond invariant
   bounds on *real* data triggers a hotfix drop, not a wait.

Passive-rate or prior changes (doc 04 §5's dangerous levers) additionally
require: a full 27-profile harness comparison in the PR description and an
explicit "I intend to change every run" sentence — no drive-by tuning.

## 6. Cadence & seasons

- **Monthly drop:** ~15–20 cards + 2–3 endings + report-rule additions.
  Aligned to seasonal windows where possible (doc 10 §5).
- **Two seasons/year** (doc 03 §6): a drop plus base-year shift, topical
  event rotation, season badge, and a launch push. Season drops get a
  double-length QA week and a full AI-off playthrough (doc 05 §5).
- Endings target: 32 → 48+ within 6 months (confirmed pace), then slow to
  taste — the collection must stay completable in principle.

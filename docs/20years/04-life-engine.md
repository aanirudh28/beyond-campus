# 04 — The Life Engine

Canonical spec of the deterministic engine: what may never change, and how
everything else changes safely. The single most load-bearing decision in this
doc is §3 (stored-render for old links) — docs 06, 11, and 12 all inherit it.

## 1. The determinism contract (frozen)

> **Same `(seed, profile, choices)` ⇒ byte-identical life, on any client and
> on the server, forever within a CONTENT_VERSION.**

As built:

- 31-bit seed → `mulberry32` PRNG (`lib/life/rng.ts`); per-chapter streams via
  `chapterRng(seed, chapter)` = `mulberry32(seed ^ ((chapter+1) * 0x9e3779b9))`;
  ghosts use a separate `seed ^ 0xc0ffee` stream.
- `dealChapter` filters the chapter pool by live conditions, `seededShuffle`s
  with the chapter stream, interleaves events at stable positions.
- Passive between-chapter time (appraisals, accrual, burnout decay) draws from
  its own seeded stream so it can never collide with card draws.
- `replayRun` / `replayToChapter` rebuild state from the triple and throw
  `ReplayError` on drift — used server-side as anti-cheat (the API never
  trusts client stats: `app/api/life/ending/route.ts`) and client-side for
  save/resume validation.
- Verified by `scripts/life-sim-test.ts` (2,000 random runs replay
  byte-identically).

**Frozen API surface** (changing any of these = new CONTENT_VERSION *and* a
migration note in doc 12's changelog):

- `Stats` keys and their clamping rules (0–100 stats clamp; savings floor −30;
  salary floor 0)
- `Effects` semantics including `salary: {mult}` multiplicative form
- Condition evaluation order and `EndingMatch` first-match-wins semantics
- RNG stream derivation constants and the shuffle algorithm
- Trail capture points (chapter boundaries)

## 2. The stream-isolation invariant

**Adding cards to a chapter pool must not reshuffle what existing seeds deal
from the previous pool.** Today `seededShuffle` over the filtered pool means
any pool change reorders everything — which is *why* every content change
bumps CONTENT_VERSION and invalidates saves. That is acceptable for live
saves (24h TTL) but NOT for public share links (§3). Two consequences:

1. There is no "additive-safe" card change. All content edits are
   version-bumping edits. Doc 12's ritual assumes this.
2. Old versions are never re-simulated. Reproducing a v2 life under v3
   content is impossible by construction — so old lives must be *stored*,
   not recomputed.

## 3. CONTENT_VERSION policy: stored-render for public pages (DECISION)

**Decision: public share pages render from data persisted at completion time,
and never re-simulate.** Rejected alternative: archiving content snapshots
per version and replaying old runs against them — more machinery, more repo
weight, and it still breaks if engine math changes.

What this requires (executed in doc 11 §2):

- At completion, `POST /api/life/ending` persists to `life_runs` everything
  the public page needs: `trail` (currently rebuilt by replay in
  `app/api/life/[id]/route.ts` — stop doing that), ghost summaries (ending id
  + net-worth delta per ghost), the challenge URL params, and
  `content_version`.
- `GET /api/life/[id]` becomes a pure read. No engine import, no replay, no
  version sensitivity. Old links render identically forever.
- Live localStorage saves stay version-gated exactly as today
  (`CONTENT_VERSION` check in `bc20_run`, 24h TTL, `rebuildFromSave` discards
  on drift). A version bump costs at most one in-flight run; copy for that
  state is specified in doc 06 §6.

Semantics of `CONTENT_VERSION` after this change: it gates *live replay only*
(saves, resume, challenge links, server anti-cheat), not display of history.
Challenge links (`?l=seed.profile`) always deal from the *current* version —
a friend challenged across a version bump plays the current deck; that is
acceptable and disclosed nowhere (nobody diffs decks).

## 4. The invariant suite (harness growth)

`scripts/life-sim-test.ts` currently asserts determinism and prints the
ending distribution. Extend it into the release gate (CI wiring in doc 11 §4)
with these named checks:

| Check | Source | Fails when |
|---|---|---|
| `replay-identity` | as built | any of 2,000 runs fails byte-identical replay |
| `ending-reachability` | doc 02 §4.1 | any ending id has zero occurrences |
| `distribution-bounds` | doc 02 §4.2–3 | any ending >12%; catch-alls >20% combined; tone mix outside 40/35/25 ±8pp |
| `profile-fairness` | doc 02 §4.4 | any profile's bad-tone rate >15pp above global |
| `orphan-flags` | doc 03 §5 | a flag is set but never read, or read but never set |
| `effect-budgets` | doc 02 §5 | any card option exceeds magnitude budgets (static check) |
| `policy-stability` | doc 02 §6 | fixed-policy tone varies materially across 100 seeds |
| `stat-sanity` | — | any simulated state escapes clamps, or NaN/negative-age states |

Output format (the "balance report" doc 12 §3 consumes): per-check pass/fail,
ending histogram before/after when run with `--baseline <ref>`, per-card
option pick-rates and EV deltas, flagged deviations. Exit non-zero on any
failure — CI blocks merge.

## 5. Tuning levers and their blast radius

| Lever | Where | Blast radius |
|---|---|---|
| Card effects / options | `cards-ch*.ts` | that card's runs; version bump |
| Ending matchers / order | `endings.ts` | distribution only — old runs keep stored endings (§3); version bump |
| Profile priors | `createInitialState` | every run; full rebalance; version bump |
| Passive rates (appraisal/accrual/decay) | `engine.ts` | every run, compounding; the most dangerous lever — rebalance + explicit sign-off (doc 12 §5) |
| Deal counts per chapter | `chapters.ts` | run length + economy totals; treat like passive rates |
| `baselineRarity` priors | `endings.ts` | display only, no simulation impact; no version bump needed |

## 6. Extension points (what the schema tolerates)

Designed-in headroom — allowed without engine redesign, each still a version
bump:

- **New conditions** on `Condition`/`EndingMatch` (additive fields, default
  no-op) — e.g. `minAge`, `chapterRange`.
- **New flags** — free, subject to the registry (doc 03 §5).
- **Per-option conditions** (an option visible only if a flag holds): schema
  addition to `CardOption`; engine change is small; UX must show 2 options
  minimum after filtering.
- **New personas** = new `Profile['stream']` values (doc 03 §4): touches
  priors, conditions, and the profile-fairness invariant.

Explicitly out: multi-card branching chains (state machine inside a chapter),
mid-chapter stat reveals, and anything that makes a card's outcome depend on
future dealt cards — these break the "card = legible self-contained tradeoff"
model (doc 02 §5).

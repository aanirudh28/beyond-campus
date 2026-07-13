# 03 — The Content Universe

The taxonomy of cards, endings, and flags as built, and every axis along which
the universe expands. Sequencing is a settled decision (§1); doc 12 owns the
production SOP; doc 02 owns the balance rules every expansion obeys.

## 1. Expansion sequencing (decision)

> **Depth → endings → seasons machinery → one new persona → localization.**

Confirmed with founder: personas wait until the share loop is proven
(roadmap P3), because off-ICP leads dilute the nurture funnel and every
persona multiplies balance surface. Cadence context: founder commits ~5+
hrs/week → monthly content drops, 32 → 48+ endings within 6 months, 2 major
seasons/year (doc 12 §6).

## 2. Axis 1 — Depth (more cards per chapter)

Current graph: 80 cards across 6 chapter files (`lib/life/content/cards-ch*.ts`),
~30 pivotal/forced, dealing 37 choices per run. Because deals are conditional
+ seeded, pool size beyond the deal count is pure replay value.

- **Target: 140 cards within 6 months** (roughly +10/month at ~5 approved
  cards/week alongside other work). Priority per chapter: raise each pool to
  ≥2× its deal count, deepest first where conditions fragment the pool
  (chapter 3 THE FORK and chapter 4 THE WEIGHT fragment most by profile).
- Every new card declares its **theme slot** — the dilemma family it belongs
  to (money-vs-time, loyalty-vs-leverage, visibility, health, family-pull,
  skill-bet, risk-appetite). No chapter pool may have >3 cards in one slot;
  variety of dilemma beats volume of cards.
- Depth cards prefer **conditions** over universality: a card only a
  `bcom/tier3` player sees is worth more than a 28th generic card, because it
  makes profile replay honest (doc 02 §6.2).

## 3. Axis 2 — Endings (32 → 48+)

Endings are cheap relative to cards (no economy impact — matchers read state,
they don't write it) and directly feed the collection loop and the SEO
surface (doc 10 §3).

**Ending families** — every ending belongs to one; new endings fill the
thinnest family first so 48 stays coherent rather than becoming a lottery:

| Family | Current members (examples) | Room to grow |
|---|---|---|
| Builder | founder, exit, beautiful_failure, hometown_king | franchise empire, the acquirer |
| Climber | corner_office, cxo paths, golden_handcuffs | the expat ladder, the IC-legend |
| Money | quiet_crorepati, screenshot_investor, emi_horizon, recession_alchemist | the FIRE-at-42, the lifestyle-creep |
| People | people_bank, board_whisperer, door_opener, professor_of_practice | the connector-of-record |
| Rooted | quiet_pillar, hometown_king, settled_one, present_parent | the family-business inheritor |
| Cautionary | burnout, comfortable_trap, machine_left_behind, ghost_of_linkedin | the perpetual-pivoter, the credential-collector v2 |
| Wildcard | open_road, remittance_years, one_person_channel, sandwich_generation | the second-passport, the accidental-civil-servant |

Rules for new endings: most-specific-first insertion order preserved; every
new matcher passes reachability + distribution invariants (doc 02 §4); blurb
written to the litmus rule; `baselineRarity` authored, then corrected by real
data (doc 08 §5). Old runs keep their stored endings across expansions
(doc 04 §3) — the collection denominator ("X of N") reads N from current
content, which is fine: discovery counts never shrink.

## 4. Axis 3 — Personas (Phase 3, not before)

First new persona: **engineering** (`stream: 'eng'`). Scope when it happens:

- Profile priors + condition audit: ~70% of cards are stream-agnostic by
  design; budget ~25 forked/new cards + 4–6 stream-gated endings
  (the-services-bench, the-product-switch...) per persona.
- The profile-fairness invariant (doc 02 §4.4) extends to the new stream
  before launch.
- **Leads hygiene:** persona lands in `leads` with distinct source tagging so
  the nurture drip can branch or exclude (doc 09 §4) — this was the reason to
  defer, so it's a launch blocker, not a nice-to-have.
- After eng, evaluate BSc/BA generalist before any further split. Cap: 4
  streams total; beyond that the balance matrix (streams × cities ×
  ambitions × invariants) outgrows a solo founder.

## 5. The flag registry (new, governed artifact)

`setFlags` names are currently implicit strings scattered across card files —
one typo silently kills an ending. Fix: **`lib/life/content/flags.ts`
exporting a `const FLAGS` registry** (name → `{ description, setBy: cardIds,
readBy: endingIds|reportRules|conditions }` — the setBy/readBy lists
generated, not hand-maintained). Rules:

- Cards and endings import flag names from the registry; raw string literals
  for flags become a lint error in `lib/life/content/`.
- The harness `orphan-flags` check (doc 04 §4) enforces set⇄read closure.
- Naming convention: `snake_case`, verb-or-state phrased from the player's
  life (`mentor_kept`, `bought_dip`, `ai_resisted`), no chapter prefixes
  (flags outlive chapters).
- Current census (~45 flags) gets backfilled with descriptions as the
  registry's seed content.

## 6. Axis 4 — Seasons ("Class of 20XX")

A season is an annual refresh, not a new game: base year shifts (2027→2051),
topical event cards rotate in behind conditions/flags, and a season badge
marks the collection. Machinery requirements (built in P2, first season
shipped after):

- Topical events (an AI-tools wave, a funding winter, a policy change) are
  ordinary event cards in the pool — no special engine support; they rotate
  via editing the pool + version bump like any content drop.
- Season identity lives in copy and `CONTENT_VERSION`-era metadata, not in
  the engine. Old seasons' public links survive automatically (doc 04 §3).
- **Chapter count stays 6, ages stay 21–45** (decision). A "45→65 DLC" is
  rejected: the audience is 20; the product's power is showing *their* next
  20 years, not their parents'. Revisit only if data shows organic demand.

## 7. Axis 5 — Localization

Hinglish first, and only in the AI narration layer (doc 05 §6) — authored
base text stays English so the content graph stays single-source. Since
narration is generated per-run, Hinglish is nearly free to pilot behind a
player toggle. Full-Hindi authored content is a separate, much larger project;
parked until Hinglish data justifies it.

## 8. Anti-goals

- No UGC cards, ever (doc 01 §7).
- No licensed/branded content (real company names in cards invite legal and
  dating problems; archetypes — "a Big-4 adjacent firm" — age better).
- No season FOMO mechanics (limited-time endings that vanish from the
  collection). Rotations add; they don't revoke.

# 07 — Multiverse & Social Systems

The "other lives" layer — ghosts, challenges, cohort decks, and the community
wall. This is the defensible layer: all of it rides on determinism (doc 04),
all of it costs zero AI, and none of it requires accounts.

## 1. Ghosts v2

As built: `simulateGhost` flips one pivotal choice and replays the same
seeded life; unseen alternate cards resolve via the dedicated ghost stream
(`seed ^ 0xc0ffee`); `ghostForkIndices` picks ≤2 forks (earliest + mid-life);
converged ghosts (same ending, <₹5L delta) are dropped.

v2 additions, in order:

1. **Named fork framing:** each ghost is titled by its fork card ("The life
   where you took the Gulf job") — data already present, copy change only.
2. **Third ghost slot — "the disciplined ghost":** a policy ghost that always
   picks the long-term-compounding option at every pivotal card. This is the
   sharpest Life Report companion ("the best version of your world ended as
   The Quiet Crorepati, ₹48L ahead") and it's one `simulateGhost` variant.
3. **Ghost of a friend:** when a challenge run completes, show the challenger's
   *actual* life beside yours (same seed ⇒ direct comparison is fair). Needs
   challenge lineage (§2). Still deterministic, still zero AI.

Ghost count stays ≤3 on the ending screen; more dilutes the gut-punch.

## 2. Challenge lineage (P0 schema change)

As built, challenge links (`?l=seed.stream.city.ambition`) are stateless — we
can't tell that a run *was* a challenge or show the challenger any results.
Fix: `parent_run_id uuid` column on `life_runs` (doc 11 §2), set at
`POST /api/life/start` when a challenge param carries the source run id
(extend the link format to `?l=seed.profile&c=<runId>`).

Unlocks, in order of value:

- **Challenge scoreboard on the share page:** "4 friends lived your life —
  2 beat your net worth, 1 burned out." Aggregate by `parent_run_id`, public,
  no names (privacy §5).
- **K-factor measurement** (doc 08 §4): challenges created → accepted →
  completed, the product's most important growth number.
- Ghost-of-a-friend (§1.3).

## 3. Cohort decks (the B2B2C bridge)

One seed, many players, compare endings — a classroom activity that sells
itself to TPOs and feeds the cohort business (doc 01 §3).

- **Mechanic:** a cohort link is just a challenge link with a label:
  `?l=seed.profile&g=<cohortId>` where `cohortId` is a random slug minted by
  a tiny `POST /api/life/cohort` (name in, slug out; row in `life_cohorts`,
  doc 11 §3). No auth — the link *is* the cohort, consistent with the
  identity decision.
- **The cohort page** (`/20years/c/[slug]`): ending distribution of everyone
  who played that deck ("Section B, 41 lives: 12 Comfortable Traps…"), tone
  split, aggregate net-worth spread. Anonymous by default.
- **Distribution:** founder/ambassador seeds cohort links to TPOs and class
  WhatsApp groups (doc 10 §5). A TPO dashboard is explicitly *not* built
  until a pilot proves demand (roadmap P3 gate).

## 4. Leaderboards: reframed, not built (decision)

**No global leaderboards.** A "richest simulated life" board poisons the
product's message (net worth ≠ the point — half the good endings are not
money endings) and invites grinding the deterministic system. Reframed
instead as **ending-diversity surfaces**:

- The community wall (§5) — what the multiverse chose, not who won.
- Cohort pages compare *distributions*, not ranked individuals.
- The collection ("X of 32") is the only personal score, and it's private.

## 5. The community wall & privacy stance

**Wall:** a section on the landing page + a `/20years/multiverse` page fed by
the analytics aggregates (doc 08): total lives lived, live ending histogram
with real rarity, "this week the multiverse chose safety: 61% took the stable
offer at 24." Pure read of aggregate data; strong social proof; zero PII.

**Privacy rules for a no-auth product (constitutional):**

- Public surfaces show aggregates or single anonymous runs only. A share page
  exposes exactly what the player chose to share (their own run URL).
- No names anywhere except self-entered challenge framing kept client-side.
- `email` and `ip_hash` never leave the server (`app/api/life/[id]/route.ts`
  safe-fields rule, as built — keep it).
- Challenge scoreboards show counts and deltas, never identities.

## 6. Anti-goals

- No realtime anything (doc 01 §7).
- No friend graphs, follows, or profiles — relationships live in WhatsApp,
  where they already are; we just make the artifacts worth sending.
- No cohort moderation surface (no user content exists to moderate — the wall
  and cohort pages render only computed data).

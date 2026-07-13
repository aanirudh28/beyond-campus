# 08 — Analytics & Events

The product currently has **zero** instrumentation. This doc specifies the
event taxonomy (frozen names), the in-house storage, and the two dashboards
that consume it. It must exist before doc 10 (K-factor definition) and
doc 14 (exit metrics) can mean anything — build it first in P0.

## 1. Principles

- **Every chart answers a decision** (apti doc 06 rule). Two audiences:
  founder tuning (content balance) and founder growth (funnel/loops). No
  vanity surfaces.
- **In-house, no third parties** (decision): one `life_events` table written
  by the API routes we already own. No GA, no PostHog — consistent with repo
  patterns, zero cost, zero consent-banner complexity.
- **No PII in events.** `run_id` is the only identifier; email exists solely
  in `life_runs`/`leads` as built. Raw IP never stored (ip_hash stays on
  `life_runs` only).
- **Frozen names.** Renaming an event after launch is forbidden; add a new
  event and deprecate in comments instead.

## 2. Transport (decision)

**One new endpoint `POST /api/life/events`** taking a batch
`{runId?, events: [{n, p?}]}`, fire-and-forget from the client
(`navigator.sendBeacon` where possible so abandons get flushed). Rejected
alternative: piggybacking events onto scene/ending calls — it can't capture
abandons or share clicks (which happen when no game call is in flight), and
the route is trivial. Server-side events (start, ending, claim) are written
inline by their existing routes — no client trip. Rate-limited by the same
ip-hash pattern as `start`; invalid names dropped silently.

## 3. The event taxonomy (~16 events)

| Event | Props | Written by |
|---|---|---|
| `run_started` | profile, seeded (bool), parent_run_id? | server (`start`) |
| `profile_completed` | profile | client |
| `chapter_completed` | chapter | client |
| `card_answered` | cardId, optionId, chapter | client |
| `run_abandoned` | chapter, cardsAnswered | client (beacon on unload w/ incomplete run) |
| `ending_reached` | endingId, tone, contentVersion | server (`ending`) |
| `ghost_viewed` | forkCardId | client |
| `share_clicked` | channel: whatsapp\|image\|copy\|challenge | client |
| `challenge_created` | — | client (challenge link copied/sent) |
| `challenge_accepted` | parent_run_id | server (`start` w/ `c=` param) |
| `report_viewed` | itemCount | client |
| `report_claimed` | — | server (`claim`) |
| `report_cta_clicked` | href | client |
| `collection_viewed` | discovered | client |
| `ai_fallback` | callType, reason | server (`scene`/`ending`) |
| `og_page_view` | runId | server (`[id]` route) |

Prop values are enums/ids/ints only — no free text.

## 4. The two dashboards (founder-only, `/admin` pattern)

**Run funnel:** start → profile → ch1…ch6 → ending → {share, claim, replay},
absolute + rates, split by profile and by seeded/organic. Headline numbers:
completion rate, share rate, claim rate, **K-factor = challenge_accepted /
ending_reached** (the north-star multiplier, doc 01 §5), and challenge
completion rate.

**Content-balance board** (feeds doc 02's invariants with *real* data, where
the harness uses simulated data):

- Per-card option split vs harness-predicted split — a card where 90% of real
  players pick one option is a failed tradeoff (doc 02 §5); flag at >80/20.
- Real ending frequency vs `baselineRarity` vs harness distribution.
- Abandon heatmap by card — the card where runs die is a writing problem.
- `ai_fallback` rate by call type (doc 05 §8 observability).

Implementation: SQL views over `life_events` + `life_runs`, rendered in the
existing admin surface. No cron — computed on read.

## 5. Rarity switchover (formalized)

`lib/life/rarity.ts` blends authored priors with real counts (pseudo-count
20, threshold 200 global). Formalize: **real frequency takes over at N≥200
completed runs *per profile-bucket* (stream×city), falling back to global
N≥200, else authored prior.** Rationale: rarity shown to a tier-3 bcom player
should reflect lives like theirs once data allows; before that, honest priors
beat noisy truth. The `life_ending_counts` view grows a profile dimension
(doc 11 §3).

## 6. Retention & hygiene

- `life_events` rows are kept 12 months, then aggregated into monthly rollup
  rows and deleted (manual SQL ritual, documented in doc 11 §6 — no cron).
- Dashboards must stay sub-second on 1M events: indexes specified in
  doc 11 §3; if they outgrow that, pre-aggregate into the rollup table on
  read-through, still no cron.

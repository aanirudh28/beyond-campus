# 11 — Architecture Evolution

Paste-ready technical plan within the hard constraints: Vercel Hobby (2-cron
limit, both used — **nothing in this doc may ever want a cron**), Supabase
with no migration tooling (founder pastes SQL manually), Next.js 16.2.1
(read `node_modules/next/dist/docs/` before touching routes), service-role
pattern for all life tables (RLS on, no policies).

## 1. Current state

```
client (play page, localStorage save)
   │ HMAC run token (CRON_SECRET-signed, 4h)
   ▼
app/api/life/{start,scene,ending,claim,[id]}  ── serviceClient() ──▶ life_runs
   │ start: ip-hash 10/day · scene/ending: life_consume_ai_call (8, 6h)
   ▼
Anthropic haiku-4-5 (scenes, epilogue) · leads table (claim → nurture cron)
```

## 2. The consolidated schema change (paste once)

One block, appended to `supabase/life-schema.sql` and pasted in the SQL
editor. Covers: stored-render fields (doc 04 §3), challenge lineage
(doc 07 §2), events (doc 08), AI cache (doc 05 §3), cohorts (doc 07 §3),
collections link (doc 06 §5).

```sql
-- ============ 20years v2: multiverse + analytics (run once) ============

-- Stored-render + lineage on life_runs
alter table life_runs
  add column if not exists trail jsonb,
  add column if not exists ghosts jsonb,          -- [{forkCardId, endingId, savingsDelta}]
  add column if not exists challenge text,        -- 'seed.stream.city.ambition'
  add column if not exists content_version int,
  add column if not exists parent_run_id uuid references life_runs(id);

create index if not exists idx_life_runs_parent on life_runs (parent_run_id)
  where parent_run_id is not null;

-- Events (doc 08) — service-role only, like everything here
create table if not exists life_events (
  id bigint generated always as identity primary key,
  run_id uuid,
  n text not null,            -- event name (frozen enum, doc 08 §3)
  p jsonb,                    -- props
  created_at timestamptz not null default now()
);
create index if not exists idx_life_events_n_t on life_events (n, created_at);
create index if not exists idx_life_events_run on life_events (run_id);
alter table life_events enable row level security;

-- AI response cache (doc 05 §3)
create table if not exists life_ai_cache (
  bucket text primary key,    -- chapter:profile:pivotal-digest hash
  narrations jsonb not null,
  created_at timestamptz not null default now()
);
alter table life_ai_cache enable row level security;

-- Cohort decks (doc 07 §3)
create table if not exists life_cohorts (
  slug text primary key,
  name text not null,
  seed integer not null,
  profile jsonb not null,
  created_at timestamptz not null default now()
);
alter table life_cohorts enable row level security;

-- Cross-device collections for linked emails (doc 06 §5)
create table if not exists life_collections (
  email text primary key,
  ending_ids jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table life_collections enable row level security;

-- Rarity by profile bucket (doc 08 §5) — replaces life_ending_counts reads
create or replace view life_ending_counts_by_profile as
  select ending_id,
         (profile->>'stream') as stream,
         (profile->>'city') as city,
         count(*)::int as n
  from life_runs
  where completed_at is not null and ending_id is not null
  group by 1, 2, 3;
```

## 3. Route changes

| Route | Change | Doc |
|---|---|---|
| `POST /api/life/start` | accept `c=<parentRunId>`, set `parent_run_id`; write `run_started` event | 07 §2, 08 |
| `POST /api/life/scene` | check `life_ai_cache` bucket before Anthropic; write on miss; `ai_fallback` events; prompt-cache breakpoints | 05 §3, §8 |
| `POST /api/life/ending` | persist `trail`, `ghosts`, `challenge`, `content_version`; `ending_reached` event | 04 §3 |
| `GET /api/life/[id]` | pure read of stored fields — **delete the replay/engine import**; `og_page_view` event | 04 §3, 06 §7 |
| `POST /api/life/claim` | optional account-link token flow; sync `life_collections`; drip branch tag | 06 §5, 09 §4 |
| `POST /api/life/events` | **new** — batched, beacon-friendly, ip-hash rate-limited, enum-validated | 08 §2 |
| `POST /api/life/cohort` | **new** — mint slug, insert `life_cohorts` | 07 §3 |
| `GET /20years/c/[slug]` | **new page** — cohort distribution (reads runs by challenge match) | 07 §3 |
| `GET /20years/endings/[slug]` | **new pages** — SEO surface, ISR, counts on read | 10 §3 |

All routes stay `runtime='nodejs'`, service-role via `serviceClient()`,
authenticated by run token where applicable — no new auth model.

## 4. CI: the determinism gate

GitHub Actions (repo already on GitHub; Vercel deploys are untouched):

```yaml
# .github/workflows/life-invariants.yml
on:
  push: { paths: ['lib/life/**', 'scripts/life-sim-test.ts'] }
  pull_request: { paths: ['lib/life/**'] }
jobs:
  invariants:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx tsx scripts/life-sim-test.ts --ci
```

`--ci` runs the full invariant suite (doc 04 §4) and exits non-zero on any
failure. Because the repo deploys on push to master (no staging), the *habit*
is: content changes go through a branch + PR so the gate runs before merge;
the balance report in the job output is the review artifact (doc 12 §3).

## 5. Abuse posture at scale

- ip-hash 10 runs/day holds to ~10k runs/day; beyond that add per-IP event
  rate limits on `/api/life/events` (same helper) and a token requirement on
  event writes tied to `runId`.
- HMAC run tokens (4h) + server replay already prevent forged results; the
  new stored fields are written only by the `ending` route after `replayRun`
  succeeds, so stored-render does not weaken anti-cheat.
- `life_ai_cache` capped by monthly sweep (§6); cache poisoning impossible
  (server-generated content only).

## 6. Operational rituals (manual, no crons)

Documented here so they're real:

- **Monthly:** events rollup + 12-month purge (doc 08 §6); `life_ai_cache`
  sweep (`delete where created_at < now() - interval '60 days'`). Two
  copy-paste SQL blocks kept at the bottom of `life-schema.sql`.
- **Per content drop:** CONTENT_VERSION bump checklist (doc 12 §5) including
  the old-link protection sign-off: confirm `ending` route persists all
  stored-render fields *before* the bump ships.

## 7. Next.js 16 gotchas (for these routes)

- Read `node_modules/next/dist/docs/` before edits (AGENTS.md warning —
  breaking changes vs training data).
- Dynamic OG images and ISR ending pages: verify the 16.2 metadata/OG API
  shape in the local docs, don't assume 14.x patterns.
- `proxy.ts` (Next 16 middleware) guards `/dashboard` and `/tracker` only —
  20years routes stay public; don't add them to the matcher.

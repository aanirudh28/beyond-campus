-- ============================================================
-- 20 YEARS IN 60 MINUTES (career life-sim) — run this once in
-- the Supabase SQL editor:
-- https://supabase.com/dashboard/project/jpznmvkngoeoeprrckiv/sql
-- ============================================================

create table if not exists life_runs (
  id uuid primary key default gen_random_uuid(),
  seed integer not null,
  profile jsonb not null,
  choices jsonb,
  final_stats jsonb,
  ending_id text,
  epilogue text,
  one_liner text,
  ai_calls integer not null default 0,
  email text,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_life_runs_ip_day on life_runs (ip_hash, created_at);
create index if not exists idx_life_runs_ending on life_runs (ending_id) where completed_at is not null;

-- Service-role only: RLS on, no policies. All access goes through API routes.
alter table life_runs enable row level security;

-- Atomic AI budget: each Claude call spends one of the run's 8 credits.
-- Returns true when a credit was consumed, null when the budget is spent
-- or the run is older than 6 hours.
create or replace function life_consume_ai_call(run uuid)
returns boolean
language sql
security definer
as $$
  update life_runs
  set ai_calls = ai_calls + 1
  where id = run
    and ai_calls < 8
    and created_at > now() - interval '6 hours'
  returning true;
$$;

-- Ending rarity percentiles, computed over completed runs.
create or replace view life_ending_counts as
  select ending_id, count(*)::int as n
  from life_runs
  where completed_at is not null and ending_id is not null
  group by ending_id;

-- ============================================================
-- v2: multiverse + analytics (docs/20years/11 §2) — run once,
-- BEFORE deploying the stored-render code.
-- ============================================================

-- Stored-render + lineage on life_runs (doc 04 §3, 07 §2)
alter table life_runs
  add column if not exists trail jsonb,
  add column if not exists ghosts jsonb,
  add column if not exists challenge text,
  add column if not exists content_version int,
  add column if not exists parent_run_id uuid references life_runs(id);

create index if not exists idx_life_runs_parent on life_runs (parent_run_id)
  where parent_run_id is not null;

-- Events (doc 08) — service-role only
create table if not exists life_events (
  id bigint generated always as identity primary key,
  run_id uuid,
  n text not null,
  p jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_life_events_n_t on life_events (n, created_at);
create index if not exists idx_life_events_run on life_events (run_id);
alter table life_events enable row level security;

-- AI response cache (doc 05 §3) — wired in P2, table pasted now
create table if not exists life_ai_cache (
  bucket text primary key,
  narrations jsonb not null,
  created_at timestamptz not null default now()
);
alter table life_ai_cache enable row level security;

-- Cohort decks (doc 07 §3) — wired in P2, table pasted now
create table if not exists life_cohorts (
  slug text primary key,
  name text not null,
  seed integer not null,
  profile jsonb not null,
  created_at timestamptz not null default now()
);
alter table life_cohorts enable row level security;

-- Cross-device collections for linked emails (doc 06 §5) — wired in P1
create table if not exists life_collections (
  email text primary key,
  ending_ids jsonb not null default '[]',
  updated_at timestamptz not null default now()
);
alter table life_collections enable row level security;

-- Rarity by profile bucket (doc 08 §5)
create or replace view life_ending_counts_by_profile as
  select ending_id,
         (profile->>'stream') as stream,
         (profile->>'city') as city,
         count(*)::int as n
  from life_runs
  where completed_at is not null and ending_id is not null
  group by 1, 2, 3;

-- Dashboard views (doc 08 §4) — computed on read, no cron
create or replace view life_event_daily as
  select n, date_trunc('day', created_at) as day, count(*)::int as c
  from life_events
  group by 1, 2;

create or replace view life_card_splits as
  select (p->>'cardId') as card_id,
         (p->>'optionId') as option_id,
         count(*)::int as n
  from life_events
  where n = 'card_answered'
  group by 1, 2;

create or replace view life_abandons as
  select coalesce(p->>'chapter', '?') as chapter,
         count(*)::int as n
  from life_events
  where n = 'run_abandoned'
  group by 1;

create or replace view life_chapter_completions as
  select coalesce(p->>'chapter', '?') as chapter,
         count(*)::int as n
  from life_events
  where n = 'chapter_completed'
  group by 1;

create or replace view life_share_channels as
  select coalesce(p->>'channel', '?') as channel,
         count(*)::int as n
  from life_events
  where n = 'share_clicked'
  group by 1;

create or replace view life_ai_fallbacks as
  select coalesce(p->>'callType', '?') as call_type,
         coalesce(p->>'reason', '?') as reason,
         count(*)::int as n
  from life_events
  where n = 'ai_fallback'
  group by 1, 2;

-- ============================================================
-- Operational rituals (doc 11 §6) — run MANUALLY, monthly.
-- Never scheduled: both Vercel crons are taken.
-- ============================================================
-- 1) Events purge (keep 12 months):
--    delete from life_events where created_at < now() - interval '12 months';
-- 2) AI cache sweep (keep 60 days):
--    delete from life_ai_cache where created_at < now() - interval '60 days';

-- ---- v3: the Second Generation (paste before deploying the legacy update) ----
-- A completed run can raise the next one. The child's dealt hand is the
-- parent's ledger, converted; stored here so the anti-cheat replay
-- reconstructs the exact same starting state.
alter table life_runs add column if not exists inheritance jsonb;

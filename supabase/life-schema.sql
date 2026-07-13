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

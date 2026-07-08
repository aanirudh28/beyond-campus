-- ============================================================
-- Apti upgrade 3 — Daily Challenge + community counters
-- Run once in the Supabase SQL editor (after apti-upgrade-2.sql).
-- Safe to run before OR after deploying the matching code: the
-- challenge UI hides itself until this table exists.
-- ============================================================

-- One global row per IST day: the same 3 questions for every student.
-- Only ids are public — payloads stay locked behind the answer route.
create table if not exists apti_daily_challenges (
  challenge_date date primary key,
  question_ids uuid[] not null,
  created_at timestamptz not null default now()
);
alter table apti_daily_challenges enable row level security;
create policy "challenge ids are public" on apti_daily_challenges
  for select using (true);

-- The challenge reuses the daily-set pipeline wholesale (grading, Elo,
-- redemption): widen the allowed kinds/contexts.
alter table apti_daily_sets drop constraint if exists apti_daily_sets_kind_check;
alter table apti_daily_sets add constraint apti_daily_sets_kind_check
  check (kind in ('daily','topic','review','comeback','challenge'));

alter table apti_attempts drop constraint if exists apti_attempts_context_check;
alter table apti_attempts add constraint apti_attempts_context_check
  check (context in ('daily','topic','review','mock','speed','diagnostic','challenge'));

-- one challenge run per user per day
create unique index if not exists idx_apti_challenge_unique
  on apti_daily_sets(user_id, set_date) where kind = 'challenge';

-- presence counts + challenge leaderboards hit this daily
create index if not exists idx_apti_daily_sets_date
  on apti_daily_sets(set_date, kind) where completed_at is not null;

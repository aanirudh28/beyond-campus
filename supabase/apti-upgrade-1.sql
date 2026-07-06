-- ============================================================
-- Apti upgrade 1 — unlock multiple practice sessions per day
-- Run once in the Supabase SQL editor (after apti-schema.sql).
--
-- The original schema allowed one set per (user, date, kind), which blocks
-- a student from doing two topic sessions in one day. Only the DAILY set
-- must stay unique per day; topic/review sessions are unlimited.
-- ============================================================

alter table apti_daily_sets drop constraint if exists apti_daily_sets_user_id_set_date_kind_key;

create unique index if not exists idx_apti_daily_unique
  on apti_daily_sets(user_id, set_date) where kind = 'daily';

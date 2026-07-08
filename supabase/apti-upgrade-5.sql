-- ============================================================
-- Apti upgrade 5 — Study Circles (docs/aptitude/09 phase 2)
-- Run once in the Supabase SQL editor, after apti-schema.sql.
-- Safe to re-run.
--
-- The WhatsApp-native accountability scoreboard: 5-8 friends, an invite code,
-- a shared view of everyone's streak + sets this week + weekly rating delta,
-- and one "poke" a day. No chat inside the product — circles form around
-- existing WhatsApp groups; we provide the scoreboard, they bring the banter.
--
-- All three tables are service-role only (no client policies): the scoreboard
-- reads other members' RLS-protected profiles/sets, so it MUST be computed
-- server-side. The client only ever talks to /api/apti/circles.
-- ============================================================

create table if not exists apti_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists apti_circle_members (
  circle_id uuid not null references apti_circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  last_poke_at timestamptz,
  primary key (circle_id, user_id)
);
create index if not exists idx_circle_members_user on apti_circle_members(user_id);

create table if not exists apti_circle_pokes (
  id bigint generated always as identity primary key,
  circle_id uuid not null references apti_circles(id) on delete cascade,
  from_user uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_circle_pokes_circle on apti_circle_pokes(circle_id, created_at desc);

alter table apti_circles enable row level security;
alter table apti_circle_members enable row level security;
alter table apti_circle_pokes enable row level security;
-- no policies: service-role only, both directions (all access via API routes)

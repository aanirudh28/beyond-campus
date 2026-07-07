-- ============================================================
-- Apti upgrade 2 — mock test attempts + company targeting
-- Run once in the Supabase SQL editor (after apti-schema.sql).
-- Blueprints and company patterns live in code (lib/apti-mocks.ts,
-- lib/apti-companies.ts) — no content tables needed here.
-- ============================================================

create table if not exists apti_mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blueprint_slug text not null,
  kind text not null check (kind in ('checkpoint','section','mixed','company')),
  sections jsonb not null,                 -- [{name, question_ids, seconds}]
  answers jsonb,                           -- {qid: "B", ...} written at submit
  per_q_seconds jsonb,                     -- {qid: 41, ...}
  score numeric,
  max_score numeric,
  section_scores jsonb,                    -- [{name, correct, total}]
  report jsonb,                            -- full post-mock report
  deadline_at timestamptz not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists idx_apti_mock_user on apti_mock_attempts(user_id, started_at desc);

alter table apti_mock_attempts enable row level security;
create policy "own mock attempts select" on apti_mock_attempts
  for select using (auth.uid() = user_id);
-- all writes via service-role API routes (grading integrity)

-- company targeting on the profile (owner-editable preference)
alter table apti_profiles add column if not exists target_companies text[] not null default '{}';

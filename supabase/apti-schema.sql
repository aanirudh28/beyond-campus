-- ============================================================
-- Beyond Campus Aptitude ("Apti") — Phase 0/1 schema
-- Run once in the Supabase SQL editor (same workflow as tracker-schema.sql).
-- Design reference: docs/aptitude/12-architecture.md
-- ============================================================

-- ============ CONTENT: TOPICS / SKILLS / QUESTIONS ============
create table if not exists apti_topics (
  id uuid primary key default gen_random_uuid(),
  domain text not null check (domain in ('quant','logical','verbal','di','business')),
  slug text unique not null,
  name text not null,
  ord int not null default 0,
  meta jsonb not null default '{}'::jsonb   -- per-topic template (docs/aptitude/03)
);

create table if not exists apti_skills (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references apti_topics(id) on delete cascade,
  slug text unique not null,
  name text not null,
  ord int not null default 0,
  kind text not null default 'standard' check (kind in ('standard','drill')),
  benchmark_rating int not null default 1200,
  benchmark_seconds int not null default 60,
  prereq_skill_slugs text[] not null default '{}'
);
create index if not exists idx_apti_skills_topic on apti_skills(topic_id, ord);

-- payload carries the full question JSON (stem_md, options with traps,
-- answer, solution_md, shortcut_md, trap_explanations, hints...).
-- The API strips answers/traps/solutions before anything reaches the client.
create table if not exists apti_questions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references apti_skills(id) on delete cascade,
  type text not null default 'mcq_single'
    check (type in ('mcq_single','mcq_multi','numeric','drill','ds','set_child')),
  payload jsonb not null,
  rating int not null default 1200,
  rating_locked boolean not null default false,
  attempts int not null default 0,
  correct int not null default 0,
  time_benchmark_sec int not null default 60,
  quality_score numeric not null default 1.0,
  status text not null default 'draft'
    check (status in ('draft','reviewed','approved','retired')),
  seo_slug text unique,                      -- non-null = has a public page
  companies text[] not null default '{}',
  content_hash text not null,
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_apti_questions_skill_status on apti_questions(skill_id, status);
create index if not exists idx_apti_questions_rating on apti_questions(status, rating);
create unique index if not exists idx_apti_questions_hash on apti_questions(skill_id, content_hash);

create table if not exists apti_question_versions (
  question_id uuid not null references apti_questions(id) on delete cascade,
  version int not null,
  payload jsonb not null,
  changed_by text,
  created_at timestamptz not null default now(),
  primary key (question_id, version)
);

-- ============ USER STATE ============
create table if not exists apti_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  degree text,
  timeline date,                             -- "when is your first test?"
  lane text,                                 -- big4 | banking | fmcg | any | mba
  college text,
  whatsapp_optin boolean not null default false,
  ratings jsonb not null default '{}'::jsonb, -- {"quant":1140,"logical":1080,...}
  streak int not null default 0,
  longest_streak int not null default 0,
  freezes_left int not null default 2,
  last_set_date date,                        -- IST date of last completed set
  created_at timestamptz not null default now()
);

create table if not exists apti_skill_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id uuid not null references apti_skills(id) on delete cascade,
  rating int not null default 1000,
  attempts int not null default 0,
  correct int not null default 0,
  rolling jsonb not null default '[]'::jsonb, -- last 10 outcomes (1 | 0 | 0.5 assisted-correct)
  mastery text not null default 'unseen'
    check (mastery in ('unseen','learning','familiar','proficient','mastered','rusty')),
  times_ms jsonb not null default '[]'::jsonb, -- last 10 solve times (median → speed gate)
  probe_streak int not null default 0,
  last_practiced timestamptz,
  next_probe_at timestamptz,
  primary key (user_id, skill_id)
);

create table if not exists apti_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references apti_questions(id) on delete cascade,
  set_id uuid,                               -- daily set / session this belonged to
  context text not null default 'daily'
    check (context in ('daily','topic','review','mock','speed','diagnostic')),
  correct boolean not null,
  chosen jsonb,                              -- {"key":"B"} or {"value":42}
  time_ms int not null,
  confidence text check (confidence in ('sure','thinkso','guessing')),
  assisted boolean not null default false,   -- took a hint → no rating change, half mastery credit
  error_type text check (error_type in ('concept','calc','misread','trap','time')),
  rating_before int,
  rating_after int,
  created_at timestamptz not null default now()
);
create index if not exists idx_apti_attempts_user on apti_attempts(user_id, created_at desc);
create index if not exists idx_apti_attempts_question on apti_attempts(question_id);

create table if not exists apti_review_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid references apti_questions(id) on delete cascade,
  skill_id uuid references apti_skills(id) on delete cascade, -- null question_id ⇒ maintenance probe
  error_type text,
  interval_days numeric not null default 1,
  due_at timestamptz not null,
  correct_streak int not null default 0,
  redeemed boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_apti_review_due on apti_review_cards(user_id, due_at) where not redeemed;

create table if not exists apti_daily_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_date date not null,                    -- IST date
  kind text not null default 'daily' check (kind in ('daily','topic','review','comeback')),
  question_ids uuid[] not null,
  review_card_ids uuid[] not null default '{}',
  cursor int not null default 0,
  ratings_at_start jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  summary jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, set_date, kind)
);

-- ============ PRODUCT ANALYTICS (append-only, service-role writes) ============
create table if not exists apti_events (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_apti_events_name on apti_events(name, created_at desc);

-- ============ ROW LEVEL SECURITY ============
-- Content: topics/skills are public read; questions are service-role only
-- (answers live in payload — a public select would leak the answer key).
alter table apti_topics enable row level security;
alter table apti_skills enable row level security;
alter table apti_questions enable row level security;
alter table apti_question_versions enable row level security;

create policy "topics are public" on apti_topics for select using (true);
create policy "skills are public" on apti_skills for select using (true);
-- no select policy on apti_questions / apti_question_versions: service role only

-- User state: owners read; ALL writes go through service-role API routes so the
-- server is the only thing that can grade answers, move ratings, or tick streaks.
alter table apti_profiles enable row level security;
alter table apti_skill_state enable row level security;
alter table apti_attempts enable row level security;
alter table apti_review_cards enable row level security;
alter table apti_daily_sets enable row level security;
alter table apti_events enable row level security;

create policy "own apti profile select" on apti_profiles
  for select using (auth.uid() = user_id);
create policy "own apti profile insert" on apti_profiles
  for insert with check (auth.uid() = user_id);
create policy "own apti profile update basics" on apti_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- rating/streak integrity: clients may edit prefs, never scores
revoke update (ratings, streak, longest_streak, freezes_left, last_set_date)
  on apti_profiles from authenticated, anon;

create policy "own skill state select" on apti_skill_state
  for select using (auth.uid() = user_id);
create policy "own attempts select" on apti_attempts
  for select using (auth.uid() = user_id);
create policy "own review cards select" on apti_review_cards
  for select using (auth.uid() = user_id);
create policy "own daily sets select" on apti_daily_sets
  for select using (auth.uid() = user_id);
-- apti_events: no policies (service-role only, both directions)

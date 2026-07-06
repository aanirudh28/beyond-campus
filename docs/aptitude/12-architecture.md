# 12 — Engineering Architecture

Constraints honored: Vercel Hobby (2 crons, both used — nothing here needs a
cron slot), Supabase Postgres + RLS, service-role only in API routes with
`getAuthedUser()`, Haiku for AI, no migration tooling (SQL below is paste-ready
for the Supabase SQL editor, same workflow as `tracker-schema.sql`).

## Repo layout (mirrors tracker conventions)

```
app/aptitude/                      # public SEO pages (server components)
  page.tsx, [topic]/page.tsx, companies/[slug]/page.tsx, q/[slug]/page.tsx, tests/[vendor]/page.tsx
app/practice/                      # the app ('use client' pages, like /tracker)
  page.tsx (Today), set/[id]/page.tsx, map/page.tsx, mocks/..., stats/page.tsx
app/components/apti/               # QuestionCard, OptionList, CalibrationSheet,
                                   # RevealPanel, MasteryChip, RatingDelta, SetSummary,
                                   # MockShell, PaletteNav, ShareCard, Heatmap...
app/api/apti/                      # service-role routes (auth via getAuthedUser)
  daily-set/route.ts               # POST: build/fetch today's set
  answer/route.ts                  # POST: record attempt, run Elo, SRS, mastery (SECURITY: server computes everything; client sends only qid+choice+time+confidence)
  mock/[start|submit]/route.ts
  tutor/route.ts                   # Haiku AI tutor, metered via ai_generations pattern
  events/route.ts                  # product analytics ingest
app/api/admin/apti/                # founder question console (password-POST pattern for now; inherits the known admin-auth debt — fix rides the existing ticket)
lib/apti.ts                        # elo, srs, mastery, readiness, set-builder (pure functions + unit tests)
lib/apti-content.ts                # taxonomy loaders, question selection
supabase/apti-schema.sql           # everything below
docs/aptitude/                     # these docs
```

**Trust boundary rule (non-negotiable):** answers, ratings, mastery, streaks
are computed **server-side** in `/api/apti/answer`. The client never receives
`answer`/`trap_explanations`/`solution_md` before submitting (they'd be in the
network tab → trivial cheating → percentiles/leaderboards poisoned). Question
payloads to the client contain stem + options only; reveal content returns in
the answer response. Public SEO question pages are the curated exception.

## Schema (`supabase/apti-schema.sql` — abridged; full DDL to be generated at build time)

```sql
-- content (public read for approved; founder-write via service role)
create table apti_topics (
  id uuid primary key default gen_random_uuid(),
  domain text not null check (domain in ('quant','logical','verbal','di','business')),
  slug text unique not null, name text not null, ord int not null,
  meta jsonb not null default '{}'          -- per-topic template (doc 03)
);
create table apti_skills (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references apti_topics(id),
  slug text unique not null, name text not null, ord int not null,
  kind text not null default 'standard' check (kind in ('standard','drill')),
  benchmark_rating int not null default 1200,
  benchmark_seconds int not null default 60,
  prereq_skill_ids uuid[] not null default '{}'
);
create table apti_questions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references apti_skills(id),
  type text not null, payload jsonb not null,      -- full doc-04 schema
  rating int not null default 1200, rating_locked boolean default false,
  attempts int not null default 0, correct int not null default 0,
  time_benchmark_sec int not null,
  quality_score numeric not null default 1.0,
  status text not null default 'draft' check (status in ('draft','reviewed','approved','retired')),
  seo_slug text unique,                            -- non-null = has public page
  companies text[] not null default '{}',
  content_hash text not null,                      -- dedupe (doc 13)
  version int not null default 1,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table apti_question_versions (question_id uuid, version int, payload jsonb,
  changed_by text, created_at timestamptz default now(), primary key (question_id, version));

-- user state (RLS: user_id = auth.uid(); inserts set user_id explicitly)
create table apti_profiles (
  user_id uuid primary key references auth.users(id),
  degree text, timeline date, lane text,
  college text, whatsapp_optin boolean default false,
  ratings jsonb not null default '{}',             -- {quant:1140, logical:...}
  streak int default 0, longest_streak int default 0,
  freezes_left int default 2, last_set_date date,
  created_at timestamptz default now()
);
create table apti_skill_state (
  user_id uuid not null, skill_id uuid not null references apti_skills(id),
  rating int not null default 1000,
  attempts int default 0, correct int default 0,
  rolling jsonb not null default '[]',             -- last 10 outcomes
  mastery text not null default 'unseen',
  median_time_ms int, last_practiced timestamptz, next_probe_at timestamptz,
  primary key (user_id, skill_id)
);
create table apti_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null, question_id uuid not null,
  context text not null,                           -- daily|topic|review|mock|speed|diagnostic
  correct boolean not null, chosen jsonb, time_ms int not null,
  confidence text check (confidence in ('sure','thinkso','guessing')),
  assisted boolean default false, error_type text,
  rating_before int, rating_after int,
  created_at timestamptz default now()
);
create index on apti_attempts (user_id, created_at desc);
create index on apti_attempts (question_id);       -- question stats
create table apti_review_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, question_id uuid,
  skill_id uuid,                                   -- null qid = maintenance probe
  error_type text, interval_days numeric not null default 1,
  due_at timestamptz not null, correct_streak int default 0,
  redeemed boolean default false, created_at timestamptz default now()
);
create index on apti_review_cards (user_id, due_at) where not redeemed;
create table apti_daily_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, set_date date not null,
  kind text not null default 'daily',
  question_ids uuid[] not null, cursor int default 0,
  completed_at timestamptz, summary jsonb,
  unique (user_id, set_date, kind)
);

-- mocks & companies
create table apti_companies (id uuid primary key default gen_random_uuid(),
  slug text unique, name text, tier text, payload jsonb, status text default 'published');
create table apti_mock_blueprints (id uuid primary key default gen_random_uuid(),
  slug text unique, kind text, company_id uuid, blueprint jsonb, ord int);
create table apti_mock_attempts (id uuid primary key default gen_random_uuid(),
  user_id uuid not null, blueprint_id uuid not null,
  question_ids uuid[], answers jsonb, per_q_time jsonb,
  score numeric, section_scores jsonb, percentile numeric,
  started_at timestamptz default now(), submitted_at timestamptz, report jsonb);
create table apti_pattern_reports (id uuid primary key default gen_random_uuid(),
  user_id uuid, company_id uuid, season text, payload jsonb, created_at timestamptz default now());

-- misc
create table apti_events (id bigint generated always as identity primary key,
  user_id uuid, name text not null, props jsonb, created_at timestamptz default now());
create table apti_circles (id uuid primary key default gen_random_uuid(),
  name text, invite_code text unique, created_by uuid, created_at timestamptz default now());
create table apti_circle_members (circle_id uuid, user_id uuid, joined_at timestamptz default now(),
  primary key (circle_id, user_id));
```

RLS: enable on all user tables; `using (user_id = auth.uid())` select/insert/
update own rows. Content tables: public `select` where `status='approved'`
**via a view that strips answers** (`apti_questions_public`: id, skill, stem,
options-without-traps, type); full rows only through service role. Events:
insert-only via API. Circles: members can select their circle's member rows.

## Request flows

- **GET today:** `/api/apti/daily-set` → if today's row exists return it (with
  stems for unanswered cursor onward), else build: pull ≤2 due review cards →
  5 adaptive on focus skill (flow band, doc 04 §4) → 2 interleave → 1 stretch →
  insert row. Pure function in `lib/apti.ts` (`buildDailySet(userState, bank)`) —
  unit-testable, no cron.
- **POST answer:** validate set ownership + cursor → grade server-side → Elo
  updates (user skill + question, single transaction) → rolling window +
  mastery transition → SRS card create/advance → streak tick on set completion
  → return reveal payload (correctness, traps, solution, deltas). One route,
  one round-trip per question. p95 target <300ms.
- **Percentiles/question stats:** materialized views `apti_percentiles`
  (rating→percentile per degree) and `apti_question_stats`, refreshed by
  piggybacking on the existing 03:30 UTC reminders cron (a `refresh
  materialized view concurrently` call added to that route — chaining into an
  existing cron per house rule, not adding one).
- **AI tutor:** `/api/apti/tutor` → meter via existing `ai_generations`
  pattern → Haiku with system prompt carrying the question payload + the
  student's actual chosen answer + error tag ("explain against THEIR mistake,
  not generically") → log + return.

## Performance & scale notes

- Question bank fits in memory (~4k rows × ~4KB); cache the approved bank in a
  module-level map with 5-min TTL in the set-builder route — selection is then
  pure CPU, no N+1.
- `apti_attempts` is the only fast-growing table (10k DAU × 15/day = 150k
  rows/day worst case — fine for Postgres for years; partition by month if it
  ever matters).
- Public pages: static generation + `revalidate: 3600`; sample-question
  interactivity is a client island.
- Local build reminder: OneDrive `.next` lock → `rm -rf .next` on EPERM;
  dummy env vars per AGENTS.md.

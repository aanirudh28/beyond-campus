-- ============================================================
-- Beyond Campus Job Tracker — run this once in the Supabase SQL editor
-- ============================================================

-- ============ TRACKER PROFILES ============
create table if not exists tracker_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  is_pro boolean not null default false,
  weekly_goal int not null default 5,
  email_reminders_enabled boolean not null default true,
  last_reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ APPLICATIONS ============
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  job_url text,
  jd_text text,
  source text not null default 'other'
    check (source in ('linkedin','cold_email','portal','referral','career_page','other')),
  status text not null default 'saved'
    check (status in ('saved','applied','replied','interview','offer','rejected')),
  applied_at date,
  follow_up_date date,
  follow_up_count int not null default 0,
  contact_name text,
  contact_email text,
  notes text,
  salary_range text,
  sort_order double precision not null default extract(epoch from now()),
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_applications_user_status on applications(user_id, status);
create index if not exists idx_applications_user_followup on applications(user_id, follow_up_date);

-- ============ EVENT LOG (powers analytics funnel & timing insights) ============
create table if not exists application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('created','status_change','follow_up_sent','note')),
  from_status text,
  to_status text,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_user_created on application_events(user_id, created_at);

-- BEFORE trigger: stamp status_changed_at / applied_at / updated_at
create or replace function stamp_application_fields() returns trigger
language plpgsql as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    new.status_changed_at = now();
    if new.status = 'applied' and new.applied_at is null then
      new.applied_at = current_date;
    end if;
  end if;
  new.updated_at = now();
  return new;
end $$;

-- AFTER trigger: log events once the row exists (an event row references the
-- application via FK, so it cannot be written from a BEFORE trigger)
create or replace function log_application_event() returns trigger
language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    insert into application_events(application_id, user_id, event_type, to_status)
    values (new.id, new.user_id, 'created', new.status);
  elsif (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into application_events(application_id, user_id, event_type, from_status, to_status)
    values (new.id, new.user_id, 'status_change', old.status, new.status);
  end if;
  return new;
end $$;

drop trigger if exists trg_stamp_application_fields on applications;
create trigger trg_stamp_application_fields
  before insert or update on applications
  for each row execute function stamp_application_fields();

drop trigger if exists trg_log_application_event on applications;
create trigger trg_log_application_event
  after insert or update on applications
  for each row execute function log_application_event();

-- Applications are unlimited for everyone — monetization is on AI features
-- (metered via ai_generations) and analytics, which is where costs accrue.

-- ============ AI GENERATIONS (history + monthly metering + insight cache) ============
create table if not exists ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  kind text not null check (kind in ('extract','cold_email','follow_up','linkedin_dm','weekly_insight')),
  output jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_user_month on ai_generations(user_id, created_at);

-- ============ NURTURE EMAILS (drip sequences, sent by daily cron) ============
create table if not exists nurture_sends (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  sequence text not null,
  step int not null,
  sent_at timestamptz not null default now(),
  unique (email, sequence, step)
);
create index if not exists idx_nurture_email on nurture_sends(email);

create table if not exists nurture_optouts (
  email text primary key,
  created_at timestamptz not null default now()
);

-- service-role only: RLS on, no policies
alter table nurture_sends enable row level security;
alter table nurture_optouts enable row level security;

-- ============ ROW LEVEL SECURITY ============
alter table tracker_profiles enable row level security;
alter table applications enable row level security;
alter table application_events enable row level security;
alter table ai_generations enable row level security;

create policy "own tracker profile select" on tracker_profiles
  for select using (auth.uid() = user_id);
create policy "own tracker profile insert" on tracker_profiles
  for insert with check (auth.uid() = user_id);
create policy "own tracker profile update" on tracker_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Clients can never self-grant Pro or fiddle with reminder throttling
revoke update (is_pro, last_reminder_sent_at) on tracker_profiles from authenticated, anon;

create policy "own applications" on applications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Events: read-only for owners; rows written only by the security-definer trigger
create policy "own events select" on application_events
  for select using (auth.uid() = user_id);

-- AI generations: read-only for owners; only service-role API routes insert (metering integrity)
create policy "own ai select" on ai_generations
  for select using (auth.uid() = user_id);

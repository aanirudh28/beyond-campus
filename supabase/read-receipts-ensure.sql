-- Read Receipts: consolidated "ensure everything exists" schema. Idempotent and
-- paste-safe (one statement per line). Run this whenever the app errors about a
-- missing rr_* column, it brings the DB up to what the current code needs
-- regardless of which earlier migration did or did not apply.

create table if not exists rr_messages (id uuid primary key default gen_random_uuid(), user_id uuid not null, tracking_id text not null unique, label text, subject text, created_at timestamptz not null default now());
alter table rr_messages add column if not exists owner_email text;
alter table rr_messages add column if not exists creator_ip text;
alter table rr_messages add column if not exists first_alert_at timestamptz;
alter table rr_messages add column if not exists opened_nudge_at timestamptz;
alter table rr_messages add column if not exists unopened_nudge_at timestamptz;

create table if not exists rr_opens (id uuid primary key default gen_random_uuid(), tracking_id text not null, opened_at timestamptz not null default now(), user_agent text);
alter table rr_opens add column if not exists ip text;
alter table rr_opens add column if not exists client text;
alter table rr_opens add column if not exists city text;
alter table rr_opens add column if not exists event_type text;
alter table rr_opens add column if not exists confidence text;

create table if not exists rr_access (user_id uuid primary key, email text, payment_id text, amount int, created_at timestamptz not null default now());
create table if not exists rr_prefs (user_id uuid primary key, email_alerts boolean not null default true, followups boolean not null default true);

create index if not exists rr_messages_user_idx on rr_messages (user_id, created_at desc);
create index if not exists rr_opens_tracking_idx on rr_opens (tracking_id, opened_at desc);

alter table rr_messages enable row level security;
alter table rr_opens enable row level security;
alter table rr_access enable row level security;
alter table rr_prefs enable row level security;

notify pgrst, 'reload schema';

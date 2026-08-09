-- Read Receipts: standalone paid (₹200) email open-tracking tool.
-- Composed in /read-receipts, pasted into the student's own Gmail with an
-- invisible tracking pixel; opens are logged here. Service-role access only,
-- so RLS is on with no policies.
--
-- One statement per line on purpose: long multi-line blocks kept getting
-- mangled on paste into the Supabase SQL editor.

create table if not exists rr_messages (id uuid primary key default gen_random_uuid(), user_id uuid not null, tracking_id text not null unique, label text, subject text, created_at timestamptz not null default now());

create table if not exists rr_opens (id uuid primary key default gen_random_uuid(), tracking_id text not null, opened_at timestamptz not null default now(), user_agent text);

create table if not exists rr_access (user_id uuid primary key, email text, payment_id text, amount int, created_at timestamptz not null default now());

create index if not exists rr_messages_user_idx on rr_messages (user_id, created_at desc);

create index if not exists rr_opens_tracking_idx on rr_opens (tracking_id, opened_at desc);

alter table rr_messages enable row level security;

alter table rr_opens enable row level security;

alter table rr_access enable row level security;

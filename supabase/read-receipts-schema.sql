-- Read Receipts: a standalone paid (₹200) tool. A student composes an email in
-- /read-receipts, copies it (with an invisible tracking pixel) into Gmail, and
-- sees when + how many times the recipient opened it.
--
-- All reads/writes go through service-role API routes (authed via getAuthedUser
-- or the public pixel), so RLS is on with no policies.

-- One row per tracked email a student creates.
create table if not exists rr_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tracking_id  text not null unique,     -- public token used in the pixel URL
  label        text,                     -- who / which company (student's own note)
  subject      text,
  created_at   timestamptz not null default now()
);
create index if not exists rr_messages_user_idx on rr_messages (user_id, created_at desc);

-- One row per open (pixel load). Append-only.
create table if not exists rr_opens (
  id          bigint generated always as identity primary key,
  tracking_id text not null,
  opened_at   timestamptz not null default now(),
  user_agent  text
);
create index if not exists rr_opens_tracking_idx on rr_opens (tracking_id, opened_at desc);

-- Who has paid for the tool.
create table if not exists rr_access (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  payment_id  text,
  amount      int,
  created_at  timestamptz not null default now()
);

alter table rr_messages enable row level security;
alter table rr_opens    enable row level security;
alter table rr_access   enable row level security;
-- (no policies = only the service role can read/write)

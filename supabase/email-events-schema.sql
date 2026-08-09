-- Email deliverability tracking. Resend posts every send outcome
-- (delivered / bounced / complained / opened / ...) to /api/webhooks/resend,
-- which verifies the Svix signature and writes a row here. The admin
-- "📧 Email Health" tab reads it via service role to show bounce and spam
-- complaint rates, so a spam problem is visible instead of silent.
--
-- Service-role writes only, so RLS is on with no policies.

create table if not exists email_events (
  id          uuid primary key default gen_random_uuid(),
  svix_id     text unique,           -- Svix message id; dedupes webhook retries
  event_type  text not null,         -- e.g. email.delivered, email.bounced, email.complained
  email_id    text,                  -- Resend's message id
  recipient   text,
  subject     text,
  raw         jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists email_events_type_idx on email_events (event_type, created_at desc);
create index if not exists email_events_recipient_idx on email_events (recipient);

alter table email_events enable row level security;
-- (no policies = only the service role can read/write)

-- Read Receipts v2: live open intelligence + follow-up engine.
-- Adds device/city to opens, alert + nudge bookkeeping to messages, and a prefs
-- table. Safe to run more than once. One statement per line (paste-robust).

alter table rr_opens add column if not exists ip text;
alter table rr_opens add column if not exists client text;
alter table rr_opens add column if not exists city text;
alter table rr_messages add column if not exists owner_email text;
alter table rr_messages add column if not exists first_alert_at timestamptz;
alter table rr_messages add column if not exists opened_nudge_at timestamptz;
alter table rr_messages add column if not exists unopened_nudge_at timestamptz;
create table if not exists rr_prefs (user_id uuid primary key, email_alerts boolean not null default true, followups boolean not null default true);
alter table rr_prefs enable row level security;

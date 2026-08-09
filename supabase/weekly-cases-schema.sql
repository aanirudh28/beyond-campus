-- Weekly consulting case drip. Cases are authored in /admin (📚 Casebooks tab)
-- and sent every Wednesday by the nurture cron to people who downloaded a
-- casebook (leads.resource in the casebook set). Each lead receives the next
-- published case they haven't seen yet — dedupe lives in nurture_sends
-- (sequence = 'weekly_case', step = sort_order).
--
-- Accessed only via service-role API routes, so RLS is on with no policies
-- (blocks the anon/public key entirely).

create table if not exists weekly_cases (
  id          uuid primary key default gen_random_uuid(),
  sort_order  int  not null,
  title       text not null,
  prompt      text not null,
  hint        text,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists weekly_cases_order_idx on weekly_cases (sort_order);

alter table weekly_cases enable row level security;
-- (no policies = only the service role can read/write)

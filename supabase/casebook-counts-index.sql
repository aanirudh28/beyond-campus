-- Casebook download counts — supporting indexes
--
-- Why: /resources/consulting now renders REAL download counts (16 exact-count
-- queries, once an hour under ISR) and the admin Casebooks tab charts a 30-day
-- daily series. Both filter on resource_name and range-scan downloaded_at.
-- `resource_downloads` was created by hand back in April and never got an index,
-- so every one of those is a full table scan today.
--
-- Safe to run more than once — nothing here drops or rewrites data.
-- Paste into: Supabase dashboard -> SQL Editor -> New query -> Run.
-- https://supabase.com/dashboard/project/jpznmvkngoeoeprrckiv/sql/new

create index if not exists resource_downloads_name_time_idx
  on public.resource_downloads (resource_name, downloaded_at desc);

-- Plain time index for the "everything in the last 30 days" scan.
create index if not exists resource_downloads_time_idx
  on public.resource_downloads (downloaded_at desc);

-- The leads side of the same chart filters resource + created_at.
create index if not exists leads_resource_time_idx
  on public.leads (resource, created_at desc);

-- Read Receipts v4: classify-and-store. Every pixel request is now recorded with
-- an event_type (open / self / bot) and a confidence (high / medium / low),
-- instead of being silently dropped. Nothing is lost, and it can be tuned later.
-- Genuine opens = event_type is null (legacy rows) or 'open'. One line each,
-- paste-safe. Safe to run more than once.

alter table rr_opens add column if not exists event_type text;
alter table rr_opens add column if not exists confidence text;

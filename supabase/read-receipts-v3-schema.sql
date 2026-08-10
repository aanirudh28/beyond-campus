-- Read Receipts v3: suppress the sender's own opens. We store the creator's IP
-- at compose time and ignore pixel loads from that same IP (the sender viewing
-- their own Sent copy). One statement, paste-safe. Safe to run more than once.

alter table rr_messages add column if not exists creator_ip text;

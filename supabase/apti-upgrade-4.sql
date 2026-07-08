-- ============================================================
-- Apti upgrade 4 — index for the public SEO question pages
-- Run once in the Supabase SQL editor (after apti-upgrade-3.sql).
-- ============================================================

create index if not exists idx_apti_questions_seo
  on apti_questions(seo_slug) where seo_slug is not null;

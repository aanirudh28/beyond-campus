-- ============================================================
-- Apti — skill prerequisite graph (docs/aptitude/14 #11)
-- Populates apti_skills.prereq_skill_slugs so the engine can say
-- "your Profit & Loss is stuck because Percentages isn't solid yet."
-- Run once in the Supabase SQL editor, after the other seed waves.
-- Safe to re-run: it only sets the prereq column, roots stay '{}'.
--
-- Prerequisites GUIDE, they never gate: the map stays a map, not a cage.
-- They (1) steer which skill the daily set focuses on next, and (2) power the
-- "builds on / strengthen this first" hints on the mastery map.
--
-- The graph is a DAG: every prereq sits earlier in curriculum order than the
-- skill that needs it. Business/case skills depend on their quant foundations,
-- which is exactly the cross-topic story worth telling a consulting aspirant.
-- ============================================================

update apti_skills as k set prereq_skill_slugs = v.prereqs
from (values
  -- quant
  ('percentage-change',      array['fraction-percent-conversion']),
  ('successive-change',      array['percentage-change']),
  ('partnership',            array['combining-ratios']),
  ('weighted-average',       array['basic-averages']),
  ('alligation',             array['weighted-average']),
  ('cp-sp-basics',           array['percentage-change']),
  ('markup-discount',        array['cp-sp-basics','successive-change']),
  ('false-weights',          array['markup-discount']),
  ('simple-interest',        array['percentage-change']),
  ('compound-interest',      array['simple-interest','successive-change']),
  ('si-ci-difference',       array['compound-interest']),
  ('relative-speed-trains',  array['speed-basics']),
  ('boats-streams',          array['speed-basics']),
  ('combined-work',          array['work-rates']),
  ('pipes-cisterns',         array['work-rates']),
  -- logical
  ('series-wrong-term',      array['series-next-term']),
  ('substitution-coding',    array['letter-shift']),
  ('coded-relations',        array['relation-chains']),
  ('circular-arrangement',   array['linear-arrangement']),
  ('possibility-syllogisms', array['two-statement']),
  -- business & case (build on the quant foundations)
  ('top-down-sizing',        array['percentage-change']),
  ('bottom-up-sizing',       array['top-down-sizing']),
  ('contribution-margin',    array['cp-sp-basics']),
  ('breakeven',              array['contribution-margin']),
  ('growth-cagr',            array['percentage-change','successive-change']),
  ('profit-bridge',          array['contribution-margin','percentage-change']),
  ('chart-reading',          array['percentage-change']),
  ('business-conclusion',    array['chart-reading','percentage-change']),
  ('tradeoff-decision',      array['business-conclusion'])
) as v(slug, prereqs)
where k.slug = v.slug;

-- ============================================================
-- Apti content wave 2 — 9 new topics, 21 new skills (NO questions;
-- questions come from the /admin/apti generation pipeline).
-- Run once in the Supabase SQL editor, after apti-schema.sql.
-- Curriculum order continues from wave 1 (percentages=1, ratio=2 in quant;
-- number-series=1 in logical).
-- ============================================================

insert into apti_topics (domain, slug, name, ord, meta) values
  ('quant', 'averages-mixtures', 'Averages & Mixtures', 3,
   '{"one_liner":"Group maths: what happens when things join, leave, or blend."}'),
  ('quant', 'profit-loss-discount', 'Profit, Loss & Discount', 4,
   '{"one_liner":"The shopkeeper games every test loves."}'),
  ('quant', 'interest', 'Simple & Compound Interest', 5,
   '{"one_liner":"Money growing on money. Banks test this for a reason."}'),
  ('quant', 'time-speed-distance', 'Time, Speed & Distance', 6,
   '{"one_liner":"Trains, boats and the km/h ↔ m/s dance."}'),
  ('quant', 'time-work', 'Time & Work', 7,
   '{"one_liner":"Rates, not days. Once that clicks, it all clicks."}'),
  ('logical', 'coding-decoding', 'Coding–Decoding', 2,
   '{"one_liner":"Crack the cipher before the clock does."}'),
  ('logical', 'blood-relations', 'Blood Relations', 3,
   '{"one_liner":"Family trees under time pressure."}'),
  ('logical', 'arrangements', 'Seating Arrangements', 4,
   '{"one_liner":"Rows and circles: the puzzle backbone of every logical section."}'),
  ('logical', 'syllogisms', 'Syllogisms', 5,
   '{"one_liner":"All, some, none: Venn logic at speed."}')
on conflict (slug) do nothing;

insert into apti_skills (topic_id, slug, name, ord, benchmark_rating, benchmark_seconds)
select t.id, s.slug, s.name, s.ord, s.br, s.bs
from (values
  ('averages-mixtures',    'basic-averages',        'Basic averages',                  1, 1150, 50),
  ('averages-mixtures',    'weighted-average',      'Weighted averages',               2, 1225, 60),
  ('averages-mixtures',    'alligation',            'Alligation & mixtures',           3, 1300, 70),
  ('profit-loss-discount', 'cp-sp-basics',          'CP, SP & profit percent',         1, 1150, 50),
  ('profit-loss-discount', 'markup-discount',       'Markup & discount chains',        2, 1250, 60),
  ('profit-loss-discount', 'false-weights',         'False weights & dishonest deals', 3, 1350, 75),
  ('interest',             'simple-interest',       'Simple interest',                 1, 1150, 55),
  ('interest',             'compound-interest',     'Compound interest',               2, 1250, 70),
  ('interest',             'si-ci-difference',      'SI vs CI difference',             3, 1325, 75),
  ('time-speed-distance',  'speed-basics',          'Speed, units & average speed',    1, 1150, 55),
  ('time-speed-distance',  'relative-speed-trains', 'Relative speed & trains',         2, 1275, 70),
  ('time-speed-distance',  'boats-streams',         'Boats & streams',                 3, 1300, 70),
  ('time-work',            'work-rates',            'Work rates',                      1, 1200, 60),
  ('time-work',            'combined-work',         'Combined & interrupted work',     2, 1275, 70),
  ('time-work',            'pipes-cisterns',        'Pipes & cisterns',                3, 1300, 70),
  ('coding-decoding',      'letter-shift',          'Letter-shift codes',              1, 1100, 40),
  ('coding-decoding',      'substitution-coding',   'Substitution codes',              2, 1200, 50),
  ('blood-relations',      'relation-chains',       'Relation chains',                 1, 1175, 55),
  ('blood-relations',      'coded-relations',       'Coded relations',                 2, 1300, 70),
  ('arrangements',         'linear-arrangement',    'Linear arrangement',              1, 1225, 75),
  ('arrangements',         'circular-arrangement',  'Circular arrangement',            2, 1300, 85),
  ('syllogisms',           'two-statement',         'Two-statement syllogisms',        1, 1175, 55),
  ('syllogisms',           'possibility-syllogisms','Possibility syllogisms',          2, 1300, 65)
) as s(topic_slug, slug, name, ord, br, bs)
join apti_topics t on t.slug = s.topic_slug
on conflict (slug) do nothing;

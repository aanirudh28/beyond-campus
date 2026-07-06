-- ============================================================
-- Apti foundation seed — 3 topics, 7 skills, 26 approved questions
-- Run AFTER apti-schema.sql. Safe to re-run (slug/hash conflicts ignored).
-- Every distractor is a named trap; every answer was independently verified.
-- ============================================================

insert into apti_topics (domain, slug, name, ord, meta) values
  ('quant',   'percentages', 'Percentages', 1,
   '{"one_liner":"The base of half of arithmetic. Master this first."}'),
  ('quant',   'ratio-proportion', 'Ratio & Proportion', 2,
   '{"one_liner":"Sharing, scaling and partnership money."}'),
  ('logical', 'number-series', 'Number Series', 1,
   '{"one_liner":"Spot the pattern before the clock spots you."}')
on conflict (slug) do nothing;

insert into apti_skills (topic_id, slug, name, ord, benchmark_rating, benchmark_seconds)
select t.id, s.slug, s.name, s.ord, s.br, s.bs
from (values
  ('percentages',      'fraction-percent-conversion', 'Fraction ↔ percent conversions', 1, 1050, 25),
  ('percentages',      'percentage-change',           'Percentage change & reverse',    2, 1200, 55),
  ('percentages',      'successive-change',           'Successive percentage changes',  3, 1275, 60),
  ('ratio-proportion', 'combining-ratios',            'Combining & applying ratios',    1, 1175, 55),
  ('ratio-proportion', 'partnership',                 'Partnership & profit sharing',   2, 1275, 75),
  ('number-series',    'series-next-term',            'Find the next term',             1, 1100, 40),
  ('number-series',    'series-wrong-term',           'Find the wrong term',            2, 1250, 55)
) as s(topic_slug, slug, name, ord, br, bs)
join apti_topics t on t.slug = s.topic_slug
on conflict (slug) do nothing;

-- ---------- helper: one insert per question ----------
-- Pattern: insert ... select from apti_skills where slug = '<skill>'

-- ============ SKILL: fraction-percent-conversion ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"37.5% expressed as a fraction is:",
 "options":[
  {"key":"A","text":"3/8","trap":null},
  {"key":"B","text":"5/8","trap":"complement"},
  {"key":"C","text":"3/7","trap":"misremembered"},
  {"key":"D","text":"7/16","trap":"near-value"}],
 "answer":{"keys":["A"]},
 "solution_md":"12.5% = 1/8. So 37.5% = 3 × 12.5% = **3/8**.",
 "shortcut_md":"Memorise the 1/8 family: 12.5 → 1/8, 37.5 → 3/8, 62.5 → 5/8, 87.5 → 7/8.",
 "trap_explanations":{
  "complement":"5/8 is 62.5% — you picked the complement (100 − 37.5).",
  "misremembered":"3/7 ≈ 42.9%. Close in look, wrong in value — conversions must be exact.",
  "near-value":"7/16 = 43.75%. Plausible-looking, but the 1/8 family gives 3/8 instantly."},
 "hints":["What fraction is 12.5%?","37.5 = 3 × 12.5"]}
$q$::jsonb, 1000, 20, 'approved', md5('37.5% expressed as a fraction is')
from apti_skills where slug = 'fraction-percent-conversion'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"A value rises from 240 to 300. The increase, as a percentage of the original value, is:",
 "options":[
  {"key":"A","text":"20%","trap":"wrong-base"},
  {"key":"B","text":"25%","trap":null},
  {"key":"C","text":"30%","trap":"estimate"},
  {"key":"D","text":"60%","trap":"absolute-as-percent"}],
 "answer":{"keys":["B"]},
 "solution_md":"Increase = 300 − 240 = 60. Percentage of **original** = 60/240 = 1/4 = **25%**.",
 "shortcut_md":"240 → 300 is ×1.25. The multiplying factor 1.25 means +25%.",
 "trap_explanations":{
  "wrong-base":"60/300 = 20% — you divided by the NEW value. Percent change always uses the original as base.",
  "estimate":"An eyeball guess. 60 on 240 is exactly a quarter — compute, don't estimate here.",
  "absolute-as-percent":"60 is the absolute increase, not a percentage."},
 "hints":["Which number is the base — old or new?","Increase ÷ original × 100"]}
$q$::jsonb, 1020, 25, 'approved', md5('A value rises from 240 to 300 increase percent of original')
from apti_skills where slug = 'fraction-percent-conversion'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"What is 4/5 of 65% of 500?",
 "options":[
  {"key":"A","text":"260","trap":null},
  {"key":"B","text":"325","trap":"stopped-early"},
  {"key":"C","text":"400","trap":"skipped-percent"},
  {"key":"D","text":"240","trap":"calc-slip"}],
 "answer":{"keys":["A"]},
 "solution_md":"65% of 500 = 325. Then 4/5 × 325 = **260**.",
 "shortcut_md":"Chain the factors: 500 × 0.65 × 0.8. Reorder: 500 × 0.8 = 400, then × 0.65 = 260.",
 "trap_explanations":{
  "stopped-early":"325 is only 65% of 500 — you never applied the 4/5.",
  "skipped-percent":"400 is 4/5 of 500 — you never applied the 65%.",
  "calc-slip":"Arithmetic slip. 4/5 of 325 = 260, not 240."},
 "hints":["Do it in two steps: percent first, fraction second.","65% of 500 = ?"]}
$q$::jsonb, 1060, 30, 'approved', md5('4/5 of 65% of 500')
from apti_skills where slug = 'fraction-percent-conversion'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"16⅔% of 720 is:",
 "options":[
  {"key":"A","text":"120","trap":null},
  {"key":"B","text":"108","trap":"used-15"},
  {"key":"C","text":"144","trap":"used-20"},
  {"key":"D","text":"112","trap":"calc-slip"}],
 "answer":{"keys":["A"]},
 "solution_md":"16⅔% = 1/6. So 720 × 1/6 = **120**.",
 "shortcut_md":"The 1/6 family: 16⅔ → 1/6, 33⅓ → 1/3, 66⅔ → 2/3, 83⅓ → 5/6.",
 "trap_explanations":{
  "used-15":"108 is 15% of 720 — you rounded 16⅔ down instead of converting to 1/6.",
  "used-20":"144 is 20% of 720 (1/5). 16⅔% is 1/6, not 1/5.",
  "calc-slip":"720/6 = 120 exactly — recheck the division."},
 "hints":["16⅔% is a famous fraction.","Divide by 6."]}
$q$::jsonb, 1080, 25, 'approved', md5('16 2/3 percent of 720')
from apti_skills where slug = 'fraction-percent-conversion'
on conflict do nothing;

-- ============ SKILL: percentage-change ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"The price of sugar rises by 25%. By what percentage must a family cut its consumption so that its expenditure on sugar stays the same?",
 "options":[
  {"key":"A","text":"20%","trap":null},
  {"key":"B","text":"25%","trap":"same-percent"},
  {"key":"C","text":"30%","trap":"overshoot"},
  {"key":"D","text":"12.5%","trap":"halved"}],
 "answer":{"keys":["A"]},
 "solution_md":"Expenditure = price × quantity. Price factor = 1.25, so quantity factor must be 1/1.25 = 0.8 → a **20%** cut.",
 "shortcut_md":"For a rise of r%, required cut = r/(100+r) × 100. Here 25/125 = 20%.",
 "trap_explanations":{
  "same-percent":"Cutting 25% after a 25% rise leaves expenditure at 1.25 × 0.75 = 0.9375 — you would UNDER-spend. Percent up and percent down are never symmetric.",
  "overshoot":"30% overshoots; the exact answer comes from 25/125.",
  "halved":"Halving the rise has no mathematical basis here."},
 "hints":["Expenditure = price × quantity. Keep the product constant.","New quantity factor = 1 ÷ 1.25"]}
$q$::jsonb, 1200, 55, 'approved', md5('sugar rises 25 percent cut consumption expenditure same')
from apti_skills where slug = 'percentage-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Aisha's salary is 20% more than Bharat's. Bharat's salary is what percentage less than Aisha's?",
 "options":[
  {"key":"A","text":"16⅔%","trap":null},
  {"key":"B","text":"20%","trap":"same-percent"},
  {"key":"C","text":"25%","trap":"inverted"},
  {"key":"D","text":"18%","trap":"averaged"}],
 "answer":{"keys":["A"]},
 "solution_md":"Let Bharat = 100, Aisha = 120. Bharat is 20 less on a base of 120: 20/120 = 1/6 = **16⅔%**.",
 "shortcut_md":"\"A is r% more than B\" ⇒ B is r/(100+r) less than A. 20/120 = 16⅔%.",
 "trap_explanations":{
  "same-percent":"The classic. 20% more one way is NOT 20% less the other way — the base changes from 100 to 120.",
  "inverted":"25% is the answer to the reversed question (if A were 25% more, B would be 20% less).",
  "averaged":"Averaging 20 and something has no basis — work from the bases."},
 "hints":["Assume Bharat = 100.","The base of the second comparison is Aisha's salary."]}
$q$::jsonb, 1220, 55, 'approved', md5('salary 20 percent more what percent less')
from apti_skills where slug = 'percentage-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"In a two-candidate election, the winner polled 60% of the votes and won by 8,000 votes. The total number of votes polled was:",
 "options":[
  {"key":"A","text":"40,000","trap":null},
  {"key":"B","text":"20,000","trap":"divided-by-loser"},
  {"key":"C","text":"13,333","trap":"divided-by-winner"},
  {"key":"D","text":"80,000","trap":"used-10"}],
 "answer":{"keys":["A"]},
 "solution_md":"Winner 60%, loser 40% → margin = 20% of total = 8,000 → total = **40,000**.",
 "shortcut_md":"Margin percentage = 60 − 40 = 20. Then 8,000 ÷ 0.20.",
 "trap_explanations":{
  "divided-by-loser":"8,000/0.4 treats the margin as the loser's entire vote share. The margin is the DIFFERENCE, 20%.",
  "divided-by-winner":"8,000/0.6 treats the margin as the winner's share.",
  "used-10":"Dividing by 10% doubles the true total — the margin is 20%, not 10%."},
 "hints":["What percent of total votes is the winning margin?","60% − 40% = ?"]}
$q$::jsonb, 1180, 50, 'approved', md5('election 60 percent won by 8000 total votes')
from apti_skills where slug = 'percentage-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"A number decreased by 15% gives 340. The original number is:",
 "options":[
  {"key":"A","text":"400","trap":null},
  {"key":"B","text":"391","trap":"reverse-percent"},
  {"key":"C","text":"289","trap":"decreased-again"},
  {"key":"D","text":"425","trap":"used-20"}],
 "answer":{"keys":["A"]},
 "solution_md":"x × 0.85 = 340 → x = 340/0.85 = **400**.",
 "shortcut_md":"Undo a −15% by DIVIDING by 0.85, never by adding 15% back.",
 "trap_explanations":{
  "reverse-percent":"340 × 1.15 = 391. Adding 15% of the REDUCED value does not undo removing 15% of the original — the bases differ.",
  "decreased-again":"340 × 0.85 = 289 — you applied the decrease a second time instead of reversing it.",
  "used-20":"340/0.8 = 425 — that reverses a 20% cut, not 15%."},
 "hints":["Write it as original × 0.85 = 340.","Divide, don't add-back."]}
$q$::jsonb, 1210, 50, 'approved', md5('number decreased 15 percent gives 340 original')
from apti_skills where slug = 'percentage-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Ravi spends 80% of his income. His income rises by 20% and his spending rises by 10%. By what percentage do his savings increase?",
 "options":[
  {"key":"A","text":"60%","trap":null},
  {"key":"B","text":"10%","trap":"subtracted-percents"},
  {"key":"C","text":"20%","trap":"income-only"},
  {"key":"D","text":"30%","trap":"added-percents"}],
 "answer":{"keys":["A"]},
 "solution_md":"Take income = 100: spend 80, save 20. New income = 120, new spend = 88, new savings = 32. Change: (32 − 20)/20 = **60%**.",
 "shortcut_md":"Savings are a small slice — small percentage moves in the big numbers swing the slice hard. Always rebuild the slice, never subtract the percents.",
 "trap_explanations":{
  "subtracted-percents":"20% − 10% = 10% subtracts percents that sit on different bases (income vs spending). Illegal move.",
  "income-only":"Savings do not scale with income alone — spending moved too.",
  "added-percents":"Adding the two changes has no meaning; the savings base is what matters."},
 "hints":["Assume income 100. What are spend and savings?","Recompute both after the changes."]}
$q$::jsonb, 1260, 65, 'approved', md5('spends 80 percent income rises 20 spending 10 savings increase')
from apti_skills where slug = 'percentage-change'
on conflict do nothing;

-- ============ SKILL: successive-change ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"A shopkeeper marks up his goods by 40% and then offers a 25% discount on the marked price. His overall result is:",
 "options":[
  {"key":"A","text":"5% profit","trap":null},
  {"key":"B","text":"15% profit","trap":"subtracted-percents"},
  {"key":"C","text":"5% loss","trap":"swapped-base"},
  {"key":"D","text":"No profit, no loss","trap":"assumed-cancel"}],
 "answer":{"keys":["A"]},
 "solution_md":"SP = CP × 1.40 × 0.75 = CP × 1.05 → **5% profit**.",
 "shortcut_md":"Multiplying factors: 1.4 × 0.75 = 1.05. Successive changes always MULTIPLY.",
 "trap_explanations":{
  "subtracted-percents":"40 − 25 = 15 subtracts percents on different bases (CP vs MP). They never subtract directly.",
  "swapped-base":"You applied the 40% to the discounted price order — the markup comes first, on CP.",
  "assumed-cancel":"Up-40 and down-25 do not cancel; only the multiplied factors tell the truth."},
 "hints":["Markup acts on cost price; discount acts on marked price.","Multiply the two factors."]}
$q$::jsonb, 1250, 55, 'approved', md5('marks up 40 percent discount 25 percent overall')
from apti_skills where slug = 'successive-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"A town's population increases by 10% in the first year and decreases by 10% in the second year. The net change over two years is:",
 "options":[
  {"key":"A","text":"1% decrease","trap":null},
  {"key":"B","text":"No change","trap":"assumed-cancel"},
  {"key":"C","text":"1% increase","trap":"sign-flip"},
  {"key":"D","text":"2% decrease","trap":"doubled"}],
 "answer":{"keys":["A"]},
 "solution_md":"Factor = 1.10 × 0.90 = 0.99 → **1% decrease**.",
 "shortcut_md":"+x% then −x% always nets to −x²/100 %. Here x = 10 → −1%.",
 "trap_explanations":{
  "assumed-cancel":"+10 and −10 feel symmetric, but the −10% acts on a LARGER base, so it removes more than the +10% added.",
  "sign-flip":"The net effect of equal up-down moves is always a decrease, never an increase.",
  "doubled":"−2% double-counts; the formula is x²/100 = 1, not 2x²/100."},
 "hints":["Multiply the factors 1.1 and 0.9.","Which year acts on the bigger base?"]}
$q$::jsonb, 1230, 50, 'approved', md5('population up 10 down 10 net change')
from apti_skills where slug = 'successive-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Two successive discounts of 20% and 15% are equivalent to a single discount of:",
 "options":[
  {"key":"A","text":"32%","trap":null},
  {"key":"B","text":"35%","trap":"added-percents"},
  {"key":"C","text":"30%","trap":"averaged-down"},
  {"key":"D","text":"33%","trap":"near-miss"}],
 "answer":{"keys":["A"]},
 "solution_md":"Remaining price = 0.80 × 0.85 = 0.68 → single discount = **32%**.",
 "shortcut_md":"Combine: a + b − ab/100 = 20 + 15 − 3 = 32.",
 "trap_explanations":{
  "added-percents":"20 + 15 = 35 ignores that the second discount acts on an already-reduced price.",
  "averaged-down":"Rounding to 30 loses the exact cross-term (ab/100 = 3).",
  "near-miss":"Close, but the cross-term is exactly 3, giving 32 — options are built to punish approximation here."},
 "hints":["What fraction of the price survives both discounts?","0.8 × 0.85 = ?"]}
$q$::jsonb, 1240, 50, 'approved', md5('successive discounts 20 and 15 single discount')
from apti_skills where slug = 'successive-change'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"The length of a rectangle is increased by 20% and its breadth is decreased by 20%. Its area:",
 "options":[
  {"key":"A","text":"decreases by 4%","trap":null},
  {"key":"B","text":"stays the same","trap":"assumed-cancel"},
  {"key":"C","text":"increases by 4%","trap":"sign-flip"},
  {"key":"D","text":"decreases by 2%","trap":"halved"}],
 "answer":{"keys":["A"]},
 "solution_md":"Area factor = 1.20 × 0.80 = 0.96 → **4% decrease**.",
 "shortcut_md":"±x% on the two dimensions ⇒ area changes by −x²/100 %. x = 20 → −4%.",
 "trap_explanations":{
  "assumed-cancel":"+20 and −20 on different dimensions still multiply: 1.2 × 0.8 = 0.96, not 1.",
  "sign-flip":"Equal opposite changes always shrink the product.",
  "halved":"−2% is x²/200 — the correct formula divides by 100."},
 "hints":["Area = length × breadth, so multiply the factors.","1.2 × 0.8 = ?"]}
$q$::jsonb, 1260, 50, 'approved', md5('rectangle length up 20 breadth down 20 area')
from apti_skills where slug = 'successive-change'
on conflict do nothing;

-- ============ SKILL: combining-ratios ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"If a : b = 2 : 3 and b : c = 4 : 5, then a : c is:",
 "options":[
  {"key":"A","text":"8 : 15","trap":null},
  {"key":"B","text":"2 : 5","trap":"took-ends"},
  {"key":"C","text":"3 : 4","trap":"middle-terms"},
  {"key":"D","text":"8 : 12","trap":"stopped-early"}],
 "answer":{"keys":["A"]},
 "solution_md":"Make b common: a : b = 8 : 12 and b : c = 12 : 15. So a : b : c = 8 : 12 : 15 → a : c = **8 : 15**.",
 "shortcut_md":"a : c = (a/b) × (b/c) = (2/3) × (4/5) = 8/15.",
 "trap_explanations":{
  "took-ends":"Reading the first and last numbers (2 and 5) skips the bridge through b entirely.",
  "middle-terms":"3 : 4 pairs the two b-values — those are the terms you must EQUALISE, not answer with.",
  "stopped-early":"8 : 12 is a : b after scaling — you stopped before reaching c."},
 "hints":["Give b the same value in both ratios.","LCM of 3 and 4 is 12."]}
$q$::jsonb, 1150, 50, 'approved', md5('a b 2 3 b c 4 5 a c')
from apti_skills where slug = 'combining-ratios'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"₹1,540 is divided among Asha, Bina and Chirag in the ratio 2 : 3 : 6. Chirag's share is:",
 "options":[
  {"key":"A","text":"₹840","trap":null},
  {"key":"B","text":"₹280","trap":"wrong-person"},
  {"key":"C","text":"₹420","trap":"wrong-person-2"},
  {"key":"D","text":"₹770","trap":"halved-total"}],
 "answer":{"keys":["A"]},
 "solution_md":"Total parts = 2 + 3 + 6 = 11. One part = 1540/11 = 140. Chirag = 6 × 140 = **₹840**.",
 "shortcut_md":"Chirag holds 6/11 of the money. 1540 is 11 × 140 — spot the divisibility first.",
 "trap_explanations":{
  "wrong-person":"₹280 is Asha's share (2 parts) — the options love to offer the other people's money.",
  "wrong-person-2":"₹420 is Bina's share (3 parts).",
  "halved-total":"Half the total has no ratio logic; the split is 2:3:6, not 1:1."},
 "hints":["How many parts in total?","One part = total ÷ 11."]}
$q$::jsonb, 1120, 45, 'approved', md5('1540 divided ratio 2 3 6 chirag share')
from apti_skills where slug = 'combining-ratios'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"In a college, the ratio of boys to girls is 7 : 5. If there are 84 boys, the total number of students is:",
 "options":[
  {"key":"A","text":"144","trap":null},
  {"key":"B","text":"60","trap":"girls-only"},
  {"key":"C","text":"120","trap":"used-10-parts"},
  {"key":"D","text":"204","trap":"added-ratio-raw"}],
 "answer":{"keys":["A"]},
 "solution_md":"7 parts = 84 → 1 part = 12. Total = (7 + 5) × 12 = **144**.",
 "shortcut_md":"Total parts 12; 84 is 7 parts, so total = 84 × 12/7.",
 "trap_explanations":{
  "girls-only":"60 is just the girls (5 × 12) — the question asks for the total.",
  "used-10-parts":"120 assumes 10 total parts; 7 + 5 = 12.",
  "added-ratio-raw":"84 + 120 mixes a count with a misscaled count — everything must go through the part value 12."},
 "hints":["One part = 84 ÷ 7.","Total parts = 7 + 5."]}
$q$::jsonb, 1130, 45, 'approved', md5('boys girls 7 5 84 boys total students')
from apti_skills where slug = 'combining-ratios'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Two numbers are in the ratio 3 : 5. If 9 is added to each, the ratio becomes 3 : 4. The numbers are:",
 "options":[
  {"key":"A","text":"9 and 15","trap":null},
  {"key":"B","text":"12 and 20","trap":"solved-for-after"},
  {"key":"C","text":"6 and 10","trap":"undershoot"},
  {"key":"D","text":"15 and 25","trap":"overshoot"}],
 "answer":{"keys":["A"]},
 "solution_md":"Let the numbers be 3x, 5x. (3x + 9)/(5x + 9) = 3/4 → 12x + 36 = 15x + 27 → x = 3 → **9 and 15**. Check: 18/24 = 3/4 ✓",
 "shortcut_md":"Back-check options: only 9,15 gives (9+9):(15+9) = 18:24 = 3:4.",
 "trap_explanations":{
  "solved-for-after":"12 and 20 is 3:5 but adding 9 gives 21:29 — you may have solved for the post-addition values by mistake.",
  "undershoot":"6,10 → 15:19, not 3:4. A too-small x from a sign slip in 12x + 36 = 15x + 27.",
  "overshoot":"15,25 → 24:34 = 12:17. Wrong x — recheck the cross-multiplication."},
 "hints":["Call them 3x and 5x.","Cross-multiply (3x+9)/(5x+9) = 3/4."]}
$q$::jsonb, 1220, 65, 'approved', md5('ratio 3 5 add 9 becomes 3 4 numbers')
from apti_skills where slug = 'combining-ratios'
on conflict do nothing;

-- ============ SKILL: partnership ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Aman invests ₹40,000 for 12 months; Bhavna invests ₹60,000 for 8 months in the same business. From a profit of ₹27,000, Aman's share is:",
 "options":[
  {"key":"A","text":"₹13,500","trap":null},
  {"key":"B","text":"₹10,800","trap":"capital-only"},
  {"key":"C","text":"₹16,200","trap":"capital-only-flipped"},
  {"key":"D","text":"₹12,000","trap":"round-anchor"}],
 "answer":{"keys":["A"]},
 "solution_md":"Profit splits by capital × time. Aman: 40,000 × 12 = 4,80,000. Bhavna: 60,000 × 8 = 4,80,000. Ratio 1 : 1 → **₹13,500** each.",
 "shortcut_md":"Compare 40×12 vs 60×8 in thousands: 480 = 480. Equal shares — no division needed.",
 "trap_explanations":{
  "capital-only":"2:3 by capital gives ₹10,800 — but Bhavna's money worked only 8 months. Time weights capital.",
  "capital-only-flipped":"₹16,200 is the 3-part share of the capital-only split — doubly wrong.",
  "round-anchor":"A tidy-looking number with no computation behind it. Capital-months decide."},
 "hints":["Weight each investment by its months.","40×12 vs 60×8 — compare."]}
$q$::jsonb, 1250, 70, 'approved', md5('40000 12 months 60000 8 months profit 27000 aman share')
from apti_skills where slug = 'partnership'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Priya and Qadir start a business with ₹50,000 and ₹70,000. After 6 months, Priya adds ₹20,000. From the year's profit of ₹1,30,000, Qadir's share is:",
 "options":[
  {"key":"A","text":"₹70,000","trap":null},
  {"key":"B","text":"₹75,833","trap":"capital-only"},
  {"key":"C","text":"₹65,000","trap":"ignored-topup"},
  {"key":"D","text":"₹60,000","trap":"other-share"}],
 "answer":{"keys":["A"]},
 "solution_md":"Priya: 50,000×6 + 70,000×6 = 7,20,000. Qadir: 70,000×12 = 8,40,000. Ratio 720 : 840 = 6 : 7. Qadir = 1,30,000 × 7/13 = **₹70,000**.",
 "shortcut_md":"Work in capital-month 'lakhs': 3+4.2 = 7.2 vs 8.4 → 6:7 → 13 parts of 10,000.",
 "trap_explanations":{
  "capital-only":"5:7 on starting capitals ignores Priya's mid-year top-up entirely.",
  "ignored-topup":"A 50-50 flavoured split — the top-up changes Priya's weighted capital, not erases the difference.",
  "other-share":"₹60,000 is PRIYA's share (6 parts). Read which partner is asked."},
 "hints":["Split Priya's year into two 6-month blocks.","Capital × months for each block, then ratio."]}
$q$::jsonb, 1290, 85, 'approved', md5('priya 50000 qadir 70000 adds 20000 6 months profit 130000 qadir share')
from apti_skills where slug = 'partnership'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Rohan and Sana invest in the ratio 3 : 2. Rohan, as working partner, takes 10% of the profit for management; the rest is split by capital. From a profit of ₹50,000, Rohan receives in total:",
 "options":[
  {"key":"A","text":"₹32,000","trap":null},
  {"key":"B","text":"₹30,000","trap":"no-fee"},
  {"key":"C","text":"₹27,000","trap":"forgot-fee"},
  {"key":"D","text":"₹35,000","trap":"fee-on-share"}],
 "answer":{"keys":["A"]},
 "solution_md":"Fee = 10% × 50,000 = 5,000. Remainder 45,000 splits 3:2 → Rohan 27,000. Total = 5,000 + 27,000 = **₹32,000**.",
 "shortcut_md":"Fee first, then ratio on what remains — the order is fixed by the words 'of the profit'.",
 "trap_explanations":{
  "no-fee":"₹30,000 is 3/5 of the full 50,000 — you skipped the management fee step.",
  "forgot-fee":"₹27,000 is Rohan's capital share only — he ALSO gets the ₹5,000 fee.",
  "fee-on-share":"Adding 10% to his share computes the fee on the wrong base (his share, not the profit)."},
 "hints":["Take the 10% off the top first.","Then split the remaining ₹45,000 in 3:2."]}
$q$::jsonb, 1270, 75, 'approved', md5('working partner 10 percent rest 3 2 profit 50000 rohan total')
from apti_skills where slug = 'partnership'
on conflict do nothing;

-- ============ SKILL: series-next-term ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"3, 7, 15, 31, 63, ?",
 "options":[
  {"key":"A","text":"127","trap":null},
  {"key":"B","text":"126","trap":"doubled-only"},
  {"key":"C","text":"95","trap":"added-32"},
  {"key":"D","text":"93","trap":"pattern-drift"}],
 "answer":{"keys":["A"]},
 "solution_md":"Each term = previous × 2 + 1. 63 × 2 + 1 = **127**. (Differences double: 4, 8, 16, 32 → next difference 64.)",
 "shortcut_md":"These are 2ⁿ − 1: 4−1, 8−1, 16−1... next is 128 − 1.",
 "trap_explanations":{
  "doubled-only":"126 = 63 × 2 — you found the doubling but dropped the +1.",
  "added-32":"95 = 63 + 32 repeats the LAST difference instead of doubling it.",
  "pattern-drift":"93 fits no consistent rule — verify a candidate rule on every gap before answering."},
 "hints":["Look at the differences between terms.","Each difference doubles."]}
$q$::jsonb, 1080, 35, 'approved', md5('3 7 15 31 63 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"2, 6, 12, 20, 30, ?",
 "options":[
  {"key":"A","text":"42","trap":null},
  {"key":"B","text":"40","trap":"repeated-diff"},
  {"key":"C","text":"36","trap":"squares-drift"},
  {"key":"D","text":"44","trap":"overshoot"}],
 "answer":{"keys":["A"]},
 "solution_md":"Differences: 4, 6, 8, 10 → next difference 12 → 30 + 12 = **42**. (Terms are n(n+1): 1×2, 2×3, ... 6×7.)",
 "shortcut_md":"Recognise n(n+1) — the 'pronic' numbers. Next is 6 × 7.",
 "trap_explanations":{
  "repeated-diff":"40 repeats the last difference (10) instead of growing it to 12.",
  "squares-drift":"36 = 6² — close cousin, but these are n(n+1), not n².",
  "overshoot":"44 grows the difference by 14 — differences here rise by exactly 2."},
 "hints":["Write down the gaps.","The gaps rise by 2 each time."]}
$q$::jsonb, 1050, 35, 'approved', md5('2 6 12 20 30 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"5, 11, 23, 47, ?",
 "options":[
  {"key":"A","text":"95","trap":null},
  {"key":"B","text":"94","trap":"doubled-only"},
  {"key":"C","text":"71","trap":"repeated-diff"},
  {"key":"D","text":"96","trap":"off-by-one"}],
 "answer":{"keys":["A"]},
 "solution_md":"Each term = previous × 2 + 1. 47 × 2 + 1 = **95**.",
 "shortcut_md":"Differences 6, 12, 24 double each time → next gap 48; 47 + 48 = 95.",
 "trap_explanations":{
  "doubled-only":"94 = 47 × 2 — the +1 is the whole trick.",
  "repeated-diff":"71 = 47 + 24 reuses the last gap; the gaps double.",
  "off-by-one":"96 = 47×2+2 — check the rule on the early terms: 5×2+1 = 11 ✓."},
 "hints":["Test ×2+1 on the first pair.","5 → 11: what operation?"]}
$q$::jsonb, 1100, 35, 'approved', md5('5 11 23 47 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"8, 24, 12, 36, 18, 54, ?",
 "options":[
  {"key":"A","text":"27","trap":null},
  {"key":"B","text":"162","trap":"wrong-step"},
  {"key":"C","text":"108","trap":"doubled"},
  {"key":"D","text":"45","trap":"subtracted"}],
 "answer":{"keys":["A"]},
 "solution_md":"Alternating operations: ×3, ÷2, ×3, ÷2... After 54 comes ÷2 → **27**.",
 "shortcut_md":"Two interleaved views: check whether one rule alternates before hunting exotic patterns.",
 "trap_explanations":{
  "wrong-step":"162 = 54 × 3 applies ×3 again, but the pattern alternates and ÷2 is due.",
  "doubled":"108 = 54 × 2 — neither of the two alternating operations is ×2.",
  "subtracted":"45 = 54 − 9 — differences don't drive alternating-operation series."},
 "hints":["Compare term 1→2 and term 2→3.","The two operations alternate."]}
$q$::jsonb, 1150, 45, 'approved', md5('8 24 12 36 18 54 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"1, 4, 9, 16, 25, ?",
 "options":[
  {"key":"A","text":"36","trap":null},
  {"key":"B","text":"30","trap":"repeated-diff"},
  {"key":"C","text":"35","trap":"pattern-drift"},
  {"key":"D","text":"49","trap":"skipped-term"}],
 "answer":{"keys":["A"]},
 "solution_md":"Perfect squares: 1², 2², 3², 4², 5² → next is 6² = **36**.",
 "shortcut_md":"1, 4, 9, 16, 25 should be instantly recognisable — squares to 30² are worth memorising.",
 "trap_explanations":{
  "repeated-diff":"30 = 25 + 5? The gaps are odd numbers rising by 2 (3,5,7,9 → 11).",
  "pattern-drift":"35 fits no rule the earlier terms obey.",
  "skipped-term":"49 = 7² jumps a term; the next index is 6."},
 "hints":["Recognise the sequence type.","1, 4, 9... are all perfect what?"]}
$q$::jsonb, 980, 25, 'approved', md5('1 4 9 16 25 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"7, 12, 22, 42, 82, ?",
 "options":[
  {"key":"A","text":"162","trap":null},
  {"key":"B","text":"164","trap":"doubled-only"},
  {"key":"C","text":"122","trap":"repeated-diff"},
  {"key":"D","text":"160","trap":"off-by-two"}],
 "answer":{"keys":["A"]},
 "solution_md":"Each term = previous × 2 − 2. 82 × 2 − 2 = **162**. (Gaps: 5, 10, 20, 40 → next 80.)",
 "shortcut_md":"Gaps double → next gap 80 → 82 + 80.",
 "trap_explanations":{
  "doubled-only":"164 = 82 × 2 misses the −2 correction (check: 7×2−2 = 12 ✓).",
  "repeated-diff":"122 = 82 + 40 reuses the last gap instead of doubling it.",
  "off-by-two":"160 = 82×2−4 — verify the constant on the FIRST pair, not by feel."},
 "hints":["Look at the gaps: 5, 10, 20...","Or test ×2−2 on 7 → 12."]}
$q$::jsonb, 1130, 40, 'approved', md5('7 12 22 42 82 next')
from apti_skills where slug = 'series-next-term'
on conflict do nothing;

-- ============ SKILL: series-wrong-term ============

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Find the WRONG term: 4, 9, 19, 39, 79, 160",
 "options":[
  {"key":"A","text":"160","trap":null},
  {"key":"B","text":"79","trap":"blamed-neighbour"},
  {"key":"C","text":"39","trap":"mid-series-panic"},
  {"key":"D","text":"9","trap":"doubted-start"}],
 "answer":{"keys":["A"]},
 "solution_md":"Rule: ×2 + 1. 4→9→19→39→79 all obey; 79 × 2 + 1 = 159, not **160**.",
 "shortcut_md":"Establish the rule from the FIRST two gaps, then sweep — the wrong term is usually near the end.",
 "trap_explanations":{
  "blamed-neighbour":"79 obeys the rule (39×2+1). The break is what FOLLOWS 79, so 160 is the culprit — don't blame the last correct term.",
  "mid-series-panic":"39 = 19×2+1 ✓. Verify before accusing.",
  "doubted-start":"9 = 4×2+1 ✓ — the rule is anchored by the opening terms."},
 "hints":["Derive the rule from 4 → 9 → 19.","Check each hop: ×2+1."]}
$q$::jsonb, 1220, 55, 'approved', md5('wrong term 4 9 19 39 79 160')
from apti_skills where slug = 'series-wrong-term'
on conflict do nothing;

insert into apti_questions (skill_id, type, payload, rating, time_benchmark_sec, status, content_hash)
select id, 'mcq_single', $q$
{"stem_md":"Find the WRONG term: 2, 5, 11, 23, 47, 94",
 "options":[
  {"key":"A","text":"94","trap":null},
  {"key":"B","text":"47","trap":"blamed-neighbour"},
  {"key":"C","text":"23","trap":"mid-series-panic"},
  {"key":"D","text":"11","trap":"doubted-start"}],
 "answer":{"keys":["A"]},
 "solution_md":"Rule: ×2 + 1. 2→5→11→23→47 all obey; 47 × 2 + 1 = 95, not **94**.",
 "shortcut_md":"Lock the rule using the first two hops (2→5, 5→11), then sweep forward — a rule that survives three hops is the rule.",
 "trap_explanations":{
  "blamed-neighbour":"47 = 23×2+1 ✓. The break happens AFTER 47, so the wrong term is 94, not the last correct one.",
  "mid-series-panic":"23 = 11×2+1 ✓ — verify each hop before accusing.",
  "doubted-start":"11 = 5×2+1 ✓ — the opening terms define the rule; distrust the end first."},
 "hints":["Derive the rule from 2 → 5 → 11.","Check every hop: ×2+1."]}
$q$::jsonb, 1240, 55, 'approved', md5('wrong term 2 5 11 23 47 94')
from apti_skills where slug = 'series-wrong-term'
on conflict do nothing;

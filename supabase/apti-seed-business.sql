-- ============================================================
-- Apti content wave 3 — Business & Case Aptitude domain
-- The consulting / Founder's Office bridge nobody builds for BBA/BCom.
-- Run once in the Supabase SQL editor, after apti-schema.sql (and the
-- earlier seed waves). Safe to re-run: every insert is on-conflict-do-nothing.
--
-- Two parts:
--   1) curriculum  — 4 topics, 10 skills under domain='business'
--   2) flagship Qs — 6 hand-authored, APPROVED questions with SEO pages, so
--      the domain has real substance on day one. Generate more through the
--      admin console (the business generation prompt + trap libraries are live
--      in lib/apti-content.ts).
-- ============================================================

-- ---------- 1) curriculum ----------
insert into apti_topics (domain, slug, name, ord, meta) values
  ('business', 'market-sizing', 'Market Sizing & Guesstimates', 1,
   '{"one_liner":"Estimate any number from scratch. The interview classic."}'),
  ('business', 'case-math', 'Case Math', 2,
   '{"one_liner":"The arithmetic of real businesses: margins, breakeven, growth."}'),
  ('business', 'data-insight', 'Data & Chart Insight', 3,
   '{"one_liner":"Read the chart, then say the one thing that matters."}'),
  ('business', 'business-judgment', 'Business Judgment', 4,
   '{"one_liner":"Pick the option the numbers actually support."}')
on conflict (slug) do nothing;

insert into apti_skills (topic_id, slug, name, ord, benchmark_rating, benchmark_seconds)
select t.id, s.slug, s.name, s.ord, s.br, s.bs
from (values
  ('market-sizing',     'top-down-sizing',     'Top-down market sizing',       1, 1250, 90),
  ('market-sizing',     'bottom-up-sizing',    'Bottom-up market sizing',      2, 1275, 90),
  ('market-sizing',     'estimation-sense',    'Assumption & sanity sense',    3, 1200, 60),
  ('case-math',         'contribution-margin', 'Contribution & margins',       1, 1225, 70),
  ('case-math',         'breakeven',           'Breakeven & unit economics',   2, 1275, 80),
  ('case-math',         'growth-cagr',         'Growth rates & CAGR',          3, 1300, 75),
  ('case-math',         'profit-bridge',       'Profit levers & bridges',      4, 1325, 90),
  ('data-insight',      'chart-reading',       'Reading charts under time',    1, 1200, 70),
  ('data-insight',      'business-conclusion', 'From data to the "so what"',   2, 1300, 80),
  ('business-judgment', 'tradeoff-decision',   'Trade-off decisions',          1, 1300, 90)
) as s(topic_slug, slug, name, ord, br, bs)
join apti_topics t on t.slug = s.topic_slug
on conflict (slug) do nothing;

-- ---------- 2) flagship questions (approved + public SEO) ----------
insert into apti_questions
  (skill_id, type, payload, rating, time_benchmark_sec, status, seo_slug, content_hash)
select s.id, 'mcq_single', v.payload::jsonb, v.rating, v.tsec, 'approved', v.seo, v.hash
from (values
  ('top-down-sizing', 1260, 90,
   'chai-cups-sold-mumbai-daily-guesstimate', 'seed-biz-tds-001',
   '{"stem_md":"Roughly how many cups of chai do street vendors sell in Mumbai on a typical day? Pick the closest order of magnitude, and be ready to defend your assumptions.","options":[{"key":"A","text":"About 2 lakh (2,00,000)","trap":"wrong-population"},{"key":"B","text":"About 20 lakh (20,00,000)","trap":"single-use"},{"key":"C","text":"About 2 crore (2,00,00,000)","trap":null},{"key":"D","text":"About 20 crore (20,00,00,000)","trap":"full-penetration"}],"answer":{"keys":["C"]},"solution_md":"Top-down decomposition:\n1. Mumbai has about 2 crore people (20 million).\n2. Say about 40 percent buy chai from a vendor on a given day, so about 80 lakh people.\n3. A regular chai drinker has about 2 cups from a stall, so 80 lakh x 2 is about 1.6 crore cups.\n4. Round to the nearest order of magnitude: **about 2 crore cups a day.**\nThe exact number does not matter. A defensible structure and the right order of magnitude is the whole game.","shortcut_md":"Anchor on the city population, take a sensible buying fraction, multiply by cups per person. If the answer runs past a few times the population, an assumption is off.","trap_explanations":{"wrong-population":"You sized a single neighbourhood, not the whole metro. Anchor on the roughly 2 crore people in Mumbai.","single-use":"You undercounted, likely a low buying fraction and one cup each. Chai buyers are a big share of the city and often have two or more.","full-penetration":"This is more cups than the city can plausibly drink, over 10 per person. You assumed near-universal heavy use, or slipped to a national population."},"hints":["Start from the population of the city, not the country.","What fraction buy chai from a vendor, and how many cups each?"]}'),

  ('bottom-up-sizing', 1280, 90,
   'autorickshaws-in-a-metro-guesstimate', 'seed-biz-bus-001',
   '{"stem_md":"About how many autorickshaws operate in a metro city of roughly 1 crore (10 million) people? Pick the closest order of magnitude.","options":[{"key":"A","text":"About 5,000","trap":"magnitude-slip"},{"key":"B","text":"About 50,000","trap":null},{"key":"C","text":"About 5 lakh (5,00,000)","trap":"coverage-slip"},{"key":"D","text":"About 50 lakh (50,00,000)","trap":"wrong-base"}],"answer":{"keys":["B"]},"solution_md":"Build up from daily rides:\n1. City of about 1 crore people. Say about 1 in 10 takes an auto ride on a given day, so roughly 10 lakh rides.\n2. One autorickshaw completes about 20 rides in a working day.\n3. Autos needed = 10 lakh rides / 20 rides = about 50,000 autos.\nSanity check: that is 1 auto per 200 people, which feels right for a metro. **About 50,000.**","shortcut_md":"Estimate total daily rides, then divide by rides per vehicle per day. Finish with a per-capita sanity check.","trap_explanations":{"magnitude-slip":"Right structure, but one factor is off by 10x. Recheck rides per day or rides per auto.","coverage-slip":"You assumed far more rides or far fewer per auto. At 5 lakh autos that is 1 per 20 people, too dense.","wrong-base":"This is close to one auto for every two people. You sized from population directly instead of from daily rides."},"hints":["Build up from daily rides, not from the population directly.","How many rides does one auto do in a day?"]}'),

  ('contribution-margin', 1220, 70,
   'contribution-per-unit-cloud-kitchen', 'seed-biz-cm-001',
   '{"stem_md":"A cloud kitchen sells a biryani for Rs 300. The ingredients, packaging and delivery fee cost Rs 180 for each order. Rent, staff and software add up to Rs 1,20,000 a month. What is the contribution from one biryani?","options":[{"key":"A","text":"Rs 120","trap":null},{"key":"B","text":"Rs 300","trap":"revenue-as-contribution"},{"key":"C","text":"Rs 180","trap":"cost-as-contribution"},{"key":"D","text":"Rs 150","trap":"margin-rule-of-thumb"}],"answer":{"keys":["A"]},"solution_md":"Contribution per unit = selling price minus the variable cost of that unit.\n1. Variable cost per biryani = Rs 180 (ingredients, packaging, delivery).\n2. Contribution = 300 - 180 = **Rs 120.**\nFixed costs (rent, staff, software) do not enter the per-unit contribution. They are covered later, out of total contribution.","shortcut_md":"Contribution = price minus variable cost. Ignore fixed costs at the per-unit stage.","trap_explanations":{"revenue-as-contribution":"You used the full selling price and forgot to subtract the Rs 180 variable cost.","cost-as-contribution":"That is the variable cost itself, not what the sale contributes.","margin-rule-of-thumb":"You assumed a round 50 percent margin instead of subtracting the actual Rs 180 cost."},"hints":["Contribution is what one sale adds after its own variable cost.","Do fixed monthly costs belong in a per-unit figure?"]}'),

  ('breakeven', 1275, 80,
   'breakeven-units-cloud-kitchen', 'seed-biz-be-001',
   '{"stem_md":"The same cloud kitchen earns Rs 120 contribution per biryani and has fixed costs of Rs 1,20,000 a month. How many biryanis must it sell in a month just to break even?","options":[{"key":"A","text":"1,000","trap":null},{"key":"B","text":"400","trap":"price-not-contribution"},{"key":"C","text":"About 667","trap":"variable-cost-base"},{"key":"D","text":"2,000","trap":"contribution-halved"}],"answer":{"keys":["A"]},"solution_md":"Break-even volume = fixed costs / contribution per unit.\n1. Fixed costs = Rs 1,20,000 a month.\n2. Contribution per biryani = Rs 120.\n3. Break-even = 1,20,000 / 120 = **1,000 biryanis a month** (about 33 a day).\nBelow this it loses money; above it, every biryani adds Rs 120 of profit.","shortcut_md":"Break-even units = fixed cost / contribution per unit. Divide by 30 for a daily target.","trap_explanations":{"price-not-contribution":"You divided by the Rs 300 price. Only the Rs 120 contribution is available to cover fixed costs.","variable-cost-base":"You divided by the Rs 180 variable cost, which is not what covers fixed costs.","contribution-halved":"You used about Rs 60 of contribution. Recheck: price minus variable cost is Rs 120."},"hints":["What has to be covered before the first rupee of profit?","Break-even = fixed cost / contribution per unit."]}'),

  ('growth-cagr', 1300, 75,
   'cagr-revenue-tripled-three-years', 'seed-biz-cagr-001',
   '{"stem_md":"A D2C brand grew its revenue from Rs 8 crore to Rs 27 crore over 3 years. Its approximate compound annual growth rate (CAGR) is closest to:","options":[{"key":"A","text":"50 percent","trap":null},{"key":"B","text":"About 79 percent","trap":"simple-growth"},{"key":"C","text":"About 100 percent","trap":"doubling-slip"},{"key":"D","text":"About 25 percent","trap":"under-guess"}],"answer":{"keys":["A"]},"solution_md":"CAGR is the steady yearly multiple that compounds to the total growth.\n1. Total multiple = 27 / 8 = about 3.4x over 3 years.\n2. Find the yearly multiple: the cube root of 3.375 is 1.5.\n3. So revenue grew about 1.5x each year, a **50 percent CAGR** (8 to 12 to 18 to 27).\nGrowth compounds, so you cannot just divide the total growth by the number of years.","shortcut_md":"Look for a clean yearly multiple: 8 to 27 is 1.5 x 1.5 x 1.5. That 1.5x is 50 percent a year.","trap_explanations":{"simple-growth":"You divided the total growth of about 237 percent by 3 years. Growth compounds, so that overstates the rate.","doubling-slip":"Revenue more than tripled, but 100 percent a year would run 8 to 16 to 32 to 64, far past 27.","under-guess":"At 25 percent a year revenue reaches only about 15 crore in 3 years, well short of 27."},"hints":["Divide the end by the start to get the total multiple first.","What steady yearly multiple, applied 3 times, gives about 3.4x?"]}'),

  ('business-conclusion', 1300, 80,
   'market-share-fell-but-sold-more-phones', 'seed-biz-bc-001',
   '{"stem_md":"A phone brand saw its market share fall from 20 percent to 16 percent last year. Over the same year the overall market grew from 15 crore to 25 crore units. Did the brand sell more phones or fewer?","options":[{"key":"A","text":"More: about 4 crore units, up from 3 crore","trap":null},{"key":"B","text":"Fewer: its share dropped 4 points","trap":"share-not-units"},{"key":"C","text":"About the same: the two changes cancel out","trap":"assumed-cancel"},{"key":"D","text":"Fewer: about 2.4 crore units","trap":"static-market"}],"answer":{"keys":["A"]},"solution_md":"Turn shares into unit counts before concluding.\n1. Last year: 20 percent of 15 crore = 3 crore units.\n2. This year: 16 percent of 25 crore = 4 crore units.\n3. So the brand sold **more phones, about 4 crore vs 3 crore**, even though its share fell.\nA smaller slice of a much bigger pie can still be more pie. Always convert share to absolute units.","shortcut_md":"Share times market size gives units. Compare the unit counts, not the shares.","trap_explanations":{"share-not-units":"You compared shares. A falling share of a fast-growing market can still mean more units.","assumed-cancel":"The share fall and the market growth do not cancel; you have to multiply them out.","static-market":"You applied the new share to the old market size and missed that the market grew from 15 to 25 crore."},"hints":["Convert each year share into an actual number of units.","Share x market size = units sold."]}')
) as v(skill_slug, rating, tsec, seo, hash, payload)
join apti_skills s on s.slug = v.skill_slug
on conflict do nothing;

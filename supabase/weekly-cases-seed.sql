-- Seed: two partner-level cases for the weekly consulting drip.
-- Turnkey and safe to run more than once: creates the table if missing, and the
-- WHERE NOT EXISTS guards stop duplicate rows if you paste it twice.
-- Both are inserted published = true, so the next two Wednesday sends pick them
-- up automatically (case #1 first, #2 the week after).

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

insert into weekly_cases (sort_order, title, prompt, hint, published)
select (select coalesce(max(sort_order), 0) + 1 from weekly_cases),
  $$Fresh Bowl: the chain that grew its way into trouble$$,
  $$Your client runs Fresh Bowl, a chain of 180 quick service outlets across eight Indian cities selling salads and rice bowls. Over the last two years revenue has grown about 22 percent, but profit per outlet has fallen from roughly 9 lakh a year to 6 lakh. The CEO is proud of the growth and puzzled by the profit. She wants two answers from you by Friday. Why is this happening, and what should we do about it.

Facts you can use. Two years ago almost every order was dine-in or picked up at the counter. Today a little over half of all orders come through delivery aggregators, who keep a commission of 22 to 28 percent of the order value. The chain opened 40 new outlets in this period, and many sit within three or four kilometres of an outlet that already existed. Average bill size has stayed roughly flat. Rent and staff cost per outlet rose with inflation, nothing more.

Walk through how you would find the cause, put rough numbers on the biggest driver, and give the CEO a clear recommendation. She will push back on anything that sounds like cost cutting with no number behind it.$$,
  $$Split the problem into revenue per outlet and profit per outlet, then follow the channel mix. A sale is not really a sale when one channel keeps a quarter of it. And ask whether the 40 new outlets are winning customers or just taking them from the older outlets next door.$$,
  true
where not exists (select 1 from weekly_cases where title = $$Fresh Bowl: the chain that grew its way into trouble$$);

insert into weekly_cases (sort_order, title, prompt, hint, published)
select (select coalesce(max(sort_order), 0) + 1 from weekly_cases),
  $$HealthFirst Diagnostics: should the fund buy the labs?$$,
  $$A mid-size private equity fund is looking at buying HealthFirst Diagnostics, a chain of 60 pathology labs and sample collection centres in and around Pune and Nagpur. The asking price is about 300 crore. The partner leading the deal has one question for you. Is this worth it, and what is the single thing that would make you walk away.

What you know. HealthFirst did roughly 240 crore of revenue last year at an operating margin of about 18 percent. Around 70 percent of that revenue comes from routine tests, where three or four national brands compete hard and mostly on price. The rest comes from specialised tests that carry much better margins. Walk-in customers shrink a little every year, while orders sent in by hospitals and online health platforms keep growing, and those partners are starting to ask for lower rates. The founder is 61 and wants to sell the whole business and step away.

Decide whether the economics justify the price, spell out what you would need to believe about the next five years for this to be a good buy, and name the one risk that could sink it. The partner trusts a clear yes or no far more than a hedge.$$,
  $$Start from what you are paying for each rupee of profit, then ask whether that profit will still be there in five years. Keep the routine tests and the specialised tests in separate buckets. The whole deal turns on who holds the pricing power as walk-ins give way to hospitals and platforms.$$,
  true
where not exists (select 1 from weekly_cases where title = $$HealthFirst Diagnostics: should the fund buy the labs?$$);

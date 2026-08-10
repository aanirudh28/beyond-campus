---
name: weekly-case
description: Write a partner-level consulting case for the Beyond Campus weekly "Case Wednesday" email drip, in the house voice, then upload it to the weekly_cases table. Use whenever the founder asks to write/add/create a weekly case, a consulting case for students, or a Case Wednesday case.
---

# Weekly Case (Case Wednesday)

Write one partner-interview-grade consulting case and load it into the drip that
emails casebook leads every Wednesday. Each lead gets the next unseen published
case, in order.

## Voice and quality bar (non-negotiable)

- **Partner-level, not first-round.** The case must be ambiguous, force real
  judgment, demand a clear recommendation, and reward structure over recall. A
  good test: a smart student can't answer it with one memorised framework.
- **Always demand a number and a decision.** The prompt must ask the reader to
  size the biggest driver (rough numbers are fine) AND commit to a yes/no or a
  specific recommendation. Add a line that the "client" rejects hedging or
  unquantified hand-waving.
- **Indian context.** Rupees (lakh / crore), Indian companies, sectors, and
  cities. The audience is BBA/BCom and non-tech students chasing consulting,
  finance, marketing, BD, ops, Founder's Office roles.
- **No em dashes. Ever.** House rule. Use commas, periods, or parentheses. (See
  the `content-voice-rules` memory.) Also avoid AI-tell words: delve, leverage,
  robust, navigate, landscape, seamless, moreover, furthermore, tapestry,
  "in today's world". Write like a sharp human consultant wrote it.
- **Self-contained.** Include the few numbers the reader needs to actually work
  it (revenue, margin, mix, price, etc.) so they can practise without guessing.
- **Concise.** Setup + facts + the ask in roughly three short paragraphs. Not a
  wall of text.

## Rotate the case type and sector

Before writing, pull the existing cases (see "list" below) and pick a **type and
sector you have not used recently.** Rotate across:

- Profitability / declining margins (with a twist: revenue up, profit down, etc.)
- Market entry / go-to-market
- Investment decision (PE buy, M&A, "should we build vs buy")
- Pricing
- Growth strategy / new revenue line
- Operations / turnaround / capacity
- Market sizing / guesstimate (heavier quant)

Vary sectors too: FMCG, D2C, QSR, diagnostics/healthcare, fintech, edtech,
retail, logistics, manufacturing, media, banking.

Exemplars already published (match this calibre, do not repeat them):
1. *Fresh Bowl: the chain that grew its way into trouble* — profitability, QSR
   (revenue up, profit down; aggregator commissions + cannibalisation).
2. *HealthFirst Diagnostics: should the fund buy the labs?* — PE investment,
   diagnostics (is an 18% margin durable as the customer mix shifts).

## Output format (three fields)

- **title**: short, specific, a little intriguing. e.g. "Fresh Bowl: the chain
  that grew its way into trouble".
- **prompt**: the case. Paragraph 1 = who the client is and what they want from
  you (the decision). Paragraph 2 = the facts and numbers to use. Paragraph 3 =
  the explicit ask (find the driver, size it, recommend, and the one risk / the
  no-hedging line). Newlines are preserved in the email (white-space: pre-line).
- **hint**: one line, a framework nudge that points at the right structure
  WITHOUT giving away the answer.

## How it gets delivered (context, don't re-derive)

- Table `weekly_cases` (title, prompt, hint, published, sort_order). Schema in
  `supabase/weekly-cases-schema.sql`.
- The nurture cron (`app/api/nurture/route.ts`) sends every **Wednesday** to
  leads whose `resource` is a casebook (see `lib/casebooks.ts`). Each lead gets
  the lowest-sort_order published case they have not received. Dedupe via
  `nurture_sends` (sequence `weekly_case`, step = sort_order).
- Email body/subject built by `weeklyCaseBody` / `weeklyCaseSubject` in
  `lib/nurture.ts`. A `[TEST]` send-to-one action exists in the admin API.

## Upload steps (do this, don't paste SQL)

Copy-paste of SQL into Supabase keeps corrupting; use the live admin API instead.
Admin password: `beyondcampus2024`. Base URL: `https://www.beyond-campus.in`.

1. **Show the founder the case first** (title, prompt, hint) so they can veto.
2. **Add it** (lands unpublished). Write the payload to a temp JSON file and
   `curl --data-binary @file` so shell quoting can't mangle the prose:

   Payload: `{"password":"beyondcampus2024","action":"add","title":"...","prompt":"...","hint":"..."}`
   `POST https://www.beyond-campus.in/api/admin/weekly-cases`  ->  `{"success":true}`

3. **Publishing sends real email on the next Wednesday.** Confirm with the
   founder before publishing unless they've already said to publish directly.
   To publish: `list` to get the id, then `toggle`:
   - `{"password":"beyondcampus2024","action":"list"}` -> find the case id
   - `{"password":"beyondcampus2024","action":"toggle","id":"<id>","published":true}`
4. **Verify** with `list` and report the sort_order (that's the send order) and
   whether it's LIVE.

Optional: to preview the exact email, use the admin API `test_send`:
`{"password":"beyondcampus2024","action":"test_send","id":"<id>","email":"bookings@beyond-campus.in"}`

## Guardrails

- Never characterise Aon-owned assessment products (cut-e, CoCubes) in a case;
  neutral is fine (see `founder-employer-aon` memory).
- Keep cases sector-realistic and solvable; a partner-level case is hard because
  it is ambiguous, not because the numbers are impossible.
- Default to writing ONE case per request unless asked for more.

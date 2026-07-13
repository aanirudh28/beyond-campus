# 05 — AI Narration

The narration layer is the product's distinctive magic *and* its only marginal
cost. This doc pins the prompt contract, the real cost math, the scaling
ladder, and the quality bar for the zero-AI fallback path. Model policy:
`claude-haiku-4-5` for everything, per repo convention (AGENTS.md) — revisit
only if a cheaper tier ships.

## 1. The prompt contract (as built, now constitutional)

From `lib/life/ai.ts`:

- **AI never touches the economy.** Numbers, effects, options, outcomes live
  in the content graph (`types.ts` header rule). The AI rewrites *narration
  prose only*.
- Two call types: `sceneNarrations` (per chapter: rewrite each dealt card's
  authored `base` in 2–3 sentences for continuity with the player's actual
  history; must preserve every number; returns JSON id→string map) and
  `writeEpilogue` (4 paragraphs, 220–280 words, + share one-liner).
- Authored `outcome` lines are **never** AI-replaced (shown verbatim after
  every choice).
- The shared `VOICE` block (second person, present tense, Indian texture, ₹
  LPA money, no em dashes) is the style constitution; §6 extends it.
- Every AI function returns `null` on any failure; callers always hold
  authored fallbacks (`fallbackEpilogue`, card `base` text). Narration is
  cosmetic by contract — `POST /api/life/scene` always returns 200.

## 2. Cost math (the numbers that drive everything below)

Haiku 4.5: $1 / MTok input, $5 / MTok output. Cache reads ≈ 0.1× input;
5-minute cache writes 1.25×.

| Call | ~Input | ~Output | ~Cost |
|---|---|---|---|
| Scene (one chapter, 5–7 cards) | 1.5k tok | 500 tok | $0.004 |
| Epilogue | 1.5k tok | 450 tok | $0.004 |
| **Full run (6 scenes + 1 epilogue = 7 of 8 budget)** | | | **≈ $0.028 (~₹2.4)** |

| Monthly completed runs | AI spend (all-AI) |
|---|---|
| 1,000 | ~$28 |
| 10,000 | ~$280 |
| 100,000 | ~$2,800 |

Conclusion: negligible at current scale, real at viral scale. The response is
the ladder (§4) and caching (§3), never a paywall — free-means-free applies
to narration too (doc 09 §2).

## 3. Caching strategy (the real scaling answer)

Scene narration input is dominated by the VOICE block + card base texts —
which repeat across players. Two layers:

1. **Anthropic prompt caching:** structure scene prompts as
   [stable VOICE + chapter card texts, `cache_control` breakpoint] +
   [volatile player history]. Within any 5-minute window of concurrent play,
   chapter prompts hit cache at 0.1× input. Cheap to implement, ships first.
2. **Response cache by (cardId, profile-bucket, chapter):** most players with
   the same profile who made similar recent pivotal choices get
   interchangeable scene prose. Bucket key = `(chapter, profile,
   last-2-pivotal-choices)`. A `life_ai_cache` table (doc 11 §3) stores
   generated narrations per bucket; hit ⇒ zero API cost and zero budget
   spend. Epilogues are **never** response-cached — the ending payoff must be
   about *this* life. Expected effect at scale: >70% of scene calls served
   from cache once traffic concentrates (27 profiles × small bucket space).

## 4. The degradation ladder (decision)

Budget pressure sheds the *least* valuable calls first. As built, every run
gets 8 credits (`life_consume_ai_call` RPC, 6h window). The ladder governs
what changes under a monthly spend cap:

| Rung | State | What the player gets |
|---|---|---|
| 0 | Normal | 6 scenes + epilogue, all AI (cache-assisted) |
| 1 | Soft cap (80% of monthly budget) | Scenes for chapters 1, 3, 5 + epilogue; other chapters use authored base (players cannot tell which is which — that's the §5 bar) |
| 2 | Hard cap | Epilogue only (the highest-value call — it is the share payoff) |
| 3 | Kill switch / API outage | Full authored mode; product remains complete |

- **Monthly cap: $300** initially (env-configurable), checked by a cheap
  aggregate on `life_runs.ai_calls` — no new infra, no cron.
- At every rung the game is free and finishable. Degradation is silent; no
  "upgrade for better prose" surface exists or ever will.
- Per-run budget stays 8 and the 6-hour RPC window stays (slow players fall
  back to authored text past 6h — acceptable as built).

## 5. Fallback quality bar

Authored text is not a fallback in the apologetic sense — it is the floor the
AI must beat. Checklist for every card's `base` and for `fallbackEpilogue`
variants (enforced in doc 12's review):

- Reads complete without AI: no dangling references to "as you said" context.
- Carries the same numbers and consequences as the card's effects.
- A rung-3 run must still pass the litmus rule end-to-end. Periodic QA:
  founder plays one full run with AI disabled per content drop.

## 6. Voice guide (extends the VOICE block)

- Second person, present tense, no em dashes (as built).
- Indian texture is *specific*, never costume: EMIs on the 5th, Diwali
  bonuses, "settle down" phone calls, batchmates' Instagram — not stereotypes.
- Money always ₹, LPA/lakhs; never dollars, never paise precision.
- Never moralize (doc 02 §8); consequences speak.
- **Hinglish mode (doc 03 §7):** a player toggle adds a single instruction to
  the VOICE block (natural Hinglish, Roman script, English numerals). Same
  authored English base, same fallbacks (English — acceptable for a pilot).
  Ships as P3 experiment behind analytics event `narration_lang`.

## 7. Personalization depth (decision)

Scene prompts currently receive the player's recent history digest — keep it
that way. **Rejected:** feeding full run history into every scene call
(2–3× input cost, marginal prose gain, breaks the §3 response cache). The
epilogue is the one call that gets the full pivotal-moment digest
(`pivotalMoments` in `engine.ts`, as built), because it is the payoff and is
never cached.

## 8. Failure & retry

- Scene fetch: client retries ×2 with backoff before settling on authored
  text (doc 06 §6 — currently 0 retries; fix in P0). Retries do not spend
  extra budget credits beyond the RPC's atomic consume.
- `parseClaudeJson` (shared from `lib/tracker.ts`) guards malformed output;
  any parse failure = authored fallback, never a visible error.
- Log every fallback occurrence as an analytics event (`ai_fallback`,
  doc 08 §3) so degradation is observable — today it is silent and unmeasured.

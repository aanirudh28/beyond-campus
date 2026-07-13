# 06 — Run UX

The 60-minute arc screen by screen, the ending-reveal choreography, and the
two known UX debts (share-page parity, scene retry). Mobile-first throughout:
share links open from WhatsApp, so ~90% of arrivals are phones. House tokens
apply (`#0B0B0F`, `#4F7CFF→#7B61FF`, DM Serif / DM Sans / Geist Mono).

## 1. The arc

```
Landing (/20years)          Play (/20years/play)                    Share (/20years/life/[id])
┌────────────────┐   ┌──────────────────────────────────────┐   ┌──────────────────┐
│ hero           │   │ profile (3 Qs) → seed reveal          │   │ ending + graph   │
│ how it works   │──▶│ ch1..6: intro → cards → outcome beats │──▶│ ghost + rarity   │
│ endings wall   │   │ ending reveal sequence                │   │ play-yours CTA   │
└────────────────┘   └──────────────────────────────────────┘   └──────────────────┘
```

## 2. Onboarding: 3 questions, then the world exists

Stream / city / ambition chips, then the seed reveal beat: "Your world is
seed #48291. Every choice from here is yours." The seed number is shown
deliberately — it is the fairness receipt (doc 02 §6) and the challenge
currency (doc 07). No name, no email, no account (identity decision: no-auth
core forever; optional account-link only at report-claim, §5).

Challenge arrivals (`?l=seed.stream.city.ambition`) see locked profile chips
and a banner: "You're living {friend}'s world. Same luck. Your calls."

## 3. The card loop

As built (`DecisionCard.tsx`, `StatBar.tsx`, `ChapterIntro.tsx`):

- Sticky HUD: 5 bars + age/year. Decisions: title, narration, 2 option
  buttons. Events: 1–2 options, visually distinct (mono EVENT label).
- **The outcome beat is sacred:** after every choice, the authored `outcome`
  line + stat-delta chips, on their own beat before the next card. Never
  auto-advance past it; consequence legibility is the game.
- Pivotal cards get a subtle marker (the ⟡ glyph) — players should be able to
  feel weight without knowing the mechanics.
- Chapter intro screens hold on AI readiness with a 6s timeout, then proceed
  with authored text (see §6 for retry).

## 4. The ending sequence (choreography)

The payoff is a *sequence*, not a screen. Order is load-bearing — emotion
first, comparison second, conversion last:

1. **The reveal:** ending name + emoji + tone-colored treatment, rarity line
   ("7% of 12,400 lives end here").
2. **The epilogue:** 4 paragraphs (AI or authored). Full-bleed reading view.
3. **The life graph:** net worth + salary trails (`LifeTimeline.tsx`) with the
   2–3 pivotal moments annotated.
4. **The ghost:** "In the life where you {other choice}…" — alternate ending
   + net-worth delta (doc 07).
5. **The share stack:** WhatsApp share, download card (1080×1350 PNG),
   challenge link ("send them YOUR life"), copy link.
6. **The Life Report:** first turning point free, remaining items behind the
   email gate (§5).
7. **One more life:** replay CTA with a different-profile suggestion + the
   collection state ("7 of 32 discovered", NEW badge).

**CTA hierarchy decision:** share/challenge above report, replay last. The
growth loop (doc 10) monetizes attention better than a premature email ask,
and replay is the natural exit action, not the headline.

## 5. The report gate & optional account link

The email gate on the full Life Report is the product's only gate (doc 09
§2). At claim: email → `leads` (nurture drip). **New:** a post-claim optional
"link this email to your Beyond Campus account" step so the ending collection
persists cross-device (founder decision: no-auth core + optional link).
Implementation: claim response includes a link token; if the email matches an
existing auth user, collections sync via a `life_collections` keyed store
(doc 11 §3). Declining changes nothing; collections stay per-device.

## 6. Failure states & versioning copy

| State | Behavior | Copy direction |
|---|---|---|
| Scene fetch fails | retry ×2 w/ backoff, then authored base (doc 05 §8) | invisible — never surface |
| Rate limited (10 runs/day/IP) | block new run | "Ten lives in one day is a lot of living. Come back tomorrow." |
| Save expired (24h) or CONTENT_VERSION bump | discard save, offer fresh start | "Your world has moved on — the simulation updated while you were away. Start a new life (your discovered endings are safe)." Never the word "error". |
| Completed-run revisit (409 on ending) | route to their share page | — |
| Old share link, any version | renders from stored data (doc 04 §3) | no degradation, no banner |

## 7. Share-page parity spec (P0 fix)

The public page (`/20years/life/[id]`) is currently a thin cousin of the
private ending screen. Target parity, rendered from stored fields
(doc 11 §2):

| Element | Private | Public (target) |
|---|---|---|
| Ending, epilogue, one-liner, rarity | ✅ | ✅ (as built) |
| Life graph | ✅ | ✅ (as built, but from stored trail — no replay) |
| Ghost comparison | ✅ | **add** (from stored ghost summary) |
| Challenge link ("play this exact life") | ✅ | **add** (from stored params) — this is the missing loop-closer, doc 10 §2 |
| Stat tiles | ✅ | ✅ |
| Life Report + email gate | ✅ | **never** — the report belongs to the player; public pages convert via "play yours" |
| Play-yours CTA | — | ✅ primary |

OG image (`opengraph-image.tsx`) stays per-run; per-ending share-asset
variants are doc 10 §4.

## 8. Anti-goals

- No timers, no urgency mechanics inside a run — the "60 minutes" is a
  promise of scope, not a countdown.
- No mid-run interstitials, upsells, or email asks. Conversion surfaces exist
  only after the ending.
- No settings screen. The product has at most two toggles ever (narration
  language, doc 05 §6; sound if added) and they live unobtrusively on the
  play screen.

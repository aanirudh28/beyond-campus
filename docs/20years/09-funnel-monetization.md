# 09 — Funnel & Monetization

How a free toy pays for itself without ever feeling like a funnel. The
business model is indirect by design: 20years generates qualified emotional
intent; apti, the tracker, and the cohorts convert it. Nothing in the game is
ever paid.

## 1. The conversion theory

The Life Report (`lib/life/content/report.ts`) is the bridge. Its power is
that every item is *earned by the player's own run* — "at 22 **you** skipped
the Excel sprint" converts where generic advice doesn't. The chain:

```
sim regret (felt) → report item (named) → real action (small) → BC surface (CTA)
```

The whole business case is the report→CTA click-through. If that number is
<5% after iteration, the funnel thesis fails and 20years is a brand asset,
not a funnel (kill criterion, doc 14).

## 2. The line (constitutional)

**The entire game is free forever.** Every card, ending, ghost, challenge,
cohort deck, share asset. The email gate on the full Life Report is the
product's *only* gate. Where marginal cost accrues (AI narration), the answer
is the degradation ladder (doc 05 §4) — never a meter shown to players, never
a paywall. This mirrors the platform's "free means free / monetize only where
cost accrues" rule, and is stricter: here even the cost-accruing surface
degrades free rather than charging.

Anti-goals, permanent: no run limits beyond anti-abuse (10/day/IP), no energy
mechanics, no ads, no "premium endings," no paid rarity boosts.

## 3. Report rules v2 (12 → ~25)

Current: 12 conditional rules + always-on closer, ≤5 shown + closer. The
expansion fills coverage gaps so every run generates ≥4 *earned* items:

| Gap today | New rules (examples) | CTA target |
|---|---|---|
| Career-track specific | exam_track drift, own_business lessons, went_abroad tradeoff | /book (₹549 strategy call) |
| Skill signals | ai_native early adoption praise, skills-stagnation warning | /aptitude |
| Network positive-path | board_seat / people_bank reinforcement ("systematize it") | /tracker |
| Money mechanics | emi timing, bought_dip discipline, lifestyle creep | /guides |
| Family/boundary | showed_up reinforcement, career_first warning | /book |
| Cohort-shaped moments | swallowed_it (visibility), proof_of_work | /cohort |

Rules stay in the same `when(state)` shape; each new rule registers its flags
in the registry (doc 03 §5). Selection stays ≤5 + closer, ranked: rules
pointing at *paid* surfaces cap at 2 per report — the report must read as a
mirror, not a brochure.

## 4. The leads handshake

As built: claim inserts `{email, resource:'20years'}` into `leads`, feeding
the existing nurture cron (no new cron — hard 2-cron limit). Additions:

- **Dedicated drip branch:** the nurture sequence for `resource='20years'`
  opens with the player's own frame ("Your simulation said the next 90 days
  matter most — here's day 1"), then converges with the standard leads
  sequence. Sequence copy is specced here; `/api/nurture` executes it.
- **Dedupe:** email already in `leads` from another resource ⇒ tag, don't
  duplicate; already a tracker/apti user ⇒ skip the intro drip entirely
  (they're past TOFU).
- **Budget:** Resend ≈100/day, nurture capped 70/run — 20years leads join
  that cap; at >70 new claims/day the drip queues (acceptable; the report
  itself already delivered the value).
- **Persona hygiene** (future, doc 03 §4): non-BBA/BCom leads carry their
  stream so the drip can branch or exclude.

## 5. Attribution

- Every report CTA href carries `?utm_source=20years&utm_campaign=report`
  (share pages: `utm_campaign=share`; cross-promo tiles: `=tile`).
- `report_cta_clicked` events (doc 08 §3) give click-through; downstream
  conversion reads UTM at booking/purchase (existing surfaces already log
  source on `leads`/purchases).
- The number that matters monthly: **claims → apti activation → cohort
  bookings attributable to `source=20years`**, reviewed against the doc 14
  kill criteria.

## 6. Parked experiments (deferred, not decided)

Founder-flagged, revisit post-P2 with data; none may violate §2:

- **₹99 printed "Life Certificate"** (physical/merch of your ending card) —
  cosmetic commerce, not gameplay. Only if organic demand appears in shares.
- **TPO/B2B pricing for cohort decks** (doc 07 §3) — free pilot first; charge
  institutions, never students.
- **Sponsored season events** (a fintech sponsoring the investing arc) —
  high brand risk; requires editorial firewall rules before even piloting.

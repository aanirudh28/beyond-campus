# 01 — Strategy & Positioning

Why a career life-simulator exists inside a placement-prep platform, what job it
does in the funnel, and the metrics that decide whether it earns further
investment.

## 1. The real problem

Career anxiety for a tier-2/3 BBA/BCom student is *abstract*. "Compound your
skills" and "network early" are sermons — nobody feels a sermon. Apti attacks
the problem rationally (practice, ratings, readiness scores); it captures
students who already have intent. But most students at 20 don't have intent
yet. They have vague dread.

20 Years in 60 Minutes converts that dread into a *felt experience*: you live
ages 21→45 in ~35 choices, and the consequence of skipping the Excel sprint at
22 arrives as a smaller flat at 38. The simulation does what no article can —
it makes the cost of the default path emotionally concrete, then hands the
player a Life Report that maps their fictional regrets to real actions at 21.

## 2. The five core mechanics

Everything in this suite hangs off five mechanics. If a proposed feature
doesn't strengthen one of these, it doesn't ship.

1. **Deterministic fate.** Seed + profile + choices fully determine a life
   (`lib/life/engine.ts`). No hidden dice. This is what makes ghosts, challenges,
   rarity, and fairness *provable* rather than claimed.
2. **The pivotal choice.** ~30 of 80 cards are marked pivotal; they gate
   endings and feed ghosts. The player should be able to name the moment their
   life turned.
3. **The ghost.** The road not taken, simulated for free from the same seed
   (`simulateGhost`). Regret as a rendered chart, not a lecture.
4. **The collection.** 32 endings, "X of 32 discovered," rarity percentages.
   Replay pressure without daily-habit mechanics.
5. **The report.** The conversion surface (`lib/life/content/report.ts`): every
   sim regret mapped to one real action with a CTA into apti/tracker/cohorts.

## 3. Positioning

| Against | They are | We are |
|---|---|---|
| BitLife / life-sim games | Absurdist entertainment, US-centric, endless | Grounded in real Indian salary bands, 2026–2050, one honest hour |
| Career quizzes / "personality" tests | Horoscopes with radio buttons | A simulation with visible math and provable fairness |
| Career content (LinkedIn advice, YouTube) | Tells you what happens | Makes it *happen to you* |
| Apti (our own product) | Rational mid-funnel practice | Emotional top-of-funnel; captures pre-intent students at peak shareability |

**The three-stage funnel:**

```
20years (feel it)  →  apti (fix it)  →  cohorts / 1:1 (get placed)
  emotional TOFU       rational MOFU       paid BOFU
  no signup            email/account       ₹549–₹2,500
```

The Life Report is the bridge between stage 1 and 2; the leads nurture drip
(shared `leads` table, `resource:'20years'`) is the pipe.

## 4. The honest session model: a comet, not a habit

One run is 25–40 minutes. Success is **2–4 lifetime runs per player plus one
share**, not daily engagement. This is a comet product: it flares, it seeds the
funnel, its collection and seasons bring players back occasionally. Everything
downstream must be honest about that:

- Analytics (doc 08) measure completion and K-factor, not DAU/streaks.
- Growth (doc 10) invests in loops-per-run, not retention mechanics.
- No streaks, no energy bars, no daily rewards — those belong to apti.

## 5. North-star metrics

> **Weekly completed runs** × **challenge K-factor** (challenge links accepted
> per completed run).

Supporting tree:

- Start → ending completion rate (target ≥55%; doc 08 funnel)
- Share rate (any share action per completion, target ≥30%)
- Report-claim rate (email per completion, target ≥20%)
- Report → apti/tracker CTA click-through (target ≥8%; the funnel thesis)
- Ending-collection depth (share of players with ≥2 endings discovered)

Not tracked as goals: registered users (there are none by design), DAU,
session frequency.

## 6. The litmus rule

One test governs every card, ending, epilogue line, and share asset:

> **Does this make the player say "that's exactly what would happen to me" —
> and immediately send it to a friend?**

Recognition first, shareability second, cleverness never. A card that is
funny but not recognizable fails. An ending that is recognizable but generic
("The Success") fails the second half.

## 7. What we are NOT building

- **Real-money mechanics** of any kind. The sim's ₹ is fiction; doc 09 covers
  the (free) business model.
- **Realtime multiplayer.** Async multiverse only (ghosts, challenges, cohort
  decks — doc 07).
- **User-generated cards.** The economy is authored and balance-tested
  (doc 12); UGC breaks fairness and the voice.
- **A native app.** WhatsApp-opened mobile web is the surface.
- **Non-career life depth.** Marriage, health, family exist as texture and
  stats, never as their own gameplay systems. This is a *career* sim.
- **A separate brand.** 20years lives at beyond-campus.in/20years permanently
  (decision confirmed); every share URL builds the main domain.

## 8. Why this product is defensible

Anyone can clone a quiz. Cloning this requires: an authored 80-card economy
balanced by simulation (docs 02, 12), a deterministic engine enabling
zero-cost ghosts and verifiable rarity (doc 04), an AI narration layer with a
cost model (doc 05), and — the real moat — a funnel to monetize attention it
generates (doc 09). The moat is the *system*, and the system is this suite.

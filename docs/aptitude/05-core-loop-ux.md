# 05 — Core Loop, UX & Screens

House style throughout: dark `#0B0B0F`, gradient `#4F7CFF→#7B61FF`, DM Serif
Display for display type, DM Sans body, Geist Mono for numbers/timers.
Minimal, fast, one primary action per screen. Mobile-first (our users are on
₹12k phones on hostel wifi) — every screen designed at 360px first.

## 1. Information architecture

```
/aptitude                    → public landing (SEO)
/aptitude/[topic]            → public topic hub (SEO, doc 11)
/aptitude/companies/[slug]   → public company prep page (SEO, doc 08)
/aptitude/q/[slug]           → public question+explanation pages (SEO, doc 11)
/practice                    → THE app home = today's set (auth)
/practice/set/[id]           → solving surface (daily set / topic session / review)
/practice/map                → mastery map
/practice/mocks              → mock ladder + history
/practice/mocks/[attempt]    → post-mock report
/practice/stats              → analytics dashboard (doc 06)
/practice/companies          → my target companies + readiness
```

Logged-in nav (bottom bar on mobile): **Today · Map · Mocks · Stats · More**.

## 2. Onboarding (target: first question answered < 90 seconds from signup)

Principle: the diagnostic IS the onboarding. No tour, no feature carousel.

1. **Auth** — existing Supabase (Google one-tap primary for this audience).
2. **Three taps of context** (one screen each, skippable):
   - Degree (BBA/BCom/BA/Law/other) → powers peer percentiles
   - Placement timeline ("When's your first test?" — month picker / "not sure")
     → powers pacing + countdown
   - Target lane (Big 4 & consulting / Banking & finance / FMCG-sales-marketing /
     Any good role / MBA prep) → seeds target companies
3. **"Let's find your level"** — 8-question adaptive diagnostic (binary-search
   difficulty ladder across arithmetic + logical + verbal). Framed as the game
   itself, not a test: instant per-question feedback, rating counter visibly
   converging at top.
4. **The reveal** (the magic moment, must land):
   - "Your starting Apti Rating: **1140** · Top ~40% of BBA students"
   - Mini map: 2 strengths, 2 gaps, "your first focus: Percentages"
   - "Deloitte readiness: 34/100 — here's the 6-week path" (if lane chosen)
   - One button: **"Start Day 1"** → first real daily set (8 questions on day 1).
5. Post-set: streak = 1, WhatsApp nudge opt-in ("12 minutes a day. We'll remind
   you. That's it."), done.

## 3. Home = Today (`/practice`)

The home screen is the daily set. Not a dashboard with the set inside it.

```
┌──────────────────────────────────┐
│  Tue 14 Jul · 🔥 11 days         │
│                                  │
│  Today's Set                     │
│  10 questions · ~12 min          │
│  2 review · 5 percentages        │
│  2 mixed · 1 stretch             │
│                                  │
│  [ ▶ Start today's 10 ]          │  ← single gradient CTA
│                                  │
│  Quant 1287 ▲12 this week        │
│  Deloitte readiness 62 ▲3        │
│                                  │
│  Extra practice ▾                │  ← collapsed: topic session,
│  Review backlog (3 due) ▾        │     speed round, mocks
└──────────────────────────────────┘
```

States: **not started** (above) · **mid-set** ("Resume — 4 left") ·
**done** (summary card + "extra practice?" + tomorrow preview) ·
**streak at risk** (post 8pm, copy shifts: "11 days needs 12 minutes") ·
**comeback** (missed ≥3 days: "Warm-up set, slightly easier. Streaks restart;
ratings don't. Your 1287 is still yours." — zero guilt copy).

## 4. Solving surface

One question. Nothing else.

```
┌──────────────────────────────────┐
│  ●●●●○○○○○○            3/10   ✕ │   ← progress dots; ✕ = save & exit
│                                  │
│  A shopkeeper marks up 40% and   │
│  offers a 25% discount. His      │
│  overall profit is:              │
│                                  │
│  ○ 5% profit                     │
│  ○ 15% profit                    │
│  ○ 5% loss                       │
│  ○ No profit, no loss            │
│                                  │
│  💡 Hint                         │
│         [ Lock answer ]          │
└──────────────────────────────────┘
→ calibration sheet slides up: [ Sure ] [ Think so ] [ Guessing ]
→ reveal:
┌──────────────────────────────────┐
│  ✓ Correct · 41s (benchmark 55s) │
│  +9 → Quant 1296                 │
│  ──────────────────────────      │
│  Solution ▾   Shortcut ★ ▾       │
│  1.4 × 0.75 = 1.05 → 5% profit   │
│         [ Next → ]               │
└──────────────────────────────────┘
```

Wrong answer adds: trap explanation first ("You did 40−25. Percentages on
different bases never subtract."), then the required one-tap "What happened?"
(concept / calc slip / misread / trap / time) → "Added to your Redemption
Queue — it returns Thursday."

Set completion screen: rating delta with count-up animation, mastery changes
("Percentage change: Familiar → **Proficient**"), redemptions won, streak tick,
time vs benchmark summary, [Share card] (doc 11), [Done] / [Keep going].

## 5. Mastery Map (`/practice/map`)

Not a fake tree — an honest grid grouped by domain → topic, each skill a chip
colored by state (Unseen dim → Learning blue → Familiar indigo → Proficient
gradient → Mastered gold ring → Rusty amber). Tap chip → skill sheet: rating,
accuracy, time trend, "practice this skill," why-it-matters (companies that
test it), prerequisite links. Top of map: "Recommended focus: Profit & Loss —
because Percentages just hit Proficient." Filter: by target company (dims
skills that company doesn't test — the map literally reshapes per goal).

## 6. Key empty states (copy matters more than pixels)

- **Stats, day 1:** "Your dashboard is earning itself. After ~3 sets we'll show
  you patterns even you don't know about yet."
- **Redemption queue empty:** "Nothing to redeem. Either you're perfect or
  you're new — both fixable." [Practice]
- **Mocks, none taken:** "Nobody likes mocks. That's why yours starts at 15
  minutes, not 60. First checkpoint unlocks a real readiness number."
- **Map, all unseen:** "60 topics looks scary. You need ~14 of them for your
  first target. Start with today's set — the map fills itself."

## 7. Notifications (in-app + WhatsApp opt-in; email only weekly)

| Trigger | Channel | Copy sketch |
|---|---|---|
| Daily, user-chosen hour | WhatsApp/push | "Day 12 needs 12 minutes. 2 redemptions waiting." + deep link |
| Streak at risk (evening) | WhatsApp | "🔥 11 days on the line. One set keeps it." |
| Mastery milestone | in-app | "Percentages → Proficient. 3 of 14 Deloitte skills done." |
| Weekly report (Sun) | email (fits Resend budget) | Wrong-answer autopsy + week plan (doc 06 §4) |
| Rating milestone | in-app + share prompt | "Quant crossed 1300 — top 25% of BBA students." |

Caps: ≤1 outbound/day. Quiet by default; the product must be missable without
being naggy — guilt-free comeback is the retention play, not notification spam.

## 8. Design tokens (delta over existing globals.css)

```
--apti-correct: #34D399   --apti-wrong: #F87171   --apti-stretch: #FBBF24
--apti-mastered: #F5C518 (ring only)              --apti-rusty: #F59E0B
--rating-font: var(--font-geist-mono)             /* all numbers mono */
motion: 150ms ease-out; count-up on rating deltas; no confetti except
  first-ever redemption and Mastered transitions (rare = meaningful)
```

Reuse `SiteChrome.tsx`, grain, reveal patterns per the design-system memory.

# 08 — Company Database & Readiness Score

## Why this exists

"Deloitte aptitude test pattern 2026" is what our student actually googles the
night they get the email. Company pages are simultaneously: (a) the highest-
intent SEO surface, (b) the input to the Readiness Score, (c) the bridge from
"random practice" to "purposeful practice."

## Schema

```jsonc
// companies
{
  "slug": "deloitte",
  "name": "Deloitte",
  "tier": "big4",              // big4|consulting|banking|fmcg|tech-nontech|startup|psu-lite
  "roles": ["Analyst", "Consultant (BTA)", "Audit Assistant"],
  "hiring_seasons": ["Aug-Oct", "Jan-Feb"],
  "test_vendor": "versant|shl|aon-cut-e|amcat|mettl|inhouse|hirevue",
  "pattern": {                  // versioned; new row per season, keep history
    "season": "2026",
    "sections": [
      { "name": "Quantitative", "questions": 25, "minutes": 35,
        "skills_weight": { "percentages": 3, "ratio": 2, "di-tables": 3, "..." : 1 },
        "negative": 0.25, "back_nav": false },
      { "name": "Logical", "questions": 24, "minutes": 35, "...": "..." },
      { "name": "Verbal", "questions": 25, "minutes": 25, "...": "..." }
    ],
    "difficulty_band": [1150, 1400],       // rating range of typical questions
    "estimated_cutoff_pct": 70,            // per section where known
    "confidence": "reported|verified|estimated",   // honesty label, always shown
    "sources": ["user-reports:23", "public"]
  },
  "notes_md": "GD/JAM follows aptitude; versant English round...",
  "roadmap": { "weeks": 6, "milestones": [ ... ] },
  "status": "published"
}
```

**Data honesty rule:** every pattern datum carries a confidence label. We never
present guessed cutoffs as facts — "estimated from 23 student reports, Jan 2026"
builds more trust than fake precision. Crowdsource loop: post-test 60-second
report form ("which sections? how many Qs? rough difficulty? did you clear?")
prompted to users whose target company's season is active; 25+ reports →
pattern marked `verified`, contributors credited.

## Seed list (~40, by funnel priority)

- **Big 4 + consulting adjacents (P0):** Deloitte, EY, KPMG, PwC, Grant Thornton,
  ZS, Accenture Strategy, Aon, McKinsey (knowledge/analyst roles — never framed
  as closed doors), BCG (RA/KT), Bain (ACI)
- **Banking/finance (P0):** ICICI, HDFC, Axis, Kotak, HSBC, Amex, JPMC ops,
  Goldman ops (P1), Barclays, Deutsche ops
- **FMCG/GT sales & MT (P1):** HUL, ITC, Nestlé, Marico, Dabur, Asian Paints,
  Aditya Birla Group (ABG LEAP)
- **New-age (P1):** Amazon (non-tech ops/vendor mgmt), Flipkart, Swiggy, Zomato,
  Uber, Urban Company, Meesho, Razorpay (non-tech)
- **Vendors as pseudo-companies (P0):** SHL, Aon cut-e, AMCAT, CoCubes, Mettl,
  Versant — "the recruiters' section decoder": students face the *vendor's*
  test more than the company's; almost nobody explains vendors. High SEO value.

## Company page template (public `/aptitude/companies/[slug]`)

1. Pattern card (sections/questions/time/marking, confidence-labeled, season)
2. Difficulty vs our bank ("their quant sits around 1250 — try 3 sample Qs at
   that level right now" — instant interactive hook, no signup for 3 questions)
3. Topic weight chart → which skills matter (links to topic hubs)
4. The N-week roadmap (concrete weekly milestones)
5. Cutoff & selection funnel notes, GD/interview what-comes-after
6. CTA: "Get your Deloitte readiness score" → signup → diagnostic seeds it
7. For logged-in users the same page becomes personal: readiness score, your
   gaps vs their weights, "start Deloitte plan."

## Readiness Score (0–100) — the math

For company C with section-skill weights `w_s` (normalized), user skill states:

```
skill_score(s)   = mastery_value(s) × speed_factor(s)
  mastery_value  : unseen 0 · learning .25 · familiar .5 · proficient .85 · mastered 1 · rusty .6
  speed_factor   : 1 if median_time ≤ benchmark×1.25 · else linear down to .6 at 2×

coverage   = Σ w_s × skill_score(s)                            (0–1)
mock_factor= 0.75 + 0.25 × best_relevant_mock_percentile        (no mock → 0.75 cap noted in UI:
                                                                 "readiness capped until a checkpoint")
recency    = 1 − 0.15 × staleness(no practice in 14d on weighted skills)

readiness  = round(100 × coverage × mock_factor × recency)
```

Bands: <40 "Foundation" · 40–65 "Building" · 65–80 "Almost there" · 80+
"Test-ready" (never promise selection — copy: "ready for the *test*; interviews
are a different game — that's what cohorts are for," said once, quietly).

**"What moves it"**: top-3 levers computed directly from the gradient — the
highest `w_s × (1 − skill_score)` skills plus the mock cap if unmet. Always
shown with the score. A number without levers is a judgment; with levers it's
a plan.

## Placement-calendar awareness (v2)

`hiring_seasons` + user timeline → ambient urgency done honestly: "Big 4 campus
season typically opens in August. You have ~6 weeks — your plan needs 5
sets/week." Season-open banner on relevant company pages. No fake countdowns.

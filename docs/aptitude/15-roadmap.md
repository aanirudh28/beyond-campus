# 15 — Roadmap, Sprints & Launch

Assumption: solo founder + Claude Code, ~2 focused build hours + ~1.5 content
hours/day, shipping to production on push (no staging — feature-flag risky
surfaces via a simple `apti_flags` check).

## Phase 0 — Foundation (weeks 1–2)

**Goal: a daily set answerable end-to-end by the founder's own account.**

- [ ] `supabase/apti-schema.sql` (doc 12) pasted + RLS verified with two test users
- [ ] `lib/apti.ts`: Elo, SM-2-lite, mastery transitions, set builder — pure
      functions with unit tests (the only part of this product where bugs
      silently corrupt user trust; test it properly)
- [ ] `/api/apti/daily-set` + `/api/apti/answer` (server-side grading, trust
      boundary per doc 12)
- [ ] Solving surface + reveal + calibration + error-tap (doc 05 §4)
- [ ] Today home (3 states: fresh/mid/done) + streak logic
- [ ] Admin question console with keyboard review flow (doc 13)
- [ ] Content: trap libraries + generation prompts for the 5 foundation topics
      (Percentages, Ratio, Averages, Series, Coding-Decoding) → **300 approved Qs**

Exit test: founder does a real daily set on the phone every day of week 2.

## Phase 1 — Private beta (weeks 3–6)

**Goal: 50 real students from the existing base using it daily; learning loop complete.**

- [ ] Onboarding + 8-Q diagnostic + rating reveal (doc 05 §2)
- [ ] Redemption queue live in daily sets; redemption celebration
- [ ] Mastery map v1; mastery transitions surfaced in set summary
- [ ] Checkpoint mocks (rung 1) + post-mock report v1 (score, minutes, fix plan)
- [ ] Stats v1: quadrant, error mix, calibration curve (docs 06 W2–W4)
- [ ] Content → **1,200 approved** (finish arithmetic P0 + logical P0 core + verbal grammar/RC start)
- [ ] Recruit 50 beta users from tracker/nurture lists; WhatsApp group for feedback
- [ ] Instrument all doc-06 events from day one

Exit metrics: ≥50% D7 of activated betas; median set completion <14 min;
zero answer-key complaints unresolved.

## Phase 2 — Public launch (weeks 7–10)

**Goal: SEO surface live, readiness scores real, soft public launch.**

- [ ] Public pages: landing, 20 topic hubs, 12 company pages, 4 vendor decoders,
      100 SEO question pages (doc 11)
- [ ] Company DB + readiness score + "what moves it" (doc 08)
- [ ] Section tests + mixed mocks (rungs 2–3), negative-marking counterfactual
- [ ] Weekly autopsy email (Resend budget check: batch under existing caps)
- [ ] WhatsApp opt-in nudges (manual/intern-operated broadcast initially; API later)
- [ ] Share cards (rating/streak/challenge) + Daily Challenge
- [ ] AI tutor (metered, `ai_generations` pattern) + ₹299 bundle extension
- [ ] Content → **2,000 (full P0)**
- [ ] Launch: nurture sequence to existing base → founder LinkedIn post →
      ambassador kit v1 to the 2 interns' college networks

Exit metrics: 500 WAU, activation ≥55%, first organic SEO signups.

## Phase 3 — Compounding (months 3–6)

- Company sims (rung 4) for top-10 companies; pattern-report crowdsourcing
- Study circles + college boards + Monthly Placement Readiness Test + TPO dashboards
- Business & Case Aptitude domain (the signature content)
- Learn Cards; leagues (if streak data supports); Ghost mode
- Content → 3,700 full v1; 500 SEO question pages; discussions (phase-3 gate:
  sustained daily traffic)
- Evaluate: PWA install prompts, WhatsApp Business API, standalone app decision

## Standing weekly rituals (founder ops, ~2h/week)

Mon: funnel + learning metrics review (doc 06 §4) · Wed: worst-20 questions +
flag queue · Fri: one distribution artifact (trap Reel / LinkedIn trap-of-week
from the trap library) · Sun: pattern-report approvals in season.

## Kill criteria / honesty checkpoints

- Week 6: if beta D7 < 30% despite iteration, the loop isn't landing — stop
  adding features, run 10 user interviews, fix the core before Phase 2.
- Month 4: if 30-day rating delta for active users isn't clearly positive,
  the adaptive/content difficulty needs recalibration before any growth push
  (growth on a product that doesn't demonstrably improve students burns the
  brand that the cohorts depend on).

## Sequencing rationale (why this order)

Habit loop before content breadth (a perfect bank nobody opens daily is
IndiaBix). Measurement before growth (readiness scores are the shareable,
fundable proof). SEO before paid anything (compounds while sleeping). Community
last (needs density to be alive, moderation to be safe, and a solo founder has
neither on day one).

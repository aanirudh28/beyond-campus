# Beyond Campus Aptitude — Product Design System

The definitive free aptitude preparation platform for non-tech Indian students.
Working name: **"Apti" by Beyond Campus** (final naming in 11-growth-seo.md).

## How to read this

Documents are ordered. Strategy first, implementation assets last. Each doc is
self-contained enough to hand to a contributor, but they reference each other.

| # | Doc | What it contains |
|---|-----|------------------|
| 01 | [strategy.md](01-strategy.md) | First principles, why students quit, the 7 core mechanics, positioning, metrics tree |
| 02 | [pedagogy.md](02-pedagogy.md) | Learning science → concrete product mechanics mapping |
| 03 | [content-taxonomy.md](03-content-taxonomy.md) | Full domain → topic → subtopic → skill tree (~60 topics), per-topic design template |
| 04 | [question-engine.md](04-question-engine.md) | Question schema, types, Elo adaptive engine, spaced repetition, hints, calibration |
| 05 | [core-loop-ux.md](05-core-loop-ux.md) | Daily Set, onboarding, screens, wireframes, empty states, copy |
| 06 | [analytics.md](06-analytics.md) | Student-facing dashboard spec + internal event taxonomy |
| 07 | [mocks.md](07-mocks.md) | Mock ladder: micro-checkpoints → company simulations, scoring, percentiles |
| 08 | [companies.md](08-companies.md) | Company DB schema, seed list (~40), page template, readiness score math |
| 09 | [gamification-community.md](09-gamification-community.md) | Rating, streaks, mastery identity, study circles, leaderboards |
| 10 | [premium.md](10-premium.md) | Free/paid line, cohort funnel, what is NEVER paywalled |
| 11 | [growth-seo.md](11-growth-seo.md) | Naming, SEO page architecture, ambassadors, WhatsApp, share loops |
| 12 | [architecture.md](12-architecture.md) | Supabase SQL schema, API routes, repo integration, cron strategy |
| 13 | [content-pipeline.md](13-content-pipeline.md) | Question production SOP, Haiku draft prompts, QC rubric, dedupe, versioning |
| 14 | [differentiators.md](14-differentiators.md) | 50 innovations nobody currently offers, ranked by effort × impact |
| 15 | [roadmap.md](15-roadmap.md) | Phases, sprint plans, backlog, launch checklist |

## Stated assumptions (decisions made; override if wrong)

1. **This lives inside beyond-campus.in**, not a separate product. Shared Supabase
   auth, shared design system (dark `#0B0B0F`, `#4F7CFF→#7B61FF` gradient, DM Serif
   Display / DM Sans / Geist Mono), shared nav. Route root: `/aptitude` for public
   SEO pages, `/practice` for the logged-in app. Rationale: the cohorts are the
   business model; a separate brand splits the funnel and doubles the work of a
   solo founder.
2. **Built for the actual stack**: Next.js 16 App Router, Supabase (RLS,
   `user_id = auth.uid()` pattern from the tracker), Vercel Hobby (2-cron hard
   limit — everything schedulable is computed on-read, nothing needs a new cron),
   Resend ≈100/day (so the habit channel is WhatsApp + in-app, not email),
   `claude-haiku-4-5` for AI, one-time Razorpay payments only.
3. **Content is founder-produced with AI drafting + human review**, at a target
   rate of 50–80 approved questions/day using the pipeline in doc 13. No content
   team assumed.
4. **Free means free.** No question is ever paywalled. Premium = human things
   (cohorts, mentorship, resume, interviews), matching the existing ₹549/₹1,750/₹2,500
   ladder. AI tutor chat is metered like Tracker AI (5/month free), because that's
   where marginal cost accrues — consistent with the existing "monetize only where
   cost accrues" decision.
5. **The AI Target List generator stays dead** — company *preparation* pages are
   in scope, personalized company *targeting* remains the cohort's USP.

## The one-sentence product

> Ten adaptive questions a day, a rating that visibly climbs, every mistake
> comes back until you beat it, and one number that tells you if you're ready
> for Deloitte.

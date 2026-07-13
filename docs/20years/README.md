# 20 Years in 60 Minutes — Product Design System

The career life-simulator inside beyond-campus.in: live ages 21→45 in ~35
choices, land on 1 of 32 endings, meet the lives you didn't live, and walk
away with a Life Report that maps your fictional regrets to real actions
at 21.

## How to read this

Documents are ordered. Strategy first, implementation assets last. Each doc
is self-contained enough to hand to a contributor, but they reference each
other as `(doc NN §N)`. Build status lives in commit messages that cite doc
numbers — never in these files.

| # | Doc | What it contains |
|---|-----|------------------|
| 01 | [strategy.md](01-strategy.md) | Why a life-sim, the five core mechanics, the three-stage funnel, comet session model, north-star metrics, litmus rule |
| 02 | [simulation-design.md](02-simulation-design.md) | The 7-stat economy, difficulty & believability rules, ending-distribution fairness invariants, effect budgets, replayability model |
| 03 | [content-universe.md](03-content-universe.md) | Card/ending taxonomy, expansion axes (depth → endings → seasons → personas → Hinglish), the flag registry |
| 04 | [life-engine.md](04-life-engine.md) | The determinism contract, CONTENT_VERSION policy (stored-render for old links), the invariant suite, tuning levers, extension points |
| 05 | [ai-narration.md](05-ai-narration.md) | Prompt contract, real cost math, caching layers, the degradation ladder, fallback quality bar, voice guide |
| 06 | [run-ux.md](06-run-ux.md) | The arc screen by screen, ending-reveal choreography, share-page parity spec, failure states, versioning copy |
| 07 | [multiverse-social.md](07-multiverse-social.md) | Ghosts v2, challenge lineage & scoreboards, cohort decks, the leaderboard stance, privacy rules |
| 08 | [analytics.md](08-analytics.md) | The 16-event taxonomy (frozen names), in-house life_events storage, the two founder dashboards, rarity switchover |
| 09 | [funnel-monetization.md](09-funnel-monetization.md) | The conversion theory, the free line, report rules v2, leads/nurture handshake, attribution, parked experiments |
| 10 | [growth-seo.md](10-growth-seo.md) | The three loops ranked, loop-leak fixes, ending pages as SEO surface, share assets v2, launch playbook |
| 11 | [architecture.md](11-architecture.md) | Paste-ready schema block, route changes, GitHub Actions CI gate, abuse posture, cron-free operational rituals |
| 12 | [content-pipeline.md](12-content-pipeline.md) | The solo-founder SOP: Haiku-drafted prose, hand-authored numbers, harness balance reports, the CONTENT_VERSION ritual, cadence |
| 13 | [differentiators.md](13-differentiators.md) | 23 ranked innovations `[phase · effort]` with ★ flagships, plus the "clever but never" list |
| 14 | [roadmap.md](14-roadmap.md) | P0 Hardening → P1 Loop proof → P2 Multiverse → P3 Universe, doc-tagged checklists, exit metrics, kill criteria |

## Stated assumptions (decisions made; override if wrong)

1. **This lives inside beyond-campus.in at `/20years`, permanently.** No
   separate brand or domain; every share URL and SEO page builds the main
   domain. Same rationale as apti: the cohorts are the business model, and a
   solo founder doesn't split funnels.
2. **No-auth core, forever.** Identity = seed + localStorage + HMAC run
   tokens. The one concession: at report-claim, an *optional* email→account
   link so ending collections persist cross-device (doc 06 §5). The game
   itself never asks anyone to sign up.
3. **Canonical ending count is 32** (the "27 endings" in the first commit
   message is stale). Docs are the source of truth; target 48+ within 6
   months (doc 03 §3).
4. **Built inside the platform's hard constraints** (AGENTS.md): Vercel
   Hobby 2-cron limit — nothing here may ever need a cron; Supabase with
   manually pasted SQL; Resend ~100/day; `claude-haiku-4-5` for all AI;
   house design tokens; free-means-free.
5. **The economy is authored, never generated.** AI drafts prose at authoring
   time (doc 12 §2) and decorates narration at runtime (doc 05 §1); every
   gameplay number is hand-written in the content graph and balance-checked
   by simulation. Old share links render from stored results and never
   degrade (doc 04 §3).
6. **Founder content budget: ~5+ hrs/week** → monthly drops, two seasons a
   year, ~5 approved cards/week (doc 12 §6).

## The one-sentence product

> Answer three questions, live the next twenty-four years of your career in
> one honest hour, meet the lives you didn't live — and start fixing the
> real one before dinner.

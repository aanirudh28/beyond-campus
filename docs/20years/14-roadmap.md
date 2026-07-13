# 14 — Roadmap

Assumption: solo founder + Claude Code, ~5+ hrs/week on 20years content
(confirmed) alongside build time shared with apti; ship-on-push to
production; content changes go branch → PR → CI gate (doc 11 §4). Build
status lives in commit messages citing doc numbers, never in this file.

## Phase 0 — Hardening (weeks 1–2)

**Goal: full funnel visible, zero silent degradation paths.**

- [ ] Consolidated schema paste: stored-render fields, `parent_run_id`,
      `life_events`, `life_ai_cache`, `life_cohorts`, `life_collections`
      (doc 11 §2)
- [ ] `ending` route persists trail/ghosts/challenge/content_version;
      `[id]` route becomes pure read — old links never degrade (doc 04 §3)
- [ ] Share-page parity: ghost + challenge link on public pages (doc 06 §7)
- [ ] `POST /api/life/events` + client instrumentation of the full taxonomy
      (doc 08 §2–3)
- [ ] Challenge lineage: `c=` param, `parent_run_id`, accepted/created events
      (doc 07 §2)
- [ ] Scene fetch retry ×2 + `ai_fallback` events (doc 05 §8)
- [ ] CI invariant gate: extend harness to the doc 04 §4 suite + GitHub
      Action (doc 11 §4)
- [ ] Flag registry `flags.ts` + orphan-flags check (doc 03 §5)
- [ ] Funnel + content-balance dashboards in admin (doc 08 §4)
- [ ] Copy fix: all surfaces say 32 endings (the "27" in old commit copy is
      stale; docs are source of truth)

Exit test: founder opens the funnel dashboard and reads completion rate,
share rate, K-factor from real events; kills a share link's run replay and
the page still renders.

## Phase 1 — Loop proof (weeks 3–6)

**Goal: the challenge loop measurably works; SEO surface live.**

- [ ] Launch playbook executed: founder-run posts, nurture blast, ambassador
      WhatsApp seeding with challenge links (doc 10 §5)
- [ ] Ending SEO pages `/20years/endings/[slug]` + sitemap + wall links
      (doc 10 §3)
- [ ] Ghost-comparison share card (docs 10 §4, 13 #19)
- [ ] Report rules v2: 12 → ~25 with CTA mapping + UTM attribution
      (doc 09 §3, §5)
- [ ] Nurture drip branch for `resource='20years'` + dedupe rules (doc 09 §4)
- [ ] Optional account-link at claim; `life_collections` sync (doc 06 §5)
- [ ] Cross-promo tiles in apti/tracker (doc 10 §6)
- [ ] Anthropic prompt-cache breakpoints on scene calls (doc 05 §3.1)
- [ ] First monthly content drop through the full pipeline ritual (doc 12)

Exit metrics: ≥55% start→ending completion · **K ≥ 0.25** · report-claim
≥20% of completions · report CTA click-through ≥8% · og-page → run
conversion ≥15%.

## Phase 2 — Multiverse (weeks 7–12)

**Goal: the social layer deepens; the product markets itself.**

- [ ] Cohort decks: mint API, `/20years/c/[slug]` distribution page, TPO
      pilot with 2–3 colleges (doc 07 §3)
- [ ] Challenge scoreboard on share pages (doc 07 §2)
- [ ] Ghosts v2: named forks, disciplined ghost, ghost-of-a-friend
      (doc 07 §1)
- [ ] Multiverse wall on landing + `/20years/multiverse` (doc 07 §5)
- [ ] AI response cache `life_ai_cache` + degradation ladder rungs wired to
      the monthly cap (doc 05 §3–4)
- [ ] Rarity switchover to per-profile real data (doc 08 §5)
- [ ] Seasons machinery (topical event rotation path, badge plumbing)
      (doc 03 §6)
- [ ] Depth drops continue: pools toward 2× deal counts; endings toward 40
      (docs 03 §2–3, 12 §6)

Exit metrics: cohort pilot: ≥2 colleges, ≥30 lives/cohort, TPO asks for
another · K holds ≥0.25 at higher volume · ≥35% of completers start run 2.

## Phase 3 — Universe (months 4–8)

**Goal: the world grows; the funnel is proven or the thesis is revised.**

- [ ] Endings to 48+ (doc 03 §3)
- [ ] Engineering persona: priors, ~25 forked cards, stream-gated endings,
      fairness invariant extension, leads hygiene (doc 03 §4)
- [ ] Hinglish narration toggle behind `narration_lang` analytics (doc 05 §6)
- [ ] First "Class of 2027" season launch aligned to academic year
      (docs 03 §6, 12 §6)
- [ ] TPO/B2B decision from pilot data: free forever vs institutional pricing
      (docs 07 §3, 09 §6)
- [ ] Programmatic stat pages if volume supports (doc 10 §3)
- [ ] Fairness audit page (doc 13 #15)

## Standing rituals (founder ops)

Weekly: funnel + balance board review (doc 08 §4) · one distribution
artifact (a run screenshot post or deck-of-the-week). Monthly: content drop
(doc 12 §5–6) · events rollup + cache sweep SQL (doc 11 §6). Seasonal:
launch pushes in Jan–Mar and May–Jun windows (doc 10 §5).

## Kill criteria / honesty checkpoints

- **End of P1:** if K < 0.1 after iterating share copy and choreography, the
  share loop isn't landing — stop all content expansion; fix the
  ending-screen sequence (doc 06 §4) and share assets before any P2 work.
- **End of P2:** if report→apti/tracker CTA click-through < 5% despite rules
  v2, the funnel thesis fails — 20years continues as a brand asset on
  maintenance (seasonal drops only); halt P3 investment; redirect founder
  hours to apti.
- **Any phase:** if a content drop ships a fairness-invariant violation to
  production (caught by the balance board, missed by the harness), freeze
  drops until the harness gains the missing check — the fairness promise
  outranks the cadence.

## Sequencing rationale

Instrumentation before growth (you can't fix a loop you can't see — doc 08
first). Old-link safety before content cadence (every drop bumps the version;
stored-render makes bumps safe — doc 04 §3 in P0). Loops before universe
(a bigger world with a broken share loop is content nobody sees). Personas
last (they multiply balance surface and dilute leads until the funnel is
proven — doc 03 §1).

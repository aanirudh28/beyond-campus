# 10 — Growth & SEO

Engineering the loops that are currently accidental. Naming decision
(settled): the product stays "20 Years in 60 Minutes" at
beyond-campus.in/20years — every share URL and ending page builds the main
domain's authority. No paid acquisition, ever.

## 1. The three loops, ranked

| # | Loop | Mechanic | Status | K contribution |
|---|---|---|---|---|
| 1 | **Challenge** | "live my exact life" → friend plays same seed → their ending screen mints new challenges | built but leaky (§2) | measured directly: `challenge_accepted / ending_reached` (doc 08 §4); **target K ≥ 0.25 by end of P1** |
| 2 | **Share-card** | ending → WhatsApp text / 1080×1350 PNG / OG-rich link → viewer hits "play yours" | built | drives `og_page_view → run_started` conversion (target ≥15%) |
| 3 | **Report-forward** | claimed report emails get forwarded / screenshotted | weakest, free | not engineered beyond making report items screenshot-shaped |

Optimize loop 1 first — it has the strongest psychological hook (same luck,
head-to-head) and the cleanest measurement.

## 2. Loop-leak fixes (P0)

- **Challenge URL not persisted:** a player who shares their result page has
  no challenge link on it — the public page can't mint challenges. Fixed by
  share-page parity (doc 06 §7, stored fields doc 11 §2). This is the single
  highest-leverage growth fix in the backlog.
- **Challenge lineage untracked:** K-factor is currently unmeasurable
  (doc 07 §2, `parent_run_id`).
- **Abandoned runs vanish silently:** `run_abandoned` events (doc 08) tell us
  *where*; the save/resume system already softens it — measure before adding
  any re-engagement mechanics.

## 3. The SEO surface: ending pages

A client-side game gives Google nothing — the endings are the only
crawlable, evergreen content. **Build `/20years/endings/[slug]`, one page per
ending (32 → 48+):**

- Content per page: name, emoji, blurb, real rarity ("2.1% of 14,209
  simulated lives"), the tone, 2–3 anonymized real trails (graphs), "paths
  that lead here" (flag/threshold description in prose), and the play CTA.
  Rarity and counts computed on read from `life_ending_counts` — pages get
  richer as the multiverse grows.
- Query targets: "comfortable trap career", "golden handcuffs meaning
  salary", "burnout at 30 India" — endings are named like search phrases on
  purpose; new endings (doc 03 §3) should keep doing this.
- Later (data permitting): programmatic stat pages ("average simulated salary
  of a BBA at 30: what 10,000 runs say") — genuinely novel content nobody
  else can generate. P2+, needs volume first.
- All pages join `app/sitemap.ts`; endings wall on the landing page links
  each tile to its page (internal linking done).

## 4. Share assets v2

- Per-ending OG variants: current OG image is per-run; add ending-page OG
  images (static per ending — cheaper, cacheable).
- **Ghost-comparison card:** a second downloadable PNG — "my life vs the road
  not taken," two trails, two endings. The most screenshot-native artifact
  the product can produce.
- WhatsApp share text A/B (doc 08 events make this measurable): current
  one-liner vs one-liner + rarity vs challenge-framed.

## 5. Launch playbook & seasonality

1. **Founder-run seeding:** LinkedIn posts of the founder's own run (real
   screenshots, real ending) — the format is inherently reply-bait ("what did
   you get?").
2. **Existing base:** nurture blast to tracker/roast/apti audiences (within
   Resend caps) — "we built you a time machine."
3. **College WhatsApp seeding** via the existing ambassador/intern networks:
   challenge links, not landing links (arrive inside the loop, not at the
   door).
4. **Cohort decks to TPOs** (doc 07 §3): one classroom = 40 simultaneous
   players + a distribution page that markets the platform.
5. **Seasonal spikes:** placement season (Jan–Mar) and results season
   (May–Jun) are the two windows; content drops and seeding pushes align to
   them (doc 12 cadence). "Class of 20XX" season launches (doc 03 §6) anchor
   to academic year start.

## 6. Cross-promo (both directions)

- Apti/tracker surfaces get a "simulate your next 20 years" tile (post-set
  summary in apti; tracker empty states) — cheap, high-intent placement.
- 20years report CTAs already point into apti/tracker/cohorts (doc 09).
  Guardrail: cross-promo never interrupts a run (doc 06 §8).

## 7. Guardrails

- No paid acquisition; no growth mechanic that requires accounts; no dark
  patterns (fake scarcity, fake friend activity). The multiverse wall
  (doc 07 §5) shows *real* aggregates only — if the numbers are small, they
  are small ("312 lives lived this week" is honest and still social proof).
- K-factor is a health metric, not a god: if K stalls below 0.1 after P1
  iteration, fix the ending-screen choreography before spending on anything
  else (doc 14 kill criteria).

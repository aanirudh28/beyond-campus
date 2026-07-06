# 09 — Gamification & Community

## Gamification: the honest-progress stack

Layering (each layer serves a different psychological job):

| Layer | Job | Mechanic |
|---|---|---|
| **Momentum** | show up today | Streak (completed set = tick; opened app ≠ tick). 2 freezes/month, visible when used. Milestones at 7/21/50/100 with share cards |
| **Progress** | feel movement | Apti Rating (Elo, doc 04) — moves every session. Weekly delta is the headline, not the absolute (early absolute numbers can sting) |
| **Mastery** | earned competence | Skill states + Mastered gold rings; published criteria; Rusty decay keeps it honest |
| **Identity** | become "a person who prepares" | Degree-cohort percentile, milestone copy ("placements can't surprise you"), profile card: rating + streak + mastered count |
| **Victory** | felt wins | Redemptions ("you beat the question that beat you"), speed-round PBs, first-mock celebration, ghost-mode wins |

Explicitly rejected: login points, gems/coins, random rewards, avatar shops,
volume leaderboards, "you've been selected!" fake events. One test governs
everything (doc 02 §14): remove the mechanic — does learning get worse (keep)
or only engagement (must be honest) or neither (cut)?

## Leagues — the one Duolingo import, modified

Weekly leagues of 30 users matched by *rating band* (not volume), ranked by
**rating gained** this week (not questions attempted — attempts are gameable,
rating gain is not; grinding easy questions moves nothing). Opt-in, join from
day 8+ (habit first, competition second). No demotion shame: bottom third
simply "stays." v2 feature — streaks and rating must prove out first.

## Community: sequence deliberately

**Phase 1 (launch): ambient presence, zero moderation surface.**
"437 students did today's set" · Daily Challenge participation counts ·
per-question stats after answering ("62% get this wrong — you're in the 38%").
Community *feeling* without community *management* (solo founder reality).

**Phase 2: Study Circles (the core social feature).**
5–8 friends, invite link (WhatsApp-native — this is how Indian students
organize). Shared view: everyone's streak + sets this week + weekly rating
delta. One group nudge/day allowed ("poke"). No chat inside the product —
circles form around existing WhatsApp groups; we provide the scoreboard, they
bring the banter. Accountability without moderation. Circle Challenge: weekly
head-to-head vs another random circle of similar aggregate rating (v2.1).

**Phase 2.5: College boards.**
Opt-in college affiliation → college aggregate boards on Weekly/Monthly
challenges ("NMIMS vs Christ vs SRCC"). College pride is a massive, cheap
motivator in this demographic, and TPOs love it (growth loop: doc 11 — TPO
gets a free college dashboard of participation).

**Phase 3: Question discussions (LeetCode-style).**
Threaded discussion per question, sorted by upvotes; "alternative method"
posts highlighted. Massive SEO + genuine learning value, but needs moderation
tooling (report → founder queue; contributor rep score) — do not ship before
there's daily traffic to justify it.

**Phase 3+: Mentorship marketplace-lite.**
Placed seniors (Results Wall alumni!) answer "how did you prep for X" AMAs.
Bridges community to the cohort funnel naturally — mentors ARE the social
proof.

## Referral (give-get, learning-native)

"Invite a friend → you both get +1 streak freeze and unlock Ghost Mode early."
No cash, no discounts on a free product; the reward is product capability +
the friend joining your circle (the real retention payload). Referral prompt
appears at high-affect moments only: post-redemption, post-milestone,
post-first-mock — never on day 1.

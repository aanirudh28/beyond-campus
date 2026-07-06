# 13 — Content Pipeline: 4,000 Questions, One Founder

## The model

**AI drafts, human approves, users audit.** Haiku generates candidate questions
in batches against tight per-skill prompts; the founder reviews in a purpose-
built admin console at ~1 question/minute; post-launch, quality telemetry
(doc 04 §8) and user flags catch what review missed. Nothing reaches students
without human approval. Nothing is copied from existing sites — patterns are
public domain, expressions are not; every question is original.

## Production math

- Haiku batch: 10 candidates per skill per run, ~60% approval rate after review
- Founder review: 60–90 min/day → 50–80 approved/day
- P0 bank (~2,000): 5–6 weeks alongside build; launch threshold 1,200 ≈ 3.5 weeks
- Cost: negligible (Haiku, ~1k tokens/question)

## Generation prompt template (per skill, versioned in repo)

```
System: You write original aptitude questions for Indian placement tests
(BBA/BCom audience). Never reproduce existing published questions.

Generate {n} questions for skill: {skill_name}.
Skill definition: {skill_def}
Difficulty target: {band} (typical solver: {persona_line})
Constraints:
- Indian context where natural (₹, Indian names rotated from this list: {names},
  realistic business scenarios) — never forced
- Numbers must work out cleanly UNLESS the skill is approximation
- EVERY distractor must encode a named trap from this skill's trap library:
  {trap_library}. No filler options.
- Solution: numbered steps, ≤5 steps. Then a genuine shortcut if one exists
  (multiplying factors, fraction equivalents, option elimination) — if the
  shortcut is fake or same as the solution, write "none".
- Time benchmark: seconds a Proficient student needs.
Output: JSON array matching {schema}. Also output a "self_check" field:
  re-derive the answer independently; if mismatch, mark "FAILED".
```

Self-check + a second verification pass (separate Haiku call: "solve this
question cold, show work" — mismatch → auto-reject) filters most math errors
before human review. Trap libraries per skill are authored once by the founder
(the highest-value 2 hours per topic) and reused forever — they also power
Reels scripts and SEO trap pages (doc 11).

## Review console (`/admin` → Apti Questions; mirrors Jobs Console pattern)

Queue of drafts, one per screen: rendered exactly as students see it →
founder solves it (keyboard: A/B/C/D) → reveal → checklist → verdict.
Keys: `y` approve · `e` edit-inline · `x` reject-with-reason (reasons feed
prompt improvements) · `s` skip. Target: <60s/question.

**Approval checklist (hard gates):**
1. I solved it and got the keyed answer
2. Exactly one defensible answer; no ambiguity a lawyer could exploit
3. Every distractor = a real mistake I can name
4. Solution teaches the method, not just this instance; shortcut is genuine
5. Reads clean at 360px (tables/charts as data, no walls of text)
6. Difficulty seed and benchmark time feel right (Elo self-corrects, but seed sanely)
7. Original — dedupe check passed (below)
8. Voice rules: no em dashes, inclusive framing, Indian-natural context

## Dedupe (automatic, pre-review)

`content_hash` = SHA of normalized stem (numbers → `#`, names → `@`, lowercase,
stripped). Exact-hash = duplicate structure → auto-reject unless numbers-only
variant is *wanted* (drills). Near-dupe: pg_trgm similarity > 0.6 against same
skill → flagged side-by-side in console. Structure-variants (same skeleton,
different numbers) are allowed but capped at 3 per skeleton and never served
to the same user within 60 days.

## Versioning & repair loop

Edits bump `version`, old payload archived to `apti_question_versions`;
attempts reference the version implicitly by timestamp. Weekly ritual
(30 min, from doc 06 founder analytics): worst-20 by quality_score → fix or
retire; flag queue → resolve; dead distractors (<2% pickup) → replace with a
better trap. Retired questions keep their SEO pages if any (content stays,
just leaves rotation).

## Sourcing beyond generation

- **User pattern reports** (doc 08) refresh company blueprints each season
- **"Submit a question you faced"** (post-test flow): students paraphrase what
  they remember → founder reconstructs an original question testing the same
  skill → tagged to that company, contributor thanked. Legally clean, freshness
  unbeatable.
- Public exam archives (CAT/banking previous years where officially released)
  inform *pattern coverage*, never copied text.

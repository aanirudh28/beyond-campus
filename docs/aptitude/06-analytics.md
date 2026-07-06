# 06 — Analytics: Student Dashboard + Event Taxonomy

## Principle

Every chart must answer a decision, not display a number. The test for any
widget: *"What does the student DO differently after seeing this?"* If the
answer is nothing, cut it. All views end in an action button.

## 1. Student dashboard (`/practice/stats`)

### Header strip
Apti Rating per domain (mono font, weekly delta arrows) · composite percentile
vs same-degree peers · current streak · sets this week vs plan.

### Widget 1 — "What to do next" (always first)
Not a chart: 3 ranked recommendations with reasons and one-tap starts.
"① Clear 4 redemption cards (~6 min) — 2 expire to 'forgotten' soon.
② Profit & Loss session — lowest accuracy (54%) among Deloitte-weighted skills.
③ Checkpoint #2 — your readiness number is 9 days stale."
Every recommendation shows *why* (recommendation transparency = trust).

### Widget 2 — Speed × Accuracy quadrant (per topic)
Scatter: x = median time vs benchmark, y = accuracy. Four labeled zones:
**Test-ready** (fast+accurate) · **Slow but sure** (accurate, over time — drill
speed) · **Rushing** (fast, inaccurate — slow down, trap-prone) · **Gap**
(neither — go to Learn Cards). Tap any dot → targeted session of exactly that
deficiency (speed drills vs learn cards vs mixed). This one chart replaces most
"weakness reports."

### Widget 3 — Error mix
Stacked bar of the five error taps over time: concept / calc slip / misread /
trap / time. The insight most students never get: *"Only 31% of your errors are
concept gaps. 40% are misreads — you don't need more theory, you need to slow
down 5 seconds on the stem."* Action: launches matching drill mode (e.g.
misread → "underline-the-ask" training questions).

### Widget 4 — Calibration curve
Bars for Sure/Think-so/Guessing → actual accuracy in each. Overconfident:
"When you're 'Sure', you're right 71% of the time. On negative-marking tests
that gap is expensive." Underconfident flag matters too ("your 'Guessing' hits
55% — you know more than you trust; attempt more").

### Widget 5 — Forgetting risk
List of Mastered/Proficient skills with overdue maintenance probes: "Averages —
mastered 34 days ago, unprobed. 5-min top-up protects it." One-tap probe set.

### Widget 6 — Consistency heatmap
GitHub-style year grid of sets completed. Intensity = questions, ring =
streak-freeze days (honesty rule: freezes visible). Plus best hour ("you
complete 84% of sets started before 10am; 41% after 9pm — schedule accordingly").

### Widget 7 — Readiness panel
Per target company: score, 4-week sparkline, top-3 "what moves it" levers
(doc 08 math). CTA: "Do the highest-lever thing."

### Deliberately excluded
Total time spent (rewards grinding), questions-attempted leaderboards, any
all-users percentile (unfair to our audience), predicted-salary gimmicks.

## 2. Weekly report ("Wrong-answer autopsy" — Sunday email + in-app)

The one email that must be excellent (Resend budget: this is the flagship use).
Sections: rating movement + percentile; the week's 3 most instructive wrong
answers with trap explanations (retrieval cue: "can you solve it now?" link);
error-mix shift; next week's plan (auto-generated: N sets, focus topics, 1
checkpoint if due); one line of coach voice ("Your speed on DI improved 22%.
Your misread rate didn't. Next week we fix reading, not math.").

## 3. Internal event taxonomy (product analytics)

Table `apti_events` (append-only, service-role insert via API, doc 12) — or
PostHog later; schema identical either way.

```
onboarding_started/completed {degree, lane, timeline}
diagnostic_completed {starting_rating}
daily_set_started/completed {set_id, composition, duration_s}
question_answered {qid, skill, correct, time_ms, confidence, assisted,
                   error_type?, context: daily|topic|review|mock|speed}
hint_taken {qid, level}
redemption_won {qid, days_since_first_wrong}
mastery_changed {skill, from, to}
probe_failed {skill}
mock_started/submitted/abandoned {mock_id, kind, score, percentile}
readiness_viewed {company, score}
share_card_generated {kind: rating|streak|redemption|readiness}
whatsapp_optin/optout, streak_freeze_used, comeback_set_served
ai_tutor_used {qid, generation_n_of_quota}
paywall_viewed / cohort_cta_clicked {surface: postmock|plateau|nav}
question_flagged {qid, reason}
```

## 4. Founder analytics (admin, weekly ritual)

Funnel: signup → activated (first set <24h) → D7 ≥3 sets → W4 retained.
Content health: worst-20 questions by quality_score, dead distractors, flag
queue. Learning proof: median 30-day rating delta of active users (**the** number
that validates the product), redemption rate. Funnel to business: aptitude-active
→ cohort page views → purchases (UTM-tagged surfaces from §1 W7 / mock reports).

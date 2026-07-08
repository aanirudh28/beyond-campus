// Run: node --test scripts/apti-engine.test.ts   (Node 22.6+ / 24 native TS)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  expectedScore, attemptScore, eloUpdate,
  pushWindow, median, computeMastery,
  nextCardState, errorIntervalModifier,
  nextStreak, buildDailySet, chooseFocusSkills, skillReady,
  DEFAULT_SKILL_STATE,
  type SkillState, type CandidateQuestion,
} from '../lib/apti-engine.ts'

// ---------- Elo ----------

test('expectedScore: equal ratings → 0.5, 400 gap → ~0.91', () => {
  assert.equal(expectedScore(1200, 1200), 0.5)
  const p = expectedScore(1400, 1000)
  assert.ok(p > 0.90 && p < 0.92, `got ${p}`)
})

test('attemptScore: slow-correct earns 0.7', () => {
  assert.equal(attemptScore(true, 30_000, 60), 1)     // under benchmark
  assert.equal(attemptScore(true, 121_000, 60), 0.7)  // beyond 2× benchmark
  assert.equal(attemptScore(false, 10_000, 60), 0)
})

test('eloUpdate: novice K=32, question moves opposite, locked question frozen', () => {
  const up = eloUpdate({ userRating: 1000, userAttempts: 5, questionRating: 1000, questionAttempts: 10, ratingLocked: false, score: 1 })
  assert.equal(up.userDelta, 16)        // 32 × (1 − 0.5)
  assert.equal(up.questionDelta, -4)    // 8 × (1 − 0.5), opposite sign
  const locked = eloUpdate({ userRating: 1000, userAttempts: 50, questionRating: 1000, questionAttempts: 300, ratingLocked: true, score: 0 })
  assert.equal(locked.userDelta, -8)    // K=16 after 30 attempts
  assert.equal(locked.questionDelta, 0)
})

// ---------- windows / mastery ----------

test('pushWindow caps at 10', () => {
  let w: number[] = []
  for (let i = 0; i < 14; i++) w = pushWindow(w, 1)
  assert.equal(w.length, 10)
})

test('median of even/odd lists', () => {
  assert.equal(median([3, 1, 2]), 2)
  assert.equal(median([4, 1, 3, 2]), 2.5)
  assert.equal(median([]), 0)
})

test('mastery ladder: unseen → learning → familiar → proficient', () => {
  const skill = { benchmarkRating: 1200, benchmarkSeconds: 60 }
  assert.equal(computeMastery(DEFAULT_SKILL_STATE, skill), 'unseen')

  const learning: SkillState = { ...DEFAULT_SKILL_STATE, attempts: 3, rolling: [1, 0, 1] }
  assert.equal(computeMastery(learning, skill), 'learning')

  const familiar: SkillState = { ...DEFAULT_SKILL_STATE, attempts: 9, rolling: [1, 1, 0, 1, 0, 1, 1, 0, 1], mastery: 'learning' }
  assert.equal(computeMastery(familiar, skill), 'familiar')

  const proficient: SkillState = {
    ...DEFAULT_SKILL_STATE, attempts: 20, rating: 1220,
    rolling: [1, 1, 1, 1, 0, 1, 1, 1, 1, 1],       // 90%
    timesMs: [50_000, 60_000, 70_000], mastery: 'familiar',
  }
  assert.equal(computeMastery(proficient, skill), 'proficient')
})

test('mastery: speed gate blocks proficient; no demotion on a bad window', () => {
  const skill = { benchmarkRating: 1200, benchmarkSeconds: 60 }
  const slow: SkillState = {
    ...DEFAULT_SKILL_STATE, attempts: 20, rating: 1250,
    rolling: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    timesMs: [120_000, 130_000, 110_000],           // way over 1.25× benchmark
    mastery: 'familiar',
  }
  assert.equal(computeMastery(slow, skill), 'familiar')

  const badDay: SkillState = {
    ...DEFAULT_SKILL_STATE, attempts: 30, rating: 1250,
    rolling: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0],        // 30% window
    timesMs: [50_000], mastery: 'proficient',
  }
  assert.equal(computeMastery(badDay, skill), 'proficient') // sticks
})

// ---------- SRS ----------

test('redemption card: 1d → 3d on first correct, redeemed on second', () => {
  const first = nextCardState({ intervalDays: 1, correctStreak: 0 }, true, 'trap')
  assert.equal(first.intervalDays, 3)
  assert.equal(first.redeemed, false)
  const second = nextCardState({ intervalDays: first.intervalDays, correctStreak: first.correctStreak }, true)
  assert.equal(second.redeemed, true)
})

test('redemption card: wrong answer resets to 1d', () => {
  const reset = nextCardState({ intervalDays: 7, correctStreak: 1 }, false)
  assert.deepEqual({ i: reset.intervalDays, s: reset.correctStreak, r: reset.redeemed }, { i: 1, s: 0, r: false })
})

test('error type modulates intervals: concept sooner, misread later', () => {
  assert.equal(errorIntervalModifier('concept'), 0.75)
  assert.equal(errorIntervalModifier('misread'), 1.25)
  const concept = nextCardState({ intervalDays: 1, correctStreak: 0 }, true, 'concept')
  assert.equal(concept.intervalDays, 2.25)  // 3 × 0.75
})

// ---------- streaks ----------

test('streak: consecutive day increments, gap resets, same-day idempotent', () => {
  assert.equal(nextStreak({ streak: 5, lastSetDate: '2026-07-05' }, '2026-07-06'), 6)
  assert.equal(nextStreak({ streak: 5, lastSetDate: '2026-07-03' }, '2026-07-06'), 1)
  assert.equal(nextStreak({ streak: 5, lastSetDate: '2026-07-06' }, '2026-07-06'), 5)
  assert.equal(nextStreak({ streak: 0, lastSetDate: null }, '2026-07-06'), 1)
})

// ---------- set builder ----------

function makeBank(): CandidateQuestion[] {
  const bank: CandidateQuestion[] = []
  const skills = ['s-focus1', 's-focus2', 's-old1', 's-old2']
  let n = 0
  for (const skillId of skills) {
    for (const rating of [900, 1000, 1050, 1100, 1150, 1200, 1300, 1400, 1500]) {
      bank.push({ id: `q${n++}`, skillId, rating })
    }
  }
  return bank
}

const seededRng = () => {
  let s = 42
  return () => { s = (s * 1103515245 + 12345) % 2 ** 31; return s / 2 ** 31 }
}

test('buildDailySet: full state → 10 questions, 2/5/2/1 composition', () => {
  const plan = buildDailySet({
    dueReviews: [
      { cardId: 'c1', questionId: 'rq1', skillId: 's-old1' },
      { cardId: 'c2', questionId: 'rq2', skillId: 's-old2' },
      { cardId: 'c3', questionId: 'rq3', skillId: 's-old1' },
    ],
    candidates: makeBank(),
    skillRatings: { 's-focus1': 1100, 's-focus2': 1000, 's-old1': 1200, 's-old2': 1250 },
    focusSkillIds: ['s-focus1', 's-focus2'],
    practicedSkillIds: ['s-old1', 's-old2'],
    rng: seededRng(),
  })
  assert.equal(plan.questionIds.length, 10)
  assert.deepEqual(plan.composition, { review: 2, focus: 5, interleave: 2, stretch: 1 })
  assert.deepEqual(plan.reviewCardIds, ['c1', 'c2'])      // only 2 review slots
  assert.equal(new Set(plan.questionIds).size, 10)        // no duplicates
})

test('buildDailySet: day 1 (no reviews, nothing practiced) still fills 10', () => {
  const plan = buildDailySet({
    dueReviews: [],
    candidates: makeBank(),
    skillRatings: {},
    focusSkillIds: ['s-focus1'],
    practicedSkillIds: [],
    rng: seededRng(),
  })
  assert.equal(plan.questionIds.length, 10)
  assert.equal(plan.composition.review, 0)
  assert.equal(new Set(plan.questionIds).size, 10)
})

test('buildDailySet: tiny bank degrades without crashing', () => {
  const plan = buildDailySet({
    dueReviews: [],
    candidates: [
      { id: 'a', skillId: 's-focus1', rating: 1000 },
      { id: 'b', skillId: 's-focus1', rating: 1200 },
    ],
    skillRatings: { 's-focus1': 1000 },
    focusSkillIds: ['s-focus1'],
    practicedSkillIds: [],
    rng: seededRng(),
  })
  assert.equal(plan.questionIds.length, 2)
  assert.equal(new Set(plan.questionIds).size, 2)
})

test('chooseFocusSkills: first two not-yet-proficient in order', () => {
  const focus = chooseFocusSkills(['a', 'b', 'c', 'd'], {
    a: { mastery: 'proficient' },
    b: { mastery: 'familiar' },
    c: { mastery: 'unseen' },
  })
  assert.deepEqual(focus, ['b', 'c'])
})

test('chooseFocusSkills: prereqs steer focus to ready skills first', () => {
  // c depends on b; b is only 'learning', so c is blocked. a (no prereq) and
  // d (prereq a is proficient) are ready and should be chosen over c.
  const states = {
    a: { mastery: 'familiar' as const },
    b: { mastery: 'learning' as const },
    c: { mastery: 'unseen' as const },
    d: { mastery: 'unseen' as const },
  }
  const prereqs = { c: ['b'], d: ['a'] }
  assert.deepEqual(chooseFocusSkills(['a', 'b', 'c', 'd'], states, prereqs), ['a', 'b'])
  // once b is proficient, its dependent c becomes ready and outranks nothing
  // above it; with a mastered, focus is b then c
  const states2 = { ...states, a: { mastery: 'mastered' as const }, b: { mastery: 'familiar' as const } }
  assert.deepEqual(chooseFocusSkills(['a', 'b', 'c', 'd'], states2, prereqs), ['b', 'c'])
})

test('skillReady: blocked until every prereq is familiar+', () => {
  const prereqs = { x: ['p', 'q'] }
  assert.equal(skillReady('x', prereqs, { p: { mastery: 'familiar' }, q: { mastery: 'learning' } }), false)
  assert.equal(skillReady('x', prereqs, { p: { mastery: 'familiar' }, q: { mastery: 'proficient' } }), true)
  assert.equal(skillReady('root', {}, {}), true) // no prereqs → always ready
})

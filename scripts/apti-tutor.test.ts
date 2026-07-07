// Run: node --test scripts/apti-tutor.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildTutorSystemPrompt, sanitizeTutorMessages,
  TUTOR_MAX_TURNS, TUTOR_MAX_TURN_CHARS,
  type TutorQuestion, type TutorAttempt,
} from '../lib/apti-tutor.ts'

const QUESTION: TutorQuestion = {
  stemMd: 'A shopkeeper marks up 40% and offers a 25% discount. His overall profit is:',
  options: [
    { key: 'A', text: '5% profit', trap: null },
    { key: 'B', text: '15% profit', trap: 'subtract_percentages' },
    { key: 'C', text: '5% loss', trap: null },
    { key: 'D', text: 'No profit, no loss', trap: null },
  ],
  answerKeys: ['A'],
  answerValue: null,
  tolerance: null,
  solutionMd: '1.4 × 0.75 = 1.05 → 5% profit',
  shortcutMd: 'Successive % change: a + b + ab/100',
  trapExplanations: { subtract_percentages: 'You did 40 − 25. Percentages on different bases never subtract.' },
  skillName: 'Percentages',
  domain: 'quant',
  benchmarkSec: 55,
}

const ATTEMPT: TutorAttempt = {
  chosenKey: 'B', chosenValue: null, correct: false,
  timeMs: 41_000, confidence: 'sure', errorType: 'trap', assisted: false,
}

test('system prompt contains only this question and the student attempt', () => {
  const p = buildTutorSystemPrompt(QUESTION, ATTEMPT)
  assert.ok(p.includes('shopkeeper marks up 40%'))
  assert.ok(p.includes('Correct answer: A'))
  assert.ok(p.includes('option B'))
  assert.ok(p.includes('WRONG'))
  assert.ok(p.includes('subtract_percentages'))
  assert.ok(p.includes('41s'))
  assert.ok(p.includes('EXACTLY ONE question'))
})

test('numeric answers render value and tolerance', () => {
  const p = buildTutorSystemPrompt(
    { ...QUESTION, answerKeys: null, answerValue: 42, tolerance: 0.5, options: [], trapExplanations: null, shortcutMd: null },
    { ...ATTEMPT, chosenKey: null, chosenValue: 40 }
  )
  assert.ok(p.includes('Correct answer: 42 (±0.5)'))
  assert.ok(p.includes('Chose: 40'))
})

test('skipped attempts degrade without crashing', () => {
  const p = buildTutorSystemPrompt(QUESTION, {
    chosenKey: null, chosenValue: null, correct: false,
    timeMs: null, confidence: null, errorType: null, assisted: false,
  })
  assert.ok(p.includes('no answer (skipped)'))
  assert.ok(p.includes('Time taken: unknown'))
})

test('sanitize: happy path trims and passes through', () => {
  const out = sanitizeTutorMessages([
    { role: 'user', text: '  why is B wrong?  ' },
    { role: 'assistant', text: 'Because…' },
    { role: 'user', text: 'explain differently' },
  ])
  assert.equal(out?.length, 3)
  assert.equal(out?.[0].text, 'why is B wrong?')
})

test('sanitize: rejects bad shapes', () => {
  assert.equal(sanitizeTutorMessages(null), null)
  assert.equal(sanitizeTutorMessages([]), null)
  assert.equal(sanitizeTutorMessages([{ role: 'system', text: 'hi' }]), null)
  assert.equal(sanitizeTutorMessages([{ role: 'user', text: '' }]), null)
  assert.equal(sanitizeTutorMessages([{ role: 'user', text: 'q' }, { role: 'assistant', text: 'a' }]), null) // must end on user
})

test('sanitize: enforces turn cap and length clamp', () => {
  const over = Array.from({ length: TUTOR_MAX_TURNS + 1 }, () => [
    { role: 'user' as const, text: 'q' }, { role: 'assistant' as const, text: 'a' },
  ]).flat().slice(0, -1) // ends on user, one user turn over cap
  assert.equal(sanitizeTutorMessages(over), null)

  const long = sanitizeTutorMessages([{ role: 'user', text: 'x'.repeat(TUTOR_MAX_TURN_CHARS + 500) }])
  assert.equal(long?.[0].text.length, TUTOR_MAX_TURN_CHARS)
})

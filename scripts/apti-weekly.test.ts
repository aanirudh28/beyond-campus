// Run: node --test scripts/apti-weekly.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWeeklyAutopsy, dominantError, type WeeklyInput } from '../lib/apti-weekly.ts'

const BASE: WeeklyInput = {
  setsCompleted: 5,
  startRatings: { quant: 1200, logical: 1100 },
  ratings: { quant: 1234, logical: 1090 },
  errorMix: { misread: 4, trap: 2 },
  wrongCount: 6,
  attemptCount: 50,
  wrongHighlights: [
    { stemMd: 'A **shopkeeper** marks up 40% and discounts 25%…', skillName: 'Percentages', trapExplanation: 'You did 40 − 25. Bases differ.' },
    { stemMd: 'Series: 2, 6, 12, 20, ?', skillName: 'Series', trapExplanation: null },
  ],
  weakestSkill: { name: 'Profit & Loss', accuracy: 54 },
}

test('full week renders every section', () => {
  const { subject, body } = buildWeeklyAutopsy(BASE)
  assert.ok(subject.includes('+24')) // 34 - 10
  assert.ok(body.includes('5 sets'))
  assert.ok(body.includes('Percentages'))
  assert.ok(body.includes('The trap: You did 40 − 25'))
  assert.ok(body.includes('4× misread'))
  assert.ok(body.includes('missing words')) // misread coach line
  assert.ok(body.includes('Profit &amp; Loss'))
  assert.ok(!body.includes('**')) // markdown stripped
})

test('all-correct week degrades gracefully', () => {
  const { subject, body } = buildWeeklyAutopsy({
    ...BASE, errorMix: {}, wrongCount: 0, wrongHighlights: [], weakestSkill: null,
  })
  assert.ok(subject.includes('zero unforced errors'))
  assert.ok(!body.includes('Miss 1'))
  assert.ok(body.includes('Consistency is the whole plan'))
})

test('empty ratings do not crash', () => {
  const { body } = buildWeeklyAutopsy({
    ...BASE, startRatings: {}, ratings: {}, wrongHighlights: [],
  })
  assert.ok(body.includes('Your week'))
})

test('stems are escaped and clipped', () => {
  const { body } = buildWeeklyAutopsy({
    ...BASE,
    wrongHighlights: [{ stemMd: `<script>x</script>${'a'.repeat(400)}`, skillName: 'X<Y', trapExplanation: null }],
  })
  assert.ok(!body.includes('<script>'))
  assert.ok(body.includes('&lt;script&gt;'))
})

test('dominantError picks the biggest bucket', () => {
  assert.equal(dominantError({ trap: 3, calc: 5 }), 'calc')
  assert.equal(dominantError({}), null)
})

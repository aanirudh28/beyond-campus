// Run: node --test scripts/apti-challenge.test.ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pickChallengeQuestions, CHALLENGE_SIZE } from '../lib/apti-engine.ts'

const q = (id: string, domain: string, rating: number) => ({ id, domain, rating })

const BANK = [
  q('q1', 'quant', 1200), q('q2', 'quant', 1250), q('q3', 'quant', 1600),
  q('l1', 'logical', 1150), q('l2', 'logical', 1300),
  q('v1', 'verbal', 1120), q('v2', 'verbal', 1340),
  q('d1', 'di', 1200),
]

test('picks one per core domain inside the band', () => {
  const ids = pickChallengeQuestions(BANK, new Set(), () => 0)
  assert.equal(ids.length, CHALLENGE_SIZE)
  assert.equal(new Set(ids).size, CHALLENGE_SIZE)
  // deterministic rng=0 → first in-band candidate of each domain
  assert.deepEqual(ids, ['q1', 'l1', 'v1'])
})

test('never repeats recent challenge questions', () => {
  const ids = pickChallengeQuestions(BANK, new Set(['q1', 'l1', 'v1']), () => 0)
  assert.ok(!ids.includes('q1') && !ids.includes('l1') && !ids.includes('v1'))
  assert.equal(ids.length, CHALLENGE_SIZE)
})

test('falls out of band rather than starving', () => {
  const tiny = [q('a', 'quant', 900), q('b', 'quant', 1700), q('c', 'logical', 950)]
  const ids = pickChallengeQuestions(tiny, new Set(), () => 0)
  assert.equal(ids.length, CHALLENGE_SIZE)
})

test('returns short list when the bank is too small (caller hides feature)', () => {
  const ids = pickChallengeQuestions([q('only', 'quant', 1200)], new Set(), () => 0)
  assert.equal(ids.length, 1)
})

test('fills missing domains from anywhere', () => {
  const noVerbal = [q('q1', 'quant', 1200), q('l1', 'logical', 1200), q('d1', 'di', 1200)]
  const ids = pickChallengeQuestions(noVerbal, new Set(), () => 0)
  assert.equal(ids.length, CHALLENGE_SIZE)
  assert.ok(ids.includes('d1'))
})

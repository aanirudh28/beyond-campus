// Live smoke test of the generation pipeline: one real Haiku draft batch +
// cold-solve verification, using the exact prompts/schemas the route uses.
import { readFileSync } from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildGenerationPrompt, buildVerificationPrompt,
  GENERATION_SCHEMA, VERIFICATION_SCHEMA,
  validateCandidate, contentHash,
  type GeneratedCandidate, type SkillContext,
} from '../lib/apti-content.ts'

const env = readFileSync('.env.local', 'utf8')
const key = env.match(/ANTHROPIC_API_KEY=(.+)/)?.[1]?.trim()
if (!key) throw new Error('no key')

const anthropic = new Anthropic({ apiKey: key })
const MODEL = 'claude-haiku-4-5-20251001'

const skill: SkillContext = {
  slug: 'percentage-change', name: 'Percentage change & reverse', domain: 'quant',
  topicName: 'Percentages', benchmarkRating: 1200, benchmarkSeconds: 55,
}

const gen = await anthropic.messages.create({
  model: MODEL,
  max_tokens: 4000,
  output_config: { format: { type: 'json_schema', schema: GENERATION_SCHEMA } },
  messages: [{ role: 'user', content: buildGenerationPrompt(skill, 2, ['The price of sugar rises by 25%...']) }],
})
const text = gen.content.find((b) => b.type === 'text')
if (!text || text.type !== 'text') throw new Error('no text block')
const { questions } = JSON.parse(text.text) as { questions: GeneratedCandidate[] }
console.log(`drafted: ${questions.length}`)
for (const q of questions) {
  const problem = validateCandidate(q, skill)
  console.log(`- [${problem ?? 'VALID'}] key=${q.answer_key} hash=${contentHash(q.stem_md).slice(0, 8)}`)
  console.log(`  ${q.stem_md.slice(0, 100)}`)
}

const ver = await anthropic.messages.create({
  model: MODEL,
  max_tokens: 1000,
  output_config: { format: { type: 'json_schema', schema: VERIFICATION_SCHEMA } },
  messages: [{ role: 'user', content: buildVerificationPrompt(questions) }],
})
const vtext = ver.content.find((b) => b.type === 'text')
if (!vtext || vtext.type !== 'text') throw new Error('no verify text')
const { answers } = JSON.parse(vtext.text) as { answers: { index: number; answer_key: string }[] }
for (const a of answers) {
  const match = questions[a.index]?.answer_key === a.answer_key
  console.log(`verify Q${a.index}: cold=${a.answer_key} keyed=${questions[a.index]?.answer_key} ${match ? '✓' : '✕ MISMATCH'}`)
}
console.log('SMOKE_OK')

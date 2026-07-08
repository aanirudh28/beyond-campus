// Apti content pipeline: per-skill trap libraries, Haiku generation prompts,
// candidate validation and dedupe hashing. Design: docs/aptitude/13.
// The trap libraries are the moat — every distractor a generator produces
// must be the exact result of one of these named mistakes.

import { createHash } from 'node:crypto'
import type { QuestionPayload } from '@/lib/apti'

export interface Trap { name: string; description: string }

// ---------------- trap libraries ----------------

export const TRAP_LIBRARIES: Record<string, Trap[]> = {
  // ---- percentages ----
  'fraction-percent-conversion': [
    { name: 'complement', description: 'computed 100 minus the asked percentage' },
    { name: 'misremembered', description: 'used a near-miss fraction equivalent (e.g. 3/7 for 37.5%)' },
    { name: 'skipped-step', description: 'applied only one of two chained operations' },
    { name: 'calc-slip', description: 'plausible arithmetic slip in the final multiply/divide' },
  ],
  'percentage-change': [
    { name: 'wrong-base', description: 'divided the change by the NEW value instead of the original' },
    { name: 'same-percent', description: 'assumed x% more one way equals x% less the other way' },
    { name: 'reverse-percent', description: 'undid a change by adding/subtracting the percent of the changed value instead of dividing by the factor' },
    { name: 'absolute-as-percent', description: 'reported the absolute change as if it were the percentage' },
    { name: 'subtracted-percents', description: 'subtracted two percentages that sit on different bases' },
  ],
  'successive-change': [
    { name: 'added-percents', description: 'added/subtracted successive percentages directly instead of multiplying factors' },
    { name: 'assumed-cancel', description: 'assumed +x% then −x% returns to the start' },
    { name: 'swapped-base', description: 'applied the changes in the wrong order / to the wrong base' },
    { name: 'halved-or-doubled', description: 'used x²/200 or 2x²/100 instead of x²/100 in the shortcut' },
  ],
  // ---- ratio & partnership ----
  'combining-ratios': [
    { name: 'took-ends', description: 'read a:c straight off the outer numbers without equalising b' },
    { name: 'wrong-person', description: 'computed a different person’s share than the one asked' },
    { name: 'wrong-total-parts', description: 'summed the ratio parts incorrectly' },
    { name: 'part-as-answer', description: 'reported one part’s value where a total (or vice versa) was asked' },
  ],
  partnership: [
    { name: 'capital-only', description: 'split by capital ratio, ignoring the time each capital was invested' },
    { name: 'ignored-topup', description: 'ignored a mid-period addition or withdrawal of capital' },
    { name: 'forgot-fee', description: 'forgot the working partner’s salary/commission taken off the top' },
    { name: 'other-share', description: 'reported the other partner’s share' },
  ],
  // ---- series ----
  'series-next-term': [
    { name: 'repeated-diff', description: 'reused the last difference instead of growing it by the pattern' },
    { name: 'doubled-only', description: 'applied the multiplication but dropped the +k/−k correction' },
    { name: 'pattern-drift', description: 'a value that fits no rule the earlier terms obey (plausible-looking)' },
    { name: 'wrong-interleave', description: 'applied the wrong one of two alternating operations' },
  ],
  'series-wrong-term': [
    { name: 'blamed-neighbour', description: 'accused the last CORRECT term before the actual break' },
    { name: 'mid-series-panic', description: 'accused a mid-series term that actually obeys the rule' },
    { name: 'doubted-start', description: 'accused an opening term that anchors the rule' },
  ],
  // ---- averages & mixtures ----
  'basic-averages': [
    { name: 'summed-averages', description: 'averaged two group averages directly without weighting by group size' },
    { name: 'off-by-one-count', description: 'used n±1 members when someone joins or leaves' },
    { name: 'total-as-average', description: 'reported the total where the average was asked, or vice versa' },
    { name: 'calc-slip', description: 'plausible arithmetic slip in the sum or division' },
  ],
  'weighted-average': [
    { name: 'unweighted-mean', description: 'took the plain mean of the two values, ignoring the weights' },
    { name: 'swapped-weights', description: 'attached each weight to the wrong value' },
    { name: 'weights-as-values', description: 'averaged the weights instead of the values' },
  ],
  alligation: [
    { name: 'inverted-ratio', description: 'wrote the mixing ratio the wrong way round (nearer difference to wrong side)' },
    { name: 'averaged-prices', description: 'took the midpoint instead of applying the rule of alligation' },
    { name: 'quantity-for-ratio', description: 'reported the ratio where a quantity was asked, or vice versa' },
  ],
  // ---- profit, loss & discount ----
  'cp-sp-basics': [
    { name: 'wrong-base', description: 'computed profit% on SP instead of CP' },
    { name: 'sign-flip', description: 'reported a loss as a profit or vice versa' },
    { name: 'amount-as-percent', description: 'reported the rupee amount where the percentage was asked' },
  ],
  'markup-discount': [
    { name: 'subtracted-percents', description: 'did markup% − discount% directly instead of multiplying factors' },
    { name: 'discount-on-cp', description: 'applied the discount to cost price instead of marked price' },
    { name: 'assumed-cancel', description: 'assumed equal markup and discount cancel out' },
  ],
  'false-weights': [
    { name: 'weight-as-profit', description: 'treated the grams stolen as the profit percentage directly' },
    { name: 'wrong-base-gain', description: 'computed gain on 1000g instead of the true base given' },
    { name: 'ignored-price-move', description: 'ignored a simultaneous markup/discount when combining with false weight' },
  ],
  // ---- simple & compound interest ----
  'simple-interest': [
    { name: 'included-principal', description: 'reported amount (P+I) where interest was asked, or vice versa' },
    { name: 'time-slip', description: 'used months as years or mis-set the time period' },
    { name: 'rate-on-amount', description: 'applied the rate to the amount instead of the principal' },
  ],
  'compound-interest': [
    { name: 'used-simple', description: 'computed simple interest where compounding was asked' },
    { name: 'wrong-periods', description: 'mishandled half-yearly/quarterly compounding (rate and period both change)' },
    { name: 'interest-vs-amount', description: 'reported the amount where the interest was asked, or vice versa' },
  ],
  'si-ci-difference': [
    { name: 'zero-diff-2yr', description: 'assumed SI and CI are equal at 2 years' },
    { name: 'formula-slip', description: 'used P(r/100) instead of P(r/100)² for the 2-year difference' },
    { name: 'three-year-as-two', description: 'applied the 2-year difference formula to a 3-year question' },
  ],
  // ---- time, speed & distance ----
  'speed-basics': [
    { name: 'averaged-speeds', description: 'took the plain mean of two speeds over equal DISTANCES (harmonic mean needed)' },
    { name: 'unit-slip', description: 'mixed km/h with m/s without converting (×18/5 or ×5/18)' },
    { name: 'time-distance-swap', description: 'solved for time where distance was asked, or vice versa' },
  ],
  'relative-speed-trains': [
    { name: 'wrong-relative', description: 'added speeds for same-direction (or subtracted for opposite)' },
    { name: 'ignored-length', description: 'ignored the train’s own length (or the platform’s) in the distance covered' },
    { name: 'one-length-only', description: 'used one train’s length where both cross each other' },
  ],
  'boats-streams': [
    { name: 'swapped-updown', description: 'used b+s for upstream or b−s for downstream' },
    { name: 'stream-as-boat', description: 'reported the stream speed where the boat’s still-water speed was asked' },
    { name: 'averaged-updown', description: 'averaged upstream and downstream TIMES instead of speeds' },
  ],
  // ---- time & work ----
  'work-rates': [
    { name: 'added-days', description: 'added the days each person needs instead of adding their rates' },
    { name: 'averaged-days', description: 'averaged the two workers’ day counts' },
    { name: 'rate-vs-days', description: 'reported the combined rate where days were asked, or vice versa' },
  ],
  'combined-work': [
    { name: 'ignored-departure', description: 'ignored a worker joining late or leaving early' },
    { name: 'wrong-remaining', description: 'mis-computed the fraction of work remaining at the switch' },
    { name: 'efficiency-flip', description: 'inverted an efficiency ratio (twice as efficient = half the days, not double)' },
  ],
  'pipes-cisterns': [
    { name: 'ignored-leak-sign', description: 'added the emptying pipe’s rate instead of subtracting it' },
    { name: 'added-times', description: 'added fill times instead of rates' },
    { name: 'net-flip', description: 'got the net rate’s sign wrong (tank never fills vs fills)' },
  ],
  // ---- coding-decoding ----
  'letter-shift': [
    { name: 'wrong-direction', description: 'shifted backward where the code shifts forward (or vice versa)' },
    { name: 'off-by-one', description: 'shifted by k±1 positions' },
    { name: 'no-wraparound', description: 'failed to wrap around past Z/A' },
  ],
  'substitution-coding': [
    { name: 'partial-map', description: 'applied the substitution to only part of the word' },
    { name: 'reversed-map', description: 'applied the code-to-word mapping where word-to-code was asked' },
    { name: 'position-vs-letter', description: 'confused letter substitution with position-value coding' },
  ],
  // ---- blood relations ----
  'relation-chains': [
    { name: 'gender-assumed', description: 'assumed a gender the statement never gives' },
    { name: 'generation-slip', description: 'landed one generation off (uncle vs grandfather etc.)' },
    { name: 'reversed-relation', description: 'answered the relation of A to B where B to A was asked' },
  ],
  'coded-relations': [
    { name: 'symbol-swap', description: 'applied one symbol’s meaning to another' },
    { name: 'chain-order', description: 'resolved the coded chain in the wrong order' },
    { name: 'reversed-relation', description: 'answered the inverse relation of the one asked' },
  ],
  // ---- arrangements ----
  'linear-arrangement': [
    { name: 'left-right-flip', description: 'mirrored left/right (especially when facing direction matters)' },
    { name: 'ends-confused', description: 'placed a person at the wrong end when both ends are constrained' },
    { name: 'neighbour-not-fixed', description: 'treated "next to" as a fixed side when both sides are possible' },
  ],
  'circular-arrangement': [
    { name: 'clockwise-flip', description: 'swapped clockwise/anticlockwise (left/right invert facing centre vs out)' },
    { name: 'opposite-miscount', description: 'mis-identified the person sitting opposite (n/2 seats away)' },
    { name: 'neighbour-not-fixed', description: 'fixed a neighbour that could sit on either side' },
  ],
  // ---- syllogisms ----
  'two-statement': [
    { name: 'converted-all', description: 'illegally converted "All A are B" into "All B are A"' },
    { name: 'some-means-not-all', description: 'read "Some A are B" as implying some A are NOT B' },
    { name: 'middle-undistributed', description: 'drew a conclusion through an undistributed middle term' },
  ],
  'possibility-syllogisms': [
    { name: 'definite-for-possible', description: 'treated a possibility conclusion as a definite one (or vice versa)' },
    { name: 'converted-all', description: 'illegally converted a universal statement' },
    { name: 'no-case-missed', description: 'missed the Venn case that makes the possibility true/false' },
  ],
  // ---- business & case aptitude (the consulting / Founder's Office bridge) ----
  'top-down-sizing': [
    { name: 'wrong-population', description: 'anchored on the wrong base population (a neighbourhood, or a whole country, not the city asked)' },
    { name: 'single-use', description: 'undercounted uses per person, or the fraction of people who actually buy' },
    { name: 'full-penetration', description: 'assumed nearly everyone buys, or many uses each, giving more than the population can plausibly consume' },
    { name: 'magnitude-slip', description: 'right structure but one factor off by a power of ten (lakh vs crore)' },
  ],
  'bottom-up-sizing': [
    { name: 'wrong-base', description: 'sized straight from population instead of building up from the unit driver (rides, transactions, visits)' },
    { name: 'coverage-slip', description: 'assumed too much activity per unit, or too little throughput per server' },
    { name: 'frequency-slip', description: 'used the wrong number of uses or transactions per period' },
    { name: 'magnitude-slip', description: 'right structure but one factor off by a power of ten' },
  ],
  'contribution-margin': [
    { name: 'revenue-as-contribution', description: 'used the full selling price without subtracting the variable cost' },
    { name: 'cost-as-contribution', description: 'reported the variable cost itself as the contribution' },
    { name: 'margin-rule-of-thumb', description: 'assumed a round margin (like 50 percent) instead of subtracting the actual variable cost' },
    { name: 'fixed-in-unit', description: 'folded a share of fixed cost into the per-unit contribution, where it does not belong' },
  ],
  breakeven: [
    { name: 'price-not-contribution', description: 'divided fixed cost by the selling price instead of the contribution per unit' },
    { name: 'variable-cost-base', description: 'divided fixed cost by the variable cost per unit' },
    { name: 'contribution-halved', description: 'used a wrong (often halved) contribution per unit' },
    { name: 'ignored-fixed', description: 'left out part of the fixed cost, or set a per-day figure against a monthly cost' },
  ],
  'growth-cagr': [
    { name: 'simple-growth', description: 'divided the total percentage growth by the number of years instead of compounding' },
    { name: 'doubling-slip', description: 'over-applied a doubling or tripling heuristic to the yearly rate' },
    { name: 'under-guess', description: 'picked a rate too low to reach the end value when compounded' },
    { name: 'total-as-annual', description: 'reported the total multiple or total growth as if it were the annual rate' },
  ],
  'chart-reading': [
    { name: 'absolute-vs-relative', description: 'read an absolute change where a share or percentage was asked, or the reverse' },
    { name: 'axis-misread', description: 'misread the scale, the units, or a broken or secondary axis' },
    { name: 'cherry-point', description: 'drew a trend from a single point instead of the whole series' },
  ],
  'business-conclusion': [
    { name: 'share-not-units', description: 'compared market shares directly without converting them to actual unit counts' },
    { name: 'assumed-cancel', description: 'assumed two opposing changes cancel instead of multiplying them out' },
    { name: 'static-market', description: 'held the market size fixed and missed that it grew or shrank' },
    { name: 'correlation-cause', description: 'inferred cause from two figures that merely move together' },
  ],
}

// Domain-level fallbacks for skills without a bespoke library yet.
const GENERIC_TRAPS: Record<string, Trap[]> = {
  quant: [
    { name: 'wrong-base', description: 'used the wrong base/reference value in a percentage or ratio step' },
    { name: 'formula-slip', description: 'applied a close-but-wrong formula' },
    { name: 'calc-slip', description: 'plausible arithmetic slip' },
    { name: 'asked-vs-found', description: 'solved for a related quantity, not the one asked' },
  ],
  logical: [
    { name: 'reversed-logic', description: 'applied the rule/relation in the reverse direction' },
    { name: 'case-missed', description: 'ignored an alternative case the constraints allow' },
    { name: 'off-by-one', description: 'position/count off by one' },
  ],
  verbal: [
    { name: 'near-synonym', description: 'a near-synonym that misses the contextual meaning' },
    { name: 'grammar-overcorrect', description: 'a correction that introduces a different error' },
    { name: 'scope-shift', description: 'an option that overstates or narrows the passage’s claim' },
  ],
  business: [
    { name: 'wrong-base', description: 'anchored on the wrong base value (population, market, or cost) for the estimate' },
    { name: 'structure-slip', description: 'a decomposition that skips or double-counts a step' },
    { name: 'magnitude-slip', description: 'right approach but an answer off by a power of ten' },
    { name: 'asked-vs-found', description: 'solved for a related quantity, not the one asked' },
  ],
}

export function trapsForSkill(slug: string, domain: string): Trap[] {
  return TRAP_LIBRARIES[slug] ?? GENERIC_TRAPS[domain] ?? GENERIC_TRAPS.quant
}

// ---------------- generation ----------------

export const INDIAN_NAMES = [
  'Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Sana', 'Vikram', 'Priya',
  'Aisha', 'Nikhil', 'Tanvi', 'Farhan', 'Ishita', 'Dev', 'Zoya', 'Arjun',
]

export interface SkillContext {
  slug: string
  name: string
  domain: string
  topicName: string
  benchmarkRating: number
  benchmarkSeconds: number
}

export function buildGenerationPrompt(skill: SkillContext, count: number, existingStems: string[]): string {
  const traps = trapsForSkill(skill.slug, skill.domain)
  if (skill.domain === 'business') return buildBusinessGenerationPrompt(skill, count, existingStems, traps)
  return `You write ORIGINAL aptitude questions for Indian placement tests (BBA/BCom/BA audience, tier-2/3 colleges). Never reproduce a published question.

Write ${count} multiple-choice questions for this skill:
SKILL: ${skill.name} (topic: ${skill.topicName}, domain: ${skill.domain})
DIFFICULTY: typical solver has rating ~${skill.benchmarkRating} (1000 = beginner, 1400 = strong); mix one notch easier and one notch harder across the batch.
TIME BENCHMARK: a proficient student solves one in ~${skill.benchmarkSeconds}s.

TRAP LIBRARY — every wrong option MUST be the exact numeric/logical result of one of these named mistakes:
${traps.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

RULES:
1. Exactly 4 options (A–D), exactly one correct. Compute every distractor by actually making its trap's mistake — no filler numbers.
2. Numbers must work out cleanly unless the skill is about approximation.
3. Indian context where natural (₹, names like ${INDIAN_NAMES.slice(0, 5).join(', ')}, realistic business scenarios). Never forced.
4. solution_md: numbered steps, max 5, teach the METHOD. Bold the final answer with **.
5. shortcut_md: a genuinely faster route (multiplying factors, option elimination, known families). If none exists, empty string.
6. hints: exactly 2, progressive — first a reframe, then the method name or first step. Never reveal the answer.
7. Each wrong option gets trap (the library name) and trap_explanation: 1–2 sentences telling the student exactly what mistake produced that number, written TO the student ("You divided by...").
8. Do NOT duplicate the structure of these existing questions:
${existingStems.slice(0, 15).map((s) => `- ${s.slice(0, 90)}`).join('\n') || '- (none yet)'}
9. self_check_answer_key: independently re-derive the answer from scratch and write which key it is. If your re-derivation disagrees with answer_key, fix the question before output.
10. No em dashes in any student-facing text.`
}

// Business & Case Aptitude reads differently from arithmetic: the value is the
// decomposition and the defensible assumption, not a clean single number. Same
// output schema (4 trap-mapped MCQ options) so the whole admin pipeline,
// validation and cold-solve verification work unchanged.
function buildBusinessGenerationPrompt(skill: SkillContext, count: number, existingStems: string[], traps: Trap[]): string {
  return `You write ORIGINAL business and case-style aptitude questions for Indian placement and Founder's Office / consulting-analyst prep (BBA/BCom audience). Never reproduce a published question.

Write ${count} multiple-choice questions for this skill:
SKILL: ${skill.name} (topic: ${skill.topicName}, domain: business)
DIFFICULTY: a typical solver has rating ~${skill.benchmarkRating} (1000 = beginner, 1400 = strong); mix one notch easier and one harder across the batch.
TIME BENCHMARK: a proficient student solves one in ~${skill.benchmarkSeconds}s.

This is BUSINESS reasoning, not textbook arithmetic. Match the sub-genre to the skill:
- Market sizing / guesstimates: the four options are spaced roughly one order of magnitude apart; the correct one is the defensible order of magnitude. The teaching is the DECOMPOSITION (base x fraction x uses), never a precise number. State assumptions in the solution.
- Case math (contribution, breakeven, growth/CAGR, profit levers): realistic Indian business scenarios (a cloud kitchen, a D2C brand, a kirana chain, an app). Numbers should resolve cleanly.
- Data / chart insight: give a small set of figures in words; the question is the business "so what". Distractors confuse share with units, absolute with relative, or correlation with cause.

TRAP LIBRARY - every wrong option MUST be the exact result of one of these named mistakes:
${traps.map((t) => `- ${t.name}: ${t.description}`).join('\n')}

RULES:
1. Exactly 4 options (A-D), exactly one defensible/correct. Compute every distractor by actually making its trap's mistake, no filler.
2. solution_md: numbered steps (max 5) showing the decomposition or business logic. For sizing, show the estimation tree and end on the order of magnitude. Bold the final answer with **.
3. shortcut_md: the reusable structure ("population x fraction x uses", "fixed cost / contribution", "end / start, then the yearly multiple").
4. hints: exactly 2, progressive, never revealing the answer.
5. Each wrong option gets trap (the library name) and trap_explanation: 1-2 sentences written TO the student ("You compared shares instead of units...").
6. Realistic Indian business context (Rs, real-feeling firms), never forced. Do NOT duplicate the structure of these existing questions:
${existingStems.slice(0, 15).map((s) => `- ${s.slice(0, 90)}`).join('\n') || '- (none yet)'}
7. self_check_answer_key: independently re-derive the answer; if it disagrees with answer_key, fix the question before output.
8. No em dashes in any student-facing text.`
}

// JSON schema for structured outputs (additionalProperties:false everywhere,
// no unsupported constraints).
export const GENERATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'stem_md', 'options', 'answer_key', 'solution_md', 'shortcut_md',
          'hints', 'difficulty', 'time_benchmark_sec', 'self_check_answer_key',
        ],
        properties: {
          stem_md: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['key', 'text', 'trap', 'trap_explanation'],
              properties: {
                key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                text: { type: 'string' },
                trap: { type: ['string', 'null'] },
                trap_explanation: { type: ['string', 'null'] },
              },
            },
          },
          answer_key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
          solution_md: { type: 'string' },
          shortcut_md: { type: 'string' },
          hints: { type: 'array', items: { type: 'string' } },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          time_benchmark_sec: { type: 'integer' },
          self_check_answer_key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
        },
      },
    },
  },
} as const

export const VERIFICATION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['answers'],
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['index', 'answer_key'],
        properties: {
          index: { type: 'integer' },
          answer_key: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
        },
      },
    },
  },
} as const

export function buildVerificationPrompt(questions: { stem_md: string; options: { key: string; text: string }[] }[]): string {
  return `Solve each aptitude question completely from scratch. Show no work — output only your final answer key for each. Be careful and exact; these answers gate publication.

${questions.map((q, i) => `Q${i}: ${q.stem_md}\n${q.options.map((o) => `${o.key}) ${o.text}`).join('\n')}`).join('\n\n')}`
}

// ---------------- validation & shaping ----------------

export interface GeneratedCandidate {
  stem_md: string
  options: { key: string; text: string; trap: string | null; trap_explanation: string | null }[]
  answer_key: string
  solution_md: string
  shortcut_md: string
  hints: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  time_benchmark_sec: number
  self_check_answer_key: string
}

export function validateCandidate(c: GeneratedCandidate, skill: SkillContext): string | null {
  if (!c.stem_md || c.stem_md.trim().length < 15) return 'stem too short'
  if (!Array.isArray(c.options) || c.options.length !== 4) return 'needs exactly 4 options'
  const keys = c.options.map((o) => o.key).sort().join('')
  if (keys !== 'ABCD') return 'option keys must be A-D'
  const texts = new Set(c.options.map((o) => o.text.trim()))
  if (texts.size !== 4) return 'duplicate option texts'
  if (!c.options.some((o) => o.key === c.answer_key)) return 'answer key not among options'
  if (c.self_check_answer_key !== c.answer_key) return 'self-check disagreed with answer key'
  const traps = new Set(trapsForSkill(skill.slug, skill.domain).map((t) => t.name))
  for (const o of c.options) {
    if (o.key === c.answer_key) continue
    if (!o.trap || !traps.has(o.trap)) return `distractor ${o.key} has no library trap`
    if (!o.trap_explanation || o.trap_explanation.trim().length < 10) return `distractor ${o.key} missing trap explanation`
  }
  if (!c.solution_md || c.solution_md.trim().length < 20) return 'solution too thin'
  if (!Array.isArray(c.hints) || c.hints.length < 1) return 'needs hints'
  if (c.time_benchmark_sec < 8 || c.time_benchmark_sec > 300) return 'benchmark out of range'
  return null
}

export function candidateToPayload(c: GeneratedCandidate): QuestionPayload {
  const trapExplanations: Record<string, string> = {}
  for (const o of c.options) {
    if (o.trap && o.trap_explanation) trapExplanations[o.trap] = o.trap_explanation
  }
  return {
    stem_md: c.stem_md.trim(),
    options: c.options.map((o) => ({ key: o.key, text: o.text.trim(), trap: o.key === c.answer_key ? null : o.trap })),
    answer: { keys: [c.answer_key] },
    solution_md: c.solution_md.trim(),
    shortcut_md: c.shortcut_md.trim() || undefined,
    trap_explanations: trapExplanations,
    hints: c.hints.map((h) => h.trim()).slice(0, 3),
  }
}

export function ratingSeed(difficulty: 'easy' | 'medium' | 'hard', benchmarkRating: number): number {
  const offset = difficulty === 'easy' ? -130 : difficulty === 'hard' ? 140 : 0
  return Math.max(850, Math.min(1550, benchmarkRating + offset))
}

// Structure hash for dedupe: numbers → #, names/case/punctuation flattened.
export function contentHash(stem: string): string {
  const normalized = stem
    .toLowerCase()
    .replace(/[0-9]+(\.[0-9]+)?/g, '#')
    .replace(/[^a-z#\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return createHash('sha256').update(normalized).digest('hex')
}

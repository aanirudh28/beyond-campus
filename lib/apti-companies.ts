// Company prep database (docs/aptitude/08) — patterns the readiness score is
// computed against. Lives in code for v1: the founder updates it each season
// (with student pattern reports) via a PR, not a CMS.
//
// HONESTY RULE: every pattern here is labeled `confidence: 'estimated'` until
// verified by 25+ student reports. The UI must always show that label.
//
// skillWeights reference apti_skills slugs. Weights: 3 = heavily tested,
// 2 = regular, 1 = appears. Skills a student hasn't touched score 0, which is
// exactly what readiness should reflect.

export interface CompanyPattern {
  slug: string
  name: string
  tier: 'big4' | 'consulting' | 'banking' | 'fmcg' | 'newage'
  vendor: string                    // the test platform students actually face
  sectionsLine: string              // human summary of the real test shape
  negativeMarking: boolean
  season: string
  cutoffNote: string
  confidence: 'estimated' | 'reported' | 'verified'
  skillWeights: Record<string, number>
}

export const COMPANIES: CompanyPattern[] = [
  {
    slug: 'deloitte', name: 'Deloitte', tier: 'big4', vendor: 'Versant / in-house',
    sectionsLine: 'Quant + logical + verbal, ~60 Q in ~60 min, then JAM/GD',
    negativeMarking: false, season: 'Aug–Oct campus, Jan–Feb off-campus',
    cutoffNote: 'Sectional cutoffs reported around 65–70%',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 3, 'fraction-percent-conversion': 2, 'successive-change': 2,
      'combining-ratios': 2, 'basic-averages': 2, 'cp-sp-basics': 2, 'markup-discount': 2,
      'simple-interest': 1, 'speed-basics': 2, 'work-rates': 2,
      'series-next-term': 3, 'letter-shift': 2, 'substitution-coding': 1,
      'relation-chains': 2, 'linear-arrangement': 2, 'two-statement': 2,
    },
  },
  {
    slug: 'ey', name: 'EY', tier: 'big4', vendor: 'SHL / Mettl',
    sectionsLine: 'Numerical + logical + verbal batteries, strict per-section timers',
    negativeMarking: false, season: 'Aug–Nov',
    cutoffNote: 'Adaptive batteries; consistent accuracy matters more than raw count',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 3, 'successive-change': 2, 'weighted-average': 2, 'basic-averages': 2,
      'combining-ratios': 2, 'markup-discount': 2, 'compound-interest': 1,
      'speed-basics': 2, 'relative-speed-trains': 1, 'work-rates': 2,
      'series-next-term': 2, 'letter-shift': 2, 'relation-chains': 2,
      'linear-arrangement': 2, 'circular-arrangement': 1, 'two-statement': 3,
    },
  },
  {
    slug: 'kpmg', name: 'KPMG', tier: 'big4', vendor: 'Aon cut-e',
    sectionsLine: 'Short sharp modules (scales) — speed under pressure is the test',
    negativeMarking: true, season: 'Sep–Dec',
    cutoffNote: 'cut-e modules are short; a few careless errors sink a module',
    confidence: 'estimated',
    skillWeights: {
      'fraction-percent-conversion': 3, 'percentage-change': 2, 'basic-averages': 2,
      'combining-ratios': 2, 'cp-sp-basics': 2, 'speed-basics': 2,
      'series-next-term': 3, 'series-wrong-term': 2, 'letter-shift': 2,
      'two-statement': 2, 'linear-arrangement': 1,
    },
  },
  {
    slug: 'pwc', name: 'PwC', tier: 'big4', vendor: 'SHL / in-house',
    sectionsLine: 'Numerical reasoning + logical + situational judgement',
    negativeMarking: false, season: 'Aug–Nov',
    cutoffNote: 'Numerical section skews percentages/ratio on data snippets',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 3, 'successive-change': 2, 'fraction-percent-conversion': 2,
      'combining-ratios': 2, 'weighted-average': 2, 'markup-discount': 1,
      'simple-interest': 1, 'work-rates': 1,
      'series-next-term': 2, 'relation-chains': 2, 'linear-arrangement': 2, 'two-statement': 2,
    },
  },
  {
    slug: 'accenture', name: 'Accenture', tier: 'consulting', vendor: 'in-house (cognitive + abilities)',
    sectionsLine: 'Cognitive: numerical + verbal + logical, ~50 min; then communication round',
    negativeMarking: false, season: 'Rolling, peaks Aug–Jan',
    cutoffNote: 'High volume, moderate difficulty — speed and consistency win',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 2, 'fraction-percent-conversion': 2, 'basic-averages': 2,
      'cp-sp-basics': 2, 'simple-interest': 2, 'speed-basics': 2, 'work-rates': 2,
      'series-next-term': 3, 'letter-shift': 3, 'substitution-coding': 2,
      'relation-chains': 2, 'linear-arrangement': 2, 'two-statement': 2,
    },
  },
  {
    slug: 'icici', name: 'ICICI Bank', tier: 'banking', vendor: 'in-house / Mettl',
    sectionsLine: 'Apti + English + psychometric; arithmetic-heavy quant',
    negativeMarking: true, season: 'Year-round PO/MT drives',
    cutoffNote: 'Negative marking — the skip-or-attempt instinct matters',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 3, 'simple-interest': 3, 'compound-interest': 3, 'si-ci-difference': 2,
      'combining-ratios': 2, 'basic-averages': 2, 'alligation': 2, 'cp-sp-basics': 2,
      'speed-basics': 2, 'boats-streams': 1, 'work-rates': 2, 'pipes-cisterns': 1,
      'series-next-term': 2, 'coded-relations': 1, 'two-statement': 2, 'possibility-syllogisms': 1,
    },
  },
  {
    slug: 'hdfc', name: 'HDFC Bank', tier: 'banking', vendor: 'in-house',
    sectionsLine: 'Quant + reasoning + English, banking-flavoured arithmetic',
    negativeMarking: true, season: 'Year-round',
    cutoffNote: 'Interest and ratio problems dominate the quant section',
    confidence: 'estimated',
    skillWeights: {
      'simple-interest': 3, 'compound-interest': 3, 'percentage-change': 2, 'combining-ratios': 2,
      'partnership': 2, 'basic-averages': 2, 'alligation': 1, 'markup-discount': 1,
      'speed-basics': 1, 'work-rates': 2,
      'series-next-term': 2, 'letter-shift': 2, 'relation-chains': 2, 'linear-arrangement': 2,
      'two-statement': 2,
    },
  },
  {
    slug: 'axis', name: 'Axis Bank', tier: 'banking', vendor: 'Mettl',
    sectionsLine: 'Apti + behavioural; moderate difficulty, tight timing',
    negativeMarking: false, season: 'Year-round (Ahead / MT programs)',
    cutoffNote: 'Balanced across arithmetic and reasoning',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 2, 'simple-interest': 2, 'compound-interest': 2,
      'combining-ratios': 2, 'basic-averages': 2, 'cp-sp-basics': 2,
      'speed-basics': 2, 'work-rates': 1,
      'series-next-term': 2, 'letter-shift': 2, 'relation-chains': 2,
      'linear-arrangement': 2, 'two-statement': 2,
    },
  },
  {
    slug: 'hul', name: 'HUL', tier: 'fmcg', vendor: 'in-house (ULIP/UFLP gamified + apti)',
    sectionsLine: 'Gamified cognitive + numerical; case-flavoured business numeracy',
    negativeMarking: false, season: 'Jul–Sep (UFLP), internships Dec–Jan',
    cutoffNote: 'Business-context arithmetic — margins, mixes, growth rates',
    confidence: 'estimated',
    skillWeights: {
      'percentage-change': 3, 'successive-change': 2, 'weighted-average': 3, 'alligation': 2,
      'cp-sp-basics': 3, 'markup-discount': 2, 'combining-ratios': 2, 'basic-averages': 2,
      'contribution-margin': 3, 'growth-cagr': 2, 'business-conclusion': 2, 'top-down-sizing': 1,
      'series-next-term': 1, 'two-statement': 1, 'linear-arrangement': 1,
    },
  },
  {
    slug: 'amazon-ops', name: 'Amazon (Ops / Vendor Mgmt)', tier: 'newage', vendor: 'in-house',
    sectionsLine: 'Numerical + logical + work-style; ops math and estimation',
    negativeMarking: false, season: 'Rolling',
    cutoffNote: 'Rates, throughput and averages — Time & Work in disguise',
    confidence: 'estimated',
    skillWeights: {
      'work-rates': 3, 'combined-work': 2, 'pipes-cisterns': 1, 'speed-basics': 2,
      'percentage-change': 2, 'weighted-average': 2, 'basic-averages': 2,
      'bottom-up-sizing': 2, 'breakeven': 1,
      'combining-ratios': 2, 'series-next-term': 2, 'linear-arrangement': 2,
      'circular-arrangement': 1, 'two-statement': 2,
    },
  },
  {
    slug: 'founders-office', name: "Founder's Office / Chief of Staff", tier: 'newage',
    vendor: 'take-home case / live assignment',
    sectionsLine: 'A business case: market sizing, unit economics, and a data-backed recommendation',
    negativeMarking: false, season: 'Rolling, heaviest Jun–Sep',
    cutoffNote: 'Judged on structure and defensible assumptions, not a single exact number',
    confidence: 'estimated',
    skillWeights: {
      'top-down-sizing': 3, 'bottom-up-sizing': 3, 'estimation-sense': 2,
      'contribution-margin': 3, 'breakeven': 3, 'growth-cagr': 2, 'profit-bridge': 2,
      'chart-reading': 2, 'business-conclusion': 3, 'tradeoff-decision': 3,
      'percentage-change': 2, 'weighted-average': 1,
    },
  },
]

export function companyBySlug(slug: string): CompanyPattern | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}

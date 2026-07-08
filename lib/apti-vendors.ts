// Vendor decoder database (docs/aptitude/14 #29) — the test PLATFORMS students
// actually face, explained and made practiceable as first-class entities.
// Students search "AMCAT syllabus" or "SHL practice" far more than any single
// company name, so each vendor is its own high-intent SEO page.
//
// HONESTY RULE (same as companies): every pattern is 'estimated' until verified
// by student reports; the UI always shows that label. Company links are derived
// from the real vendor strings in apti-companies.ts, never invented.

import { COMPANIES, type CompanyPattern } from '@/lib/apti-companies'

export interface VendorPattern {
  slug: string
  name: string
  maker: string
  tagline: string
  formatLine: string
  adaptive: boolean
  negativeMarking: string           // 'No' | 'Yes' | 'Module-dependent'
  scoring: string
  quirks: string[]                  // the things that actually trip students
  drillSkills: string[]             // apti_skills slugs → topic links on the page
  vendorMatch: string[]             // terms found in a company's `vendor` string
  confidence: 'estimated'
}

export const VENDORS: VendorPattern[] = [
  {
    slug: 'amcat', name: 'AMCAT', maker: 'Aspiring Minds (an SHL company)',
    tagline: 'India’s most widely used fresher employability test.',
    formatLine: 'Quantitative Ability + Logical Ability + English Comprehension, plus a personality module and optional domain modules. About 2 to 2.5 hours.',
    adaptive: true, negativeMarking: 'No',
    scoring: 'Per-module scores; each company sets its own cutoffs',
    quirks: [
      'Adaptive within a module: you cannot go back and change an answer, and the next question hardens if you are doing well.',
      'Each module is separately timed. Running out of time in one does not borrow from another.',
      'The personality module (AMPI) is not part of the cutoff but is shown to recruiters. Answer honestly and consistently.',
      'Domain modules (Excel, Finance, etc.) matter for specific roles. Check which one the job asks for.',
    ],
    drillSkills: ['percentage-change', 'fraction-percent-conversion', 'basic-averages', 'speed-basics', 'work-rates', 'series-next-term', 'letter-shift', 'linear-arrangement'],
    vendorMatch: ['AMCAT', 'Aspiring Minds'], confidence: 'estimated',
  },
  {
    slug: 'elitmus', name: 'eLitmus pH Test', maker: 'eLitmus',
    tagline: 'A percentile-scored fresher test with real negative marking. Accuracy beats attempts.',
    formatLine: 'Three sections: Quantitative, Problem Solving (logical + data interpretation) and Verbal. Two hours, roughly 20 questions a section.',
    adaptive: false, negativeMarking: 'Yes',
    scoring: 'Percentile, relative to every test-taker (not a raw score)',
    quirks: [
      'Negative marking kicks in once you attempt a share of a section: a wrong answer costs you, so selective attempting is the skill.',
      'Scoring is percentile-based, so a low raw score can still be a high percentile on a hard paper. Do not panic at the difficulty.',
      'The problem-solving section leans on data interpretation and number-system puzzles more than plain arithmetic.',
      'The score is valid for two years and reused across companies, so one strong sitting goes a long way.',
    ],
    drillSkills: ['percentage-change', 'combining-ratios', 'speed-basics', 'series-next-term', 'chart-reading', 'business-conclusion', 'two-statement'],
    vendorMatch: ['eLitmus', 'pH Test'], confidence: 'estimated',
  },
  {
    slug: 'shl', name: 'SHL', maker: 'SHL Group',
    tagline: 'The global standard for graduate aptitude: numerical, verbal and inductive reasoning.',
    formatLine: 'Numerical reasoning (data tables and charts, calculator allowed), verbal reasoning, and inductive/logical reasoning with shape sequences. Tightly timed.',
    adaptive: true, negativeMarking: 'No',
    scoring: 'Percentile against a comparison group of other candidates',
    quirks: [
      'Numerical reasoning is data interpretation, not pure arithmetic: you read tables and charts under time, with an on-screen calculator.',
      'Inductive reasoning uses shape and pattern sequences. It rewards the same "find the rule" instinct as number series.',
      'Timing is brutal and per-question in the interactive version. A defensible quick read beats a perfect slow one.',
      'You are scored against a comparison group, so consistency across sections matters more than one strong section.',
    ],
    drillSkills: ['chart-reading', 'business-conclusion', 'percentage-change', 'combining-ratios', 'series-next-term'],
    vendorMatch: ['SHL'], confidence: 'estimated',
  },
  {
    slug: 'mettl', name: 'Mercer Mettl', maker: 'Mercer | Mettl',
    tagline: 'India’s most configurable proctored assessment. The pattern shifts by company.',
    formatLine: 'Aptitude (quant + logical + verbal) with optional English and psychometric modules, heavily proctored. Sectional timers.',
    adaptive: false, negativeMarking: 'Module-dependent',
    scoring: 'Raw sectional scores with company-set cutoffs',
    quirks: [
      'Strongly proctored: the webcam is on and switching browser tabs is flagged. Set up in a quiet, well-lit spot.',
      'Every company configures its own paper, so the exact mix varies. Prepare the fundamentals broadly.',
      'The quant tends to be arithmetic-heavy: percentages, interest, ratios and averages over fancy topics.',
      'Some companies switch on negative marking and some do not. Read the instructions screen before you start.',
    ],
    drillSkills: ['percentage-change', 'simple-interest', 'compound-interest', 'combining-ratios', 'basic-averages', 'series-next-term', 'two-statement'],
    vendorMatch: ['Mettl'], confidence: 'estimated',
  },
  {
    slug: 'tcs-ion-nqt', name: 'TCS iON NQT', maker: 'TCS iON',
    tagline: 'One adaptive test whose score opens doors at many companies at once.',
    formatLine: 'The National Qualifier Test: Numerical Ability, Verbal Ability and Reasoning Ability, with optional advanced sections for specific roles. Sectional timers.',
    adaptive: true, negativeMarking: 'No',
    scoring: 'A score band shared across many recruiters, valid for about two years',
    quirks: [
      'Adaptive by design: answer well and the questions get harder, and the harder ones carry more marks. Steady accuracy compounds.',
      'One sitting, many doors: the NQT score is reused across a large pool of hiring companies, so a strong attempt goes a long way.',
      'The numerical section leans on data interpretation and arithmetic under time more than exotic topics.',
      'Each section is separately timed and you move forward through it, so pace per question matters.',
    ],
    drillSkills: ['percentage-change', 'speed-basics', 'work-rates', 'simple-interest', 'chart-reading', 'series-next-term', 'substitution-coding', 'linear-arrangement'],
    vendorMatch: ['TCS iON', 'TCS NQT', 'NQT'], confidence: 'estimated',
  },
]

export function vendorBySlug(slug: string): VendorPattern | undefined {
  return VENDORS.find((v) => v.slug === slug)
}

// Companies (from apti-companies.ts) whose real `vendor` string names this
// vendor. Honest by construction: no link exists unless a company genuinely
// lists the platform.
export function companiesUsingVendor(v: VendorPattern): CompanyPattern[] {
  return COMPANIES.filter((c) =>
    v.vendorMatch.some((term) => c.vendor.toLowerCase().includes(term.toLowerCase()))
  )
}

// The vendor decoder for a company's test platform, if we have one — powers the
// "Tested via ..." cross-link on company pages.
export function vendorForCompany(company: CompanyPattern): VendorPattern | undefined {
  return VENDORS.find((v) =>
    v.vendorMatch.some((term) => company.vendor.toLowerCase().includes(term.toLowerCase()))
  )
}

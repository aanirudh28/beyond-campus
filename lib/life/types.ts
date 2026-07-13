// 20 Years in 60 Minutes — shared types for the deterministic life engine.
// The economy is authored TypeScript; AI only decorates narration. Keep every
// gameplay-relevant number in this content graph, never in prompts.

export interface Stats {
  salary: number // current CTC in ₹ LPA. 0 = between jobs / studying
  savings: number // net worth in ₹ lakhs
  skills: number // 0-100
  network: number // 0-100
  reputation: number // 0-100 professional brand
  burnout: number // 0-100, high is bad
  family: number // 0-100 relationships and roots
}

export type StatKey = keyof Stats

export interface Profile {
  stream: 'bba' | 'bcom' | 'other'
  city: 'metro' | 'tier2' | 'tier3'
  ambition: 'money' | 'stability' | 'impact'
}

export interface ChoiceRecord {
  c: number // chapter index 0-5
  cardId: string
  optionId: string
}

export interface TrailPoint {
  age: number
  year: number
  salary: number
  savings: number
  burnout: number
}

export interface GameState {
  seed: number
  profile: Profile
  chapter: number // 0-5
  age: number // display age at current point
  year: number // display year
  stats: Stats
  flags: Record<string, true> // sparse: mentor_kept, excel_learned, moved_metro...
  history: ChoiceRecord[]
  trail: TrailPoint[] // stat snapshots at chapter boundaries, for the timeline chart
}

export interface Effects {
  salary?: number | { mult: number } // +2 LPA, or ×1.4 on a switch
  savings?: number
  skills?: number
  network?: number
  reputation?: number
  burnout?: number
  family?: number
}

export interface Condition {
  flag?: string
  notFlag?: string
  minStat?: Partial<Stats>
  maxStat?: Partial<Stats>
  ambition?: Profile['ambition']
  city?: Profile['city']
  stream?: Profile['stream']
}

export interface CardOption {
  id: string
  label: string // button text, keep under ~60 chars
  effects: Effects
  setFlags?: string[]
  outcome: string // authored consequence line, always shown, AI never replaces this
}

export interface Card {
  id: string // 'ch1_family_verdict'
  chapter: number // 0-indexed
  kind: 'decision' | 'event'
  title: string // mono-label above the card
  base: string // authored narration; the AI fallback AND the AI's raw material
  pivotal?: boolean // feeds the epilogue digest
  condition?: Condition
  forced?: boolean // events only: always included (e.g. the Correction)
  options: CardOption[] // 2 for decisions, 1-2 for events
}

export interface ChapterMeta {
  index: number
  title: string // 'THE HUNT'
  ageFrom: number
  ageTo: number
  yearFrom: number
  yearTo: number
  intro: string // chapter transition screen text
  decisions: number // how many decision cards to deal
  events: number // how many pool events to deal
}

export interface EndingMatch extends Condition {
  minSalary?: number
  maxSalary?: number
  minSavings?: number
  maxSavings?: number
  anyFlags?: string[]
  allFlags?: string[]
  noneFlags?: string[]
}

export interface Ending {
  id: string // 'the_comfortable_trap'
  name: string
  emoji: string
  tone: 'good' | 'bad' | 'weird'
  blurb: string // 2 sentences, authored; shown on card, OG image, and AI fallback
  baselineRarity: number // authored prior %, used until real N is meaningful
  match: EndingMatch
}

export interface LifeReportItem {
  moment: string // "At 22 you skipped the Excel sprint for the trip."
  lesson: string // what it cost inside the simulation
  action: string // what to do NOW, at 21, in the real world
  cta: { label: string; href: string }
}

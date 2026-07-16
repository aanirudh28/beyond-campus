import type { ChoiceRecord } from './types'
import { ALL_CARDS, CHAPTERS } from './content/chapters'

// The diary: the run reconstructed as a readable story, straight from the
// authored outcome lines the player actually triggered. Zero AI, fully
// deterministic, private to the player (choices never leave the device
// except inside the anti-cheat replay).

export interface DiaryEntry {
  cardTitle: string
  chose: string
  outcome: string
  pivotal: boolean
}

export interface DiaryChapter {
  index: number
  title: string
  ageFrom: number
  ageTo: number
  yearFrom: number
  yearTo: number
  entries: DiaryEntry[]
}

export function buildDiary(history: ChoiceRecord[]): DiaryChapter[] {
  const chapters: DiaryChapter[] = []
  for (const meta of CHAPTERS) {
    const entries: DiaryEntry[] = []
    for (const record of history) {
      if (record.c !== meta.index) continue
      const card = ALL_CARDS[record.c]?.find((c) => c.id === record.cardId)
      const option = card?.options.find((o) => o.id === record.optionId)
      if (!card || !option) continue
      entries.push({
        cardTitle: card.title,
        chose: option.label,
        outcome: option.outcome,
        pivotal: card.pivotal === true,
      })
    }
    if (entries.length) {
      chapters.push({
        index: meta.index,
        title: meta.title,
        ageFrom: meta.ageFrom,
        ageTo: meta.ageTo,
        yearFrom: meta.yearFrom,
        yearTo: meta.yearTo,
        entries,
      })
    }
  }
  return chapters
}

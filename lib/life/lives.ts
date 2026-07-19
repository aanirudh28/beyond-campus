// Past lives on this device: every completed run becomes an exhibit in
// the collection. Pure localStorage, no account, capped at 30. Display
// data only — the run's truth lives in the engine and (if claimed) the DB.

export interface PastLife {
  e: string // ending id
  s: number // final savings, ₹ lakhs
  o: string // origin id (the hand that was dealt)
  ts: number
}

const KEY = 'bc20_lives'

export function recordPastLife(life: PastLife) {
  try {
    const arr: PastLife[] = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    arr.push(life)
    localStorage.setItem(KEY, JSON.stringify(arr.slice(-30)))
  } catch {}
}

export function readPastLivesRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? '[]'
  } catch {
    return '[]'
  }
}

export function parsePastLives(raw: string): PastLife[] {
  try {
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

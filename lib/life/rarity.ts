import type { SupabaseClient } from '@supabase/supabase-js'
import { getEnding } from './content/endings'

// Rarity: real percentage once we have volume, blended with the authored
// prior while the player base is small so day-one endings feel plausible.
export async function endingRarity(svc: SupabaseClient, endingId: string): Promise<number> {
  const prior = getEnding(endingId).baselineRarity
  const { data } = await svc.from('life_ending_counts').select('ending_id, n')
  if (!data) return prior
  const total = data.reduce((sum, row) => sum + row.n, 0)
  const count = data.find((row) => row.ending_id === endingId)?.n ?? 0
  if (total >= 200) return Math.max(1, Math.round((count / total) * 100))
  return Math.max(1, Math.round(((count + 20 * (prior / 100)) / (total + 20)) * 100))
}

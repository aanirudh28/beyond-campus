import type { SupabaseClient } from '@supabase/supabase-js'
import { getEnding } from './content/endings'

// Rarity display (doc 08 §5): real frequency takes over at N≥200 completed
// runs per profile bucket (stream × city) — rarity shown to a tier-3 bcom
// player should reflect lives like theirs once data allows. Falls back to
// global real frequency at N≥200, else the authored prior blended with
// whatever little data exists.

interface ProfileBucket {
  stream?: string
  city?: string
}

export async function endingRarity(
  svc: SupabaseClient,
  endingId: string,
  profile?: ProfileBucket | null,
): Promise<number> {
  const prior = getEnding(endingId).baselineRarity

  if (profile?.stream && profile?.city) {
    try {
      const { data } = await svc
        .from('life_ending_counts_by_profile')
        .select('ending_id, n')
        .eq('stream', profile.stream)
        .eq('city', profile.city)
      if (data) {
        const total = data.reduce((sum, row) => sum + row.n, 0)
        if (total >= 200) {
          const count = data.find((row) => row.ending_id === endingId)?.n ?? 0
          return Math.max(1, Math.round((count / total) * 100))
        }
      }
    } catch {
      // view not pasted yet — fall through to global
    }
  }

  const { data } = await svc.from('life_ending_counts').select('ending_id, n')
  if (!data) return prior
  const total = data.reduce((sum, row) => sum + row.n, 0)
  const count = data.find((row) => row.ending_id === endingId)?.n ?? 0
  if (total >= 200) return Math.max(1, Math.round((count / total) * 100))
  return Math.max(1, Math.round(((count + 20 * (prior / 100)) / (total + 20)) * 100))
}

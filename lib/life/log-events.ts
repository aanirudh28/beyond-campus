import type { SupabaseClient } from '@supabase/supabase-js'

// Server-side event writer (doc 08). Fire-and-forget: analytics must never
// break gameplay, so every failure (including "table not pasted yet") is
// swallowed. Frozen names — never rename, only add.

export const LIFE_EVENTS = [
  'run_started',
  'profile_completed',
  'chapter_completed',
  'card_answered',
  'run_abandoned',
  'ending_reached',
  'ghost_viewed',
  'share_clicked',
  'challenge_created',
  'challenge_accepted',
  'report_viewed',
  'report_claimed',
  'report_cta_clicked',
  'collection_viewed',
  'ai_fallback',
  'og_page_view',
] as const

export type LifeEventName = (typeof LIFE_EVENTS)[number]

// Only these may arrive via the public /api/life/events endpoint; the rest
// are written inline by trusted routes (start/ending/claim/scene/[id]).
export const CLIENT_EVENTS: ReadonlySet<string> = new Set([
  'profile_completed',
  'chapter_completed',
  'card_answered',
  'run_abandoned',
  'ghost_viewed',
  'share_clicked',
  'challenge_created',
  'report_viewed',
  'report_cta_clicked',
  'collection_viewed',
])

export async function logLifeEvents(
  svc: SupabaseClient,
  runId: string | null,
  events: { n: LifeEventName; p?: Record<string, unknown> }[],
): Promise<void> {
  if (!events.length) return
  try {
    await svc.from('life_events').insert(
      events.map((e) => ({
        run_id: runId,
        n: e.n,
        p: e.p ?? null,
      })),
    )
  } catch {
    // analytics never breaks gameplay
  }
}

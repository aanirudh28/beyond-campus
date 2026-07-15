import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { getEnding } from '@/lib/life/content/endings'
import { endingRarity } from '@/lib/life/rarity'
import { logLifeEvents } from '@/lib/life/log-events'

export const runtime = 'nodejs'

const V2_FIELDS =
  'ending_id, epilogue, one_liner, final_stats, profile, trail, ghosts, challenge, completed_at, created_at'
const V1_FIELDS = 'ending_id, epilogue, one_liner, final_stats, profile, completed_at, created_at'

// Public result: a PURE READ of fields stored at completion (doc 04 §3).
// No engine import, no replay, no CONTENT_VERSION sensitivity — old links
// render identically forever. Never expose email, ip_hash, or raw choices.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const svc = serviceClient()
    let { data: run } = await svc.from('life_runs').select(V2_FIELDS).eq('id', id).single()
    if (!run) {
      // v2 columns not pasted yet: serve the v1 shape.
      const v1 = await svc.from('life_runs').select(V1_FIELDS).eq('id', id).single()
      run = v1.data ? { ...v1.data, trail: null, ghosts: null, challenge: null } : null
    }
    if (!run || !run.completed_at || !run.ending_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const ending = getEnding(run.ending_id)
    const rarity = await endingRarity(svc, run.ending_id, run.profile)
    await logLifeEvents(svc, id, [{ n: 'og_page_view' }])
    return NextResponse.json({
      ending,
      epilogue: run.epilogue || ending.blurb,
      oneLiner: run.one_liner || '',
      rarity,
      stats: run.final_stats,
      trail: run.trail ?? null,
      ghosts: run.ghosts ?? null,
      challenge: run.challenge ?? null,
      createdAt: run.created_at,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

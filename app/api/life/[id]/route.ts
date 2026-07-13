import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { getEnding } from '@/lib/life/content/endings'
import { endingRarity } from '@/lib/life/rarity'
import { replayRun } from '@/lib/life/engine'

export const runtime = 'nodejs'

// Public result: safe fields only. Never expose email, ip_hash, or raw choices.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const svc = serviceClient()
    const { data: run } = await svc
      .from('life_runs')
      .select('seed, profile, choices, ending_id, epilogue, one_liner, final_stats, completed_at, created_at')
      .eq('id', id)
      .single()
    if (!run || !run.completed_at || !run.ending_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const ending = getEnding(run.ending_id)
    const rarity = await endingRarity(svc, run.ending_id)

    // The life graph, rebuilt from the stored run. Content updates can break
    // replay of old runs; the graph is then simply omitted.
    let trail = null
    try {
      if (Array.isArray(run.choices)) {
        trail = replayRun(run.seed, run.profile, run.choices).trail
      }
    } catch {}

    return NextResponse.json({
      ending,
      epilogue: run.epilogue || ending.blurb,
      oneLiner: run.one_liner || '',
      rarity,
      stats: run.final_stats,
      trail,
      createdAt: run.created_at,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

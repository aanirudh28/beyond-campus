import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { getEnding } from '@/lib/life/content/endings'
import { endingRarity } from '@/lib/life/rarity'

export const runtime = 'nodejs'

// Public result: safe fields only. Never expose email, ip_hash, or choices.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const svc = serviceClient()
    const { data: run } = await svc
      .from('life_runs')
      .select('ending_id, epilogue, one_liner, final_stats, completed_at, created_at')
      .eq('id', id)
      .single()
    if (!run || !run.completed_at || !run.ending_id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const ending = getEnding(run.ending_id)
    const rarity = await endingRarity(svc, run.ending_id)
    return NextResponse.json({
      ending,
      epilogue: run.epilogue || ending.blurb,
      oneLiner: run.one_liner || '',
      rarity,
      stats: run.final_stats,
      createdAt: run.created_at,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

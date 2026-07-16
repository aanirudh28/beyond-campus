import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { getEnding } from '@/lib/life/content/endings'

export const runtime = 'nodejs'

const CITY_LABEL: Record<string, string> = {
  metro: 'a metro',
  tier2: 'a tier-2 city',
  tier3: 'a small town',
}

// The multiverse wall (doc 07 §5): the latest anonymous endings, so the
// landing page shows a world that is visibly being lived in. No ids, no
// names, no emails — just endings and where they happened.
export async function GET() {
  try {
    const svc = serviceClient()
    const { data } = await svc
      .from('life_runs')
      .select('ending_id, profile, completed_at')
      .not('completed_at', 'is', null)
      .not('ending_id', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(12)
    const wall = (data ?? []).map((run) => {
      const e = getEnding(run.ending_id)
      const mins = Math.max(1, Math.round((Date.now() - new Date(run.completed_at).getTime()) / 60000))
      const ago =
        mins < 60
          ? `${mins}m ago`
          : mins < 60 * 48
            ? `${Math.round(mins / 60)}h ago`
            : `${Math.round(mins / 1440)}d ago`
      return {
        emoji: e.emoji,
        name: e.name,
        tone: e.tone,
        where: CITY_LABEL[run.profile?.city] ?? 'somewhere',
        ago,
      }
    })
    return NextResponse.json({ wall })
  } catch {
    return NextResponse.json({ wall: [] })
  }
}

export const runtime = 'nodejs'
export const maxDuration = 30

import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { ENDINGS } from '@/lib/life/content/endings'
import { ALL_CARDS } from '@/lib/life/content/chapters'

const ADMIN_PASSWORD = 'beyondcampus2024'

// Founder dashboards for 20 Years (doc 08 §4): the run funnel and the
// content-balance board, computed on read from the life_* views. No cron.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const svc = serviceClient()

    const [daily, chapters, channels, fallbacks, abandons, splits, endings, runsTotal, runsDone] =
      await Promise.all([
        svc.from('life_event_daily').select('n, day, c'),
        svc.from('life_chapter_completions').select('chapter, n'),
        svc.from('life_share_channels').select('channel, n'),
        svc.from('life_ai_fallbacks').select('call_type, reason, n'),
        svc.from('life_abandons').select('chapter, n'),
        svc.from('life_card_splits').select('card_id, option_id, n'),
        svc.from('life_ending_counts').select('ending_id, n'),
        svc.from('life_runs').select('id', { count: 'exact', head: true }),
        svc
          .from('life_runs')
          .select('id', { count: 'exact', head: true })
          .not('completed_at', 'is', null),
      ])

    if (daily.error) {
      // life_events not pasted yet — tell the founder exactly what to do.
      return NextResponse.json({
        needsSchema: true,
        message:
          'The v2 SQL block has not been run yet. Paste supabase/life-schema.sql (the v2 section) in the Supabase SQL editor, then reload.',
      })
    }

    // Totals by event name (all time).
    const totals: Record<string, number> = {}
    for (const row of daily.data ?? []) {
      totals[row.n] = (totals[row.n] ?? 0) + row.c
    }
    const starts = totals['run_started'] ?? runsTotal.count ?? 0
    const completions = totals['ending_reached'] ?? runsDone.count ?? 0

    // Content balance: real ending frequency vs authored prior.
    const endingTotal = (endings.data ?? []).reduce((sum, r) => sum + r.n, 0)
    const endingBoard = ENDINGS.map((e) => {
      const n = (endings.data ?? []).find((r) => r.ending_id === e.id)?.n ?? 0
      return {
        id: e.id,
        name: e.name,
        tone: e.tone,
        n,
        realPct: endingTotal ? Math.round((n / endingTotal) * 1000) / 10 : 0,
        prior: e.baselineRarity,
      }
    }).sort((a, b) => b.n - a.n)

    // Lopsided cards: real option splits worse than 80/20 (doc 02 §5).
    const byCard = new Map<string, { option_id: string; n: number }[]>()
    for (const row of splits.data ?? []) {
      const list = byCard.get(row.card_id) ?? []
      list.push({ option_id: row.option_id, n: row.n })
      byCard.set(row.card_id, list)
    }
    const cardTitles = new Map(ALL_CARDS.flat().map((c) => [c.id, c.title]))
    const lopsided = [...byCard.entries()]
      .map(([cardId, options]) => {
        const total = options.reduce((sum, o) => sum + o.n, 0)
        const top = options.reduce((a, b) => (a.n >= b.n ? a : b))
        return {
          cardId,
          title: cardTitles.get(cardId) ?? cardId,
          topOption: top.option_id,
          topPct: total ? Math.round((top.n / total) * 100) : 0,
          answers: total,
        }
      })
      .filter((c) => c.answers >= 20 && c.topPct >= 80)
      .sort((a, b) => b.topPct - a.topPct)

    return NextResponse.json({
      funnel: {
        starts,
        completions,
        completionRate: starts ? Math.round((completions / starts) * 100) : 0,
        shareClicks: totals['share_clicked'] ?? 0,
        shareRate: completions ? Math.round(((totals['share_clicked'] ?? 0) / completions) * 100) : 0,
        claims: totals['report_claimed'] ?? 0,
        claimRate: completions ? Math.round(((totals['report_claimed'] ?? 0) / completions) * 100) : 0,
        challengesCreated: totals['challenge_created'] ?? 0,
        challengesAccepted: totals['challenge_accepted'] ?? 0,
        kFactor: completions
          ? Math.round(((totals['challenge_accepted'] ?? 0) / completions) * 100) / 100
          : 0,
        ogPageViews: totals['og_page_view'] ?? 0,
        abandons: totals['run_abandoned'] ?? 0,
      },
      chapterCompletions: (chapters.data ?? []).sort((a, b) => Number(a.chapter) - Number(b.chapter)),
      abandonsByChapter: (abandons.data ?? []).sort((a, b) => Number(a.chapter) - Number(b.chapter)),
      shareChannels: channels.data ?? [],
      aiFallbacks: fallbacks.data ?? [],
      endings: endingBoard,
      lopsidedCards: lopsided,
    })
  } catch {
    return NextResponse.json({ error: 'Dashboard failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { ensureTodayChallenge } from '@/lib/apti'
import { istDateString } from '@/lib/apti-engine'

// Daily Challenge: the same 3 questions for every student each IST day.
// Rides the daily-set pipeline (kind='challenge'), so grading, Elo and
// redemption all reuse /api/apti/answer unchanged. Requires
// supabase/apti-upgrade-3.sql — until pasted, GET reports available:false
// and the Today page hides the card.

interface ChallengeSetRow {
  id: string
  user_id: string
  completed_at: string | null
  summary: { correct?: number; totalTimeMs?: number } | null
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const challenge = await ensureTodayChallenge()
  if (!challenge) return NextResponse.json({ available: false })

  const svc = serviceClient()
  const today = istDateString()
  const { data: rows } = await svc
    .from('apti_daily_sets')
    .select('id, user_id, completed_at, summary')
    .eq('set_date', today).eq('kind', 'challenge')
  const sets = (rows ?? []) as ChallengeSetRow[]

  const finished = sets.filter((s) => s.completed_at)
  const mine = sets.find((s) => s.user_id === user.id) ?? null

  let my: null | { setId: string; done: boolean; correct?: number; totalTimeMs?: number; topPct?: number } = null
  if (mine) {
    my = { setId: mine.id, done: !!mine.completed_at }
    if (mine.completed_at && mine.summary) {
      const correct = mine.summary.correct ?? 0
      const timeMs = mine.summary.totalTimeMs ?? 0
      // rank: more correct wins, faster breaks ties (missing time ranks last)
      const beatenBy = finished.filter((s) => {
        if (s.id === mine.id) return false
        const c = s.summary?.correct ?? 0
        const t = s.summary?.totalTimeMs ?? Number.MAX_SAFE_INTEGER
        return c > correct || (c === correct && t < (timeMs || Number.MAX_SAFE_INTEGER))
      }).length
      my.correct = correct
      my.totalTimeMs = timeMs
      my.topPct = Math.max(1, Math.round(((beatenBy + 1) / Math.max(1, finished.length)) * 100))
    }
  }

  return NextResponse.json({
    available: true,
    date: challenge.challenge_date,
    total: challenge.question_ids.length,
    participants: finished.length,
    my,
  })
}

export async function POST() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const challenge = await ensureTodayChallenge()
  if (!challenge) {
    return NextResponse.json({ error: 'The challenge is warming up — try tomorrow.' }, { status: 503 })
  }

  const svc = serviceClient()
  const today = istDateString()
  const { data: profile } = await svc
    .from('apti_profiles').select('ratings').eq('user_id', user.id).single()

  const { data: created, error } = await svc.from('apti_daily_sets').insert({
    user_id: user.id,
    set_date: today,
    kind: 'challenge',
    question_ids: challenge.question_ids,
    ratings_at_start: profile?.ratings ?? {},
  }).select('id').single()

  if (error) {
    // unique(user_id, set_date) where kind='challenge' → they already have one
    const { data: existing } = await svc
      .from('apti_daily_sets').select('id')
      .eq('user_id', user.id).eq('set_date', today).eq('kind', 'challenge')
      .maybeSingle()
    if (existing) return NextResponse.json({ setId: existing.id })
    return NextResponse.json({ error: 'Could not start the challenge' }, { status: 500 })
  }
  return NextResponse.json({ setId: created.id })
}

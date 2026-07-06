export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/tracker'
import { ensureAptiProfile, getOrBuildTodaySet, loadSetQuestions, loadCurriculum, clientSafeQuestion } from '@/lib/apti'

// Returns today's set (building it on first request of the IST day) with
// client-safe question payloads: stems and options only — answers, traps and
// solutions come back exclusively through /api/apti/answer after a lock-in.
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await ensureAptiProfile(user.id, user.email!)
  const set = await getOrBuildTodaySet(user.id, profile)
  const [questions, curriculum] = await Promise.all([
    loadSetQuestions(set.question_ids),
    loadCurriculum(),
  ])

  return NextResponse.json({
    set: {
      id: set.id,
      date: set.set_date,
      cursor: set.cursor,
      total: set.question_ids.length,
      completedAt: set.completed_at,
      summary: set.summary,
      reviewCount: set.review_card_ids.length,
    },
    questions: questions.map((q) => clientSafeQuestion(q, curriculum)),
    profile: {
      streak: profile.streak,
      longestStreak: profile.longest_streak,
      lastSetDate: profile.last_set_date,
      ratings: profile.ratings ?? {},
    },
  })
}

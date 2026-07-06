export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser } from '@/lib/tracker'
import { getOwnedSet, loadSetQuestions, loadCurriculum, clientSafeQuestion } from '@/lib/apti'

// Loads any set the caller owns (daily, topic session, review session) for
// the player. Same trust boundary as the daily set: stems and options only.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const set = await getOwnedSet(user.id, id)
  if (!set) return NextResponse.json({ error: 'Set not found' }, { status: 404 })

  const [questions, curriculum] = await Promise.all([
    loadSetQuestions(set.question_ids),
    loadCurriculum(),
  ])

  return NextResponse.json({
    set: {
      id: set.id,
      kind: set.kind,
      cursor: set.cursor,
      total: set.question_ids.length,
      completedAt: set.completed_at,
      summary: set.summary,
      reviewCount: set.review_card_ids.length,
    },
    questions: questions.map((q) => clientSafeQuestion(q, curriculum)),
  })
}

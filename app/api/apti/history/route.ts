export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { blueprintBySlug, type MockSectionRow } from '@/lib/apti-mocks'

// One timeline of everything the student has sat: practice sets (any set
// with at least one answer locked) and submitted mocks. List metadata only —
// question content ships via /api/apti/review/[id] per session.

interface HistorySession {
  id: string
  scope: 'set' | 'mock'
  kind: string
  name: string | null
  date: string
  total: number
  attempted: number
  correct: number
  completed: boolean
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const svc = serviceClient()

  const [{ data: sets }, { data: mocks }] = await Promise.all([
    svc.from('apti_daily_sets')
      .select('id, kind, question_ids, cursor, completed_at, summary, created_at')
      .eq('user_id', user.id).gt('cursor', 0)
      .order('created_at', { ascending: false }).limit(120),
    svc.from('apti_mock_attempts')
      .select('id, blueprint_slug, kind, score, max_score, sections, submitted_at')
      .eq('user_id', user.id).not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false }).limit(40),
  ])

  // completed sets carry correct counts in summary; in-progress ones need a
  // single batched attempts lookup
  const needCounts = (sets ?? []).filter((s) => typeof s.summary?.correct !== 'number')
  const correctBySet = new Map<string, number>()
  if (needCounts.length > 0) {
    const { data: attempts } = await svc.from('apti_attempts')
      .select('set_id, correct')
      .eq('user_id', user.id)
      .in('set_id', needCounts.map((s) => s.id))
    for (const a of attempts ?? []) {
      if (a.correct) correctBySet.set(a.set_id, (correctBySet.get(a.set_id) ?? 0) + 1)
    }
  }

  const sessions: HistorySession[] = [
    ...(sets ?? []).map((s): HistorySession => ({
      id: s.id,
      scope: 'set',
      kind: s.kind,
      name: null,
      date: s.created_at,
      total: (s.question_ids as string[]).length,
      attempted: s.cursor,
      correct: typeof s.summary?.correct === 'number' ? s.summary.correct : correctBySet.get(s.id) ?? 0,
      completed: !!s.completed_at,
    })),
    ...(mocks ?? []).map((m): HistorySession => ({
      id: m.id,
      scope: 'mock',
      kind: 'mock',
      name: blueprintBySlug(m.blueprint_slug)?.name ?? m.blueprint_slug,
      date: m.submitted_at,
      total: (m.sections as MockSectionRow[]).reduce((n, sec) => n + sec.question_ids.length, 0),
      attempted: Math.round(Number(m.max_score ?? 0)),
      correct: Math.round(Number(m.score ?? 0)),
      completed: true,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1))

  return NextResponse.json({ sessions })
}

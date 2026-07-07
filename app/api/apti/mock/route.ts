export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { BLUEPRINTS, blueprintBySlug, buildMockAttempt } from '@/lib/apti-mocks'

// GET  → the mock ladder: blueprints + the caller's attempt history
// POST → start an attempt for a blueprint
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const svc = serviceClient()
  const [{ data: attempts }, { count: practiceCount }] = await Promise.all([
    svc.from('apti_mock_attempts')
      .select('id, blueprint_slug, kind, score, max_score, started_at, submitted_at')
      .eq('user_id', user.id).order('started_at', { ascending: false }).limit(20),
    svc.from('apti_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])
  return NextResponse.json({
    blueprints: BLUEPRINTS.map((b) => ({
      slug: b.slug, kind: b.kind, name: b.name, tagline: b.tagline,
      questions: b.sections.reduce((a, s) => a + s.count, 0),
      minutes: Math.round(b.sections.reduce((a, s) => a + s.seconds, 0) / 60),
    })),
    attempts: attempts ?? [],
    practiceCount: practiceCount ?? 0,
  })
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { blueprint?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const blueprint = blueprintBySlug(body.blueprint ?? '')
  if (!blueprint) return NextResponse.json({ error: 'Unknown test' }, { status: 400 })

  // resume an unfinished attempt of the same blueprint instead of stacking new ones
  const svc = serviceClient()
  const { data: open } = await svc.from('apti_mock_attempts')
    .select('id')
    .eq('user_id', user.id).eq('blueprint_slug', blueprint.slug)
    .is('submitted_at', null)
    .gte('deadline_at', new Date().toISOString())
    .maybeSingle()
  if (open) return NextResponse.json({ attemptId: open.id, resumed: true })

  const result = await buildMockAttempt(user.id, blueprint)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 })
  return NextResponse.json({ attemptId: result.attempt.id })
}

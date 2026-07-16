import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { serviceClient } from '@/lib/tracker'
import { verifyRunToken } from '@/lib/life/token'
import { replayToChapter, ReplayError, dealChapter } from '@/lib/life/engine'
import { ALL_CARDS, CHAPTERS, CONTENT_VERSION } from '@/lib/life/content/chapters'
import { sceneNarrations } from '@/lib/life/ai'
import { logLifeEvents } from '@/lib/life/log-events'
import type { ChoiceRecord, GameState } from '@/lib/life/types'

export const runtime = 'nodejs'
export const maxDuration = 30

// Response cache bucket (doc 05 §3.2): players with the same profile whose
// last two pivotal choices match get interchangeable scene prose. A hit
// serves narration instantly, spends zero AI budget, and costs nothing.
function sceneBucket(state: GameState, chapter: number): string {
  const pivots = state.history
    .filter((h) => ALL_CARDS[h.c]?.find((c) => c.id === h.cardId)?.pivotal)
    .slice(-2)
    .map((h) => `${h.cardId}:${h.optionId}`)
    .join(',')
  const p = state.profile
  return crypto
    .createHash('sha256')
    .update(`v${CONTENT_VERSION}|c${chapter}|${p.stream}.${p.city}.${p.ambition}|${pivots}`)
    .digest('hex')
}

// Narration is cosmetic: this route ALWAYS returns 200. Any failure
// (bad token, spent budget, AI error) returns empty narrations and the
// client falls back to each card's authored base text.
const EMPTY = { narrations: {} as Record<string, string> }

function isChoiceArray(v: unknown): v is ChoiceRecord[] {
  return (
    Array.isArray(v) &&
    v.length <= 40 &&
    v.every(
      (c) =>
        c &&
        typeof c.c === 'number' &&
        typeof c.cardId === 'string' &&
        typeof c.optionId === 'string',
    )
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const runId = verifyRunToken(body?.token)
    const chapter = body?.chapter
    if (
      !runId ||
      typeof chapter !== 'number' ||
      chapter < 0 ||
      chapter >= CHAPTERS.length ||
      !isChoiceArray(body?.choices)
    ) {
      return NextResponse.json(EMPTY)
    }

    const svc = serviceClient()
    const { data: run } = await svc
      .from('life_runs')
      .select('seed, profile')
      .eq('id', runId)
      .single()
    if (!run) return NextResponse.json(EMPTY)

    let cards, state
    try {
      const replay = replayToChapter(run.seed, run.profile, body.choices, chapter)
      state = replay.state
      cards = dealChapter(state)
    } catch (e) {
      if (e instanceof ReplayError) return NextResponse.json(EMPTY)
      throw e
    }

    // Cache first: a hit spends no budget and answers instantly.
    const bucket = sceneBucket(state, chapter)
    let cached: Record<string, string> = {}
    try {
      const { data: hit } = await svc
        .from('life_ai_cache')
        .select('narrations')
        .eq('bucket', bucket)
        .maybeSingle()
      if (hit?.narrations && typeof hit.narrations === 'object') cached = hit.narrations
    } catch {}
    const covered = cards.filter((c) => typeof cached[c.id] === 'string').length
    if (covered >= cards.length - 1) {
      return NextResponse.json({ narrations: cached })
    }

    // Miss: atomic budget spend (8 AI calls per run, enforced in the DB).
    const { data: allowed } = await svc.rpc('life_consume_ai_call', { run: runId })
    if (!allowed) {
      await logLifeEvents(svc, runId, [{ n: 'ai_fallback', p: { callType: 'scene', reason: 'budget' } }])
      // Whatever partial coverage the cache has still beats plain base text.
      return NextResponse.json({ narrations: cached })
    }

    const narrations = await sceneNarrations(cards, state)
    if (!narrations) {
      await logLifeEvents(svc, runId, [{ n: 'ai_fallback', p: { callType: 'scene', reason: 'error' } }])
      return NextResponse.json({ narrations: cached })
    }

    // Merge-upsert: coverage of this bucket grows toward the full pool.
    try {
      await svc.from('life_ai_cache').upsert({ bucket, narrations: { ...cached, ...narrations } })
    } catch {}
    return NextResponse.json({ narrations })
  } catch {
    return NextResponse.json(EMPTY)
  }
}

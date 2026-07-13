import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { verifyRunToken } from '@/lib/life/token'
import { replayToChapter, ReplayError, dealChapter } from '@/lib/life/engine'
import { CHAPTERS } from '@/lib/life/content/chapters'
import { sceneNarrations } from '@/lib/life/ai'
import type { ChoiceRecord } from '@/lib/life/types'

export const runtime = 'nodejs'
export const maxDuration = 30

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
    // Atomic budget spend: 8 AI calls per run, enforced in the database.
    const { data: allowed } = await svc.rpc('life_consume_ai_call', { run: runId })
    if (!allowed) return NextResponse.json(EMPTY)

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

    const narrations = await sceneNarrations(cards, state)
    return NextResponse.json({ narrations: narrations ?? {} })
  } catch {
    return NextResponse.json(EMPTY)
  }
}

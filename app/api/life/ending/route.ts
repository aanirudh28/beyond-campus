import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { verifyRunToken } from '@/lib/life/token'
import { buildLifeReport, replayRun, ReplayError, selectEnding } from '@/lib/life/engine'
import { getEnding } from '@/lib/life/content/endings'
import { fallbackEpilogue, writeEpilogue } from '@/lib/life/ai'
import { endingRarity } from '@/lib/life/rarity'

export const runtime = 'nodejs'
export const maxDuration = 60

const SITE = 'https://www.beyond-campus.in'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const runId = verifyRunToken(body?.token)
    if (!runId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!Array.isArray(body?.choices) || body.choices.length > 45) {
      return NextResponse.json({ error: 'Invalid run' }, { status: 400 })
    }

    const svc = serviceClient()
    const { data: run } = await svc
      .from('life_runs')
      .select('seed, profile, completed_at')
      .eq('id', runId)
      .single()
    if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    if (run.completed_at) return NextResponse.json({ error: 'Already completed' }, { status: 409 })

    // Never trust client-computed stats: rebuild the whole life server-side.
    let finalState
    try {
      finalState = replayRun(run.seed, run.profile, body.choices)
    } catch (e) {
      if (e instanceof ReplayError) {
        return NextResponse.json({ error: 'Invalid run' }, { status: 400 })
      }
      throw e
    }

    const endingId = selectEnding(finalState)
    const ending = getEnding(endingId)
    const report = buildLifeReport(finalState)

    // Epilogue AI call, budget-gated; authored fallback keeps this route alive.
    let prose = fallbackEpilogue(ending)
    const { data: allowed } = await svc.rpc('life_consume_ai_call', { run: runId })
    if (allowed) {
      prose = (await writeEpilogue(finalState, ending)) ?? prose
    }

    await svc
      .from('life_runs')
      .update({
        choices: body.choices,
        final_stats: finalState.stats,
        ending_id: endingId,
        epilogue: prose.epilogue,
        one_liner: prose.oneLiner,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)

    const rarity = await endingRarity(svc, endingId)

    return NextResponse.json({
      id: runId,
      ending,
      epilogue: prose.epilogue,
      oneLiner: prose.oneLiner,
      rarity,
      stats: finalState.stats,
      report,
      shareUrl: `${SITE}/20years/life/${runId}`,
    })
  } catch {
    return NextResponse.json({ error: 'Could not conclude the run' }, { status: 500 })
  }
}

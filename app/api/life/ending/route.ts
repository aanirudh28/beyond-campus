import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { verifyRunToken } from '@/lib/life/token'
import { buildLifeReport, replayRun, ReplayError, selectEnding } from '@/lib/life/engine'
import { getEnding } from '@/lib/life/content/endings'
import { CONTENT_VERSION } from '@/lib/life/content/chapters'
import { buildGhostSummaries } from '@/lib/life/ghosts'
import { composeEpilogue } from '@/lib/life/epilogue'
import { endingRarity } from '@/lib/life/rarity'
import { logLifeEvents } from '@/lib/life/log-events'

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

    // Fully authored epilogue: deterministic, instant, costs nothing.
    const prose = composeEpilogue(finalState, ending)

    // Stored-render (doc 04 §3): persist everything the public page needs,
    // so old share links never re-simulate and never degrade.
    const baseFields = {
      choices: body.choices,
      final_stats: finalState.stats,
      ending_id: endingId,
      epilogue: prose.epilogue,
      one_liner: prose.oneLiner,
      completed_at: new Date().toISOString(),
    }
    const p = run.profile
    const storedRender = {
      trail: finalState.trail,
      ghosts: buildGhostSummaries(finalState),
      challenge: `${run.seed}.${p.stream}.${p.city}.${p.ambition}`,
      content_version: CONTENT_VERSION,
    }
    const { error: updateError } = await svc
      .from('life_runs')
      .update({ ...baseFields, ...storedRender })
      .eq('id', runId)
    if (updateError) {
      // v2 columns not pasted yet: degrade to v1 fields so the run completes.
      await svc.from('life_runs').update(baseFields).eq('id', runId)
    }

    await logLifeEvents(svc, runId, [
      { n: 'ending_reached', p: { endingId, tone: ending.tone, contentVersion: CONTENT_VERSION } },
    ])

    const rarity = await endingRarity(svc, endingId, run.profile)

    // Where does this ledger sit among lives like theirs? Shown once the
    // bucket has enough completed runs to mean anything.
    let savingsPercentile: number | null = null
    try {
      const { data: peers } = await svc
        .from('life_runs')
        .select('final_stats')
        .not('completed_at', 'is', null)
        .filter('profile->>stream', 'eq', p.stream)
        .filter('profile->>city', 'eq', p.city)
        .order('completed_at', { ascending: false })
        .limit(500)
      const values = (peers ?? [])
        .map((r) => Number(r.final_stats?.savings))
        .filter((v) => Number.isFinite(v))
      if (values.length >= 20) {
        const below = values.filter((v) => v < finalState.stats.savings).length
        savingsPercentile = Math.round((below / values.length) * 100)
      }
    } catch {}

    return NextResponse.json({
      id: runId,
      ending,
      epilogue: prose.epilogue,
      oneLiner: prose.oneLiner,
      rarity,
      savingsPercentile,
      stats: finalState.stats,
      report,
      shareUrl: `${SITE}/20years/life/${runId}`,
    })
  } catch {
    return NextResponse.json({ error: 'Could not conclude the run' }, { status: 500 })
  }
}

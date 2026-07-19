import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { serviceClient } from '@/lib/tracker'
import { issueRunToken } from '@/lib/life/token'
import { logLifeEvents } from '@/lib/life/log-events'
import { deriveInheritance, type Inheritance } from '@/lib/life/legacy'
import { getEnding } from '@/lib/life/content/endings'

export const runtime = 'nodejs'

const DAILY_IP_CAP = 10

const STREAMS = ['bba', 'bcom', 'other']
const CITIES = ['metro', 'tier2', 'tier3']
const AMBITIONS = ['money', 'stability', 'impact']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const p = body?.profile
    if (
      !p ||
      !STREAMS.includes(p.stream) ||
      !CITIES.includes(p.city) ||
      !AMBITIONS.includes(p.ambition)
    ) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 400 })
    }

    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + (process.env.CRON_SECRET || ''))
      .digest('hex')

    const svc = serviceClient()
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count } = await svc
      .from('life_runs')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', dayAgo)
    if ((count || 0) >= DAILY_IP_CAP) {
      return NextResponse.json(
        { error: 'Daily limit reached. The next fifteen years can wait until tomorrow.' },
        { status: 429 },
      )
    }

    // Challenge links replay a friend's exact deck: honour a shared seed,
    // and record the lineage (doc 07 §2) so K-factor is measurable.
    const seeded = Number.isInteger(body?.seed) && body.seed >= 0 && body.seed < 2 ** 31
    const seed = seeded ? body.seed : crypto.randomInt(2 ** 31)
    const parentRunId =
      typeof body?.parentRunId === 'string' && /^[0-9a-f-]{36}$/i.test(body.parentRunId)
        ? body.parentRunId
        : null

    // Challenge runs may carry a scoreboard name. Lives inside the profile
    // jsonb (the engine reads only stream/city/ambition, so replay is safe);
    // never copied into analytics events.
    const name =
      parentRunId && typeof body?.name === 'string'
        ? body.name.replace(/[^\p{L}\p{N} .'-]/gu, '').trim().slice(0, 24)
        : ''

    // Second generation: a completed run raises this one. The parent's
    // ledger converts to the child's dealt hand, deterministically, and is
    // stored on the row so the anti-cheat replay reconstructs it exactly.
    let inheritance: Inheritance | null = null
    const legacyRunId =
      typeof body?.legacyRunId === 'string' && /^[0-9a-f-]{36}$/i.test(body.legacyRunId)
        ? body.legacyRunId
        : null
    if (legacyRunId) {
      const { data: parent } = await svc
        .from('life_runs')
        .select('ending_id, final_stats, completed_at')
        .eq('id', legacyRunId)
        .single()
      if (parent?.completed_at && parent.ending_id && parent.final_stats) {
        const parentEnding = getEnding(parent.ending_id)
        inheritance = deriveInheritance(parent.final_stats, parentEnding.tone, parent.ending_id)
      }
    }

    const row = {
      seed,
      profile: {
        stream: p.stream,
        city: p.city,
        ambition: p.ambition,
        ...(name ? { name } : {}),
      },
      ip_hash: ipHash,
    }
    const lineage = parentRunId ?? legacyRunId
    const fullRow = {
      ...row,
      ...(lineage ? { parent_run_id: lineage } : {}),
      ...(inheritance ? { inheritance } : {}),
    }
    let { data, error } = await svc.from('life_runs').insert(fullRow).select('id').single()
    if (error && (lineage || inheritance)) {
      // Lineage/inheritance columns not pasted yet: degrade to a plain run.
      inheritance = null
      ;({ data, error } = await svc.from('life_runs').insert(row).select('id').single())
    }
    if (error || !data) {
      return NextResponse.json({ error: 'Could not start the run' }, { status: 500 })
    }

    await logLifeEvents(svc, data.id, [
      // Explicit fields only: the scoreboard name never enters analytics.
      { n: 'run_started', p: { stream: p.stream, city: p.city, ambition: p.ambition, seeded, hasParent: !!parentRunId, secondGen: !!inheritance } },
      ...(parentRunId
        ? [{ n: 'challenge_accepted' as const, p: { parent_run_id: parentRunId } }]
        : []),
    ])

    return NextResponse.json({
      runId: data.id,
      seed,
      token: issueRunToken(data.id),
      ...(inheritance ? { inheritance } : {}),
    })
  } catch {
    return NextResponse.json({ error: 'Could not start the run' }, { status: 500 })
  }
}

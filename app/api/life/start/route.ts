import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { serviceClient } from '@/lib/tracker'
import { issueRunToken } from '@/lib/life/token'

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
        { error: 'Daily limit reached. The next twenty years can wait until tomorrow.' },
        { status: 429 },
      )
    }

    const seed = crypto.randomInt(2 ** 31)
    const { data, error } = await svc
      .from('life_runs')
      .insert({
        seed,
        profile: { stream: p.stream, city: p.city, ambition: p.ambition },
        ip_hash: ipHash,
      })
      .select('id')
      .single()
    if (error || !data) {
      return NextResponse.json({ error: 'Could not start the run' }, { status: 500 })
    }

    return NextResponse.json({ runId: data.id, seed, token: issueRunToken(data.id) })
  } catch {
    return NextResponse.json({ error: 'Could not start the run' }, { status: 500 })
  }
}

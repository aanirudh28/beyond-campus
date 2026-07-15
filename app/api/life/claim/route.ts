import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { logLifeEvents } from '@/lib/life/log-events'

export const runtime = 'nodejs'

// Email capture: unlocks the full Life Report and enters the nurture leads
// drip (the nurture cron reads the `leads` table, same as /api/capture-lead).
export async function POST(req: Request) {
  try {
    const { runId, email } = await req.json()
    if (
      typeof runId !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(runId) ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 200
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const clean = email.trim().toLowerCase()
    const svc = serviceClient()
    const { data: run } = await svc
      .from('life_runs')
      .update({ email: clean })
      .eq('id', runId)
      .not('completed_at', 'is', null)
      .select('id')
      .maybeSingle()
    if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    await svc.from('leads').insert({ email: clean, resource: '20years' })
    await logLifeEvents(svc, runId, [{ n: 'report_claimed' }])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Could not save' }, { status: 500 })
  }
}

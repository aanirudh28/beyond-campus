import { NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { CLIENT_EVENTS, logLifeEvents, type LifeEventName } from '@/lib/life/log-events'

export const runtime = 'nodejs'

// Analytics ingest (doc 08 §2): batched, beacon-friendly, always 200.
// Server-only event names are rejected here — trusted routes write those
// inline. Invalid anything is dropped silently.

const MAX_BATCH = 25
const MAX_PROPS = 8

// Cheap per-instance throttle (raw IPs are never stored, per doc 08 §1).
const seen = new Map<string, { count: number; reset: number }>()
function allow(ip: string): boolean {
  const now = Date.now()
  const slot = seen.get(ip)
  if (!slot || now > slot.reset) {
    seen.set(ip, { count: 1, reset: now + 60_000 })
    if (seen.size > 5000) seen.clear()
    return true
  }
  slot.count++
  return slot.count <= 120
}

function cleanProps(p: unknown): Record<string, string | number | boolean> | undefined {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return undefined
  const out: Record<string, string | number | boolean> = {}
  let n = 0
  for (const [k, v] of Object.entries(p as Record<string, unknown>)) {
    if (n >= MAX_PROPS) break
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v
    else if (typeof v === 'boolean') out[k] = v
    else if (typeof v === 'string' && v.length <= 80) out[k] = v
    else continue
    n++
  }
  return out
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
    if (!allow(ip)) return NextResponse.json({ ok: true })

    const body = await req.json()
    const runId =
      typeof body?.runId === 'string' && /^[0-9a-f-]{36}$/i.test(body.runId) ? body.runId : null
    const raw = Array.isArray(body?.events) ? body.events.slice(0, MAX_BATCH) : []
    const events = raw
      .filter((e: { n?: unknown }) => typeof e?.n === 'string' && CLIENT_EVENTS.has(e.n as string))
      .map((e: { n: string; p?: unknown }) => ({
        n: e.n as LifeEventName,
        p: cleanProps(e.p),
      }))
    if (events.length) await logLifeEvents(serviceClient(), runId, events)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

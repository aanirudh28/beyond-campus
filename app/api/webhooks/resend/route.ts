export const runtime = 'nodejs'

import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Verifies a Resend (Svix) webhook signature. Resend signs with
// base64(HMAC_SHA256(secret, `${svix-id}.${svix-timestamp}.${rawBody}`)).
// The signing secret looks like "whsec_<base64>".
function verifySvix(secret: string, id: string, ts: string, sigHeader: string, body: string): boolean {
  try {
    const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64')
    const expected = crypto.createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64')
    const expBuf = Buffer.from(expected)
    // header is space-separated "v1,<sig>" entries
    return sigHeader.split(' ').some(part => {
      const sig = part.split(',')[1]
      if (!sig) return false
      const sigBuf = Buffer.from(sig)
      return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)
    })
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = await req.text()
  const secret = process.env.RESEND_WEBHOOK_SECRET

  // Enforce the signature when a secret is configured (production). Without one,
  // reject rather than accept unauthenticated events into the table.
  if (!secret) {
    console.error('[resend webhook] RESEND_WEBHOOK_SECRET not set')
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }
  const svixId = req.headers.get('svix-id') || ''
  const svixTs = req.headers.get('svix-timestamp') || ''
  const svixSig = req.headers.get('svix-signature') || ''
  if (!verifySvix(secret, svixId, svixTs, svixSig, body)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 401 })
  }

  let evt: { type?: string; data?: Record<string, unknown> }
  try {
    evt = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const data = (evt.data || {}) as Record<string, unknown>
  const to = data.to
  const recipient = Array.isArray(to) ? String(to[0] ?? '') : (typeof to === 'string' ? to : null)

  const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  // Ignore duplicate deliveries (same svix-id) rather than double-count.
  await svc.from('email_events').upsert({
    svix_id: svixId || null,
    event_type: evt.type || 'unknown',
    email_id: (data.email_id as string) || null,
    recipient: recipient ? recipient.toLowerCase() : null,
    subject: (data.subject as string) || null,
    raw: evt,
  }, { onConflict: 'svix_id', ignoreDuplicates: true })

  return NextResponse.json({ ok: true })
}

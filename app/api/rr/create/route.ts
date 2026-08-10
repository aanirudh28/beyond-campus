export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

export async function POST(req: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()

  // Free for now (gaining users). Any logged-in user can create tracked emails.
  const { label, subject } = await req.json().catch(() => ({}))
  const trackingId = crypto.randomBytes(9).toString('base64url')

  const { error } = await svc.from('rr_messages').insert({
    user_id: user.id,
    tracking_id: trackingId,
    label: (label ? String(label).slice(0, 200) : null),
    subject: (subject ? String(subject).slice(0, 300) : null),
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trackingId })
}

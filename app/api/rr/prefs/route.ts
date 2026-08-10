export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

export async function POST(req: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const patch: Record<string, boolean> = {}
  if (typeof body.email_alerts === 'boolean') patch.email_alerts = body.email_alerts
  if (typeof body.followups === 'boolean') patch.followups = body.followups
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const svc = serviceClient()
  const { error } = await svc.from('rr_prefs').upsert({ user_id: user.id, ...patch }, { onConflict: 'user_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

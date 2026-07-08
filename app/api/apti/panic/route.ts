export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { istDateString } from '@/lib/apti-engine'
import { computePanicPlan } from '@/lib/apti-panic'

// Panic Mode plan for the caller's saved test date (apti_profiles.timeline).
// The date itself is set client-side (owner-editable profile field); this route
// only reads it and returns the triage plan.
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()
  const { data: profile } = await svc.from('apti_profiles')
    .select('timeline, target_companies').eq('user_id', user.id).maybeSingle()

  const testDate: string | null = profile?.timeline ?? null
  const targets: string[] = profile?.target_companies ?? []
  if (!testDate) return NextResponse.json({ testDate: null, targets })

  const today = istDateString()
  const daysLeft = Math.round(
    (new Date(testDate + 'T00:00:00Z').getTime() - new Date(today + 'T00:00:00Z').getTime()) / 86_400_000
  )
  if (daysLeft < 0) return NextResponse.json({ testDate, daysLeft, expired: true, targets })

  const plan = await computePanicPlan(user.id, daysLeft, targets)
  return NextResponse.json({ testDate, ...plan })
}

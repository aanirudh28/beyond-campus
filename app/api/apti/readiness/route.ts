export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, serviceClient } from '@/lib/tracker'
import { computeReadiness } from '@/lib/apti-mocks'
import { COMPANIES } from '@/lib/apti-companies'

// Readiness per target company (docs/aptitude/08): coverage of the company's
// skill weights × mock evidence, with "what moves it" levers.
export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = serviceClient()
  const { data: profile } = await svc.from('apti_profiles')
    .select('target_companies').eq('user_id', user.id).maybeSingle()
  const targets: string[] = profile?.target_companies ?? []

  const readiness = await computeReadiness(user.id, targets.length > 0 ? targets : undefined)
  return NextResponse.json({
    targets,
    readiness,
    allCompanies: COMPANIES.map((c) => ({ slug: c.slug, name: c.name, tier: c.tier })),
  })
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, syncProEntitlement, getAiUsage, FREE_AI_CAP, FREE_APP_CAP } from '@/lib/tracker'
import { serviceClient } from '@/lib/tracker'

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isPro = await syncProEntitlement(user.id, user.email!)
  const [aiUsed, { count: appsUsed }] = await Promise.all([
    getAiUsage(user.id),
    serviceClient().from('applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return NextResponse.json({
    isPro,
    appsUsed: appsUsed || 0,
    appsCap: FREE_APP_CAP,
    aiUsed,
    aiCap: FREE_AI_CAP,
  })
}

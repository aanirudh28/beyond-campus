export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, syncProEntitlement, getAiUsage, serviceClient, FREE_AI_CAP } from '@/lib/tracker'

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [isPro, aiUsed, { data: roast }] = await Promise.all([
    syncProEntitlement(user.id, user.email!),
    getAiUsage(user.id),
    serviceClient().from('roast_results').select('id').eq('email', user.email!).limit(1).maybeSingle(),
  ])

  return NextResponse.json({
    isPro,
    aiUsed,
    aiCap: FREE_AI_CAP,
    hasRoast: !!roast,
  })
}

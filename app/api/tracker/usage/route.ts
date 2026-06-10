export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getAuthedUser, syncProEntitlement, getAiUsage, FREE_AI_CAP } from '@/lib/tracker'

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isPro = await syncProEntitlement(user.id, user.email!)
  const aiUsed = await getAiUsage(user.id)

  return NextResponse.json({
    isPro,
    aiUsed,
    aiCap: FREE_AI_CAP,
  })
}

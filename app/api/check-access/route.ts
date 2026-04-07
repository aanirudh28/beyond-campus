import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ hasAccess: false, revoked: false })

  const [{ data: manualData }, { data: purchaseData }] = await Promise.all([
    supabase.from('manual_access').select('access_type').eq('email', email).single(),
    supabase.from('resource_purchases').select('email').eq('email', email).single(),
  ])

  const hasAccess = !!manualData || !!purchaseData

  return NextResponse.json({
    hasAccess,
    accessType: manualData?.access_type || (purchaseData ? 'paid' : null),
    revoked: !hasAccess,
  })
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ hasAccess: false })

  const { data } = await supabase
    .from('manual_access')
    .select('access_type')
    .eq('email', email)
    .single()

  return NextResponse.json({
    hasAccess: !!data,
    accessType: data?.access_type || null
  })
}

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { email, paymentId } = await req.json()
  await supabase.from('resource_purchases').insert({
    email,
    payment_id: paymentId,
    amount: 199,
    created_at: new Date().toISOString(),
  })
  return NextResponse.json({ success: true })
}

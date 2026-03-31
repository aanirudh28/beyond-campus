import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email, resource } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('leads').insert({ email, resource })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[capture-lead] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

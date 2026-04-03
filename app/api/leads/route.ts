import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, source } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const supabase = getSupabase()

    await supabase.from('leads').insert({
      email,
      resource: source || 'Feed Post Notification',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[leads] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

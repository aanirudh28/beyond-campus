import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // created per-request so the module can be imported without env vars (local builds)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { id } = await params
  const { data, error } = await supabase
    .from('roast_results')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Result not found' }, { status: 404 })

  const { resume_text, ...safeData } = data
  return NextResponse.json(safeData)
}

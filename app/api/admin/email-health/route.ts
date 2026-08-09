export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_PASSWORD = 'beyondcampus2024'

export async function POST(req: Request) {
  try {
    const { password } = await req.json()
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const since = new Date(Date.now() - 30 * 86400000).toISOString()
    const count = (type: string) =>
      svc.from('email_events').select('id', { count: 'exact', head: true }).eq('event_type', type).gte('created_at', since).then(r => r.count || 0)

    const [sent, delivered, bounced, complained, opened, { data: problems }] = await Promise.all([
      count('email.sent'),
      count('email.delivered'),
      count('email.bounced'),
      count('email.complained'),
      count('email.opened'),
      svc.from('email_events')
        .select('event_type, recipient, subject, created_at')
        .in('event_type', ['email.bounced', 'email.complained'])
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    // Denominator: 'sent' fires for every send; fall back to delivered+bounced.
    const base = sent || (delivered + bounced) || 0
    const pct = (n: number) => (base ? Math.round((n / base) * 1000) / 10 : 0)

    return NextResponse.json({
      windowDays: 30,
      sent,
      delivered,
      bounced,
      complained,
      opened,
      deliveredPct: pct(delivered),
      bouncePct: pct(bounced),
      complaintPct: pct(complained),
      openPct: delivered ? Math.round((opened / delivered) * 1000) / 10 : 0,
      problems: problems || [],
      configured: base > 0,
    })
  } catch (error) {
    console.error('Admin email-health error:', error)
    return NextResponse.json({ error: 'Failed to fetch email health' }, { status: 500 })
  }
}

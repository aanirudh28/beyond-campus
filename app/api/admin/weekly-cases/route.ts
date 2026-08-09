export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailShell, weeklyCaseBody, weeklyCaseSubject } from '@/lib/nurture'

const ADMIN_PASSWORD = 'beyondcampus2024'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { action } = body

    if (action === 'list') {
      const { data, error } = await svc.from('weekly_cases').select('*').order('sort_order', { ascending: true })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ cases: data || [] })
    }

    if (action === 'add') {
      const title = String(body.title || '').trim()
      const prompt = String(body.prompt || '').trim()
      const hint = String(body.hint || '').trim()
      if (!title || !prompt) return NextResponse.json({ error: 'Title and prompt are required' }, { status: 400 })
      const { data: last } = await svc.from('weekly_cases').select('sort_order').order('sort_order', { ascending: false }).limit(1)
      const nextOrder = (last?.[0]?.sort_order ?? 0) + 1
      const { error } = await svc.from('weekly_cases').insert({ sort_order: nextOrder, title, prompt, hint: hint || null, published: false })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'toggle') {
      const { error } = await svc.from('weekly_cases').update({ published: !!body.published }).eq('id', body.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { error } = await svc.from('weekly_cases').delete().eq('id', body.id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Send one case to a single address for a render check. Uses the exact same
    // template as the Wednesday drip, and does NOT touch nurture_sends, so it
    // never affects the real dedupe/schedule.
    if (action === 'test_send') {
      const email = String(body.email || '').trim().toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
      const { data: c, error } = await svc.from('weekly_cases').select('title, prompt, hint').eq('id', body.id).single()
      if (error || !c) return NextResponse.json({ error: error?.message || 'Case not found' }, { status: 404 })
      const resend = new Resend(process.env.RESEND_API_KEY!)
      const { error: sendErr } = await resend.emails.send({
        from: 'Beyond Campus <bookings@beyond-campus.in>',
        to: email,
        subject: `[TEST] ${weeklyCaseSubject(c.title)}`,
        html: emailShell(weeklyCaseBody(c), email),
      })
      if (sendErr) return NextResponse.json({ error: String(sendErr) }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('Admin weekly-cases error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

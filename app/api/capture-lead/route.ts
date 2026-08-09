export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailShell, ctaButton } from '@/lib/nurture'
import { CASEBOOKS, CASEBOOK_NAMES, casebookUrl, SITE } from '@/lib/casebooks'

// Delivers the full casebook pack the moment a lead is captured on
// /resources/consulting, then records the lead for the weekly-case drip.
function packEmail(): string {
  const links = CASEBOOKS.map(c => `
    <tr><td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
      <a href="${casebookUrl(c.slug)}" style="color: #93BBFF; font-size: 14px; font-weight: 600; text-decoration: none;">📄 ${c.name} →</a>
    </td></tr>`).join('')

  return `
    <h1 style="font-size: 22px; margin: 0 0 12px;">Your casebook pack is here 📚</h1>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Every consulting casebook and guestimate resource we have, in one place. Click any to open the PDF:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 8px 0 20px;">${links}</table>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">And every <strong style="color: white;">Wednesday</strong> we'll send you a fresh case to practice — with a framework nudge so you actually learn to crack it, not just read solutions.</p>
    <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Casebooks teach the frameworks. When you're ready to actually get placed, our 8-week Placement Cohort takes you there.</p>
    ${ctaButton(`${SITE}/cohort`, 'See the Placement Cohort →')}`
}

export async function POST(req: Request) {
  try {
    const { email, resource } = await req.json()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    const clean = String(email).trim().toLowerCase()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase.from('leads').insert({ email: clean, resource })

    // Immediate pack delivery — only for casebook captures. Never let an email
    // failure fail the capture; the lead row is what matters most.
    if (!resource || CASEBOOK_NAMES.includes(resource)) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({
          from: 'Beyond Campus <bookings@beyond-campus.in>',
          to: clean,
          subject: 'Your consulting casebook pack 📚 (all 8 + guestimates)',
          html: emailShell(packEmail(), clean),
        })
      } catch (e) {
        console.error('[capture-lead] pack email failed:', e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[capture-lead] error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { serviceClient } from '@/lib/tracker'

// Hit daily at 09:00 IST by Vercel cron (vercel.json). Vercel sends
// Authorization: Bearer ${CRON_SECRET} automatically when the env var exists.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = serviceClient()
  const today = new Date().toISOString().slice(0, 10)
  const throttleCutoff = new Date(Date.now() - 20 * 3600 * 1000).toISOString()

  const { data: due } = await svc
    .from('applications')
    .select('user_id, company, role, follow_up_date, status')
    .lte('follow_up_date', today)
    .in('status', ['applied', 'replied', 'interview'])

  if (!due || due.length === 0) return NextResponse.json({ sent: 0 })

  const userIds = [...new Set(due.map(d => d.user_id))]
  const { data: profiles } = await svc
    .from('tracker_profiles')
    .select('user_id, email, name, last_reminder_sent_at, email_reminders_enabled')
    .in('user_id', userIds)
    .eq('email_reminders_enabled', true)

  const resend = new Resend(process.env.RESEND_API_KEY!)
  let sent = 0

  for (const profile of profiles || []) {
    if (profile.last_reminder_sent_at && profile.last_reminder_sent_at > throttleCutoff) continue

    const items = due.filter(d => d.user_id === profile.user_id).slice(0, 5)
    if (items.length === 0) continue

    const overdueDays = (d: string) => Math.max(0, Math.round((new Date(today).getTime() - new Date(d).getTime()) / 86400000))
    const rows = items.map(item => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <strong style="color: white;">${item.company}</strong>
          <span style="color: rgba(255,255,255,0.5);"> — ${item.role}</span>
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); text-align: right; color: #fbbf24; font-size: 13px; white-space: nowrap;">
          ${overdueDays(item.follow_up_date) > 0 ? `${overdueDays(item.follow_up_date)}d overdue` : 'due today'}
        </td>
      </tr>`).join('')

    try {
      await resend.emails.send({
        from: 'Beyond Campus <bookings@beyond-campus.in>',
        to: profile.email,
        subject: `⏰ ${items.length} follow-up${items.length > 1 ? 's' : ''} due — don't let them forget you`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0B0F; border-radius: 16px; padding: 36px; color: white;">
            <div style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); border-radius: 100px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">BEYOND CAMPUS</div>
            <h1 style="font-size: 22px; margin: 0 0 8px;">${profile.name ? profile.name.split(' ')[0] + ', these' : 'These'} companies are waiting 👇</h1>
            <p style="color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.6; margin: 0 0 20px;">A polite follow-up 2x's your reply rate. The AI writer will draft it in 5 seconds.</p>
            <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden;">${rows}</table>
            <a href="https://beyond-campus.in/tracker" style="display: inline-block; margin-top: 22px; padding: 13px 28px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; text-decoration: none; border-radius: 100px; font-weight: bold; font-size: 14px;">Send follow-ups now →</a>
            <p style="color: rgba(255,255,255,0.25); font-size: 11.5px; margin-top: 26px;">You get these because follow-up reminders are on. Turn them off anytime in tracker settings ⚙️.</p>
          </div>`,
      })
      await svc.from('tracker_profiles').update({ last_reminder_sent_at: new Date().toISOString() }).eq('user_id', profile.user_id)
      sent++
    } catch { /* one failed email shouldn't kill the batch */ }
  }

  return NextResponse.json({ sent })
}

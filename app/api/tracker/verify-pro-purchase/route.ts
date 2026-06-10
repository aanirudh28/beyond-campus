export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { Resend } from 'resend'
import { getAuthedUser, serviceClient } from '@/lib/tracker'

export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderId, paymentId, signature } = await req.json()
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  if (expected !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const svc = serviceClient()
  await Promise.all([
    // resource_purchases keeps /api/check-access working for the bundled pack
    svc.from('resource_purchases').insert({ email: user.email, payment_id: paymentId, amount: 299 }),
    svc.from('tracker_profiles').update({ is_pro: true }).eq('user_id', user.id),
  ])

  // receipt email — non-blocking, payment already succeeded
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Beyond Campus <bookings@beyond-campus.in>',
      to: user.email!,
      subject: 'You\'re Pro now 🚀 — Tracker + Resource Pack unlocked',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0B0F; border-radius: 16px; padding: 36px; color: white;">
          <div style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); border-radius: 100px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">BEYOND CAMPUS</div>
          <h1 style="font-size: 24px; margin: 0 0 12px;">Welcome to Pro 🎉</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Your payment of <strong style="color: white;">₹299</strong> went through. Everything is unlocked:</p>
          <ul style="color: rgba(255,255,255,0.75); font-size: 14px; line-height: 2;">
            <li>♾️ Unlimited applications on the Job Tracker</li>
            <li>✨ Unlimited AI cold emails, follow-ups &amp; DMs</li>
            <li>📊 Full pipeline analytics</li>
            <li>📧 Complete resource pack — cold email templates, LinkedIn scripts, resume guide</li>
          </ul>
          <a href="https://beyond-campus.in/tracker" style="display: inline-block; margin-top: 16px; padding: 13px 28px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; text-decoration: none; border-radius: 100px; font-weight: bold; font-size: 14px;">Open your tracker →</a>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 28px;">Payment ID: ${paymentId}</p>
        </div>`,
    })
  } catch { /* receipt failure must not fail the purchase */ }

  return NextResponse.json({ success: true })
}

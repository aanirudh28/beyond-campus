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
  await svc.from('rr_access').upsert(
    { user_id: user.id, email: user.email, payment_id: paymentId, amount: 200 },
    { onConflict: 'user_id' }
  )

  // receipt — non-blocking, payment already succeeded
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    await resend.emails.send({
      from: 'Beyond Campus <bookings@beyond-campus.in>',
      to: user.email!,
      subject: 'Read Receipts unlocked 📬',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0B0B0F; border-radius: 16px; padding: 36px; color: white;">
          <div style="display: inline-block; padding: 6px 16px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); border-radius: 100px; font-size: 12px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px;">BEYOND CAMPUS</div>
          <h1 style="font-size: 24px; margin: 0 0 12px;">You're in 📬</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.7;">Your payment of <strong style="color: white;">₹200</strong> went through. Read Receipts is unlocked. Now you'll know the moment a recruiter opens your cold email, and how many times.</p>
          <a href="https://www.beyond-campus.in/read-receipts" style="display: inline-block; margin-top: 16px; padding: 13px 28px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; text-decoration: none; border-radius: 100px; font-weight: bold; font-size: 14px;">Open Read Receipts →</a>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 28px;">Payment ID: ${paymentId}</p>
        </div>`,
    })
  } catch { /* receipt failure must not fail the purchase */ }

  return NextResponse.json({ success: true })
}

import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, date, timeSlot, type, amount } = await req.json()

    if (type === 'summer') {
      await resend.emails.send({
        from: 'Beyond Campus <bookings@beyond-campus.in>',
        to: email,
        subject: "You're in! Beyond Campus Summer Internship Program 🌟",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="margin:0;padding:0;background:#0B0B0F;font-family:'Inter',sans-serif;">
            <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

              <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;padding:8px 20px;background:linear-gradient(135deg,#f59e0b,#f97316);border-radius:100px;font-size:14px;font-weight:700;color:white;letter-spacing:1px;">
                  BEYOND CAMPUS
                </div>
              </div>

              <div style="background:#111827;border:1px solid rgba(245,158,11,0.2);border-radius:24px;padding:40px;margin-bottom:24px;">
                <h1 style="font-size:28px;font-weight:800;color:white;margin:0 0 8px;letter-spacing:-0.5px;">
                  You're in! 🎉
                </h1>
                <p style="color:rgba(255,255,255,0.5);font-size:16px;margin:0 0 32px;line-height:1.6;">
                  Hey ${name}, welcome to the Beyond Campus Summer Internship Program 2025!
                </p>

                <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:16px;padding:24px;margin-bottom:24px;">
                  <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    <span style="color:rgba(255,255,255,0.5);font-size:14px;">Program</span>
                    <span style="color:white;font-size:14px;font-weight:600;">Summer Internship Program 2025</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    <span style="color:rgba(255,255,255,0.5);font-size:14px;">Duration</span>
                    <span style="color:white;font-size:14px;font-weight:600;">4 Weeks</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    <span style="color:rgba(255,255,255,0.5);font-size:14px;">Start Date</span>
                    <span style="color:white;font-size:14px;font-weight:600;">April 11, 2025</span>
                  </div>
                  <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:4px;display:flex;justify-content:space-between;">
                    <span style="color:rgba(255,255,255,0.5);font-size:14px;">Amount Paid</span>
                    <span style="color:#f59e0b;font-size:16px;font-weight:800;">₹599</span>
                  </div>
                </div>

                <div style="margin-bottom:24px;">
                  <p style="color:rgba(255,255,255,0.7);font-size:14px;font-weight:600;margin:0 0 12px;">What's coming your way:</p>
                  ${[
                    'Cold Email Templates for Internships',
                    'Internship Resume Template',
                    'LinkedIn DM Scripts',
                    'Target Company List (100+ companies)',
                    '4 Weekly Live Sessions',
                    'Private WhatsApp Community',
                    'Personalized Resume & Outreach Feedback',
                    'Lifetime Resource Access',
                  ].map(item => `
                  <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
                    <span style="color:#f59e0b;font-size:14px;flex-shrink:0;margin-top:1px;">✓</span>
                    <span style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.5;">${item}</span>
                  </div>`).join('')}
                </div>

                <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0;">
                  We'll add you to the WhatsApp group shortly and send you onboarding details before April 11. Get ready to land your first internship this summer! 🚀
                </p>
              </div>

              <div style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:24px;">
                <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 8px;">Need help?</p>
                <p style="color:white;font-size:14px;margin:0;">Reply to this email or reach us at <a href="mailto:hello@beyond-campus.in" style="color:#f59e0b;">hello@beyond-campus.in</a></p>
              </div>

              <p style="text-align:center;color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
                © 2025 Beyond Campus · beyond-campus.in
              </p>
            </div>
          </body>
          </html>
        `,
      })

      return NextResponse.json({ success: true })
    }

    const isCohor = type === 'cohort'

    await resend.emails.send({
      from: 'Beyond Campus <bookings@beyond-campus.in>',
      to: email,
      subject: isCohor
        ? '🎉 You\'re in! Beyond Campus Cohort Confirmed'
        : '✅ Mentorship Session Confirmed — Beyond Campus',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#0B0B0F;font-family:'Inter',sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 24px;">

            <div style="text-align:center;margin-bottom:32px;">
              <div style="display:inline-block;padding:8px 20px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);border-radius:100px;font-size:14px;font-weight:700;color:white;letter-spacing:1px;">
                BEYOND CAMPUS
              </div>
            </div>

            <div style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px;margin-bottom:24px;">
              <h1 style="font-size:28px;font-weight:800;color:white;margin:0 0 8px;letter-spacing:-0.5px;">
                ${isCohor ? 'Welcome to the Cohort! 🚀' : 'Session Confirmed! ✅'}
              </h1>
              <p style="color:rgba(255,255,255,0.5);font-size:16px;margin:0 0 32px;line-height:1.6;">
                Hey ${name}, your booking is confirmed. Here are your details:
              </p>

              <div style="background:rgba(79,124,255,0.08);border:1px solid rgba(79,124,255,0.2);border-radius:16px;padding:24px;margin-bottom:24px;">
                ${!isCohor ? `
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Date</span>
                  <span style="color:white;font-size:14px;font-weight:600;">${date}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Time</span>
                  <span style="color:white;font-size:14px;font-weight:600;">${timeSlot}</span>
                </div>
                ` : `
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Program</span>
                  <span style="color:white;font-size:14px;font-weight:600;">8-Week Placement Accelerator</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Start Date</span>
                  <span style="color:white;font-size:14px;font-weight:600;">April 1, 2025</span>
                </div>
                `}
                <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:4px;display:flex;justify-content:space-between;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Amount Paid</span>
                  <span style="color:#4F7CFF;font-size:16px;font-weight:800;">₹${amount}</span>
                </div>
              </div>

              <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0;">
                ${isCohor
                  ? 'We\'ll send you the WhatsApp group link and onboarding details before April 1. Get ready to land your dream job! 💪'
                  : 'Your mentor will reach out to you on your email before the session. Please keep an eye on your inbox!'}
              </p>
            </div>

            <div style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:24px;">
              <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0 0 8px;">Need help?</p>
              <p style="color:white;font-size:14px;margin:0;">Reply to this email or reach us at <a href="mailto:hello@beyond-campus.in" style="color:#4F7CFF;">hello@beyond-campus.in</a></p>
            </div>

            <p style="text-align:center;color:rgba(255,255,255,0.2);font-size:12px;margin:0;">
              © 2025 Beyond Campus · beyond-campus.in
            </p>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
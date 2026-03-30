import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, type } = await req.json()

    console.log('[create-account] called for:', email, '| type:', type)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[create-account] SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const tempPassword = email.split('@')[0]

    // Check if profile already exists — don't recreate
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existing) return NextResponse.json({ success: true, existing: true })

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Create profile row
    await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      name,
      email,
      stage: 1,
      cold_emails_sent: 0,
      interview_calls: 0,
      is_placed: false,
    })

    // Send dashboard welcome email
    await resend.emails.send({
      from: 'Beyond Campus <bookings@beyond-campus.in>',
      to: email,
      subject: 'Your Beyond Campus dashboard is ready 🎉',
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
              <h1 style="font-size:26px;font-weight:800;color:white;margin:0 0 8px;">Your dashboard is ready 🚀</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:15px;margin:0 0 28px;line-height:1.6;">
                Hey ${name}, your Beyond Campus student account has been created. Track your progress, complete weekly check-ins, and access all your resources.
              </p>

              <div style="background:rgba(79,124,255,0.08);border:1px solid rgba(79,124,255,0.2);border-radius:16px;padding:24px;margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Login URL</span>
                  <span style="color:#4F7CFF;font-size:14px;font-weight:600;">beyond-campus.in/login</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Email</span>
                  <span style="color:white;font-size:14px;font-weight:600;">${email}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:rgba(255,255,255,0.5);font-size:14px;">Temp Password</span>
                  <span style="color:white;font-size:14px;font-weight:700;font-family:monospace;letter-spacing:1px;">${tempPassword}</span>
                </div>
              </div>

              <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;line-height:1.6;">
                Please change your password after logging in. Need help? Reply to this email or reach us at <a href="mailto:hello@beyond-campus.in" style="color:#4F7CFF;">hello@beyond-campus.in</a>
              </p>
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
    console.error('Create account error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

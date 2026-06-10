export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { serviceClient } from '@/lib/tracker'
import { unsubToken } from '@/lib/nurture'

const page = (title: string, message: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#0B0B0F;color:white;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px;">
  <div>
    <div style="display:inline-block;padding:6px 16px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);border-radius:100px;font-size:12px;font-weight:bold;letter-spacing:1px;margin-bottom:20px;">BEYOND CAMPUS</div>
    <h1 style="font-size:22px;margin:0 0 10px;">${title}</h1>
    <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;max-width:380px;">${message}</p>
  </div>
</body></html>`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token || token !== unsubToken(email)) {
    return new NextResponse(page('Invalid link', 'This unsubscribe link is invalid or expired. Reply to any of our emails and we\'ll remove you manually.'), {
      status: 400, headers: { 'Content-Type': 'text/html' },
    })
  }

  await serviceClient().from('nurture_optouts').upsert({ email: email.toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true })

  return new NextResponse(page('You\'re unsubscribed ✓', 'No more tips or updates from us. You\'ll still get transactional emails like payment receipts, and follow-up reminders can be turned off in your tracker settings.'), {
    headers: { 'Content-Type': 'text/html' },
  })
}

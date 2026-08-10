export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailShell, rrOpenAlertSubject, rrOpenAlertBody } from '@/lib/nurture'

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

function gif() {
  return new Response(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}

// A mail-client label, and whether it's a proxy (Gmail/Yahoo fetch server-side,
// so their IP/UA is a datacenter, not the reader's real device/location).
function clientLabel(ua: string): { client: string; proxy: boolean } {
  const u = ua.toLowerCase()
  if (u.includes('googleimageproxy')) return { client: 'Gmail', proxy: true }
  if (u.includes('yahoomailproxy') || u.includes('ymailproxy')) return { client: 'Yahoo Mail', proxy: true }
  if (u.includes('iphone')) return { client: 'iPhone', proxy: false }
  if (u.includes('ipad')) return { client: 'iPad', proxy: false }
  if (u.includes('android')) return { client: 'Android', proxy: false }
  if (u.includes('outlook') || u.includes('microsoft office')) return { client: 'Outlook', proxy: false }
  if (u.includes('macintosh') || u.includes('mac os')) return { client: 'Mac', proxy: false }
  if (u.includes('windows')) return { client: 'Windows', proxy: false }
  if (u.includes('bot') || u.includes('proxy') || u.includes('preview')) return { client: 'Scanner', proxy: true }
  return { client: 'Unknown', proxy: false }
}

async function cityFromIp(ip: string): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 1500)
    const r = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal, headers: { 'User-Agent': 'beyond-campus-rr' } })
    clearTimeout(t)
    if (!r.ok) return null
    const d = await r.json()
    const parts = [d.city, d.country_name].filter(Boolean)
    return parts.length ? parts.join(', ') : null
  } catch { return null }
}

export async function GET(req: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params
  try {
    const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: msg } = await svc
      .from('rr_messages')
      .select('created_at, first_alert_at, owner_email, label, user_id')
      .eq('tracking_id', trackingId)
      .maybeSingle()

    // Ignore the sender's own render in the first 15s after creating the email.
    if (msg && Date.now() - new Date(msg.created_at).getTime() > 15000) {
      const ua = req.headers.get('user-agent') || ''
      const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || ''
      const { client, proxy } = clientLabel(ua)
      const city = (!proxy && ip) ? await cityFromIp(ip) : null

      await svc.from('rr_opens').insert({ tracking_id: trackingId, user_agent: ua, ip: ip || null, client, city })

      // First-open alert (once per message, if the owner has alerts on).
      if (!msg.first_alert_at && msg.owner_email) {
        await svc.from('rr_messages').update({ first_alert_at: new Date().toISOString() }).eq('tracking_id', trackingId)
        try {
          const { data: pref } = await svc.from('rr_prefs').select('email_alerts').eq('user_id', msg.user_id).maybeSingle()
          if (!pref || pref.email_alerts !== false) {
            const resend = new Resend(process.env.RESEND_API_KEY!)
            await resend.emails.send({
              from: 'Beyond Campus <bookings@beyond-campus.in>',
              to: msg.owner_email,
              subject: rrOpenAlertSubject(msg.label),
              html: emailShell(rrOpenAlertBody(msg.label), msg.owner_email),
            })
          }
        } catch { /* alert failure must never break the pixel */ }
      }
    }
  } catch {
    // never let logging break the pixel — the recipient must see nothing
  }
  return gif()
}

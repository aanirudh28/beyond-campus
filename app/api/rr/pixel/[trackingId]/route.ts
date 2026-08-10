export const runtime = 'nodejs'

import { createClient } from '@supabase/supabase-js'

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

// A mail-client label. `proxy` = Gmail/Yahoo fetch server-side (their IP/UA is a
// datacenter, not the reader's device). `bot` = link-preview crawlers and security
// scanners that auto-fetch the pixel: never a human read, so we do not count them.
function clientLabel(ua: string): { client: string; proxy: boolean; bot: boolean } {
  const u = ua.toLowerCase()
  // Legit mail-render proxies — these represent a real reader, keep them.
  if (u.includes('googleimageproxy')) return { client: 'Gmail', proxy: true, bot: false }
  if (u.includes('yahoomailproxy') || u.includes('ymailproxy')) return { client: 'Yahoo Mail', proxy: true, bot: false }
  // Link-preview crawlers + security scanners — auto-fetch, never a human, skip.
  const scanners = ['slackbot', 'slack-imgproxy', 'facebookexternalhit', 'whatsapp', 'twitterbot', 'linkedinbot', 'telegrambot', 'discordbot', 'bingpreview', 'skypeuripreview', 'proofpoint', 'barracuda', 'mimecast', 'symantec', 'ironport', 'bot', 'crawler', 'spider', 'preview', 'scanner']
  if (scanners.some(s => u.includes(s))) return { client: 'Scanner', proxy: true, bot: true }
  if (u.includes('iphone')) return { client: 'iPhone', proxy: false, bot: false }
  if (u.includes('ipad')) return { client: 'iPad', proxy: false, bot: false }
  if (u.includes('android')) return { client: 'Android', proxy: false, bot: false }
  if (u.includes('outlook') || u.includes('microsoft office')) return { client: 'Outlook', proxy: false, bot: false }
  if (u.includes('macintosh') || u.includes('mac os')) return { client: 'Mac', proxy: false, bot: false }
  if (u.includes('windows')) return { client: 'Windows', proxy: false, bot: false }
  return { client: 'Unknown', proxy: false, bot: false }
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
      .select('created_at, creator_ip')
      .eq('tracking_id', trackingId)
      .maybeSingle()

    const ua = req.headers.get('user-agent') || ''
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || ''

    // Skip self-opens: (a) loads in the first 2 minutes after creating, which are
    // the sender pasting/sending and Gmail auto-loading the pixel at send time
    // (this is the main false-open source, and it works even through Gmail's
    // proxy since it is time-based, not IP-based), and (b) any load from the
    // sender's own IP (non-proxied clients viewing their Sent copy).
    const isFresh = !msg || Date.now() - new Date(msg.created_at).getTime() <= 120000
    const isSelfIp = !!(ip && msg?.creator_ip && ip === msg.creator_ip)

    const { client, proxy, bot } = clientLabel(ua)

    if (msg && !isFresh && !isSelfIp && !bot) {
      // De-dupe: a single human open often triggers several pixel fetches within
      // seconds (client render + retries). Collapse loads within 90s into one
      // open, so the count reflects distinct viewing sessions, not raw fetches.
      const { data: recent } = await svc
        .from('rr_opens')
        .select('opened_at')
        .eq('tracking_id', trackingId)
        .order('opened_at', { ascending: false })
        .limit(1)
      const isDupe = !!recent?.[0] && Date.now() - new Date(recent[0].opened_at).getTime() < 90000

      if (!isDupe) {
        const city = (!proxy && ip) ? await cityFromIp(ip) : null
        await svc.from('rr_opens').insert({ tracking_id: trackingId, user_agent: ua, ip: ip || null, client, city })
        // Instant email-on-open alert intentionally omitted for now (Resend free-tier
        // limits at scale, low utility). The dashboard + in-app toast cover it.
      }
    }
  } catch {
    // never let logging break the pixel — the recipient must see nothing
  }
  return gif()
}

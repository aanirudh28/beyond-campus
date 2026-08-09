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
      // never cache, so every open re-fetches and counts
      'Cache-Control': 'no-store, no-cache, must-revalidate, private, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}

export async function GET(req: Request, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params
  try {
    const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Only log for a real message, and ignore the sender's own render in the
    // first 15s after creating it (composing / copying triggers a local load).
    const { data: msg } = await svc.from('rr_messages').select('created_at').eq('tracking_id', trackingId).maybeSingle()
    if (msg) {
      const freshMs = Date.now() - new Date(msg.created_at).getTime()
      if (freshMs > 15000) {
        await svc.from('rr_opens').insert({
          tracking_id: trackingId,
          user_agent: req.headers.get('user-agent') || null,
        })
      }
    }
  } catch {
    // never let a logging failure break the pixel — the recipient must see nothing
  }
  return gif()
}

import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import { getEnding } from '@/lib/life/content/endings'

export const alt = '20 Years in 60 Minutes — a career life-simulator by Beyond Campus'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Landscape share card for a completed run. Any failure falls back to the
// generic prompt card so a broken row never breaks link previews.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  let endingName = 'Which ending will you get?'
  let emoji = '⏳'
  let rarityLine = '35 CHOICES · 32 ENDINGS · 20 YEARS'

  try {
    const { id } = await params
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      const svc = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )
      const { data: run } = await svc
        .from('life_runs')
        .select('ending_id, completed_at')
        .eq('id', id)
        .single()
      if (run?.completed_at && run.ending_id) {
        const ending = getEnding(run.ending_id)
        endingName = ending.name
        emoji = ending.emoji
        rarityLine = 'SOMEONE LIVED 20 YEARS AND GOT THIS ENDING'
      }
    }
  } catch {
    // fall through to the generic card
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0B0F',
          position: 'relative',
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: 300,
            width: 600,
            height: 520,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(79,124,255,0.4) 0%, rgba(123,97,255,0.2) 45%, rgba(11,11,15,0) 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            letterSpacing: 8,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 40,
          }}
        >
          20 YEARS IN 60 MINUTES
        </div>
        <div style={{ display: 'flex', fontSize: 96, marginBottom: 24 }}>{emoji}</div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: -2,
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          {endingName}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 4,
            color: '#93BBFF',
            border: '2px solid rgba(79,124,255,0.5)',
            borderRadius: 9999,
            padding: '12px 32px',
            marginBottom: 44,
          }}
        >
          {rarityLine}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
            padding: '14px 34px',
            borderRadius: 9999,
          }}
        >
          Play your 20 years free → beyond-campus.in/20years
        </div>
      </div>
    ),
    size,
  )
}

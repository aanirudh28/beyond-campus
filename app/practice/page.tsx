'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLORS, Card, PrimaryBtn, Mono, DOMAIN_LABELS } from '@/app/components/apti/ui'
import type { SetSummary } from '@/app/components/apti/SetPlayer'

interface TodayData {
  set: {
    id: string
    date: string
    cursor: number
    total: number
    completedAt: string | null
    summary: SetSummary | null
    reviewCount: number
  }
  profile: {
    streak: number
    longestStreak: number
    lastSetDate: string | null
    ratings: Record<string, number>
  }
}

export default function PracticePage() {
  const [data, setData] = useState<TodayData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/apti/daily-set')
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d) => { if (d && !cancelled) setData(d) })
      .catch(() => { if (!cancelled) setError('Could not load today’s set. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
  })

  if (error) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted }}>{error}</p>
      </main>
    )
  }

  if (!data) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted2, fontSize: 14 }}>Building today&rsquo;s set…</p>
      </main>
    )
  }

  const { set, profile } = data
  const done = !!set.completedAt
  const started = set.cursor > 0 && !done
  const remaining = set.total - set.cursor

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <span style={{ color: COLORS.muted, fontSize: 14 }}>{today}</span>
        <Mono style={{ fontSize: 14, color: profile.streak > 0 ? '#fff' : COLORS.muted2 }}>
          🔥 {profile.streak} day{profile.streak === 1 ? '' : 's'}
        </Mono>
      </div>

      {/* the set card */}
      <Card style={{ padding: 28, marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 6px' }}>
          {done ? 'Done for today.' : started ? 'Pick up where you left off' : 'Today’s Set'}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14, margin: '0 0 20px' }}>
          {done
            ? `${set.summary?.correct ?? '—'}/${set.total} correct. Tomorrow’s set is already brewing.`
            : started
              ? `${remaining} question${remaining === 1 ? '' : 's'} left · ~${Math.ceil(remaining * 1.2)} min`
              : `${set.total} questions · ~${Math.ceil(set.total * 1.2)} min${set.reviewCount > 0 ? ` · ${set.reviewCount} redemption` : ''}`}
        </p>
        {!done && (
          <PrimaryBtn onClick={() => router.push(`/practice/set/${set.id}`)}>
            {started ? `Resume — ${remaining} left` : `▶ Start today’s ${set.total}`}
          </PrimaryBtn>
        )}
        {done && set.summary && (
          <div>
            {Object.entries(set.summary.ratingDeltas ?? {}).map(([domain, delta]) => (
              <div key={domain} style={{
                display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                borderTop: `1px solid ${COLORS.hair}`, fontSize: 14,
              }}>
                <span style={{ color: COLORS.muted }}>{DOMAIN_LABELS[domain] ?? domain}</span>
                <Mono style={{ color: (delta as number) >= 0 ? COLORS.correct : COLORS.wrong }}>
                  {(delta as number) >= 0 ? `▲ +${delta}` : `▼ ${delta}`}
                </Mono>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ratings strip */}
      {Object.keys(profile.ratings).length > 0 && (
        <Card style={{ padding: 18 }}>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: COLORS.muted2, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
            Apti Rating
          </p>
          {Object.entries(profile.ratings).map(([domain, rating]) => (
            <div key={domain} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 15 }}>
              <span style={{ color: COLORS.muted }}>{DOMAIN_LABELS[domain] ?? domain}</span>
              <Mono style={{ fontWeight: 600 }}>{rating as number}</Mono>
            </div>
          ))}
          <p style={{ margin: '10px 0 0', fontSize: 12, color: COLORS.muted2 }}>
            Provisional until 50 attempts — it settles as you practice.
          </p>
        </Card>
      )}
    </main>
  )
}

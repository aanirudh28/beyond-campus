'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SetPlayer, { type ClientQuestion, type SetSummary } from '@/app/components/apti/SetPlayer'
import { COLORS } from '@/app/components/apti/ui'

interface TodayResponse {
  set: {
    id: string
    cursor: number
    total: number
    completedAt: string | null
    summary: SetSummary | null
  }
  questions: ClientQuestion[]
}

export default function SetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<TodayResponse | null>(null)
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
      .then((d: TodayResponse | null) => {
        if (!d || cancelled) return
        // only today's set is playable — anything else bounces home
        if (d.set.id !== id) { router.replace('/practice'); return }
        setData(d)
      })
      .catch(() => { if (!cancelled) setError('Could not load the set. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

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
        <p style={{ color: COLORS.muted2, fontSize: 14 }}>Loading…</p>
      </main>
    )
  }

  return (
    <main>
      <SetPlayer
        setId={data.set.id}
        questions={data.questions}
        startCursor={data.set.cursor}
        initialSummary={data.set.completedAt ? data.set.summary : null}
      />
    </main>
  )
}

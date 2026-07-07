'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MockPlayer from '@/app/components/apti/MockPlayer'
import { COLORS } from '@/app/components/apti/ui'
import type { ClientQuestion } from '@/app/components/apti/SetPlayer'

interface AttemptResponse {
  id: string
  name: string
  deadlineAt: string
  submittedAt: string | null
  sections?: { name: string; seconds: number; questions: ClientQuestion[] }[]
}

export default function MockPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<AttemptResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch(`/api/apti/mock/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/mocks'); return null }
        if (r.status === 404) { router.replace('/practice/mocks'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d: AttemptResponse | null) => {
        if (!d || cancelled) return
        if (d.submittedAt) { router.replace(`/practice/mocks/${id}/report`); return }
        if (new Date(d.deadlineAt).getTime() < Date.now()) {
          // out of time before it even loaded — grade what exists
          fetch('/api/apti/mock/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attemptId: id, answers: {}, perQSeconds: {} }),
          }).finally(() => router.replace(`/practice/mocks/${id}/report`))
          return
        }
        setData(d)
      })
      .catch(() => { if (!cancelled) setError('Could not load the test. Refresh to retry.') })
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
  if (!data?.sections) {
    return (
      <main style={{ maxWidth: 480, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <p style={{ color: COLORS.muted2, fontSize: 14 }}>Setting up your paper…</p>
      </main>
    )
  }

  return (
    <main>
      <MockPlayer
        attemptId={data.id}
        name={data.name}
        deadlineAt={data.deadlineAt}
        sections={data.sections}
      />
    </main>
  )
}

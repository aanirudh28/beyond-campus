'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { COLORS, Card, Chip, Mono, PrimaryBtn, AptiStyles } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

// Every session ever sat, one ledger — tap any of them to reopen every
// question with your answer and the full solution.

interface HistorySession {
  id: string
  scope: 'set' | 'mock'
  kind: string
  name: string | null
  date: string
  total: number
  attempted: number
  correct: number
  completed: boolean
}

const KIND_META: Record<string, { glyph: string; label: string }> = {
  daily: { glyph: '🔥', label: 'Daily Set' },
  topic: { glyph: '◆', label: 'Skill Drill' },
  review: { glyph: '↺', label: 'Redemption Run' },
  comeback: { glyph: '🌤', label: 'Comeback Set' },
  mock: { glyph: '⏱', label: 'Mock' },
}

function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  })
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/apti/history')
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/history'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d: { sessions: HistorySession[] } | null) => { if (d && !cancelled) setSessions(d.sessions) })
      .catch(() => { if (!cancelled) setError('Could not load your history. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = useMemo(() => {
    const map = new Map<string, HistorySession[]>()
    for (const s of sessions ?? []) {
      const key = dayLabel(s.date)
      const list = map.get(key) ?? []
      list.push(s)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [sessions])

  const totals = useMemo(() => {
    const list = sessions ?? []
    const questions = list.reduce((n, s) => n + s.attempted, 0)
    const correct = list.reduce((n, s) => n + s.correct, 0)
    return {
      sessions: list.length,
      questions,
      accuracy: questions > 0 ? Math.round((correct / questions) * 100) : 0,
    }
  }, [sessions])

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 24 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>History</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
          Your work, <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>on the record.</em>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
          Reopen any session — every question, your answer, and the solution live here for good.
        </p>
      </header>

      {error && <p style={{ color: COLORS.muted, textAlign: 'center', padding: '40px 0' }}>{error}</p>}

      {!sessions && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 36, height: 36, margin: '0 auto 18px', borderRadius: '50%',
            border: '3px solid rgba(79,124,255,0.2)', borderTopColor: COLORS.blue,
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: COLORS.muted2, fontSize: 14 }}>Opening the ledger…</p>
        </div>
      )}

      {sessions && sessions.length === 0 && (
        <Card className="apti-in" style={{ textAlign: 'center', padding: '44px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📓</div>
          <p style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 6 }}>Nothing on the record yet.</p>
          <p style={{ color: COLORS.muted, fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
            Your history writes itself the moment you answer your first question.
          </p>
          <PrimaryBtn onClick={() => router.push('/practice')}>Start today&rsquo;s set →</PrimaryBtn>
        </Card>
      )}

      {sessions && sessions.length > 0 && (
        <>
          {/* the ledger line */}
          <Card className="apti-in" style={{ padding: '18px 22px', marginBottom: 26 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {[
                { v: totals.sessions, l: totals.sessions === 1 ? 'session' : 'sessions' },
                { v: totals.questions, l: 'questions faced' },
                { v: `${totals.accuracy}%`, l: 'lifetime accuracy' },
              ].map((s) => (
                <div key={s.l}>
                  <Mono style={{ fontSize: 24, fontWeight: 600, display: 'block', lineHeight: 1.15 }}>{s.v}</Mono>
                  <span style={{ fontSize: 11.5, color: COLORS.muted2 }}>{s.l}</span>
                </div>
              ))}
            </div>
          </Card>

          {groups.map(([day, list], gi) => (
            <section key={day} className="apti-in" style={{ marginBottom: 22, animationDelay: `${Math.min(gi * 0.05, 0.3)}s` }}>
              <p className="mono-label" style={{ marginBottom: 10 }}>{day}</p>
              {list.map((s) => {
                const meta = KIND_META[s.kind] ?? KIND_META.daily
                const title = s.scope === 'mock' ? s.name ?? 'Mock' : meta.label
                const acc = s.attempted > 0 ? s.correct / s.attempted : 0
                return (
                  <Link
                    key={s.id}
                    href={`/practice/review/${s.id}${s.scope === 'mock' ? '?type=mock' : ''}`}
                    className="apti-option"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', marginBottom: 8, borderRadius: 14,
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
                    }}
                  >
                    <span aria-hidden style={{
                      width: 40, height: 40, minWidth: 40, borderRadius: 12, fontSize: 18,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      background: s.scope === 'mock' ? 'rgba(123,97,255,0.12)' : 'rgba(79,124,255,0.10)',
                      border: `1px solid ${COLORS.hair}`,
                    }}>
                      {meta.glyph}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600 }}>
                        {title}
                        {!s.completed && <Chip color={COLORS.stretch} bg={COLORS.stretchBg}>In progress</Chip>}
                      </span>
                      <span style={{ display: 'block', fontSize: 12, color: COLORS.muted2, marginTop: 3 }}>
                        {s.attempted}{s.scope === 'set' && s.attempted < s.total ? ` of ${s.total}` : ''} question{s.attempted === 1 ? '' : 's'}
                        {' · '}review every answer
                      </span>
                    </span>
                    <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Mono style={{
                        fontSize: 15, fontWeight: 700,
                        color: acc >= 0.7 ? COLORS.correct : acc >= 0.4 ? COLORS.stretch : COLORS.wrong,
                      }}>
                        {s.correct}<span style={{ color: COLORS.muted2, fontWeight: 500 }}>/{s.attempted}</span>
                      </Mono>
                      <span style={{ display: 'block', fontSize: 11, color: COLORS.muted2, marginTop: 2 }}>open →</span>
                    </span>
                  </Link>
                )
              })}
            </section>
          ))}
        </>
      )}

      <AptiNav active="none" />
    </main>
  )
}

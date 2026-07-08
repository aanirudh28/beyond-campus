'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { COLORS, Card, Mono, AccuracyRing, AptiStyles } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'
import { trackAptiEvent } from '@/app/components/apti/track'

const MOCK_CTA_DISMISSED = 'apti_mock_cta_dismissed'

interface Report {
  score: number
  maxScore: number
  sections: { name: string; correct: number; total: number }[]
  timeSinks: { stem: string; seconds: number; correct: boolean }[]
  weakSkills: { id: string; name: string; correct: number; total: number }[]
  redemptionsQueued: number
  overtime: boolean
}

// The post-mock report (docs/aptitude/07): never just a score — where the
// minutes went, what to fix, one tap to start fixing it.
export default function MockReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [name, setName] = useState('')
  const [report, setReport] = useState<Report | null>(null)
  const [kind, setKind] = useState('')
  const [ctaDismissed, setCtaDismissed] = useState(true) // resolved from localStorage after mount
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch(`/api/apti/mock/${id}`)
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/mocks'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d) => {
        if (!d || cancelled) return
        if (!d.submittedAt) { router.replace(`/practice/mocks/${id}`); return }
        setName(d.name)
        setReport(d.report)
        setKind(d.kind ?? '')
        // doc 10 surface 1: rung-2+ mocks only, dismiss sticks, shown-once tracked
        if (d.kind && d.kind !== 'checkpoint' && !localStorage.getItem(MOCK_CTA_DISMISSED)) {
          setCtaDismissed(false)
          if (!sessionStorage.getItem(`apti_pw_${id}`)) {
            sessionStorage.setItem(`apti_pw_${id}`, '1')
            trackAptiEvent('paywall_viewed', { surface: 'postmock', mockId: id })
          }
        }
      })
      .catch(() => { if (!cancelled) setError('Could not load the report.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const drill = async (skillId: string) => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/apti/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topic', skillId }),
      })
      const d = await res.json()
      if (res.ok) router.push(`/practice/set/${d.setId}`)
      else setError(d.error)
    } finally {
      setBusy(false)
    }
  }

  if (error) return <main style={{ padding: '64px 20px', textAlign: 'center' }}><p style={{ color: COLORS.muted }}>{error}</p></main>
  if (!report) return <main style={{ padding: '64px 20px', textAlign: 'center' }}><p style={{ color: COLORS.muted2 }}>Loading report…</p></main>

  const pct = report.maxScore > 0 ? report.score / report.maxScore : 0

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '36px 20px 120px' }}>
      <AptiStyles />

      <div className="apti-pop" style={{ textAlign: 'center', marginBottom: 26 }}>
        <p className="mono-label" style={{ marginBottom: 16 }}>{name} · Result</p>
        <AccuracyRing correct={report.score} total={report.maxScore} />
        <p style={{ color: COLORS.muted, fontSize: 14.5, marginTop: 16, lineHeight: 1.6 }}>
          {pct >= 0.8 ? 'Strong. You walked a real test and owned the clock.'
            : pct >= 0.6 ? 'Solid base — the fix plan below is worth exactly 20 minutes.'
            : 'This is data, not judgment. Most people never even sit a mock — you just did.'}
          {report.overtime && ' (Submitted past the deadline — pace is part of the plan below.)'}
        </p>
      </div>

      {/* sections */}
      {report.sections.length > 1 && (
        <Card className="apti-in" style={{ marginBottom: 14 }}>
          <p className="mono-label" style={{ marginBottom: 10 }}>Sections</p>
          {report.sections.map((s) => (
            <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: COLORS.muted }}>{s.name}</span>
              <Mono style={{ fontWeight: 600 }}>{s.correct}/{s.total}</Mono>
            </div>
          ))}
        </Card>
      )}

      {/* where the minutes went */}
      {report.timeSinks.length > 0 && (
        <Card className="apti-in" style={{ marginBottom: 14, animationDelay: '0.08s' }}>
          <p className="mono-label" style={{ marginBottom: 4 }}>Where your minutes went</p>
          <p style={{ fontSize: 12.5, color: COLORS.muted2, marginBottom: 12 }}>
            These three ate {report.timeSinks.reduce((a, t) => a + Math.round(t.seconds), 0)}s between them.
          </p>
          {report.timeSinks.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', fontSize: 13.5, alignItems: 'baseline' }}>
              <Mono style={{ color: t.correct ? COLORS.stretch : COLORS.wrong, minWidth: 44 }}>
                {Math.round(t.seconds)}s
              </Mono>
              <span style={{ color: COLORS.muted, lineHeight: 1.5 }}>
                {t.stem}… <span style={{ color: t.correct ? COLORS.correct : COLORS.wrong }}>{t.correct ? 'got it' : 'missed it'}</span>
              </span>
            </div>
          ))}
          <p style={{ fontSize: 12.5, color: COLORS.blueSoft, marginTop: 10, lineHeight: 1.55 }}>
            The 90-second rule exists because of questions like these — marked and skipped, they cost nothing.
          </p>
        </Card>
      )}

      {/* the 20-minute fix plan */}
      <Card className="apti-in" style={{ marginBottom: 14, animationDelay: '0.16s', border: '1px solid rgba(79,124,255,0.35)' }}>
        <p className="mono-label" style={{ color: COLORS.blueSoft, marginBottom: 12 }}>Your 20-minute fix plan</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {report.weakSkills.map((s) => (
            <button key={s.id} onClick={() => drill(s.id)} disabled={busy} className="apti-option" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
              padding: '14px 16px', borderRadius: 12, fontFamily: 'inherit', fontSize: 14.5,
              background: 'rgba(79,124,255,0.07)', border: '1px solid rgba(79,124,255,0.3)',
              color: '#fff', cursor: 'pointer',
            }}>
              <span>
                <strong>◎ Drill {s.name}</strong>
                <span style={{ display: 'block', fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                  {s.correct}/{s.total} in this test — 8 questions, ~8 min
                </span>
              </span>
              <span style={{ color: COLORS.blueSoft }}>→</span>
            </button>
          ))}
          {report.redemptionsQueued > 0 && (
            <div style={{
              padding: '14px 16px', borderRadius: 12, fontSize: 14,
              background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)',
            }}>
              ↺ <strong>{report.redemptionsQueued} miss{report.redemptionsQueued === 1 ? '' : 'es'}</strong> joined
              your redemption queue — they return in tomorrow&rsquo;s set.
            </div>
          )}
          {report.weakSkills.length === 0 && report.redemptionsQueued === 0 && (
            <p style={{ fontSize: 14, color: COLORS.muted }}>
              Nothing broke. Raise the rung — take a section test next.
            </p>
          )}
        </div>
      </Card>

      <div className="apti-in" style={{ animationDelay: '0.24s' }}>
        <Link href={`/practice/review/${id}?type=mock`} style={{
          display: 'block', textAlign: 'center', padding: '14px', borderRadius: 100,
          background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.35)',
          fontSize: 14.5, fontWeight: 600, marginBottom: 10,
        }}>
          Review every question →
        </Link>
        <Link href="/practice/companies" style={{
          display: 'block', textAlign: 'center', padding: '14px', borderRadius: 100,
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.hair}`,
          fontSize: 14.5, fontWeight: 600, marginBottom: 10,
        }}>
          See what this did to your company readiness →
        </Link>
        <Link href="/practice/mocks" style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: 13.5, color: COLORS.muted2 }}>
          Back to mocks
        </Link>
        {/* doc 10 surface 1: contextual, dismissible, rung-2+ only — no popups */}
        {kind && kind !== 'checkpoint' && !ctaDismissed ? (
          <div style={{
            position: 'relative', marginTop: 18, padding: '16px 40px 16px 18px', borderRadius: 14,
            background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.25)',
          }}>
            <button
              aria-label="Dismiss"
              onClick={() => { localStorage.setItem(MOCK_CTA_DISMISSED, '1'); setCtaDismissed(true) }}
              style={{
                position: 'absolute', top: 10, right: 12, background: 'none', border: 'none',
                color: COLORS.muted2, cursor: 'pointer', fontSize: 15, padding: 2,
              }}
            >✕</button>
            <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
              Want a human to walk this report with you? The <strong style={{ color: '#fff' }}>₹549 strategy call</strong> is
              credited toward any cohort within 30 days.{' '}
              <Link
                href="/book?utm_source=apti&utm_content=postmock"
                onClick={() => trackAptiEvent('cohort_cta_clicked', { surface: 'postmock', mockId: id })}
                style={{ color: COLORS.blueSoft, fontWeight: 600 }}
              >
                Book the call →
              </Link>
            </p>
          </div>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 12, color: COLORS.muted2, marginTop: 18, lineHeight: 1.6 }}>
            Apti clears the test. Humans clear the interview.{' '}
            <Link href="/program" style={{ color: COLORS.blueSoft }}>Mentorship</Link>
          </p>
        )}
      </div>

      <AptiNav active="mocks" />
    </main>
  )
}

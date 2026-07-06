'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GRAD, COLORS, Mono, Card, PrimaryBtn, MiniMd, CountUpNumber, AptiStyles, DOMAIN_LABELS,
} from '@/app/components/apti/ui'
import type { ClientQuestion } from '@/app/components/apti/SetPlayer'

type Step = 'welcome' | 'degree' | 'timeline' | 'lane' | 'quiz' | 'reveal'

const DEGREES = ['BBA', 'BCom', 'BA / Economics', 'Law', 'Other']
const TIMELINES = [
  { label: 'Within a month', months: 1 },
  { label: '1–3 months', months: 2 },
  { label: '3–6 months', months: 5 },
  { label: 'Not sure yet', months: null },
]
const LANES = [
  { value: 'big4', label: 'Big 4 & consulting' },
  { value: 'banking', label: 'Banking & finance' },
  { value: 'marketing', label: 'Marketing, sales & BD' },
  { value: 'any', label: 'Any good role' },
]

interface DiagState {
  index: number
  total: number
  question: ClientQuestion | null
  runningEstimate: number
  lastCorrect: boolean | null
}

export default function StartPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [degree, setDegree] = useState<string | null>(null)
  const [timelineMonths, setTimelineMonths] = useState<number | null | undefined>(undefined)
  const [lane, setLane] = useState<string | null>(null)
  const [diag, setDiag] = useState<DiagState | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ rating: number; perDomain: Record<string, { asked: number; correct: number }> } | null>(null)
  const answersRef = useRef<{ questionId: string; chosenKey: string; timeMs: number }[]>([])
  const shownAt = useRef(Date.now())

  const callDiagnostic = async (final = false) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/apti/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answersRef.current,
          ...(final ? { context: { degree, lane, timelineMonths } } : {}),
        }),
      })
      if (res.status === 401) { router.push('/login?next=/practice/start'); return }
      if (!res.ok) throw new Error('diag failed')
      const d = await res.json()
      if (d.done) {
        setResult(d.result)
        setStep('reveal')
      } else {
        setDiag({
          index: d.index, total: d.total, question: d.next,
          runningEstimate: d.runningEstimate, lastCorrect: d.lastCorrect,
        })
        setSelected(null)
        shownAt.current = Date.now()
        if (step !== 'quiz') setStep('quiz')
      }
    } catch {
      setError('Something hiccuped — tap to retry.')
    } finally {
      setBusy(false)
    }
  }

  const answerCurrent = async (key: string) => {
    if (!diag?.question || busy) return
    setSelected(key)
    answersRef.current = [...answersRef.current, {
      questionId: diag.question.id,
      chosenKey: key,
      timeMs: Date.now() - shownAt.current,
    }]
    const isLast = answersRef.current.length >= diag.total
    // brief pending flash, then advance (server confirms correctness)
    const res = await fetch('/api/apti/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: answersRef.current,
        ...(isLast ? { context: { degree, lane, timelineMonths } } : {}),
      }),
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    if (!res) { setError('Something hiccuped — tap to retry.'); return }

    setFlash(res.lastCorrect ? 'correct' : 'wrong')
    setTimeout(() => {
      setFlash(null)
      if (res.done) {
        setResult(res.result)
        setStep('reveal')
      } else {
        setDiag({
          index: res.index, total: res.total, question: res.next,
          runningEstimate: res.runningEstimate, lastCorrect: res.lastCorrect,
        })
        setSelected(null)
        shownAt.current = Date.now()
      }
    }, 650)
  }

  const chipBtn = (active: boolean): React.CSSProperties => ({
    padding: '16px 18px', fontSize: 16, fontFamily: 'inherit', textAlign: 'left',
    background: active ? 'rgba(79,124,255,0.12)' : 'rgba(255,255,255,0.03)',
    color: '#fff', borderRadius: 14, cursor: 'pointer',
    border: active ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
  })

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 80px' }}>
      <AptiStyles />

      {/* ---- welcome ---- */}
      {step === 'welcome' && (
        <div className="apti-in" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p className="mono-label" style={{ marginBottom: 14 }}>Beyond Campus · Apti</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 42, letterSpacing: -1.2, lineHeight: 1.12, marginBottom: 14 }}>
            Let&rsquo;s find <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>your level.</em>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 15.5, lineHeight: 1.6, marginBottom: 36, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
            Three quick taps, then eight questions that adapt to you.
            Ninety seconds from now you&rsquo;ll have a rating — and a plan.
          </p>
          <PrimaryBtn onClick={() => setStep('degree')}>Start →</PrimaryBtn>
          <button
            onClick={() => { sessionStorage.setItem('apti_skip_onboarding', '1'); router.push('/practice') }}
            style={{ background: 'none', border: 'none', color: COLORS.muted2, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer', marginTop: 18 }}
          >
            Skip — take me straight to practice
          </button>
        </div>
      )}

      {/* ---- context taps ---- */}
      {(step === 'degree' || step === 'timeline' || step === 'lane') && (
        <div className="apti-in" key={step} style={{ paddingTop: 24 }}>
          <p className="mono-label" style={{ marginBottom: 10 }}>
            {step === 'degree' ? '1 of 3' : step === 'timeline' ? '2 of 3' : '3 of 3'}
          </p>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 30, letterSpacing: -0.8, marginBottom: 22 }}>
            {step === 'degree' && 'What are you studying?'}
            {step === 'timeline' && 'When’s your first test?'}
            {step === 'lane' && 'What are you aiming for?'}
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {step === 'degree' && DEGREES.map((d) => (
              <button key={d} style={chipBtn(degree === d)} className="apti-option"
                onClick={() => { setDegree(d); setStep('timeline') }}>{d}</button>
            ))}
            {step === 'timeline' && TIMELINES.map((t) => (
              <button key={t.label} style={chipBtn(timelineMonths === t.months)} className="apti-option"
                onClick={() => { setTimelineMonths(t.months); setStep('lane') }}>{t.label}</button>
            ))}
            {step === 'lane' && LANES.map((l) => (
              <button key={l.value} style={chipBtn(lane === l.value)} className="apti-option"
                onClick={() => { setLane(l.value); callDiagnostic() }}>{l.label}</button>
            ))}
          </div>
          {busy && <p style={{ color: COLORS.muted2, fontSize: 13, marginTop: 16, textAlign: 'center' }}>Picking your first question…</p>}
          {error && (
            <button onClick={() => callDiagnostic()} style={{ ...chipBtn(false), marginTop: 16, width: '100%', color: COLORS.wrong, textAlign: 'center' }}>
              {error}
            </button>
          )}
        </div>
      )}

      {/* ---- the ladder ---- */}
      {step === 'quiz' && diag?.question && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(diag.index / diag.total) * 100}%`, background: GRAD,
                borderRadius: 100, transition: 'width 0.5s cubic-bezier(0.2,0.6,0.2,1)',
              }} />
            </div>
            <Mono style={{ fontSize: 13, color: COLORS.muted }}>{diag.index + 1}/{diag.total}</Mono>
          </div>

          <div key={diag.question.id} className="apti-in">
            <p className="mono-label" style={{ marginBottom: 14 }}>
              {DOMAIN_LABELS[diag.question.domain] ?? 'Aptitude'} · calibrating
            </p>
            <div style={{ fontSize: 19, lineHeight: 1.6, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              <MiniMd text={diag.question.stem_md} />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {diag.question.options.map((o) => {
                const isPick = selected === o.key
                const flashStyle: React.CSSProperties = isPick && flash
                  ? flash === 'correct'
                    ? { background: COLORS.correctBg, border: `1px solid ${COLORS.correct}` }
                    : { background: COLORS.wrongBg, border: `1px solid ${COLORS.wrong}` }
                  : {}
                return (
                  <button
                    key={o.key}
                    className="apti-option"
                    disabled={!!selected}
                    onClick={() => answerCurrent(o.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                      padding: '15px 16px', fontSize: 16.5, fontFamily: 'inherit', color: '#fff',
                      background: isPick ? 'rgba(79,124,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isPick ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
                      borderRadius: 14, cursor: selected ? 'default' : 'pointer',
                      ...flashStyle,
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, minWidth: 30, borderRadius: 9,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
                      background: 'rgba(255,255,255,0.07)', color: COLORS.muted,
                    }}>{o.key}</span>
                    {o.text}
                  </button>
                )
              })}
            </div>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: COLORS.muted2, marginTop: 20 }}>
              No penalty here — this just finds where to start you.
            </p>
            {error && (
              <button onClick={() => callDiagnostic()} style={{ ...chipBtn(false), marginTop: 12, width: '100%', color: COLORS.wrong, textAlign: 'center' }}>
                {error}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---- the reveal ---- */}
      {step === 'reveal' && result && (
        <div style={{ paddingTop: 32, textAlign: 'center' }}>
          <div className="apti-pop">
            <p className="mono-label" style={{ marginBottom: 18 }}>Your starting Apti Rating</p>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 76, fontWeight: 600, letterSpacing: -2,
              background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              <CountUpNumber to={result.rating} from={800} style={{ fontSize: 76, fontWeight: 600 }} />
            </div>
          </div>

          <div className="apti-in" style={{ animationDelay: '0.35s', marginTop: 30 }}>
            <Card style={{ textAlign: 'left', padding: 0, overflow: 'hidden' }}>
              {Object.entries(result.perDomain).map(([d, s], i) => (
                <div key={d} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '15px 20px',
                  borderTop: i > 0 ? `1px solid ${COLORS.hair}` : 'none', fontSize: 14.5,
                }}>
                  <span style={{ color: COLORS.muted }}>{DOMAIN_LABELS[d] ?? d}</span>
                  <Mono style={{ color: s.correct >= Math.ceil(s.asked * 0.6) ? COLORS.correct : COLORS.stretch }}>
                    {s.correct}/{s.asked}
                  </Mono>
                </div>
              ))}
            </Card>
            <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.65, margin: '22px 0 28px' }}>
              This number moves every single day you practice — up when you
              stretch, down when you coast. Most students never even know
              theirs. You now do.
            </p>
            <PrimaryBtn onClick={() => router.push('/practice')}>Start Day 1 →</PrimaryBtn>
          </div>
        </div>
      )}
    </main>
  )
}

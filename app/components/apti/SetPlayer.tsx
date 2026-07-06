'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GRAD, COLORS, MiniMd, Card, PrimaryBtn, Mono, DOMAIN_LABELS } from './ui'

export interface ClientQuestion {
  id: string
  type: string
  stem_md: string
  options: { key: string; text: string }[]
  hint_count: number
}

interface Reveal {
  attemptId: number | null
  correct: boolean
  answerKeys: string[] | null
  answerValue: number | null
  trap: string | null
  trapExplanation: string | null
  solutionMd: string
  shortcutMd: string | null
  benchmarkSec: number
  timeMs: number
  skill: { name: string; ratingBefore: number; ratingAfter: number; masteryBefore: string; mastery: string }
  domain: { name: string; before: number | null; after: number | null }
  redemption: { isReview: boolean; redeemed: boolean } | null
  set: { cursor: number; total: number; done: boolean; summary: SetSummary | null }
}

export interface SetSummary {
  correct: number
  total: number
  ratingDeltas: Record<string, number>
  streak: number
}

type Phase = 'answer' | 'confidence' | 'reveal' | 'done'

const CONFIDENCE_OPTIONS = [
  { value: 'sure', label: 'Sure' },
  { value: 'thinkso', label: 'Think so' },
  { value: 'guessing', label: 'Guessing' },
]

const ERROR_OPTIONS = [
  { value: 'concept', label: "Didn't know the method" },
  { value: 'calc', label: 'Calculation slip' },
  { value: 'misread', label: 'Misread the question' },
  { value: 'trap', label: 'Fell for the trap' },
  { value: 'time', label: 'Rushed / ran out of time' },
]

export default function SetPlayer({ setId, questions, startCursor, initialSummary }: {
  setId: string
  questions: ClientQuestion[]
  startCursor: number
  initialSummary: SetSummary | null
}) {
  const router = useRouter()
  const [cursor, setCursor] = useState(startCursor)
  const [phase, setPhase] = useState<Phase>(initialSummary ? 'done' : 'answer')
  const [selected, setSelected] = useState<string | null>(null)
  const [numericInput, setNumericInput] = useState('')
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [summary, setSummary] = useState<SetSummary | null>(initialSummary)
  const [errorTagged, setErrorTagged] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const shownAt = useRef(Date.now())
  const lockedMs = useRef(0)

  const q = questions[cursor]
  const isNumeric = q?.type === 'numeric'

  const lockAnswer = () => {
    lockedMs.current = Date.now() - shownAt.current
    setPhase('confidence')
  }

  const submit = async (confidence: string) => {
    if (submitting || !q) return
    setSubmitting(true)
    setApiError(null)
    try {
      const res = await fetch('/api/apti/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setId,
          questionId: q.id,
          chosenKey: isNumeric ? undefined : selected,
          chosenValue: isNumeric ? Number(numericInput) : undefined,
          timeMs: lockedMs.current,
          confidence,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setApiError(err.error || 'Something went wrong — try again.')
        setPhase('answer')
        return
      }
      const data: Reveal = await res.json()
      setReveal(data)
      if (data.set.done) setSummary(data.set.summary)
      setPhase('reveal')
    } catch {
      setApiError('Network hiccup — check your connection and try again.')
      setPhase('answer')
    } finally {
      setSubmitting(false)
    }
  }

  const tagError = async (errorType: string) => {
    setErrorTagged(errorType)
    if (reveal?.attemptId) {
      fetch('/api/apti/error-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId: reveal.attemptId, errorType }),
      }).catch(() => {})
    }
  }

  const next = () => {
    if (!reveal) return
    if (reveal.set.done) {
      setPhase('done')
      return
    }
    setCursor(reveal.set.cursor)
    setSelected(null)
    setNumericInput('')
    setReveal(null)
    setErrorTagged(null)
    shownAt.current = Date.now()
    setPhase('answer')
  }

  // ---------- completion ----------
  if (phase === 'done') {
    const s = summary
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px' }}>
        <Card style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔥</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, margin: '0 0 4px' }}>
            Day {s?.streak ?? 1} done.
          </h1>
          <p style={{ color: COLORS.muted, margin: '0 0 24px', fontSize: 15 }}>
            {s ? `${s.correct}/${s.total} correct today.` : 'Set complete.'}
          </p>
          {s && Object.entries(s.ratingDeltas).filter(([, d]) => d !== 0).map(([domain, delta]) => (
            <div key={domain} style={{
              display: 'flex', justifyContent: 'space-between', padding: '10px 0',
              borderTop: `1px solid ${COLORS.hair}`, fontSize: 15,
            }}>
              <span style={{ color: COLORS.muted }}>{DOMAIN_LABELS[domain] ?? domain} rating</span>
              <Mono style={{ color: delta >= 0 ? COLORS.correct : COLORS.wrong, fontWeight: 600 }}>
                {delta >= 0 ? `▲ +${delta}` : `▼ ${delta}`}
              </Mono>
            </div>
          ))}
          <PrimaryBtn onClick={() => router.push('/practice')} style={{ marginTop: 24 }}>
            Done for today
          </PrimaryBtn>
          <p style={{ color: COLORS.muted2, fontSize: 13, marginTop: 14 }}>
            Come back tomorrow — your misses return as redemption questions.
          </p>
        </Card>
      </div>
    )
  }

  if (!q) return null

  const dots = questions.map((_, i) => (
    <span key={i} style={{
      width: 8, height: 8, borderRadius: 4, display: 'inline-block', margin: '0 3px',
      background: i < cursor ? GRAD : i === cursor ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)',
    }} />
  ))

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 64px' }}>
      {/* progress header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>{dots}</div>
        <Mono style={{ color: COLORS.muted, fontSize: 13 }}>{cursor + 1}/{questions.length}</Mono>
      </div>

      {/* stem */}
      <div style={{ fontSize: 18, lineHeight: 1.55, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
        <MiniMd text={q.stem_md} />
      </div>

      {apiError && (
        <div style={{ color: COLORS.wrong, fontSize: 14, marginBottom: 16 }}>{apiError}</div>
      )}

      {/* ---------- answering ---------- */}
      {(phase === 'answer' || phase === 'confidence') && (
        <>
          {isNumeric ? (
            <input
              value={numericInput}
              onChange={(e) => setNumericInput(e.target.value)}
              inputMode="decimal"
              placeholder="Your answer"
              disabled={phase === 'confidence'}
              style={{
                width: '100%', padding: '14px 16px', fontSize: 17, fontFamily: 'var(--mono)',
                background: COLORS.card, color: '#fff',
                border: `1px solid ${COLORS.hair}`, borderRadius: 12, marginBottom: 16,
              }}
            />
          ) : (
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {q.options.map((o) => (
                <button
                  key={o.key}
                  onClick={() => phase === 'answer' && setSelected(o.key)}
                  style={{
                    textAlign: 'left', padding: '14px 16px', fontSize: 16, fontFamily: 'inherit',
                    background: selected === o.key ? 'rgba(79,124,255,0.15)' : COLORS.card,
                    color: '#fff',
                    border: selected === o.key ? '1px solid #4F7CFF' : `1px solid ${COLORS.hair}`,
                    borderRadius: 12, cursor: 'pointer', transition: 'border-color 150ms ease-out',
                  }}
                >
                  <Mono style={{ color: COLORS.muted, marginRight: 10, fontSize: 14 }}>{o.key}</Mono>
                  {o.text}
                </button>
              ))}
            </div>
          )}

          {phase === 'answer' && (
            <PrimaryBtn
              onClick={lockAnswer}
              disabled={isNumeric ? numericInput.trim() === '' : !selected}
            >
              Lock answer
            </PrimaryBtn>
          )}

          {phase === 'confidence' && (
            <Card style={{ padding: 16 }}>
              <p style={{ margin: '0 0 12px', color: COLORS.muted, fontSize: 14, textAlign: 'center' }}>
                How sure are you?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {CONFIDENCE_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => submit(c.value)}
                    disabled={submitting}
                    style={{
                      padding: '12px 8px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.06)', color: '#fff',
                      border: `1px solid ${COLORS.hair}`, borderRadius: 10,
                      cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.5 : 1,
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              {submitting && (
                <p style={{ margin: '12px 0 0', textAlign: 'center', color: COLORS.muted2, fontSize: 13 }}>
                  Checking…
                </p>
              )}
            </Card>
          )}
        </>
      )}

      {/* ---------- reveal ---------- */}
      {phase === 'reveal' && reveal && (
        <div>
          <Card style={{
            borderLeft: `3px solid ${reveal.correct ? COLORS.correct : COLORS.wrong}`,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <strong style={{ color: reveal.correct ? COLORS.correct : COLORS.wrong, fontSize: 17 }}>
                {reveal.correct ? '✓ Correct' : `✗ ${reveal.answerKeys?.[0] ? `Answer: ${reveal.answerKeys[0]}` : 'Incorrect'}`}
              </strong>
              <Mono style={{ color: COLORS.muted, fontSize: 13 }}>
                {Math.round(reveal.timeMs / 1000)}s · benchmark {reveal.benchmarkSec}s
              </Mono>
            </div>
            {reveal.skill.ratingAfter !== reveal.skill.ratingBefore && (
              <div style={{ marginTop: 8, fontSize: 14, color: COLORS.muted }}>
                {reveal.skill.name}:{' '}
                <Mono style={{ color: reveal.skill.ratingAfter > reveal.skill.ratingBefore ? COLORS.correct : COLORS.wrong }}>
                  {reveal.skill.ratingBefore} → {reveal.skill.ratingAfter}
                </Mono>
              </div>
            )}
            {reveal.redemption?.redeemed && (
              <div style={{ marginTop: 8, fontSize: 14, color: COLORS.correct }}>
                ★ Redeemed — you beat the question that beat you.
              </div>
            )}
            {reveal.skill.mastery !== reveal.skill.masteryBefore && (
              <div style={{ marginTop: 8, fontSize: 14, color: '#7B61FF' }}>
                {reveal.skill.name}: {reveal.skill.masteryBefore} → <strong>{reveal.skill.mastery}</strong>
              </div>
            )}
          </Card>

          {reveal.trapExplanation && (
            <Card style={{ marginBottom: 16, borderLeft: `3px solid ${COLORS.stretch}` }}>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.stretch, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                The trap
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.5 }}>
                <MiniMd text={reveal.trapExplanation} />
              </p>
            </Card>
          )}

          <Card style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12, color: COLORS.muted, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
              Solution
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              <MiniMd text={reveal.solutionMd} />
            </p>
            {reveal.shortcutMd && (
              <>
                <p style={{ margin: '16px 0 0', fontSize: 12, color: '#7B61FF', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>
                  ★ Shortcut
                </p>
                <p style={{ margin: '8px 0 0', fontSize: 15, lineHeight: 1.6 }}>
                  <MiniMd text={reveal.shortcutMd} />
                </p>
              </>
            )}
          </Card>

          {!reveal.correct && (
            <Card style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 14, color: COLORS.muted }}>What happened?</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ERROR_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => tagError(e.value)}
                    style={{
                      padding: '8px 12px', fontSize: 13, fontFamily: 'inherit',
                      background: errorTagged === e.value ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.05)',
                      color: errorTagged === e.value ? '#fff' : COLORS.muted,
                      border: errorTagged === e.value ? '1px solid #4F7CFF' : `1px solid ${COLORS.hair}`,
                      borderRadius: 20, cursor: 'pointer',
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {errorTagged && !reveal.redemption && (
                <p style={{ margin: '12px 0 0', fontSize: 13, color: COLORS.muted2 }}>
                  Added to your redemption queue — it comes back tomorrow.
                </p>
              )}
            </Card>
          )}

          <PrimaryBtn onClick={next} disabled={!reveal.correct && !errorTagged}>
            {reveal.set.done ? 'Finish set' : 'Next →'}
          </PrimaryBtn>
          {!reveal.correct && !errorTagged && (
            <p style={{ textAlign: 'center', color: COLORS.muted2, fontSize: 12, marginTop: 8 }}>
              Tag the miss first — it decides when this question returns.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

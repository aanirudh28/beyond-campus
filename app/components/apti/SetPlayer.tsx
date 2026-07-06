'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GRAD, COLORS, MiniMd, Mono, Chip, Card, PrimaryBtn,
  CountUpNumber, AccuracyRing, AptiStyles, DOMAIN_LABELS,
} from './ui'

export interface ClientQuestion {
  id: string
  type: string
  stem_md: string
  options: { key: string; text: string }[]
  hints: string[]
  skill_name: string
  domain: string
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
  { value: 'sure', label: 'Sure', caption: 'I’d bet on it' },
  { value: 'thinkso', label: 'Think so', caption: 'Fairly confident' },
  { value: 'guessing', label: 'Guessing', caption: 'Honest coin-flip' },
]

const ERROR_OPTIONS = [
  { value: 'concept', label: 'Didn’t know the method' },
  { value: 'calc', label: 'Calculation slip' },
  { value: 'misread', label: 'Misread the question' },
  { value: 'trap', label: 'Fell for the trap' },
  { value: 'time', label: 'Rushed it' },
]

export default function SetPlayer({ setId, questions, startCursor, reviewCount, initialSummary }: {
  setId: string
  questions: ClientQuestion[]
  startCursor: number
  reviewCount: number
  initialSummary: SetSummary | null
}) {
  const router = useRouter()
  const [cursor, setCursor] = useState(startCursor)
  const [phase, setPhase] = useState<Phase>(initialSummary ? 'done' : 'answer')
  const [selected, setSelected] = useState<string | null>(null)
  const [numericInput, setNumericInput] = useState('')
  const [hintsShown, setHintsShown] = useState(0)
  const [reveal, setReveal] = useState<Reveal | null>(null)
  const [summary, setSummary] = useState<SetSummary | null>(initialSummary)
  const [errorTagged, setErrorTagged] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const shownAt = useRef(Date.now())
  const lockedMs = useRef(0)

  const q = questions[cursor]
  const isNumeric = q?.type === 'numeric'
  const isReviewSlot = cursor < reviewCount
  const isStretchSlot = cursor === questions.length - 1 && questions.length >= 6 && !isReviewSlot

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
          assisted: hintsShown > 0,
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

  const tagError = (errorType: string) => {
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
    if (reveal.set.done) { setPhase('done'); return }
    setCursor(reveal.set.cursor)
    setSelected(null)
    setNumericInput('')
    setHintsShown(0)
    setReveal(null)
    setErrorTagged(null)
    shownAt.current = Date.now()
    setPhase('answer')
  }

  // keyboard: A–D select, Enter lock / next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'answer' && !isNumeric) {
        const k = e.key.toUpperCase()
        if (q?.options.some((o) => o.key === k)) { setSelected(k); return }
        if (e.key === 'Enter' && selected) lockAnswer()
      } else if (phase === 'reveal' && e.key === 'Enter') {
        if (reveal && (reveal.correct || errorTagged)) next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selected, isNumeric, reveal, errorTagged, q])

  // ---------------- completion ----------------
  if (phase === 'done') {
    const s = summary
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '56px 20px 80px' }}>
        <AptiStyles />
        <div className="apti-pop" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, animation: 'apti-flame 1.6s ease-in-out infinite', display: 'inline-block' }}>🔥</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400, letterSpacing: -1, margin: '10px 0 6px' }}>
            Day {s?.streak ?? 1} <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>done.</em>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 15, marginBottom: 32 }}>
            Most people never practice at all. You just did.
          </p>
        </div>

        {s && (
          <div className="apti-in" style={{ animationDelay: '0.15s' }}>
            <AccuracyRing correct={s.correct} total={s.total} />
            <Card style={{ marginTop: 28, padding: 0, overflow: 'hidden' }}>
              {Object.entries(s.ratingDeltas).map(([domain, delta], i) => (
                <div key={domain} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', borderTop: i > 0 ? `1px solid ${COLORS.hair}` : 'none',
                }}>
                  <span style={{ color: COLORS.muted, fontSize: 14 }}>
                    {DOMAIN_LABELS[domain] ?? domain} rating
                  </span>
                  <Mono style={{
                    fontSize: 16, fontWeight: 600,
                    color: delta > 0 ? COLORS.correct : delta < 0 ? COLORS.wrong : COLORS.muted2,
                  }}>
                    {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '· '}{Math.abs(delta)}
                  </Mono>
                </div>
              ))}
            </Card>
          </div>
        )}

        <div className="apti-in" style={{ animationDelay: '0.3s', marginTop: 28 }}>
          <PrimaryBtn onClick={() => router.push('/practice')}>Done for today</PrimaryBtn>
          <p style={{ color: COLORS.muted2, fontSize: 13, marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            Tomorrow&rsquo;s set is already forming — today&rsquo;s misses
            come back as redemption questions.
          </p>
        </div>
      </div>
    )
  }

  if (!q) return null

  const progress = (cursor + (phase === 'reveal' ? 1 : 0)) / questions.length
  const overBenchmark = reveal ? Math.round(reveal.timeMs / 1000) - reveal.benchmarkSec : 0

  const optionState = (key: string): 'idle' | 'selected' | 'correct' | 'wrong' | 'dim' => {
    if (phase !== 'reveal' || !reveal) return selected === key ? 'selected' : 'idle'
    if (reveal.answerKeys?.includes(key)) return 'correct'
    if (selected === key) return 'wrong'
    return 'dim'
  }

  const optionStyles: Record<string, React.CSSProperties> = {
    idle: { background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}` },
    selected: { background: 'rgba(79,124,255,0.12)', border: `1px solid ${COLORS.blue}`, boxShadow: '0 0 20px rgba(79,124,255,0.15)' },
    correct: { background: COLORS.correctBg, border: `1px solid ${COLORS.correct}` },
    wrong: { background: COLORS.wrongBg, border: `1px solid ${COLORS.wrong}` },
    dim: { background: 'rgba(255,255,255,0.02)', border: `1px solid ${COLORS.hair}`, opacity: 0.45 },
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '20px 20px 120px' }}>
      <AptiStyles />

      {/* ---- top bar: exit · progress · counter ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/practice" aria-label="Save & exit" style={{
          color: COLORS.muted2, fontSize: 20, lineHeight: 1, padding: 4,
        }}>✕</Link>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress * 100}%`, background: GRAD, borderRadius: 100,
            transition: 'width 0.5s cubic-bezier(0.2, 0.6, 0.2, 1)',
            boxShadow: '0 0 12px rgba(79,124,255,0.6)',
          }} />
        </div>
        <Mono style={{ color: COLORS.muted, fontSize: 13 }}>{cursor + 1}/{questions.length}</Mono>
      </div>

      {/* ---- question, re-animated per cursor ---- */}
      <div key={q.id} className="apti-in">
        {/* context chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <Chip>{q.skill_name || DOMAIN_LABELS[q.domain] || 'Practice'}</Chip>
          {isReviewSlot && <Chip color={COLORS.stretch} bg={COLORS.stretchBg}>↺ Redemption</Chip>}
          {isStretchSlot && <Chip color={COLORS.purple} bg="rgba(123,97,255,0.12)">◆ Stretch</Chip>}
        </div>

        {/* stem */}
        <div style={{ fontSize: 19, lineHeight: 1.6, marginBottom: 26, whiteSpace: 'pre-wrap', letterSpacing: 0.1 }}>
          <MiniMd text={q.stem_md} />
        </div>

        {apiError && (
          <div style={{ color: COLORS.wrong, fontSize: 14, marginBottom: 16 }}>{apiError}</div>
        )}

        {/* options — always visible; reveal paints the truth onto them */}
        {isNumeric ? (
          <input
            value={numericInput}
            onChange={(e) => setNumericInput(e.target.value)}
            inputMode="decimal"
            placeholder="Your answer"
            disabled={phase !== 'answer'}
            style={{
              width: '100%', padding: '16px 18px', fontSize: 18, fontFamily: 'var(--mono)',
              background: 'rgba(255,255,255,0.03)', color: '#fff',
              border: `1px solid ${COLORS.hair}`, borderRadius: 14, marginBottom: 18,
            }}
          />
        ) : (
          <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
            {q.options.map((o) => {
              const st = optionState(o.key)
              return (
                <button
                  key={o.key}
                  className="apti-option"
                  disabled={phase !== 'answer'}
                  onClick={() => setSelected(o.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    textAlign: 'left', padding: '15px 16px', fontSize: 16.5, fontFamily: 'inherit',
                    color: '#fff', borderRadius: 14,
                    cursor: phase === 'answer' ? 'pointer' : 'default',
                    ...optionStyles[st],
                  }}
                >
                  <span style={{
                    width: 30, height: 30, minWidth: 30, borderRadius: 9,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
                    background: st === 'correct' ? COLORS.correct : st === 'wrong' ? COLORS.wrong
                      : st === 'selected' ? GRAD : 'rgba(255,255,255,0.07)',
                    color: st === 'idle' || st === 'dim' ? COLORS.muted : '#fff',
                  }}>
                    {st === 'correct' ? '✓' : st === 'wrong' ? '✕' : o.key}
                  </span>
                  {o.text}
                </button>
              )
            })}
          </div>
        )}

        {/* hint ladder */}
        {phase === 'answer' && q.hints.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {q.hints.slice(0, hintsShown).map((h, i) => (
              <div key={i} className="apti-in" style={{
                padding: '12px 16px', marginBottom: 8, borderRadius: 12,
                background: COLORS.stretchBg, border: '1px solid rgba(251,191,36,0.25)',
                fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.85)',
              }}>
                <span style={{ color: COLORS.stretch, marginRight: 8 }}>💡</span>{h}
              </div>
            ))}
            {hintsShown < q.hints.length && (
              <button
                onClick={() => setHintsShown((n) => n + 1)}
                style={{
                  background: 'none', border: 'none', color: COLORS.muted, fontSize: 13.5,
                  fontFamily: 'inherit', cursor: 'pointer', padding: '6px 2px',
                }}
              >
                💡 {hintsShown === 0 ? 'Need a nudge?' : 'One more hint'}
                {hintsShown === 0 && <span style={{ color: COLORS.muted2 }}> · pauses rating for this question</span>}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ---- lock answer ---- */}
      {phase === 'answer' && (
        <PrimaryBtn
          onClick={lockAnswer}
          disabled={isNumeric ? numericInput.trim() === '' : !selected}
        >
          Lock answer
        </PrimaryBtn>
      )}

      {/* ---- confidence sheet ---- */}
      {phase === 'confidence' && (
        <div className="apti-sheet">
          <Card style={{ padding: 20, border: '1px solid rgba(79,124,255,0.3)', animation: 'apti-glow 2.4s ease-in-out infinite' }}>
            <p className="mono-label" style={{ textAlign: 'center', marginBottom: 14 }}>
              Before the reveal — how sure are you?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {CONFIDENCE_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => submit(c.value)}
                  disabled={submitting}
                  className="apti-option"
                  style={{
                    padding: '14px 8px', fontFamily: 'inherit',
                    background: 'rgba(255,255,255,0.04)', color: '#fff',
                    border: `1px solid ${COLORS.hair}`, borderRadius: 12,
                    cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.45 : 1,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.muted2, marginTop: 3 }}>{c.caption}</div>
                </button>
              ))}
            </div>
            <p style={{
              margin: '12px 0 0', textAlign: 'center', fontSize: 12.5,
              color: submitting ? COLORS.blueSoft : COLORS.muted2, minHeight: 18,
            }}>
              {submitting ? 'Checking…' : 'Calibration trains the skip-or-attempt instinct tests reward.'}
            </p>
          </Card>
        </div>
      )}

      {/* ---- reveal ---- */}
      {phase === 'reveal' && reveal && (
        <div>
          {/* result strip */}
          <div className="apti-pop" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 18px', borderRadius: 14, marginBottom: 12,
            background: reveal.correct ? COLORS.correctBg : COLORS.wrongBg,
            border: `1px solid ${reveal.correct ? COLORS.correct : COLORS.wrong}`,
          }}>
            <strong style={{ color: reveal.correct ? COLORS.correct : COLORS.wrong, fontSize: 17 }}>
              {reveal.correct ? '✓ Correct' : '✕ Not this time'}
            </strong>
            <Mono style={{ fontSize: 13, color: overBenchmark <= 0 ? COLORS.correct : COLORS.stretch }}>
              {Math.round(reveal.timeMs / 1000)}s {overBenchmark <= 0 ? `· ⚡ ${-overBenchmark}s under par` : `· ${overBenchmark}s over par`}
            </Mono>
          </div>

          {/* rating movement */}
          {reveal.skill.ratingAfter !== reveal.skill.ratingBefore && (
            <div className="apti-in" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 18px', borderRadius: 14, marginBottom: 12,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
              animationDelay: '0.1s',
            }}>
              <span style={{ fontSize: 14, color: COLORS.muted }}>{reveal.skill.name}</span>
              <span style={{ fontSize: 15 }}>
                <Mono style={{ color: COLORS.muted2 }}>{reveal.skill.ratingBefore}</Mono>
                <span style={{ color: COLORS.muted2, margin: '0 8px' }}>→</span>
                <CountUpNumber
                  to={reveal.skill.ratingAfter}
                  from={reveal.skill.ratingBefore}
                  style={{
                    fontWeight: 700,
                    color: reveal.skill.ratingAfter > reveal.skill.ratingBefore ? COLORS.correct : COLORS.wrong,
                  }}
                />
              </span>
            </div>
          )}

          {/* redemption / mastery moments */}
          {reveal.redemption?.redeemed && (
            <div className="apti-pop" style={{
              padding: '16px 18px', borderRadius: 14, marginBottom: 12, textAlign: 'center',
              background: 'rgba(123,97,255,0.10)', border: '1px solid rgba(123,97,255,0.45)',
              animationDelay: '0.15s',
            }}>
              <span style={{ fontSize: 15, color: COLORS.blueSoft }}>
                ★ <strong>Redeemed.</strong> You beat the question that beat you.
              </span>
            </div>
          )}
          {reveal.skill.mastery !== reveal.skill.masteryBefore && (
            <div className="apti-pop" style={{
              padding: '16px 18px', borderRadius: 14, marginBottom: 12, textAlign: 'center',
              background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.4)',
              animationDelay: '0.2s',
            }}>
              <span style={{ fontSize: 15 }}>
                {reveal.skill.name}: <span style={{ color: COLORS.muted, textTransform: 'capitalize' }}>{reveal.skill.masteryBefore}</span>
                {' '}→ <strong style={{ color: COLORS.blueSoft, textTransform: 'capitalize' }}>{reveal.skill.mastery}</strong>
              </span>
            </div>
          )}

          {/* the trap */}
          {reveal.trapExplanation && (
            <Card style={{ marginBottom: 12, borderLeft: `3px solid ${COLORS.stretch}`, animationDelay: '0.15s' }}>
              <p className="mono-label" style={{ color: COLORS.stretch, marginBottom: 8 }}>The trap you hit</p>
              <p style={{ fontSize: 15, lineHeight: 1.6 }}>
                <MiniMd text={reveal.trapExplanation} />
              </p>
            </Card>
          )}

          {/* solution + shortcut */}
          <Card style={{ marginBottom: 12 }}>
            <p className="mono-label" style={{ marginBottom: 8 }}>Solution</p>
            <p style={{ fontSize: 15, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              <MiniMd text={reveal.solutionMd} />
            </p>
            {reveal.shortcutMd && (
              <div style={{
                marginTop: 16, padding: '13px 16px', borderRadius: 12,
                background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.25)',
              }}>
                <p className="mono-label" style={{ color: COLORS.purple, marginBottom: 6 }}>★ The fast way</p>
                <p style={{ fontSize: 15, lineHeight: 1.6 }}>
                  <MiniMd text={reveal.shortcutMd} />
                </p>
              </div>
            )}
          </Card>

          {/* error tagging — required on a miss */}
          {!reveal.correct && (
            <Card style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: COLORS.muted, marginBottom: 10 }}>
                What happened? <span style={{ color: COLORS.muted2 }}>(decides when it returns)</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ERROR_OPTIONS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => tagError(e.value)}
                    className="apti-option"
                    style={{
                      padding: '9px 14px', fontSize: 13.5, fontFamily: 'inherit',
                      background: errorTagged === e.value ? 'rgba(79,124,255,0.18)' : 'rgba(255,255,255,0.04)',
                      color: errorTagged === e.value ? '#fff' : COLORS.muted,
                      border: errorTagged === e.value ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
                      borderRadius: 100, cursor: 'pointer',
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {errorTagged && (
                <p className="apti-in" style={{ margin: '12px 0 0', fontSize: 13, color: COLORS.muted2 }}>
                  ↺ Queued for redemption — it returns {errorTagged === 'concept' ? 'tomorrow' : 'in a day or two'}.
                </p>
              )}
            </Card>
          )}

          <PrimaryBtn onClick={next} disabled={!reveal.correct && !errorTagged}>
            {reveal.set.done ? 'Finish set' : 'Next →'}
          </PrimaryBtn>
          {!reveal.correct && !errorTagged && (
            <p style={{ textAlign: 'center', color: COLORS.muted2, fontSize: 12.5, marginTop: 10 }}>
              Tag the miss first — honest tags make your analytics worth reading.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

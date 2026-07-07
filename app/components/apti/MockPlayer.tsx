'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { COLORS, GRAD, MiniMd, Mono, AptiStyles } from './ui'
import type { ClientQuestion } from './SetPlayer'

interface MockSection { name: string; seconds: number; questions: ClientQuestion[] }

// Test-mode player (docs/aptitude/07): countdown, palette navigation, mark
// for review, answers changeable until submit, zero feedback until the end.
export default function MockPlayer({ attemptId, name, deadlineAt, sections }: {
  attemptId: string
  name: string
  deadlineAt: string
  sections: MockSection[]
}) {
  const router = useRouter()
  const flat = sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s.name })))
  const [cursor, setCursor] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [marked, setMarked] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [now, setNow] = useState(Date.now())
  const perQSeconds = useRef<Record<string, number>>({})
  const lastTick = useRef(Date.now())
  const submittedRef = useRef(false)

  const q = flat[cursor]
  const remaining = Math.max(0, Math.floor((new Date(deadlineAt).getTime() - now) / 1000))
  const answeredCount = Object.keys(answers).length

  const submit = async (auto = false) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)
    try {
      const res = await fetch('/api/apti/mock/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers, perQSeconds: perQSeconds.current }),
      })
      if (!res.ok) throw new Error('submit failed')
      router.replace(`/practice/mocks/${attemptId}/report`)
    } catch {
      submittedRef.current = false
      setSubmitting(false)
      if (!auto) setConfirmOpen(false)
    }
  }

  // clock + per-question time accrual + auto-submit
  useEffect(() => {
    const t = setInterval(() => {
      const nowMs = Date.now()
      const dt = (nowMs - lastTick.current) / 1000
      lastTick.current = nowMs
      if (q) perQSeconds.current[q.id] = (perQSeconds.current[q.id] ?? 0) + dt
      setNow(nowMs)
      if (nowMs >= new Date(deadlineAt).getTime()) submit(true)
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, q?.id])

  if (!q) return null

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const clockColor = remaining < 30 ? COLORS.wrong : remaining < 120 ? COLORS.stretch : '#fff'

  const paletteState = (id: string, i: number) =>
    i === cursor ? 'current' : answers[id] ? 'answered' : marked.has(id) ? 'marked' : 'blank'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 20px 140px' }}>
      <AptiStyles />

      {/* header: name · clock · submit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: COLORS.muted }}>{name}</span>
        <Mono style={{ fontSize: 22, fontWeight: 600, color: clockColor, letterSpacing: 1 }}>
          {mm}:{ss}
        </Mono>
        <button
          onClick={() => setConfirmOpen(true)}
          style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            border: `1px solid ${COLORS.hair}`, borderRadius: 100, cursor: 'pointer',
          }}
        >Submit</button>
      </div>

      {/* palette */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
        {flat.map((fq, i) => {
          const st = paletteState(fq.id, i)
          return (
            <button
              key={fq.id}
              onClick={() => setCursor(i)}
              style={{
                width: 34, height: 34, borderRadius: 9, fontFamily: 'var(--mono)', fontSize: 12.5,
                cursor: 'pointer', position: 'relative',
                background: st === 'answered' ? 'rgba(79,124,255,0.25)' : 'rgba(255,255,255,0.04)',
                color: st === 'answered' ? '#fff' : COLORS.muted,
                border: st === 'current' ? `2px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
              }}
            >
              {i + 1}
              {marked.has(fq.id) && (
                <span style={{
                  position: 'absolute', top: -3, right: -3, width: 8, height: 8,
                  borderRadius: 4, background: COLORS.stretch,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* question */}
      <div key={q.id} className="apti-in">
        <p className="mono-label" style={{ marginBottom: 12 }}>
          {q.section} · Q{cursor + 1} of {flat.length} · {q.skill_name}
        </p>
        <div style={{ fontSize: 18, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 20 }}>
          <MiniMd text={q.stem_md} />
        </div>
        <div style={{ display: 'grid', gap: 9, marginBottom: 20 }}>
          {q.options.map((o) => {
            const selected = answers[q.id] === o.key
            return (
              <button
                key={o.key}
                className="apti-option"
                onClick={() => setAnswers((a) => {
                  const next = { ...a }
                  if (selected) delete next[q.id]  // tap again to clear (skip strategy)
                  else next[q.id] = o.key
                  return next
                })}
                style={{
                  display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
                  padding: '13px 15px', fontSize: 15.5, fontFamily: 'inherit', color: '#fff',
                  borderRadius: 12, cursor: 'pointer',
                  background: selected ? 'rgba(79,124,255,0.14)' : 'rgba(255,255,255,0.03)',
                  border: selected ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
                }}
              >
                <Mono style={{ fontSize: 13, color: selected ? COLORS.blueSoft : COLORS.muted }}>{o.key}</Mono>
                {o.text}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setCursor((c) => Math.max(0, c - 1))}
            disabled={cursor === 0}
            style={{
              padding: '11px 18px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', color: cursor === 0 ? COLORS.muted2 : '#fff',
              border: `1px solid ${COLORS.hair}`, borderRadius: 100, cursor: 'pointer',
            }}
          >← Prev</button>
          <button
            onClick={() => setMarked((m) => {
              const next = new Set(m)
              if (next.has(q.id)) next.delete(q.id); else next.add(q.id)
              return next
            })}
            style={{
              padding: '11px 18px', fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
              background: marked.has(q.id) ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
              color: marked.has(q.id) ? COLORS.stretch : COLORS.muted,
              border: marked.has(q.id) ? '1px solid rgba(251,191,36,0.4)' : `1px solid ${COLORS.hair}`,
              borderRadius: 100, cursor: 'pointer',
            }}
          >{marked.has(q.id) ? '◆ Marked' : '◇ Mark'}</button>
          <button
            onClick={() => setCursor((c) => Math.min(flat.length - 1, c + 1))}
            disabled={cursor === flat.length - 1}
            style={{
              marginLeft: 'auto', padding: '11px 22px', fontSize: 14, fontFamily: 'inherit', fontWeight: 700,
              background: GRAD, color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer',
              opacity: cursor === flat.length - 1 ? 0.4 : 1,
            }}
          >Next →</button>
        </div>
        <p style={{ marginTop: 14, fontSize: 12.5, color: COLORS.muted2, textAlign: 'center' }}>
          Test rules: no feedback until submit. Anything eating 90+ seconds — mark it and move.
        </p>
      </div>

      {/* submit confirm */}
      {confirmOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="apti-pop" style={{
            background: '#111827', border: `1px solid ${COLORS.hair}`, borderRadius: 18,
            padding: 26, maxWidth: 360, width: '100%',
          }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 22, marginBottom: 8 }}>Submit?</h2>
            <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.6, marginBottom: 20 }}>
              {answeredCount}/{flat.length} answered
              {answeredCount < flat.length ? ` — ${flat.length - answeredCount} blank.` : '.'}
              {' '}<Mono style={{ color: clockColor }}>{mm}:{ss}</Mono> left.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => submit()} disabled={submitting} style={{
                flex: 1, padding: '13px', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                background: GRAD, color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}>{submitting ? 'Grading…' : 'Submit'}</button>
              <button onClick={() => setConfirmOpen(false)} disabled={submitting} style={{
                padding: '13px 18px', fontSize: 14, fontFamily: 'inherit',
                background: 'rgba(255,255,255,0.06)', color: COLORS.muted,
                border: `1px solid ${COLORS.hair}`, borderRadius: 100, cursor: 'pointer',
              }}>Keep going</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

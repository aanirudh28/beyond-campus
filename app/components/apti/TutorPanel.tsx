'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { COLORS, GRAD, Mono } from '@/app/components/apti/ui'
import { trackAptiEvent } from '@/app/components/apti/track'

const MAX_TURNS = 6 // mirrors TUTOR_MAX_TURNS server-side

interface Message { role: 'user' | 'assistant'; text: string }
interface Usage { used: number; cap: number; unlimited: boolean }

// The AI Tutor chat (docs/aptitude/10) — collapsed to one quiet button under
// the solution; anchored to one graded attempt. The server holds the trust
// boundary; this component only ships the transcript back and forth.
export default function TutorPanel({ scope, attemptId, mockId, questionId, correct }: {
  scope: 'set' | 'mock'
  attemptId?: number | null
  mockId?: string
  questionId?: string
  correct: boolean
}) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [walled, setWalled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (scope === 'set' && attemptId == null) return null

  const userTurns = messages.filter((m) => m.role === 'user').length
  const outOfTurns = userTurns >= MAX_TURNS

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || busy || outOfTurns) return
    const nextMessages: Message[] = [...messages, { role: 'user', text: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/apti/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          scope === 'set'
            ? { scope, attemptId, messages: nextMessages }
            : { scope, mockId, questionId, messages: nextMessages }
        ),
      })
      const d = await res.json()
      if (res.status === 402) {
        setWalled(true)
        setUsage(d.usage ?? null)
        setMessages(messages) // roll back the unsent turn
        trackAptiEvent('paywall_viewed', { surface: 'tutor' })
        return
      }
      if (!res.ok) {
        setError(d.error || 'The tutor is briefly unavailable — try again.')
        setMessages(messages)
        return
      }
      setMessages([...nextMessages, { role: 'assistant', text: d.reply }])
      setUsage(d.usage ?? null)
      setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 60)
    } catch {
      setError('Network hiccup — try again.')
      setMessages(messages)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="apti-option"
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '14px 16px', borderRadius: 14, marginBottom: 12,
          background: 'rgba(123,97,255,0.07)', border: '1px solid rgba(123,97,255,0.3)',
          color: '#fff', fontSize: 14.5, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 18 }}>🧠</span>
        <span style={{ flex: 1 }}>
          {correct ? 'Ask the tutor — explain this differently' : 'Ask the tutor — where did my reasoning go wrong?'}
        </span>
        <span style={{ color: COLORS.purple }}>→</span>
      </button>
    )
  }

  return (
    <div style={{
      borderRadius: 14, marginBottom: 12, overflow: 'hidden',
      background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.3)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${COLORS.hair}` }}>
        <span style={{ fontSize: 16 }}>🧠</span>
        <span className="mono-label" style={{ flex: 1, color: COLORS.blueSoft }}>AI Tutor</span>
        <button onClick={() => setOpen(false)} style={{
          background: 'none', border: 'none', color: COLORS.muted2, cursor: 'pointer', fontSize: 16, padding: 2,
        }}>✕</button>
      </div>

      <div ref={scrollRef} style={{ maxHeight: 320, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && !walled && (
          <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>
            It knows this exact question, your answer, and your timing. Ask anything about it.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '88%', padding: '10px 14px', borderRadius: 14, fontSize: 14, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            background: m.role === 'user' ? 'rgba(79,124,255,0.18)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${m.role === 'user' ? 'rgba(79,124,255,0.35)' : COLORS.hair}`,
          }}>
            {m.text}
          </div>
        ))}
        {busy && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 14, fontSize: 14, color: COLORS.muted2, background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.hair}` }}>
            thinking…
          </div>
        )}
        {error && <p style={{ fontSize: 13, color: COLORS.wrong, margin: 0 }}>{error}</p>}

        {walled && (
          <div style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(79,124,255,0.07)', border: '1px solid rgba(79,124,255,0.3)' }}>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 10px' }}>
              You&rsquo;ve used your <Mono>{usage?.cap ?? 5}</Mono> free tutor chats this month.
              The practice itself stays free forever — the tutor is metered because every chat costs us AI compute.
            </p>
            <Link href="/free" style={{
              display: 'inline-block', padding: '10px 20px', borderRadius: 100,
              background: GRAD, color: '#fff', fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
            }}>
              Unlimited with the ₹299 pack →
            </Link>
          </div>
        )}
      </div>

      {!walled && (
        <div style={{ padding: '10px 16px 14px' }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {(correct
                ? ['Explain it differently', 'How do I solve these faster?']
                : ['Where exactly did I go wrong?', 'Explain it differently']
              ).map((s) => (
                <button key={s} onClick={() => send(s)} disabled={busy} className="apti-option" style={{
                  padding: '8px 13px', fontSize: 13, fontFamily: 'inherit', borderRadius: 100,
                  background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.hair}`,
                  color: COLORS.muted, cursor: 'pointer',
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {outOfTurns ? (
            <p style={{ fontSize: 12.5, color: COLORS.muted2, margin: 0 }}>
              That&rsquo;s the turn limit for one question — try re-solving it now, that&rsquo;s where it sticks.
            </p>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1500}
                placeholder="Ask about this question…"
                style={{
                  flex: 1, padding: '11px 14px', borderRadius: 100, fontSize: 14, fontFamily: 'inherit',
                  background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.hair}`,
                  color: '#fff', outline: 'none',
                }}
              />
              <button type="submit" disabled={busy || !input.trim()} style={{
                padding: '11px 18px', borderRadius: 100, border: 'none', fontFamily: 'inherit',
                background: busy || !input.trim() ? 'rgba(255,255,255,0.07)' : GRAD,
                color: busy || !input.trim() ? COLORS.muted2 : '#fff',
                fontSize: 14, fontWeight: 700, cursor: busy || !input.trim() ? 'default' : 'pointer',
              }}>
                Ask
              </button>
            </form>
          )}
          {usage && !usage.unlimited && (
            <p style={{ fontSize: 11.5, color: COLORS.muted2, margin: '8px 0 0' }}>
              <Mono>{Math.max(0, usage.cap - usage.used)}</Mono> of <Mono>{usage.cap}</Mono> free tutor chats left this month ·{' '}
              <Link href="/free" style={{ color: COLORS.blueSoft, textDecoration: 'none' }}>unlimited with the ₹299 pack</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

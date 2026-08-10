'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SITE = 'https://www.beyond-campus.in'

interface OpenEvent { opened_at: string; client: string | null; city: string | null }
interface TrackedMsg {
  id: string; label: string | null; subject: string | null; created_at: string
  opens: number; lastOpened: string | null; status: 'waiting' | 'opened' | 'follow_up' | 'no_open'
  timeline: OpenEvent[]
}
interface Prefs { email_alerts: boolean; followups: boolean }

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function openLine(o: OpenEvent) {
  const place = [o.client, o.city].filter(Boolean).join(' · ')
  return `${place || 'Opened'} · ${timeAgo(o.opened_at)}`
}

async function copyRichHtml(html: string, plain: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof window.ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new window.ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })])
      return true
    }
  } catch { /* fall through to execCommand */ }
  try {
    const div = document.createElement('div')
    div.contentEditable = 'true'
    div.innerHTML = html
    div.style.position = 'fixed'; div.style.left = '-9999px'; div.style.top = '0'
    document.body.appendChild(div)
    const range = document.createRange(); range.selectNodeContents(div)
    const sel = window.getSelection(); sel?.removeAllRanges(); sel?.addRange(range)
    const ok = document.execCommand('copy')
    sel?.removeAllRanges(); document.body.removeChild(div)
    return ok
  } catch { return false }
}

export default function Tool() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'loading' | 'anon' | 'ready'>('loading')
  const [messages, setMessages] = useState<TrackedMsg[]>([])
  const [prefs, setPrefs] = useState<Prefs>({ email_alerts: true, followups: true })
  const [toast, setToast] = useState('')
  const [err, setErr] = useState('')
  const prevOpens = useRef<Record<string, number>>({})

  const [label, setLabel] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'working' | 'copied' | 'failed'>('idle')
  const [copiedHtml, setCopiedHtml] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPhase('anon'); return }
    const res = await fetch('/api/rr/messages')
    const data = await res.json()
    const msgs: TrackedMsg[] = data.messages || []
    const prev = prevOpens.current
    if (Object.keys(prev).length > 0) {
      const bumped = msgs.find(m => (prev[m.id] ?? 0) < m.opens)
      if (bumped) setToast(`📬 ${bumped.label || bumped.subject || 'Your email'} was just opened`)
    }
    const next: Record<string, number> = {}
    for (const m of msgs) next[m.id] = m.opens
    prevOpens.current = next
    setMessages(msgs)
    if (data.prefs) setPrefs(data.prefs)
    setPhase('ready')
  }, [supabase])

  // load() only setStates after awaits, so this is not a synchronous cascade
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (phase !== 'ready') return
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [phase, load])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(t)
  }, [toast])

  const setPref = async (key: keyof Prefs, val: boolean) => {
    setPrefs(p => ({ ...p, [key]: val }))
    try {
      await fetch('/api/rr/prefs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: val }) })
    } catch { /* optimistic; ignore */ }
  }

  const createAndCopy = async () => {
    if (!body.trim()) { setErr('Write your email first.'); return }
    setCopyState('working'); setErr('')
    const res = await fetch('/api/rr/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, subject }),
    })
    const data = await res.json()
    if (!data.trackingId) { setCopyState('failed'); setErr(data.error || 'Could not create the tracked email.'); return }
    const pixel = `<img src="${SITE}/api/rr/pixel/${data.trackingId}" width="1" height="1" style="width:1px;height:1px;border:0;opacity:0" alt="">`
    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#000">${escapeHtml(body).replace(/\n/g, '<br>')}${pixel}</div>`
    setCopiedHtml(html)
    const ok = await copyRichHtml(html, body)
    setCopyState(ok ? 'copied' : 'failed')
    load()
  }

  if (phase === 'loading') {
    return <Card><p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Loading…</p></Card>
  }

  if (phase === 'anon') {
    return (
      <Card>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 20, marginTop: 0 }}>Sign in with Google to start tracking your emails. It&apos;s free.</p>
        <Link href="/login?next=/read-receipts" style={btnPrimary}>Start tracking free →</Link>
      </Card>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', padding: '11px 20px', borderRadius: 100, fontSize: 13.5, fontWeight: 700, boxShadow: '0 8px 30px rgba(79,124,255,0.5)' }}>{toast}</div>
      )}

      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>New tracked email</div>
        <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px', lineHeight: 1.6 }}>
          Only the <strong style={{ color: 'rgba(255,255,255,0.8)' }}>email body</strong> gets copied. The company and subject fields are labels for your own tracking only, they are never added to the email you send. You will type the real subject in Gmail yourself.
        </p>

        <label style={fieldLabel}>Company / recipient <span style={muted}>· your tracking only, not sent</span></label>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Google, Analyst role" style={inputStyle} />

        <label style={{ ...fieldLabel, marginTop: 12 }}>Subject <span style={muted}>· your tracking only, type the real one in Gmail</span></label>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Application for the summer analyst role" style={inputStyle} />

        <label style={{ ...fieldLabel, marginTop: 12 }}>Email body <span style={muted}>· this is the only part that gets copied</span></label>
        <textarea value={body} onChange={e => { setBody(e.target.value); setCopyState('idle') }} placeholder="Write your email here…" rows={9} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
        <button onClick={createAndCopy} disabled={copyState === 'working'} style={{ ...btnPrimary, width: '100%', border: 'none', marginTop: 12, cursor: copyState === 'working' ? 'wait' : 'pointer' }}>
          {copyState === 'working' ? 'Preparing…' : copyState === 'copied' ? '✓ Copied. Now paste into Gmail' : '📋 Create & copy tracked email'}
        </button>
        {copyState === 'copied' && (
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 13, color: '#6ee7b7', lineHeight: 1.6 }}>
            Your <strong>email body</strong> is copied (with the invisible tracker). In Gmail: click Compose, <strong>type your own subject line</strong>, paste the body with <strong>Ctrl+V</strong> (⌘+V on Mac), then send. The company and subject you entered here are not part of the email, they just label this row below.
          </div>
        )}
        {copyState === 'failed' && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12.5, color: '#fca5a5', marginBottom: 6 }}>Auto-copy was blocked by your browser. Select all of the box below, copy it, and paste into Gmail:</p>
            <div contentEditable suppressContentEditableWarning style={{ ...inputStyle, minHeight: 80, background: 'white', color: '#000' }} dangerouslySetInnerHTML={{ __html: copiedHtml }} />
          </div>
        )}
        {err && copyState !== 'failed' && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{err}</p>}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase' }}>Your tracked emails</div>
          <button onClick={load} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
        </div>

        {messages.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>No tracked emails yet. Create one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => <MessageRow key={m.id} m={m} />)}
          </div>
        )}
      </Card>

      {/* Preferences */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Notifications</div>
        <Toggle on={prefs.email_alerts} onChange={v => setPref('email_alerts', v)} title="Email me when an email is opened" sub="Get an instant alert the first time each email is opened." />
        <div style={{ height: 10 }} />
        <Toggle on={prefs.followups} onChange={v => setPref('followups', v)} title="Follow-up nudges" sub="Reminders when an opened email goes quiet, or an email stays unopened." />
      </Card>
    </div>
  )
}

function MessageRow({ m }: { m: TrackedMsg }) {
  const badge =
    m.status === 'follow_up' ? { text: 'Follow up?', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d' }
    : m.status === 'no_open' ? { text: 'Not opened · resend?', bg: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }
    : null

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', border: m.status === 'follow_up' ? '1px solid rgba(245,158,11,0.25)' : '1px solid transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{m.label || m.subject || 'Untitled'}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{m.subject && m.label ? `${m.subject} · ` : ''}sent {timeAgo(m.created_at)}</div>
        </div>
        {m.opens > 0 ? (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#6ee7b7' }}>● Opened {m.opens > 1 ? `${m.opens}×` : ''}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>last {timeAgo(m.lastOpened!)}</div>
          </div>
        ) : (
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>Not opened yet</div>
        )}
      </div>

      {badge && (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: badge.bg, color: badge.color }}>{badge.text}</span>
        </div>
      )}

      {m.timeline.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 12, color: '#93BBFF', cursor: 'pointer', fontWeight: 600 }}>View opens ({m.opens})</summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {m.timeline.map((o, i) => (
              <div key={i} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#6ee7b7' }}>●</span> {openLine(o)}
              </div>
            ))}
            {m.opens > m.timeline.length && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>+ {m.opens - m.timeline.length} more</div>}
          </div>
        </details>
      )}
    </div>
  )
}

function Toggle({ on, onChange, title, sub }: { on: boolean; onChange: (v: boolean) => void; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'white' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.5 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!on)} aria-pressed={on} style={{ flexShrink: 0, width: 44, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'linear-gradient(135deg,#4F7CFF,#7B61FF)' : 'rgba(255,255,255,0.12)', transition: 'background 0.2s' }}>
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
      </button>
    </div>
  )
}

const inputStyle: CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none' }
const fieldLabel: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 5 }
const muted: CSSProperties = { fontWeight: 500, color: 'rgba(255,255,255,0.35)' }
const btnPrimary: CSSProperties = { display: 'inline-block', textAlign: 'center', padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }

function Card({ children }: { children: ReactNode }) {
  return <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>{children}</div>
}

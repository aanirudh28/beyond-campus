'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SITE = 'https://www.beyond-campus.in'

interface TrackedMsg { id: string; label: string | null; subject: string | null; created_at: string; opens: number; lastOpened: string | null }

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
  const [err, setErr] = useState('')

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
    setMessages(data.messages || [])
    setPhase('ready')
  }, [supabase])

  // load() only setStates after awaits, so this is not a synchronous cascade
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (phase !== 'ready') return
    const t = setInterval(async () => {
      const res = await fetch('/api/rr/messages')
      const data = await res.json()
      setMessages(data.messages || [])
    }, 15000)
    return () => clearInterval(t)
  }, [phase])

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>New tracked email</div>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Who / which company (only you see this)" style={inputStyle} />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (for your reference)" style={{ ...inputStyle, marginTop: 10 }} />
        <textarea value={body} onChange={e => { setBody(e.target.value); setCopyState('idle') }} placeholder="Write your email here…" rows={9} style={{ ...inputStyle, marginTop: 10, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
        <button onClick={createAndCopy} disabled={copyState === 'working'} style={{ ...btnPrimary, width: '100%', border: 'none', marginTop: 12, cursor: copyState === 'working' ? 'wait' : 'pointer' }}>
          {copyState === 'working' ? 'Preparing…' : copyState === 'copied' ? '✓ Copied. Now paste into Gmail' : '📋 Create & copy tracked email'}
        </button>
        {copyState === 'copied' && (
          <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 13, color: '#6ee7b7', lineHeight: 1.6 }}>
            Open Gmail, click Compose, and paste with <strong>Ctrl+V</strong> (⌘+V on Mac), then send as normal. The tracker is invisible to the recipient. This email now shows below.
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase' }}>Your tracked emails</div>
          <button onClick={load} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
        </div>
        {messages.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>No tracked emails yet. Create one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, flexWrap: 'wrap' }}>
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
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

const inputStyle: CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none' }
const btnPrimary: CSSProperties = { display: 'inline-block', textAlign: 'center', padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }

function Card({ children }: { children: ReactNode }) {
  return <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>{children}</div>
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SITE = 'https://www.beyond-campus.in'

interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
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

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) return resolve(true)
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => resolve(true); s.onerror = () => resolve(false)
  document.body.appendChild(s)
})

export default function ReadReceiptsPage() {
  const supabase = createClient()
  const [phase, setPhase] = useState<'loading' | 'anon' | 'paywall' | 'ready'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [messages, setMessages] = useState<TrackedMsg[]>([])
  const [buying, setBuying] = useState(false)
  const [err, setErr] = useState('')

  // composer
  const [label, setLabel] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'working' | 'copied' | 'failed'>('idle')
  const [copiedHtml, setCopiedHtml] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setPhase('anon'); return }
    setEmail(user.email ?? null)
    const res = await fetch('/api/rr/messages')
    const data = await res.json()
    if (data.entitled) {
      setMessages(data.messages || [])
      setPhase('ready')
    } else {
      setPhase('paywall')
    }
  }, [supabase])

  // load() only setStates after awaits, so this is not a synchronous cascade
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  // Poll for new opens while the tool is open
  useEffect(() => {
    if (phase !== 'ready') return
    const t = setInterval(async () => {
      const res = await fetch('/api/rr/messages')
      const data = await res.json()
      if (data.entitled) setMessages(data.messages || [])
    }, 15000)
    return () => clearInterval(t)
  }, [phase])

  const buy = async () => {
    setBuying(true); setErr('')
    const ok = await loadRazorpay()
    if (!ok) { setErr('Could not load the payment gateway. Try again.'); setBuying(false); return }
    const res = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product: 'read_receipts' }) })
    const { orderId, amount, key } = await res.json()
    if (!orderId) { setErr('Could not start payment. Try again.'); setBuying(false); return }
    const options = {
      key: key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount, currency: 'INR', name: 'Beyond Campus', description: 'Read Receipts (lifetime)',
      order_id: orderId, prefill: { email: email || '' }, theme: { color: '#4F7CFF' },
      handler: async (r: RazorpayResponse) => {
        const v = await fetch('/api/rr/verify-purchase', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
        })
        const d = await v.json()
        setBuying(false)
        if (d.success) load()
        else setErr('Payment verification failed. Contact us if you were charged.')
      },
      modal: { ondismiss: () => setBuying(false) },
    }
    new window.Razorpay(options).open()
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

  // ---- render ----
  if (phase === 'loading') {
    return <Shell><p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</p></Shell>
  }

  if (phase === 'anon') {
    return (
      <Shell>
        <Hero />
        <Card>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>Sign in to unlock read receipts for your cold emails.</p>
          <Link href="/login?next=/read-receipts" style={btnPrimary}>Sign in to continue →</Link>
        </Card>
      </Shell>
    )
  }

  if (phase === 'paywall') {
    return (
      <Shell>
        <Hero />
        <Card>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: 'white', letterSpacing: -1 }}>₹200</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>one time, yours forever</span>
          </div>
          <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 2, listStyle: 'none', padding: 0, margin: '14px 0 22px' }}>
            <li>📬 Know the moment a recruiter opens your email</li>
            <li>🔁 See how many times they reopened it</li>
            <li>⏱️ Time your follow-up when interest is hot</li>
            <li>♾️ Unlimited tracked emails</li>
          </ul>
          <button onClick={buy} disabled={buying} style={{ ...btnPrimary, width: '100%', border: 'none', cursor: buying ? 'wait' : 'pointer', fontSize: 15 }}>
            {buying ? 'Opening payment…' : 'Unlock Read Receipts for ₹200'}
          </button>
          {err && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{err}</p>}
        </Card>
      </Shell>
    )
  }

  // ready
  return (
    <Shell>
      <Hero />
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#93BBFF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>New tracked email</div>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Who / which company (only you see this)" style={inputStyle} />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject (for your reference)" style={{ ...inputStyle, marginTop: 10 }} />
        <textarea value={body} onChange={e => { setBody(e.target.value); setCopyState('idle') }} placeholder="Write your cold email here…" rows={9} style={{ ...inputStyle, marginTop: 10, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
        <button onClick={createAndCopy} disabled={copyState === 'working'} style={{ ...btnPrimary, width: '100%', border: 'none', marginTop: 12, cursor: copyState === 'working' ? 'wait' : 'pointer' }}>
          {copyState === 'working' ? 'Preparing…' : copyState === 'copied' ? '✓ Copied — now paste into Gmail' : '📋 Create & copy tracked email'}
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
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No tracked emails yet. Create one above.</p>
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

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6, maxWidth: 520, margin: '4px auto 0' }}>
        A heads-up on accuracy: some mail apps (like Apple Mail) auto-load images, which can show an open the recipient did not make; a few block images, which can miss a real open. This is true of every read-receipt tool.
      </p>
    </Shell>
  )
}

// ---- little presentational helpers (house style) ----
const inputStyle: CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, outline: 'none' }
const btnPrimary: CSSProperties = { display: 'inline-block', textAlign: 'center', padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }

function Shell({ children }: { children: ReactNode }) {
  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif", padding: '32px 20px 80px' }}>
      <style>{`*,*::before,*::after{box-sizing:border-box} a{text-decoration:none} input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3)}`}</style>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20 }}>Beyond<span style={{ color: '#4F7CFF' }}>Campus</span></Link>
        {children}
      </div>
    </main>
  )
}

function Hero() {
  return (
    <div>
      <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 14 }}>Read Receipts</div>
      <h1 style={{ fontSize: 'clamp(28px,5vw,40px)', fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: 10 }}>Know when a recruiter opens your email</h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>Send cold emails from your own Gmail, and see the moment they get read, and how many times. Follow up at exactly the right time.</p>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24 }}>{children}</div>
}

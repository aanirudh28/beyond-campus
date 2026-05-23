'use client'

import { useState } from 'react'

export default function SummerRegisterPage() {
  const [email, setEmail]       = useState('')
  const [focused, setFocused]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }
    setError('')
    setLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'Summer Waitlist' }),
      })
    } catch { /* silent fail */ }
    setDone(true)
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .waitlist-card{animation:fadeUp 0.55s ease both}
        @media(max-width:520px){
          .wl-row{flex-direction:column !important}
          .wl-row input,.wl-row button{border-radius:12px !important;width:100% !important}
        }
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#f59e0b' }}>Campus</span>
        </a>
        <a href="/summer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to program
        </a>
      </div>

      {/* Centered content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px 80px' }}>
        <div className="waitlist-card" style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>

          {done ? (
            /* ── Success state ── */
            <div>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 28px' }}>
                🎉
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, marginBottom: 14, letterSpacing: -0.5 }}>
                You&apos;re on the list!
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, marginBottom: 8, maxWidth: 380, margin: '0 auto 8px' }}>
                We&apos;ll email you the moment the next Summer batch opens — you&apos;ll get early access and a founding member discount.
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 20 }}>
                Questions? <a href="mailto:hello@beyond-campus.in" style={{ color: '#f59e0b', fontWeight: 600 }}>hello@beyond-campus.in</a>
              </p>
            </div>
          ) : (
            /* ── Waitlist state ── */
            <div>
              {/* Closed badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.28)', fontSize: 12, fontWeight: 700, color: '#f87171', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', animation: 'pulse 1.8s ease infinite', display: 'inline-block' }} />
                Summer 2025 registrations closed
              </div>

              <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(30px,5vw,42px)', lineHeight: 1.1, marginBottom: 16, letterSpacing: -0.5 }}>
                The next batch is<br />
                <span style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  coming soon
                </span>
              </h1>

              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.72, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
                Enter your email and we&apos;ll notify you first — before we open registrations publicly.
              </p>

              {/* Waitlist form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <div className="wl-row" style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 440 }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit(e as any)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                      flex: 1, minWidth: 0,
                      background: '#111827',
                      border: `1.5px solid ${error ? 'rgba(239,68,68,0.6)' : focused ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 100, padding: '14px 22px',
                      fontSize: 15, color: '#fff',
                      fontFamily: "'DM Sans',sans-serif",
                      outline: 'none',
                      boxShadow: focused ? '0 0 0 3px rgba(245,158,11,0.12)' : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flexShrink: 0,
                      padding: '14px 26px', borderRadius: 100,
                      background: 'linear-gradient(135deg,#f59e0b,#f97316)',
                      border: 'none', cursor: loading ? 'wait' : 'pointer',
                      color: '#fff', fontSize: 15, fontWeight: 700,
                      fontFamily: "'DM Sans',sans-serif",
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
                      whiteSpace: 'nowrap',
                      transition: 'opacity 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    {loading ? 'Saving…' : 'Notify Me →'}
                  </button>
                </div>

                {error && (
                  <p style={{ fontSize: 12, color: 'rgba(239,68,68,0.8)', margin: 0 }}>{error}</p>
                )}

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>
                  🔒 No spam · We&apos;ll only reach out when registrations open
                </p>
              </form>

              {/* Divider */}
              <div style={{ margin: '44px auto 0', maxWidth: 360, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)' }} />

              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 28, lineHeight: 1.6 }}>
                Meanwhile, all our free resources are still available —{' '}
                <a href="/free" style={{ color: 'rgba(245,158,11,0.75)', fontWeight: 600, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f59e0b')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,158,11,0.75)')}
                >
                  explore free resources →
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

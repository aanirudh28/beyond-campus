'use client'

import { useState } from 'react'

// COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form
// and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments"
// to activate instantly.

export default function CohortPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  const handleWaitlist = async () => {
    if (!waitlistEmail.trim()) return
    setWaitlistLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail.trim(), source: 'Cohort Waitlist' }),
      })
    } catch { /* silent fail — still show success */ }
    setWaitlistDone(true)
    setWaitlistLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0B0B0F', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Coming Soon Banner */}
      <div style={{ width: '100%', background: 'rgba(79,124,255,0.1)', borderBottom: '1px solid rgba(79,124,255,0.2)', padding: '12px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'white', margin: 0 }}>
          🚀 The 8-Week Job Placement Cohort is launching soon — join the waitlist to get early access and a founding member discount.
        </p>
      </div>

      <div style={{ maxWidth: 520, width: '100%', padding: '48px 16px' }}>

        {/* Brand nav */}
        <div style={{ marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 4px 14px rgba(79,124,255,0.35)' }}>🎓</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: -0.3 }}>Beyond Campus</span>
          </a>
          <a href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            ← Home
          </a>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ background: '#f97316', color: 'white', fontSize: 13, fontWeight: 700, padding: '4px 14px', borderRadius: 100, display: 'inline-block', marginBottom: 16 }}>
            🚀 Launching Soon · Join the Waitlist
          </span>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: -0.5 }}>Join the 8-Week Placement Accelerator</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>Get structured guidance, live sessions, and proven strategies to land your first off-campus offer.</p>
        </div>

        {/* What's included card */}
        <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 16 }}>What you get</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              '8 weeks of structured curriculum',
              'Live weekly sessions with mentors',
              '50+ cold email templates',
              'ATS-optimized resume template',
              'LinkedIn DM scripts',
              'Company hit list spreadsheet',
              'Private WhatsApp community',
              'Lifetime access to all resources',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 20, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>₹999</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through', marginLeft: 10, fontSize: 14 }}>₹4,999</span>
            </div>
            <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '4px 12px', borderRadius: 100 }}>80% off</span>
          </div>
        </div>

        {/* Waitlist form card */}
        <div style={{ background: '#111827', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: 24 }}>
          {waitlistDone ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8 }}>You&apos;re on the list!</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                We&apos;ll reach out as soon as registrations open — founding members get early access and a special discount.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>Get Early Access</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                Registrations are opening soon. Drop your email and we&apos;ll notify you first — founding members get a special discount.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                  style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
                />
              </div>

              {/* COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form */}
              {/* and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments" */}
              {/* to activate instantly. */}
              <button
                onClick={handleWaitlist}
                disabled={waitlistLoading || !waitlistEmail.trim()}
                style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', fontWeight: 700, padding: '14px 0', borderRadius: 12, border: 'none', fontSize: 15, cursor: waitlistLoading || !waitlistEmail.trim() ? 'not-allowed' : 'pointer', opacity: waitlistLoading || !waitlistEmail.trim() ? 0.6 : 1, fontFamily: "'DM Sans', sans-serif" }}
              >
                {waitlistLoading ? '⏳ Saving...' : 'Notify Me →'}
              </button>

              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12 }}>
                No spam · We&apos;ll only email you when registrations open
              </p>
            </>
          )}
        </div>

      </div>
    </main>
  )
}

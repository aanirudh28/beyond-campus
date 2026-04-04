'use client'

import { useState } from 'react'

// COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form
// and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments"
// to activate instantly.

export default function CohortPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

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
    <main style={{ minHeight: '100vh', backgroundColor: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .cohort-hero-content { animation: fadeUp 0.5s ease forwards; }
        .pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: #fff; display: inline-block; animation: pulseDot 1.5s ease infinite; flex-shrink: 0; }
        @media (max-width: 600px) {
          .waitlist-row { flex-direction: column !important; }
          .waitlist-row input { border-radius: 100px !important; width: 100% !important; }
          .waitlist-row button { border-radius: 100px !important; width: 100% !important; }
        }
      `}</style>

      {/* Announcement Banner */}
      {!bannerDismissed && (
        <div style={{ width: '100%', background: 'rgba(79,124,255,0.08)', borderBottom: '1px solid rgba(79,124,255,0.15)', padding: '11px 48px 11px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Shimmer */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '25%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', animation: 'shimmer 3s ease infinite' }} />
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
            🚀 The 8-Week Job Placement Cohort is launching soon — join the waitlist to get early access and a founding member discount.
          </p>
          <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
        </div>
      )}

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <a href="/" style={{ textDecoration: 'none', fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: -0.5, color: 'white' }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/summer" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 800, color: '#fff', textDecoration: 'none', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', boxShadow: '0 0 16px rgba(245,158,11,0.35)', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>Summer ☀️</a>
          <a href="/book" style={{ padding: '9px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>Book Session</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '60px 24px 80px' }}>

        {/* Radial glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at 50% 0%, rgba(79,124,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Orb decorations */}
        <div style={{ position: 'absolute', top: -60, left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(79,124,255,0.18)', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(123,97,255,0.18)', filter: 'blur(80px)', opacity: 0.3, pointerEvents: 'none' }} />

        <div className="cohort-hero-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 700, color: 'white', letterSpacing: 0.5, boxShadow: '0 0 20px rgba(245,158,11,0.4)', marginBottom: 28 }}>
            <span className="pulse-dot" />
            🚀 Launching Soon · Join the Waitlist
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: 'white', margin: '0 0 20px', maxWidth: 700 }}>
            Join the 8-Week{' '}
            <span style={{ background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Placement Accelerator
            </span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 520, lineHeight: 1.7, margin: '0 0 32px' }}>
            Get structured guidance, live sessions, and proven strategies to land your first off-campus offer.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
            {['📅 8 weeks live', '🎯 Business roles only', '👥 Direct founder access'].map(pill => (
              <span key={pill} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '8px 18px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {pill}
              </span>
            ))}
          </div>

          {/* Waitlist form */}
          {waitlistDone ? (
            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '28px 36px', textAlign: 'center', maxWidth: 440 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>You&apos;re on the list!</p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
                We&apos;ll reach out as soon as registrations open — founding members get early access and a special discount.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%', maxWidth: 520 }}>
              <div className="waitlist-row" style={{ display: 'flex', gap: 10, width: '100%' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  style={{ flex: 1, background: '#161b22', border: `1px solid ${inputFocused ? '#4F7CFF' : 'rgba(255,255,255,0.12)'}`, borderRadius: 100, padding: '14px 24px', fontSize: 15, color: 'white', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxShadow: inputFocused ? '0 0 0 3px rgba(79,124,255,0.15)' : 'none', transition: 'border-color 0.2s, box-shadow 0.2s', minWidth: 0 }}
                />
                {/* COHORT PAYMENTS DISABLED — waitlist only */}
                <button
                  onClick={handleWaitlist}
                  disabled={waitlistLoading || !waitlistEmail.trim()}
                  style={{ background: '#4F7CFF', color: 'white', fontWeight: 700, fontSize: 15, padding: '14px 28px', borderRadius: 100, border: 'none', cursor: waitlistLoading || !waitlistEmail.trim() ? 'not-allowed' : 'pointer', opacity: waitlistLoading || !waitlistEmail.trim() ? 0.55 : 1, fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', flexShrink: 0, transition: 'opacity 0.2s' }}
                >
                  {waitlistLoading ? '⏳ Saving...' : 'Notify Me →'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>🔒 No spam · We&apos;ll only reach out when registrations open</p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', margin: '0 auto', maxWidth: 900, width: '100%' }} />

      {/* What's included + pricing */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '56px 24px 72px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ background: '#111827', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', padding: '28px 28px 24px' }}>
          <h2 style={{ fontWeight: 700, color: 'white', marginBottom: 20, fontSize: 17 }}>What you get</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 22, paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>₹999</span>
              <span style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', marginLeft: 10, fontSize: 14 }}>₹4,999</span>
            </div>
            <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)', padding: '5px 14px', borderRadius: 100 }}>80% off</span>
          </div>
        </div>

      </div>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'


export default function FreePage() {
  const [payLoading, setPayLoading] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('resourcePackUnlocked') === 'true') {
      setPaid(true)
    }
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }

    const savedEmail = localStorage.getItem('userEmail')
    if (savedEmail) {
      fetch('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.hasAccess) {
            localStorage.setItem('resourcePackUnlocked', 'true')
            setPaid(true)
          } else {
            localStorage.removeItem('resourcePackUnlocked')
            localStorage.removeItem('coldEmailPackEmailUnlocked')
            localStorage.removeItem('linkedinScriptsEmailUnlocked')
            localStorage.removeItem('resumeGuideEmailUnlocked')
            setPaid(false)
          }
        })
        .catch(() => {})
    }
  }, [])

  const handleUnlockPack = async () => {
    setPayLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 199 }),
      })
      const { orderId, amount, key } = await res.json()
      new window.Razorpay({
        key,
        amount,
        currency: 'INR',
        order_id: orderId,
        name: 'Beyond Campus',
        description: 'Resource Pack — All 5 Resources',
        theme: { color: '#4F7CFF' },
        handler: async (response: { razorpay_payment_id: string }) => {
          await fetch('/api/save-resource-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: '', paymentId: response.razorpay_payment_id }),
          })
          localStorage.setItem('resourcePackUnlocked', 'true')
          setPaid(true)
        },
      }).open()
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}

        .hero-card{
          border-radius:24px;
          padding:40px;
          background:linear-gradient(135deg,rgba(79,124,255,0.07),rgba(123,97,255,0.07));
          position:relative;
        }
        .hero-card::before{
          content:'';
          position:absolute;
          inset:0;
          border-radius:24px;
          padding:1.5px;
          background:linear-gradient(135deg,rgba(79,124,255,0.6),rgba(123,97,255,0.6));
          -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
          -webkit-mask-composite:xor;
          mask-composite:exclude;
          pointer-events:none;
        }

        .resource-card{
          background:#111827;
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;
          padding:32px;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .resource-card:hover{
          border-color:rgba(79,124,255,0.25);
          box-shadow:0 12px 48px rgba(79,124,255,0.07);
        }
        .resource-card.dim{
          opacity:0.45;
        }

        .unlock-btn{
          display:inline-flex;align-items:center;justify-content:center;
          padding:15px 32px;border-radius:12px;
          background:linear-gradient(135deg,#4F7CFF,#7B61FF);
          color:#fff;font-weight:700;font-size:15px;
          font-family:"DM Sans",sans-serif;border:none;cursor:pointer;
          transition:opacity 0.2s,box-shadow 0.2s;
          box-shadow:0 4px 24px rgba(79,124,255,0.35);
        }
        .unlock-btn:hover{opacity:0.9;box-shadow:0 6px 32px rgba(79,124,255,0.45)}
        .unlock-btn:disabled{opacity:0.6;cursor:wait}

        .unlock-btn-sm{
          display:inline-flex;align-items:center;justify-content:center;
          padding:13px 24px;border-radius:12px;
          background:linear-gradient(135deg,#4F7CFF,#7B61FF);
          color:#fff;font-weight:700;font-size:14px;
          font-family:"DM Sans",sans-serif;border:none;cursor:pointer;
          transition:opacity 0.2s,box-shadow 0.2s;
          box-shadow:0 4px 16px rgba(79,124,255,0.3);
        }
        .unlock-btn-sm:hover{opacity:0.9}
        .unlock-btn-sm:disabled{opacity:0.6;cursor:wait}

        .view-link{
          display:inline-flex;align-items:center;
          font-size:14px;font-weight:700;color:#93BBFF;
          text-decoration:none;transition:opacity 0.2s;
        }
        .view-link:hover{opacity:0.75}

        @media(max-width:640px){
          .hero-card{padding:28px 22px}
          .resource-card{padding:24px 18px}
          .hero-bullets{flex-direction:column !important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to home
        </a>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ── RESOURCE PACK HERO CARD ── */}
        <div className="hero-card" style={{ marginBottom: 52 }}>
          {/* Badge */}
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.4)', color: '#93BBFF' }}>
              BEST VALUE — ₹199
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: -0.75, marginBottom: 12, lineHeight: 1.2 }}>
            Resource Pack — Unlock Everything
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 28, maxWidth: 600 }}>
            Get all 5 resources for ₹199 — Cold Email Pack (50 templates), LinkedIn Scripts (20 DMs), Personalized Company Target List, Resume Template, and the Off-Campus Playbook.
          </p>

          {/* Feature bullets */}
          <div className="hero-bullets" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', marginBottom: 32 }}>
            {[
              'All 50 cold email templates',
              'All 20 LinkedIn DM scripts',
              'Personalized Company Target List — built for you',
              'Resume template + playbook',
            ].map(bullet => (
              <div key={bullet} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(79,124,255,0.2)', border: '1px solid rgba(79,124,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#93BBFF', flexShrink: 0 }}>✓</span>
                {bullet}
              </div>
            ))}
          </div>

          {/* CTA */}
          {paid ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontWeight: 700, fontSize: 15 }}>
              <span style={{ fontSize: 18 }}>✓</span>
              Resource Pack Unlocked
            </div>
          ) : (
            <button className="unlock-btn" onClick={handleUnlockPack} disabled={payLoading}>
              {payLoading ? 'Processing...' : 'Unlock Everything — ₹199'}
            </button>
          )}
        </div>

        {/* ── SECTION TITLE ── */}
        <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
          Free Resources
        </h2>

        {/* ── RESOURCE CARDS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Card 0: Resume Roast — NEW */}
          <div className="resource-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
                  NEW 🔥
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)' }}>AI-powered · Free</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>🔥 Resume Roast</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16 }}>
              Upload your resume and get a brutally honest score, section breakdown, rewritten bullets, and ATS analysis. 3,200+ resumes roasted.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {['AI-Powered', 'Instant', 'Free'].map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <a href="/resources/resume-roast" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(220,38,38,0.15))', border: '1.5px solid rgba(239,68,68,0.4)', color: '#f87171', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Roast My Resume →
            </a>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              Completely free · No sign-up · Results in 30 seconds
            </div>
          </div>

          {/* Card 0b: Career Toolkit — completely free */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                  FREE
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'rgba(255,255,255,0.3)' }}>No sign-up required</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>🛠️ Career Toolkit</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 16 }}>
              Skill maps, project playbooks, and resume bullets for 15 internship roles. Know exactly what to build before you apply.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
              {['15 Roles', '50+ Projects', 'Resume Bullets'].map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <a href="/resources/career-toolkit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg,rgba(79,124,255,0.2),rgba(123,97,255,0.15))', border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Explore Toolkit →
            </a>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              Completely free · No sign-up · All roles accessible
            </div>
          </div>

          {/* Card 1: Cold Email Pack */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>
                  Free
                </span>
                {paid && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                    Unlocked ✓
                  </span>
                )}
              </div>
              <a href="/resources/cold-email-pack" className="view-link">View Templates →</a>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>Cold Email Pack</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16 }}>
              50 email templates across 7 categories — HR &amp; Talent Acquisition, Founders, Alumni, Domain Specific, Follow-Ups, and Subject Lines.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              {[
                { label: '50 Templates', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
                { label: '7 Categories', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
              ].map(s => (
                <span key={s.label} style={{ padding: '5px 14px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 12, fontWeight: 700 }}>
                  {s.label}
                </span>
              ))}
            </div>

            <a href="/resources/cold-email-pack" className="view-link" style={{ fontSize: 15 }}>
              View Templates →
            </a>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 500 }}>
              2 free &bull; 4 with email &bull; 50 with Resource Pack
            </p>
          </div>

          {/* Card 2: LinkedIn DM Scripts */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>
                  Free
                </span>
                {paid && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                    Unlocked ✓
                  </span>
                )}
              </div>
              <a href="/resources/linkedin-scripts" className="view-link">View Scripts →</a>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>LinkedIn DM Scripts</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16 }}>
              20 message templates to start conversations with HRs, founders, alumni, and hiring managers — short, direct, and effective.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <span style={{ padding: '5px 14px', borderRadius: 100, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#7dd3fc', fontSize: 12, fontWeight: 700 }}>
                20 Scripts
              </span>
            </div>

            <a href="/resources/linkedin-scripts" className="view-link" style={{ fontSize: 15 }}>
              View Scripts →
            </a>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 500 }}>
              2 free &bull; 4 with email &bull; 20 with Resource Pack
            </p>
          </div>

          {/* Card 3: Consulting Resources */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                FREE
              </span>
              <a href="/resources/consulting" className="view-link">Browse Resources →</a>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>Consulting Resources</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16 }}>
              Casebooks from IIM-A, IIM-B, IIM-C, IIM-L, ISB, BITSoM + SRCC Guestimate Book. Free downloads, no sign-up.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {['8 Casebooks · Guestimates · Free'].map(s => (
                <span key={s} style={{ padding: '5px 14px', borderRadius: 100, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', fontSize: 12, fontWeight: 700 }}>
                  {s}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 18, fontWeight: 500 }}>↓ 3,200+ downloads</div>

            <a href="/resources/consulting" className="view-link" style={{ fontSize: 15 }}>
              Browse &amp; Download →
            </a>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 500 }}>
              No email required · Direct download
            </p>
          </div>

          {/* Card 4: Resume Guide — Active */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>
                Free
              </span>
              {paid && <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Unlocked ✓</span>}
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>Resume Guide</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16 }}>
              A complete chapter-by-chapter guide to building a resume that gets shortlisted for consulting, finance, Founder&apos;s Office, and startup roles.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {['7 Chapters', 'Domain Tips', '10-Min Checklist'].map(s => (
                <span key={s} style={{ padding: '5px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', color: '#93BBFF', fontSize: 12, fontWeight: 700 }}>{s}</span>
              ))}
            </div>
            <a href="/resources/resume-guide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 12, border: '1.5px solid rgba(79,124,255,0.35)', background: 'rgba(79,124,255,0.08)', color: '#93BBFF', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Read the Guide →
            </a>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 10, textAlign: 'center' }}>2 chapters free · 2 more with email · all 7 with Resource Pack</div>
          </div>

          {/* Card 5: Resume Templates */}
          <div className="resource-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>
                  Free
                </span>
                {paid && (
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
                    Unlocked ✓
                  </span>
                )}
              </div>
              <a href="/resources/resume-templates" className="view-link">View Templates →</a>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>Resume Templates</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 16 }}>
              6 resume formats — LSE, IIM, DU, Startup, Finance, and Marketing. One free, rest with Resource Pack.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: '6 Templates', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
                { label: 'ATS-Optimized', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
              ].map(s => (
                <span key={s.label} style={{ padding: '5px 14px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 12, fontWeight: 700 }}>
                  {s.label}
                </span>
              ))}
            </div>

            <a href="/resources/resume-templates" className="view-link" style={{ fontSize: 15 }}>
              View Templates →
            </a>
            <div style={{ marginTop: 12 }}>
              <a href="/resources/resume-builder" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#93BBFF')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                Try the Free Resume Builder →
              </a>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 500 }}>
              1 free &bull; all 6 with Resource Pack
            </p>
          </div>

          {/* Card 6: Off-Campus Playbook — Coming Soon */}
          <div className="resource-card dim">
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                Coming Soon
              </span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, marginBottom: 8 }}>Off-Campus Playbook</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
              The full strategy guide — how to find companies, how to research them, when to email vs DM, how to handle follow-ups, and how to convert a reply into an offer.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}

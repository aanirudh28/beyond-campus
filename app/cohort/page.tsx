'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import LeadCapturePopup from '@/app/components/LeadCapturePopup'
import { NoiseOverlay } from '@/app/components/SiteChrome'

declare global {
  interface Window { Razorpay: any }
}

const INCLUSIONS = [
  { icon: '📅', t: '8 Weekly Live Sessions', d: 'Direct mentor access every week — no pre-recorded lectures' },
  { icon: '📧', t: '50+ Cold Email Templates', d: 'Proven across consulting, finance, Founder\'s Office, and BD' },
  { icon: '💼', t: 'Resume Rewrite', d: 'ATS-optimized for business roles, reviewed by a human' },
  { icon: '🔗', t: 'LinkedIn DM Scripts', d: 'Word-for-word messages for HRs, founders, and alumni' },
  { icon: '🎯', t: 'Personalized Company List', d: '30-50 companies built around your background and city' },
  { icon: '👥', t: 'Private WhatsApp Community', d: 'Students, alumni, and mentors in one active group' },
  { icon: '📱', t: 'Direct WhatsApp Support', d: 'Reach your mentor between sessions — no waiting' },
  { icon: '🔄', t: 'Lifetime Resource Access', d: 'All templates and guides, updated regularly' },
  { icon: '🤝', t: 'Warm Introductions', d: 'Direct intros to people at your target companies' },
]

const FAQS = [
  { q: 'Who is this for?', a: "Students and recent grads targeting consulting, finance, Founder's Office, marketing, BD, or operations — especially from tier-2 and tier-3 colleges where top companies don't recruit on campus." },
  { q: 'How is this different from a course or YouTube?', a: "Personalization, accountability, and referrals. We review YOUR resume, build YOUR target list, and make warm introductions where possible. No course does that." },
  { q: 'How soon will I see results?', a: "Most students get their first cold email reply within 2 weeks. Most have an active interview conversation by week 4." },
  { q: 'What if I miss a live session?', a: "Recordings are shared within 24 hours. Sessions are scheduled evenings and weekends to work around college timetables." },
  { q: 'Is ₹2,500 a one-time payment?', a: "Yes — one payment, lifetime access. No subscriptions, no hidden fees, no upsells." },
]

export default function CohortPage() {
  const [scrollY, setScrollY] = useState(0)
  const [showSticky, setShowSticky] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      const heroBottom = heroRef.current ? heroRef.current.getBoundingClientRect().bottom : 0
      setShowSticky(heroBottom < 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })

  const handleEnroll = async () => {
    setIsEnrolling(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Could not load payment gateway. Please try again.'); setIsEnrolling(false); return }
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'placement_cohort' }),
      })
      const { orderId, amount, key } = await res.json()
      new window.Razorpay({
        key, amount, currency: 'INR',
        name: 'Beyond Campus',
        description: 'Placement Cohort — 8-Week Program',
        order_id: orderId,
        theme: { color: '#4F7CFF' },
        modal: { ondismiss: () => setIsEnrolling(false) },
        handler: async (response: { razorpay_payment_id: string }) => {
          const supabase = createClient()
          await supabase.from('bookings').insert({ type: 'placement-cohort', payment_id: response.razorpay_payment_id, amount: 2500 })
          setEnrolled(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        },
      }).open()
    } catch {
      alert('Something went wrong. Please try again or reach us on WhatsApp.')
      setIsEnrolling(false)
    }
  }

  if (enrolled) {
    return (
      <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: 'var(--sans)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ maxWidth: 460, textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,5vw,40px)', lineHeight: 1.1, marginBottom: 14 }}>You're enrolled!</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 28 }}>
            Welcome to the Placement Cohort. Our team will reach out on WhatsApp within 2 hours with your onboarding details and community access.
          </p>
          <div style={{ background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 16, padding: '18px 22px', marginBottom: 28, textAlign: 'left' }}>
            {['WhatsApp community access within 2 hours', 'Onboarding scheduled this week', 'Resource folder shared immediately'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: i < 2 ? 8 : 0 }}>
                <span style={{ color: '#4F7CFF', fontWeight: 700, flexShrink: 0 }}>→</span>{s}
              </div>
            ))}
          </div>
          <a href="/" style={{ display: 'inline-block', padding: '13px 30px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Back to Home</a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: 'var(--sans)', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        .grad{background:linear-gradient(135deg,#4F7CFF,#7B61FF,#00D2FF);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .btn-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:16px 36px;border-radius:100px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);color:white;font-weight:800;font-size:16px;cursor:pointer;border:none;font-family:var(--sans);box-shadow:0 0 40px rgba(79,124,255,0.4);transition:all 0.25s}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 56px rgba(79,124,255,0.55)}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
        .btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 32px;border-radius:100px;background:transparent;color:rgba(255,255,255,0.8);font-weight:600;font-size:15px;cursor:pointer;border:1.5px solid rgba(255,255,255,0.18);font-family:var(--sans);transition:all 0.25s;text-decoration:none}
        .btn-outline:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.35);transform:translateY(-1px)}
        .inc-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;transition:all 0.3s}
        .inc-card:hover{border-color:rgba(79,124,255,0.35);transform:translateY(-3px)}
        .faq-item{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;transition:border-color 0.3s}
        .faq-item.open{border-color:rgba(79,124,255,0.3)}
        .faq-btn{width:100%;padding:18px 22px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;cursor:pointer;text-align:left;gap:14px;color:white;font-family:var(--sans);font-size:14px;font-weight:600;line-height:1.5}
        .faq-plus{font-size:20px;color:#4F7CFF;flex-shrink:0;transition:transform 0.3s}
        .faq-plus.open{transform:rotate(45deg)}
        .faq-body{overflow:hidden;transition:max-height 0.3s ease}
        .mobile-sticky{position:fixed;bottom:0;left:0;right:0;z-index:200;padding:12px 16px;background:rgba(11,11,15,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.07);animation:slideUp 0.3s ease;display:flex;gap:10px}
        @media(min-width:769px){.mobile-sticky{display:none!important}.grid-3{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:768px){.cta-row{flex-direction:column!important}}
      `}</style>

      <NoiseOverlay />

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: scrollY > 40 ? '13px 32px' : '18px 32px', background: scrollY > 40 ? 'rgba(11,11,15,0.92)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none', borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'var(--serif)', fontSize: 20, letterSpacing: -0.5, color: 'white' }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/book" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>Book Session</a>
          <button onClick={handleEnroll} disabled={isEnrolling} className="btn-primary" style={{ padding: '9px 22px', fontSize: 13 }}>
            Enroll — ₹2,500
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.7s ease both' }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,124,255,0.11),transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.28)', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 26 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            Enrollment Open · Placement Cohort
          </div>

          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,6vw,66px)', lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>
            Get Placed in 8 Weeks.<br />
            <span className="grad">No Campus Required.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.52)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto 32px' }}>
            Live sessions, proven outreach strategies, and direct mentor support — built for non-tech students going off-campus.
          </p>

          <div className="cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-primary" style={{ fontSize: 17, padding: '17px 40px' }}>
              {isEnrolling
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Opening...</>
                : 'Enroll Now — ₹2,500 →'}
            </button>
            <button onClick={() => setPopupOpen(true)} className="btn-outline">
              Talk to a Mentor First
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', justifyContent: 'center' }}>
            {['300+ students placed', '50+ colleges', 'Results in 2 weeks', '🔒 Secure checkout'].map((item, i) => (
              <span key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.33)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>}{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ padding: '72px 24px', background: 'rgba(255,255,255,0.013)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>WHAT'S INCLUDED</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,4vw,38px)', lineHeight: 1.15 }}>Everything you need to get placed</h2>
          </div>
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {INCLUSIONS.map((inc, i) => (
              <div key={i} className="inc-card">
                <div style={{ fontSize: 22, marginBottom: 10 }}>{inc.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 5 }}>{inc.t}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{inc.d}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a href="/program" style={{ fontSize: 13, color: '#4F7CFF', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid rgba(79,124,255,0.35)', paddingBottom: 2 }}>
              See the full 8-week curriculum →
            </a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '72px 24px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>PRICING</span>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px,4vw,38px)', lineHeight: 1.15 }}>One payment. Lifetime access.</h2>
        </div>

        <div style={{ background: '#111827', border: '1.5px solid rgba(79,124,255,0.38)', borderRadius: 26, padding: '36px 32px', position: 'relative', boxShadow: '0 0 0 1px rgba(79,124,255,0.1),0 20px 72px rgba(79,124,255,0.16)' }}>
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', borderRadius: '0 0 10px 10px', padding: '5px 18px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Placement Cohort
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: -2, lineHeight: 1 }}>₹2,500</span>
              <div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.22)', textDecoration: 'line-through' }}>₹6,000</div>
                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '2px 9px', borderRadius: 100, display: 'inline-block', marginTop: 3 }}>58% off</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 26 }}>One-time · Lifetime access · No hidden fees</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {['8 weekly live sessions', '50+ cold email templates', 'Resume rewrite by a mentor', 'LinkedIn DM scripts', 'Personalized company target list', 'Private WhatsApp community + direct support', 'Lifetime resource access', 'Warm introductions to target companies'].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#4F7CFF', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>

            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-primary" style={{ width: '100%', padding: '17px', fontSize: 16 }}>
              {isEnrolling
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Opening...</>
                : 'Enroll Now — ₹2,500 →'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>🔒 Secure checkout via Razorpay</div>
            <div style={{ textAlign: 'center', marginTop: 12, padding: '9px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, fontSize: 12, color: '#6ee7b7', lineHeight: 1.6 }}>
              Took the ₹549 strategy call in the last 30 days? It&apos;s fully credited — reply to your booking
              confirmation email and we&apos;ll send your discounted enrollment link.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>Not sure if this is right for you?</p>
          <button onClick={() => setPopupOpen(true)} className="btn-outline" style={{ fontSize: 13, padding: '11px 26px' }}>
            Talk to a Mentor First — it's free
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 24px', background: 'rgba(255,255,255,0.013)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>FAQ</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3.5vw,34px)', lineHeight: 1.2 }}>Common questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.78)' }}>{faq.q}</span>
                  <span className={`faq-plus${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className="faq-body" style={{ maxHeight: openFaq === i ? 200 : 0 }}>
                  <div style={{ padding: '0 22px 20px', fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.8 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '88px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,5vw,46px)', lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 16 }}>
            Your next offer is one<br />
            <span className="grad">strategy away.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 32 }}>
            Every week without a system is a week someone else is sending the cold email you didn't.
          </p>
          <div className="cta-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-primary" style={{ padding: '17px 40px', fontSize: 16 }}>
              Enroll Now — ₹2,500 →
            </button>
            <button onClick={() => setPopupOpen(true)} className="btn-outline" style={{ padding: '16px 32px', fontSize: 15 }}>
              Talk to a Mentor First
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
        © {new Date().getFullYear()} Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.28)' }}>beyond-campus.in</a>
      </div>

      {/* MOBILE STICKY */}
      {showSticky && (
        <div className="mobile-sticky">
          <button onClick={handleEnroll} disabled={isEnrolling} className="btn-primary" style={{ flex: 1, padding: '13px', fontSize: 14 }}>
            Enroll — ₹2,500
          </button>
          <button onClick={() => setPopupOpen(true)} className="btn-outline" style={{ flexShrink: 0, fontSize: 13, padding: '12px 18px', whiteSpace: 'nowrap' }}>
            Ask a Mentor
          </button>
        </div>
      )}

      <LeadCapturePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} preselectedCohort="Placement Cohort" />
    </main>
  )
}

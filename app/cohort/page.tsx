'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import LeadCapturePopup from '@/app/components/LeadCapturePopup'

declare global {
  interface Window { Razorpay: any }
}

const WEEKS = [
  { icon: '🎯', num: 1, label: 'Foundation & Diagnosis', items: ['Full resume audit and rewrite', 'LinkedIn + Naukri optimization', 'Identifying your target roles and companies', 'Building your personalized hit list'] },
  { icon: '📧', num: 2, label: 'Cold Email Mastery', items: ['Templates that actually get replies', 'Subject line formulas that work', 'Follow-up sequences that convert', 'Setting up mail merge for scale'] },
  { icon: '💼', num: 3, label: 'LinkedIn & DM Strategy', items: ['DM scripts for HRs, founders, and alumni', 'Connection and comment strategy', 'Getting noticed without paid promotion', 'Turning connections into conversations'] },
  { icon: '🏢', num: 4, label: 'Targeting & Research', items: ['Finding the right people to contact', 'Using Apollo, Hunter.io, LinkedIn', 'Startup vs corporate targeting', 'Reading JDs to position yourself'] },
  { icon: '🗣️', num: 5, label: 'Interview Preparation', items: ['HR round prep for business roles', 'Common internship interview questions', 'Finance and consulting basics', 'Talking confidently about your background'] },
  { icon: '🔗', num: 6, label: 'Referrals & Warm Intros', items: ['Getting referrals without knowing anyone', 'Alumni outreach that actually works', 'Warm intro strategy through LinkedIn', 'Leveraging seniors and events'] },
  { icon: '📊', num: 7, label: 'Tracking & Optimizing', items: ['Building your outreach tracker', 'What to do when you get no replies', 'A/B testing your messages', 'Doubling down on what works'] },
  { icon: '🎉', num: 8, label: 'Converting Conversations', items: ['Following up after interviews', 'Negotiating stipend and role details', 'Handling rejections and staying in the game', 'Setting yourself up for a PPO'] },
]

const INCLUSIONS = [
  { icon: '📅', title: '8 Weekly Live Sessions', desc: 'Direct mentor access every week — no recorded lectures, no passive learning' },
  { icon: '📧', title: '50+ Cold Email Templates', desc: 'Proven across consulting, finance, Founder\'s Office, marketing, and BD' },
  { icon: '💼', title: 'ATS-Optimized Resume Template', desc: 'Built specifically for non-tech business internship roles' },
  { icon: '🔗', title: 'LinkedIn DM Scripts', desc: 'Word-for-word messages for HRs, founders, and alumni' },
  { icon: '🎯', title: 'Personalized Company List', desc: '30-50 companies built for your background, domain, and city — not a generic spreadsheet' },
  { icon: '👥', title: 'Private WhatsApp Community', desc: 'Students, alumni, and mentors in one active support group' },
  { icon: '📱', title: 'Direct WhatsApp Support', desc: 'Message your mentor between sessions — no waiting till next week' },
  { icon: '🔄', title: 'Lifetime Resource Access', desc: 'All templates, scripts, and guides. Updated as hiring trends shift.' },
  { icon: '🤝', title: 'Warm Introductions', desc: 'Direct intros to people at your target companies when possible' },
]

const RESULTS = [
  { name: 'Arjun S.', college: 'Tier-3 College, UP', outcome: 'Internship at BCG Mumbai', detail: 'Landed after 18 cold emails in week 3' },
  { name: 'Sneha R.', college: 'GGSIPU, Delhi', outcome: 'Offer from a Series B startup', detail: 'Founder\'s Office role, ₹25,000/month' },
  { name: 'Mihir P.', college: 'Symbiosis Pune', outcome: 'EY internship — no referral', detail: 'Pure cold email, 2nd application attempt' },
  { name: 'Divya K.', college: 'NMIMS Mumbai', outcome: 'Marketing role at Zepto', detail: 'Got the intro through our WhatsApp network' },
]

const FAQS = [
  { q: 'I have no internship experience at all. Can I still join?', a: "Yes — that's exactly who this program is built for. The resume template, outreach scripts, and targeting strategy are designed for students starting from zero. Most of our best results come from students who had no prior experience." },
  { q: "I'm from a tier-2 or tier-3 college. Will this work for me?", a: "Most of our students are from tier-2 and tier-3 colleges — not the IIMs or IITs. The off-campus approach we teach works regardless of college name. Companies hire through cold outreach and referrals every day, and we teach you exactly how to use both." },
  { q: 'What domains does the internship cohort cover?', a: "Consulting, finance, Founder's Office, marketing, business development, and operations. We focus exclusively on non-tech business roles — no coding, no SDE prep." },
  { q: 'How soon can I realistically expect an offer?', a: "Most students get their first cold email reply within 2 weeks. By week 4, most have at least one active interview conversation. Full offers typically come between weeks 5–8 depending on the domain and how aggressively you apply the strategies." },
  { q: 'What if I miss a live session?', a: "Recordings are shared with the group within 24 hours of every session. Sessions are also scheduled for evenings and weekends to minimize conflicts with college schedules." },
  { q: 'Is ₹1,750 a one-time payment? Any hidden costs?', a: "One payment. Lifetime access. No subscriptions, no upsells, no hidden fees. You also get access to all future updates to the resource library at no extra cost." },
]

function useFadeUp(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function FadeUp({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  const { ref, visible } = useFadeUp()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`, ...style }}>
      {children}
    </div>
  )
}

export default function CohortPage() {
  const [scrollY, setScrollY] = useState(0)
  const [showMobileSticky, setShowMobileSticky] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      const heroBottom = heroRef.current ? heroRef.current.getBoundingClientRect().bottom : 0
      setShowMobileSticky(heroBottom < 0)
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
        body: JSON.stringify({ amount: 1750 }),
      })
      const { orderId, amount, key } = await res.json()
      new window.Razorpay({
        key,
        amount,
        currency: 'INR',
        name: 'Beyond Campus',
        description: 'Internship Cohort — 8-Week Program',
        order_id: orderId,
        theme: { color: '#4F7CFF' },
        modal: { ondismiss: () => setIsEnrolling(false) },
        handler: async (response: { razorpay_payment_id: string }) => {
          const supabase = createClient()
          await supabase.from('bookings').insert({ type: 'internship-cohort', payment_id: response.razorpay_payment_id, amount: 1750 })
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
      <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>
          <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🎉</div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,5vw,40px)', lineHeight: 1.1, marginBottom: 16 }}>You're In!</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 32 }}>
            Welcome to the Internship Cohort. Our team will reach out on WhatsApp within 2 hours with your onboarding details and community access.
          </p>
          <div style={{ background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#4F7CFF', marginBottom: 10 }}>What happens next:</div>
            {['WhatsApp group access within 2 hours', 'Onboarding call scheduled this week', 'Resource folder shared immediately', 'First live session this weekend'].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                <span style={{ color: '#4F7CFF', fontWeight: 700, flexShrink: 0 }}>→</span>{step}
              </div>
            ))}
          </div>
          <a href="/" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Back to Home</a>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes pulseDot{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,0.5)}70%{opacity:0.8;box-shadow:0 0 0 6px rgba(34,197,94,0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .gradient-text{background:linear-gradient(135deg,#4F7CFF,#7B61FF,#00D2FF);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .btn-enroll{display:inline-flex;align-items:center;gap:8px;padding:16px 36px;border-radius:100px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);color:white;font-weight:800;font-size:16px;cursor:pointer;border:none;font-family:"DM Sans",sans-serif;box-shadow:0 0 40px rgba(79,124,255,0.45);transition:all 0.25s;letter-spacing:0.2px}
        .btn-enroll:hover{transform:translateY(-2px);box-shadow:0 0 60px rgba(79,124,255,0.6)}
        .btn-enroll:disabled{opacity:0.6;cursor:not-allowed;transform:none}
        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:15px 32px;border-radius:100px;background:transparent;color:rgba(255,255,255,0.8);font-weight:600;font-size:15px;cursor:pointer;border:1.5px solid rgba(255,255,255,0.18);font-family:"DM Sans",sans-serif;transition:all 0.25s;text-decoration:none}
        .btn-ghost:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.35);transform:translateY(-1px)}
        .week-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px 24px;transition:all 0.3s;cursor:default}
        .week-card:hover{border-color:rgba(79,124,255,0.35);transform:translateY(-3px);box-shadow:0 12px 40px rgba(79,124,255,0.12)}
        .inclusion-card{background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:18px;padding:22px;transition:all 0.3s}
        .inclusion-card:hover{border-color:rgba(79,124,255,0.35);transform:translateY(-3px);box-shadow:0 12px 36px rgba(79,124,255,0.1)}
        .result-card{background:linear-gradient(135deg,rgba(79,124,255,0.07),rgba(123,97,255,0.04));border:1px solid rgba(79,124,255,0.2);border-radius:18px;padding:24px;transition:all 0.3s}
        .result-card:hover{border-color:rgba(79,124,255,0.4);transform:translateY(-3px)}
        .faq-item{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:14px;overflow:hidden;transition:border-color 0.3s}
        .faq-item.open{border-color:rgba(79,124,255,0.35)}
        .faq-btn{width:100%;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;cursor:pointer;text-align:left;gap:16px;color:white;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:600;line-height:1.5}
        .faq-plus{font-size:22px;color:#4F7CFF;flex-shrink:0;transition:transform 0.3s;display:inline-block;line-height:1}
        .faq-plus.open{transform:rotate(45deg)}
        .faq-body{overflow:hidden;transition:max-height 0.35s ease}
        .nav-link{font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);text-decoration:none;transition:color 0.2s}
        .nav-link:hover{color:white}
        .mobile-sticky{position:fixed;bottom:0;left:0;right:0;z-index:200;padding:14px 16px;background:rgba(11,11,15,0.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.07);animation:slideUp 0.3s ease both;display:flex;gap:10px}
        @media(min-width:769px){.mobile-sticky{display:none!important}.two-col{grid-template-columns:repeat(2,1fr)!important}.three-col{grid-template-columns:repeat(3,1fr)!important}.four-col{grid-template-columns:repeat(4,1fr)!important}}
        @media(max-width:768px){.hero-btns{flex-direction:column!important;align-items:stretch!important}.hero-btns>*{text-align:center;justify-content:center}}
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.3s', padding: scrollY > 40 ? '14px 40px' : '20px 40px', background: scrollY > 40 ? 'rgba(11,11,15,0.92)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none', borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, letterSpacing: -0.5, color: 'white' }}>
            Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a href="/program" className="nav-link">Placement Cohort</a>
            <a href="/book" className="nav-link">Book Session</a>
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-enroll" style={{ padding: '10px 24px', fontSize: 13 }}>
              {isEnrolling ? 'Opening...' : 'Enroll Now — ₹1,750'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,124,255,0.12),transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -100, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(79,124,255,0.1)', filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: -60, right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(123,97,255,0.1)', filter: 'blur(100px)', pointerEvents: 'none', opacity: 0.5 }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, animation: 'fadeUp 0.7s ease both' }}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 100, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 28, letterSpacing: 0.3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0, animation: 'pulseDot 2s ease-in-out infinite' }} />
            Enrollment Open · Internship Cohort
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(38px,6vw,68px)', lineHeight: 1.05, letterSpacing: -2, marginBottom: 22 }}>
            Land Your First Internship<br />
            <span className="gradient-text">Without Campus Placements</span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto 36px' }}>
            8 weeks. Live sessions. Proven outreach strategies. Built for non-tech students from tier-2 and tier-3 colleges who are done waiting.
          </p>

          {/* CTAs */}
          <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-enroll">
              {isEnrolling
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Opening...</>
                : 'Enroll Now — ₹1,750 →'
              }
            </button>
            <button onClick={() => setPopupOpen(true)} className="btn-ghost">
              Talk to a Mentor First
            </button>
          </div>

          {/* Trust strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center' }}>
            {['300+ students helped', 'Replies in 2 weeks', '50+ colleges', '🔒 Secure checkout'].map((item, i, arr) => (
              <span key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* RESULT CARDS */}
      <section style={{ padding: '0 24px 80px' }}>
        <FadeUp style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>REAL RESULTS</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,40px)', lineHeight: 1.15 }}>Students who stopped waiting</h2>
          </div>
          <div className="four-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
            {RESULTS.map((r, i) => (
              <div key={i} className="result-card">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 16, flexShrink: 0 }}>
                  {r.name[0]}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>{r.outcome}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>{r.detail}</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  {r.name} · {r.college}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* WHO IT'S FOR */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.014)' }}>
        <FadeUp style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>IS THIS FOR YOU?</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.15 }}>Built for students the system left behind</h2>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
            {[
              { icon: '🏫', t: 'Tier-2 or tier-3 college', d: "Top companies don't walk onto your campus. You know you have to find your own path in." },
              { icon: '📬', t: 'Applying but not hearing back', d: 'You send applications into the void and get nothing. The strategy is wrong, not the effort.' },
              { icon: '🎯', t: 'Targeting business roles', d: "Consulting, finance, Founder's Office, marketing, BD — any non-tech domain you're chasing." },
              { icon: '🗂️', t: 'Want a system, not just advice', d: "You're done with vague motivation. You want a step-by-step process that moves the needle." },
              { icon: '🌐', t: 'No network to fall back on', d: "You don't have IIM alumni in the family or seniors who can get you a referral. Starting from zero." },
              { icon: '💪', t: 'Ready to do the actual work', d: "You'll send the cold emails and make the calls — if someone shows you exactly how. That's us." },
            ].map((c, i) => (
              <div key={i} style={{ background: '#0f1520', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px 22px', transition: 'all 0.3s', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,rgba(79,124,255,0.16),rgba(123,97,255,0.1))', border: '1px solid rgba(79,124,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{c.t}</div>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{c.d}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Not for you if —</span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
              {["You want a shortcut without effort", "You won't send cold emails or DMs", "You prefer watching videos passively"].map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100, fontSize: 12, color: 'rgba(255,255,255,0.38)' }}>
                  <span style={{ fontSize: 10, color: 'rgba(239,68,68,0.5)' }}>✕</span>{t}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* CURRICULUM */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>THE CURRICULUM</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.15 }}>8 weeks. Every skill you need.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', marginTop: 12, maxWidth: 440, margin: '12px auto 0', lineHeight: 1.7 }}>One live session per week, plus full async support between sessions.</p>
          </div>
          <div className="two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
            {WEEKS.map((week, i) => (
              <div key={i} className="week-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{week.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF', marginBottom: 2 }}>Week {week.num}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{week.label}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {week.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>
                      <span style={{ color: '#4F7CFF', fontSize: 11, marginTop: 3, flexShrink: 0 }}>→</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.014)' }}>
        <FadeUp style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>WHAT'S INCLUDED</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.15 }}>Everything you need. Nothing you don't.</h2>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginBottom: 28 }}>
            {INCLUSIONS.map((inc, i) => (
              <div key={i} className="inclusion-card">
                <div style={{ fontSize: 26, marginBottom: 12 }}>{inc.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>{inc.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.65 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
          {/* Value highlight */}
          <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.1),rgba(123,97,255,0.06))', border: '1.5px solid rgba(79,124,255,0.28)', borderRadius: 18, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 4 }}>Early Enrollment Bonus</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Get a personal 30-minute 1:1 strategy call included at no extra cost — for students who enroll this week.</div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: 640, margin: '0 auto' }}>
        <FadeUp>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>ENROLLMENT</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.15, marginBottom: 10 }}>One decision. One investment.</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>Less than one month of Spotify Premium for an outcome that changes your career trajectory.</p>
          </div>

          <div style={{ background: '#111827', border: '1.5px solid rgba(79,124,255,0.4)', borderRadius: 28, padding: '40px 36px', position: 'relative', boxShadow: '0 0 0 1px rgba(79,124,255,0.1), 0 24px 80px rgba(79,124,255,0.18)' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', borderRadius: '0 0 12px 12px', padding: '5px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Internship Cohort
            </div>

            <div style={{ marginTop: 16 }}>
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: 'white', letterSpacing: -2, lineHeight: 1 }}>₹1,750</span>
                <div>
                  <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through', lineHeight: 1 }}>₹6,000</div>
                  <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '2px 10px', borderRadius: 100, display: 'inline-block', marginTop: 4 }}>71% off</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>One-time payment · Lifetime access · No subscriptions</div>

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 32 }}>
                {[
                  '8 weekly live sessions with your mentor',
                  '50+ cold email templates across all domains',
                  'ATS-optimized resume template',
                  'LinkedIn DM scripts for HRs, founders, and alumni',
                  'Personalized company target list (30-50 companies)',
                  'Private WhatsApp community access',
                  'Direct WhatsApp support between sessions',
                  'Lifetime access to all resources',
                  'Warm introductions to target companies',
                  'Bonus: 30-min 1:1 strategy call (this week only)',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
                    <span style={{ color: '#4F7CFF', fontWeight: 700, flexShrink: 0, fontSize: 15 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              {/* Main CTA */}
              <button onClick={handleEnroll} disabled={isEnrolling} className="btn-enroll" style={{ width: '100%', justifyContent: 'center', fontSize: 17, padding: '18px 36px' }}>
                {isEnrolling
                  ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Opening...</>
                  : 'Enroll Now — ₹1,750 →'
                }
              </button>

              <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
                🔒 Secure checkout via Razorpay · 100% safe
              </div>
            </div>
          </div>

          {/* Talk to mentor nudge */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginBottom: 12 }}>Not sure if this is the right fit for you?</p>
            <button onClick={() => setPopupOpen(true)} className="btn-ghost" style={{ fontSize: 14, padding: '12px 28px' }}>
              Talk to a Mentor First — it's free
            </button>
          </div>
        </FadeUp>
      </section>

      {/* COMPARISON */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.014)' }}>
        <FadeUp style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>WHY NOT JUST...</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(24px,4vw,38px)', lineHeight: 1.15 }}>Beyond Campus vs. The Alternatives</h2>
          </div>
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5 }}></div>
              <div style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>Others</div>
              <div style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: '#4F7CFF', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>Beyond Campus</div>
            </div>
            {[
              ['Personalized strategy for your profile', false, true],
              ['Live mentor access (not recorded)', false, true],
              ['Real company introductions', false, true],
              ['Resume reviewed by a human', false, true],
              ['Weekly accountability', false, true],
              ['Built for tier-2/3 colleges', false, true],
              ['Outreach templates that actually work', false, true],
            ].map(([label, them, us], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.045)' : 'none' }}>
                <div style={{ padding: '15px 20px', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{label as string}</div>
                <div style={{ padding: '15px 20px', textAlign: 'center', fontSize: 16, borderLeft: '1px solid rgba(255,255,255,0.045)', color: 'rgba(239,68,68,0.6)' }}>{them ? '✓' : '✕'}</div>
                <div style={{ padding: '15px 20px', textAlign: 'center', fontSize: 16, borderLeft: '1px solid rgba(255,255,255,0.045)', color: '#4ade80', fontWeight: 700 }}>{us ? '✓' : '✕'}</div>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px' }}>
        <FadeUp style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF', display: 'block', marginBottom: 10 }}>FAQ</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(24px,4vw,40px)', lineHeight: 1.15 }}>Your questions, answered</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.8)' }}>{faq.q}</span>
                  <span className={`faq-plus${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className="faq-body" style={{ maxHeight: openFaq === i ? 240 : 0 }}>
                  <div style={{ padding: '0 24px 22px', fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Have a different question?</p>
            <button onClick={() => setPopupOpen(true)} className="btn-ghost" style={{ fontSize: 14, padding: '11px 26px' }}>Book a Free Mentor Call</button>
          </div>
        </FadeUp>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,124,255,0.1),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <FadeUp style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(30px,5vw,52px)', lineHeight: 1.08, letterSpacing: -1.5, marginBottom: 18 }}>
            The right internship won't<br />
            <span className="gradient-text">find you on its own.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
            Every week without a strategy is a week someone else is sending the cold email you didn't.
          </p>
          <div className="hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button onClick={handleEnroll} disabled={isEnrolling} className="btn-enroll" style={{ padding: '18px 44px', fontSize: 17 }}>
              Enroll Now — ₹1,750 →
            </button>
            <button onClick={() => setPopupOpen(true)} className="btn-ghost" style={{ padding: '17px 36px', fontSize: 15 }}>
              Talk to a Mentor First
            </button>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>🔒 Razorpay secure checkout · One-time payment · Lifetime access</div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 13 }}>
        © 2025 Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.28)' }}>beyond-campus.in</a>
      </div>

      {/* MOBILE STICKY */}
      {showMobileSticky && (
        <div className="mobile-sticky">
          <button onClick={handleEnroll} disabled={isEnrolling} className="btn-enroll" style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '13px 20px' }}>
            Enroll — ₹1,750
          </button>
          <button onClick={() => setPopupOpen(true)} className="btn-ghost" style={{ flexShrink: 0, fontSize: 13, padding: '12px 18px', whiteSpace: 'nowrap' }}>
            Ask a Mentor
          </button>
        </div>
      )}

      {/* LEAD CAPTURE POPUP */}
      <LeadCapturePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} preselectedCohort="Internship Cohort" />
    </main>
  )
}

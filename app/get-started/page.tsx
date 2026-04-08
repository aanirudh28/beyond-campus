'use client'

import { useState, useEffect, useRef } from 'react'

const Q1_OPTIONS = [
  { icon: '🎓', label: 'Still in college — placements haven\'t started yet' },
  { icon: '📚', label: 'Final year — placements are happening but I\'m not getting through' },
  { icon: '🎯', label: 'Recently graduated — actively job hunting' },
  { icon: '💼', label: 'Working — looking to switch to a better role' },
]

const Q2_OPTIONS = [
  { icon: '📄', label: 'My resume isn\'t getting shortlisted' },
  { icon: '📩', label: 'I\'m applying everywhere but getting no replies' },
  { icon: '🔗', label: 'I don\'t have referrals or a network' },
  { icon: '😰', label: 'I don\'t know where to start or what to do' },
]

function getRecommendation(q1: number) {
  if (q1 === 0) {
    return {
      product: '8-Week Cohort Program',
      reason: 'You have time to build your strategy properly before placements hit. The cohort gives you the full system — resume, outreach, referrals, and live coaching — so you\'re ready to strike the moment placements open.',
      highlight: 'cohort',
    }
  }
  if (q1 === 1) {
    return {
      product: 'Cohort or 1:1 Session — either works',
      reason: 'Placements are live, so speed matters — but so does having the right system. A 1:1 session gets you moving fast with a personalized plan. The cohort gives you the full toolkit plus weekly accountability to keep pushing through the season. Both are strong choices here.',
      highlight: 'both',
    }
  }
  return {
    product: '1:1 Mentorship Session',
    reason: 'Your situation is urgent and specific. A personalized session gets you an action plan, a reviewed resume, and a cold outreach strategy in one hour — exactly what you need to start moving fast.',
    highlight: 'session',
  }
}

export default function GetStarted() {
  const [q1, setQ1] = useState<number | null>(null)
  const [q2, setQ2] = useState<number | null>(null)
  const [showQ2, setShowQ2] = useState(false)
  const [showRec, setShowRec] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const recRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleQ1(i: number) {
    setQ1(i)
    setTimeout(() => setShowQ2(true), 300)
  }

  function handleQ2(i: number) {
    setQ2(i)
    setTimeout(() => {
      setShowRec(true)
      setTimeout(() => {
        recRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }, 300)
  }

  const rec = q1 !== null ? getRecommendation(q1) : null

  const FAQS = [
    { q: 'Do I need to choose between the session and the cohort right now?', a: 'No. Most students start with the ₹299 session to get clarity, and then decide on the cohort. Either way, you\'re moving forward.' },
    { q: 'What domains do you help with?', a: 'Consulting, finance, Founder\'s Office, marketing, business development, and operations. We focus exclusively on non-tech business roles.' },
    { q: 'I\'m from a tier-2 or tier-3 college. Will this work for me?', a: 'Yes — that\'s exactly who we built this for. Most of our students come from colleges outside the top 10 and break into roles their college placement cell couldn\'t get them.' },
    { q: 'How quickly can I get started after paying?', a: 'Immediately. You\'ll get a confirmation email within 2 minutes, dashboard access, and for cohort students — WhatsApp group access the same day.' },
  ]

  const step = q1 === null ? 1 : q2 === null ? 2 : 3

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans', 'Inter', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes checkPop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2);} 100%{transform:scale(1);opacity:1} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        .gradient-text { background: linear-gradient(135deg, #4F7CFF, #7B61FF, #00D2FF); background-size: 300% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }

        .quiz-card {
          background: #111827;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.5s ease both;
          text-align: left;
          width: 100%;
        }
        .quiz-card:hover {
          border-color: rgba(79,124,255,0.5);
          background: rgba(79,124,255,0.07);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(79,124,255,0.15);
        }
        .quiz-card.selected {
          border-color: #4F7CFF;
          background: rgba(79,124,255,0.12);
          box-shadow: 0 0 0 1px rgba(79,124,255,0.4), 0 8px 32px rgba(79,124,255,0.2);
        }
        .quiz-card .check {
          width: 24px; height: 24px; border-radius: 50%;
          background: #4F7CFF;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-left: auto;
          animation: checkPop 0.3s ease both;
          font-size: 13px;
        }
        .product-card {
          background: #111827;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 36px 32px;
          transition: all 0.35s ease;
          position: relative;
          overflow: hidden;
          flex: 1;
        }
        .product-card.recommended {
          border-color: rgba(79,124,255,0.5);
          box-shadow: 0 0 0 1px rgba(79,124,255,0.2), 0 24px 64px rgba(79,124,255,0.18);
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(79,124,255,0.2);
          border-color: rgba(79,124,255,0.4);
        }
        .check-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.6; }
        .section-label { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #4F7CFF; margin-bottom: 14px; display: block; }
        .proof-card { background: #111827; border-left: 4px solid #4F7CFF; border-radius: 16px; padding: 22px 24px; display: flex; align-items: flex-start; gap: 14px; transition: transform 0.3s; flex: 1; min-width: 220px; }
        .proof-card:hover { transform: translateX(4px); }
        .faq-item { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; transition: border-color 0.3s; }
        .faq-item.open { border-color: rgba(79,124,255,0.35); }
        .faq-btn { width: 100%; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; background: transparent; border: none; cursor: pointer; text-align: left; gap: 16px; color: white; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; line-height: 1.5; }
        .faq-plus { font-size: 20px; color: #4F7CFF; flex-shrink: 0; transition: transform 0.3s; display: inline-block; line-height: 1; }
        .faq-plus.open { transform: rotate(45deg); }
        .faq-body { overflow: hidden; transition: max-height 0.35s ease; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .nav.scrolled { background: rgba(11,11,15,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 40px; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 15px 32px; border-radius: 100px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 28px rgba(79,124,255,0.35); font-family: 'DM Sans', sans-serif; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(79,124,255,0.55); }
        .btn-outlined { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 100px; background: transparent; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: 1.5px solid rgba(255,255,255,0.2); font-family: 'DM Sans', sans-serif; }
        .btn-outlined:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }
        .rec-box { background: linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.07)); border: 1.5px solid rgba(79,124,255,0.35); border-radius: 24px; padding: 36px; margin-bottom: 32px; animation: fadeUp 0.6s ease both; }
        .progress-bar { display: flex; align-items: center; gap: 8px; justify-content: center; margin-bottom: 48px; }
        .progress-step { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
        .progress-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; transition: all 0.4s; }
        .progress-line { width: 48px; height: 2px; background: rgba(255,255,255,0.12); border-radius: 2px; overflow: hidden; position: relative; }
        .progress-line-fill { height: 100%; background: #4F7CFF; border-radius: 2px; transition: width 0.5s ease; }
        @media(max-width:768px) {
          .nav { padding: 16px 20px; }
          .nav.scrolled { padding: 12px 20px; }
          .products-row { flex-direction: column !important; }
          .proof-row { flex-direction: column !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, letterSpacing: -0.5, textDecoration: 'none', color: 'white' }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/book" className="btn-outlined" style={{ padding: '9px 22px', fontSize: 13 }}>Book Session</a>
          <a href="/cohort" className="btn-primary" style={{ padding: '9px 22px', fontSize: 13 }}>Join Cohort</a>
        </div>
      </nav>

      {/* SECTION 1 — HERO + QUIZ */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,124,255,0.12), transparent)', top: '20%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite' }} />

        <div style={{ maxWidth: 680, width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Hero text */}
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#93BBFF', marginBottom: 28, letterSpacing: 0.5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7CFF', display: 'inline-block', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
              Takes 30 seconds
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(36px, 6vw, 60px)', lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 18 }}>
              Let's Figure Out<br />
              <span className="gradient-text">Your Next Move</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto' }}>
              Answer 2 quick questions and we'll show you exactly where to start.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="progress-bar" style={{ animation: 'fadeUp 0.7s ease 0.1s both' }}>
            {['Step 1', 'Step 2', 'Done'].map((label, i) => {
              const active = step === i + 1
              const done = step > i + 1
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-dot" style={{ background: done ? '#4F7CFF' : active ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.06)', color: done || active ? 'white' : 'rgba(255,255,255,0.3)', border: active ? '1.5px solid #4F7CFF' : done ? 'none' : '1.5px solid rgba(255,255,255,0.12)' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'white' : done ? '#4F7CFF' : 'rgba(255,255,255,0.3)' }}>{label}</span>
                  </div>
                  {i < 2 && (
                    <div className="progress-line" style={{ marginLeft: 4 }}>
                      <div className="progress-line-fill" style={{ width: step > i + 1 ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Q1 */}
          <div style={{ animation: 'fadeUp 0.7s ease 0.15s both' }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF', marginBottom: 16 }}>Where are you right now?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Q1_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-card${q1 === i ? ' selected' : ''}`}
                  style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                  onClick={() => handleQ1(i)}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{opt.label}</span>
                  {q1 === i && <div className="check">✓</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          {showQ2 && (
            <div style={{ marginTop: 32, animation: 'fadeUp 0.5s ease both' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF', marginBottom: 16 }}>What's your biggest challenge?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Q2_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    className={`quiz-card${q2 === i ? ' selected' : ''}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => handleQ2(i)}
                  >
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{opt.label}</span>
                    {q2 === i && <div className="check">✓</div>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2 — RECOMMENDATION */}
      {showRec && rec && (
        <section ref={recRef} style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeUp 0.6s ease both' }}>
            <span className="section-label">Your Recommendation</span>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.15, letterSpacing: -1, marginBottom: 0 }}>
              Here's where to start
            </h2>
          </div>

          {/* Rec highlight box */}
          <div className="rec-box" style={{ maxWidth: 680, margin: '0 auto 48px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>✨</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#93BBFF', marginBottom: 8 }}>Based on your answers, we recommend:</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, marginBottom: 12, lineHeight: 1.2 }}>{rec.product}</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{rec.reason}</div>
              </div>
            </div>
          </div>

          {/* Both product cards */}
          <div className="products-row" style={{ display: 'flex', gap: 24, alignItems: 'stretch' }}>
            {/* 1:1 Session */}
            <div className={`product-card${rec.highlight === 'session' || rec.highlight === 'both' ? ' recommended' : ''}`}>
              {(rec.highlight === 'session' || rec.highlight === 'both') && (
                <div style={{ position: 'absolute', top: -1, left: 28, padding: '5px 16px', background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>{rec.highlight === 'both' ? 'Great starting point' : 'Recommended for you'}</div>
              )}
              <div style={{ marginTop: rec.highlight === 'session' ? 20 : 0 }}>
                <div style={{ display: 'inline-flex', padding: '5px 14px', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#93BBFF', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' }}>Best for urgent situations</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, lineHeight: 1.2, marginBottom: 20 }}>1:1 Mentorship<br />Session</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#4F7CFF' }}>₹299</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹999</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>1 hour · Live call</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {[
                    'Resume audit and rewrite plan',
                    'Personalized cold outreach strategy',
                    'LinkedIn and Naukri profile review',
                    'Target company hit list for your domain',
                    'Direct WhatsApp access for 7 days after session',
                  ].map((f, i) => (
                    <div key={i} className="check-item">
                      <span style={{ color: '#4F7CFF', fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="/book" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                  Book My Session →
                </a>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Most students book this first before deciding on the cohort
                </p>
              </div>
            </div>

            {/* Cohort */}
            <div className={`product-card${rec.highlight === 'cohort' || rec.highlight === 'both' ? ' recommended' : ''}`} style={{ background: rec.highlight === 'cohort' || rec.highlight === 'both' ? 'linear-gradient(135deg, rgba(79,124,255,0.07), rgba(123,97,255,0.04))' : '#111827' }}>
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '5px 18px', background: rec.highlight === 'cohort' || rec.highlight === 'both' ? 'linear-gradient(135deg,#4F7CFF,#7B61FF)' : 'rgba(123,97,255,0.2)', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap', color: 'white' }}>
                {rec.highlight === 'cohort' ? 'Recommended for you' : rec.highlight === 'both' ? 'Also a great fit' : 'Most Popular'}
              </div>
              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'inline-flex', padding: '5px 14px', background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#C4B5FD', marginBottom: 20, letterSpacing: 1, textTransform: 'uppercase' }}>Cohort Program</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, lineHeight: 1.2, marginBottom: 20 }}>8-Week Placement<br />Accelerator</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#7B61FF' }}>₹999</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹4,999</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>8 weeks · Live sessions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {[
                    'Everything in the 1:1 session',
                    'Weekly live group sessions (8 weeks)',
                    'Cold email and LinkedIn DM masterclass',
                    'Resume and Naukri optimization workshop',
                    "Consulting, finance and Founder's Office targeting strategy",
                    'Private WhatsApp community access',
                    '50+ templates, scripts and resources',
                    'Lifetime access to all materials',
                  ].map((f, i) => (
                    <div key={i} className="check-item">
                      <span style={{ color: '#7B61FF', fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="/cohort" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #7B61FF, #4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 36px rgba(123,97,255,0.35)', transition: 'all 0.3s', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                  Join the Cohort →
                </a>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
                  Next batch starts April 1 — only 30 seats
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3 — NOT SURE STRIP */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', background: '#111827', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 40px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 40, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 8, lineHeight: 1.3 }}>Still not sure? Talk to us first.</div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Book a free 10-minute clarity call. No pitch, no pressure — just an honest conversation about what makes sense for your situation.</div>
          </div>
          <a href="https://chat.whatsapp.com/HUe0nBmwKLWBIgnHaA6Pp0" target="_blank" rel="noopener noreferrer" className="btn-outlined" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
            Book a Free 10-min Call →
          </a>
        </div>
      </section>

      {/* SECTION 4 — PROOF STRIP */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="proof-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { icon: '⚡', text: 'Cold emails using our templates get replies within 24 hours' },
              { icon: '📅', text: 'Most students land their first interview within 30 days' },
              { icon: '🌍', text: 'Students from 50+ colleges across India have used this system' },
            ].map((fact, i) => (
              <div key={i} className="proof-card">
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{fact.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{fact.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — FAQ */}
      <section style={{ padding: '0 24px 100px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="section-label">FAQ</span>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px, 3.5vw, 38px)', lineHeight: 1.15, letterSpacing: -0.5 }}>Quick answers</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.82)' }}>{faq.q}</span>
                <span className={`faq-plus${openFaq === i ? ' open' : ''}`}>+</span>
              </button>
              <div className="faq-body" style={{ maxHeight: openFaq === i ? 240 : 0 }}>
                <div style={{ padding: '0 24px 22px', fontSize: 15, color: 'rgba(255,255,255,0.52)', lineHeight: 1.85 }}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        © 2025 Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>beyond-campus.in</a>
      </div>
    </main>
  )
}

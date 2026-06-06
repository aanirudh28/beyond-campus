'use client'

import { useEffect, useRef, useState } from 'react'
import LeadCapturePopup from './components/LeadCapturePopup'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [counters, setCounters] = useState({ salary: 0, placed: 0, rate: 0 })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [howItWorksVisible, setHowItWorksVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsStarted = useRef(false)
  const howItWorksRef = useRef<HTMLDivElement>(null)

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupPreselect, setPopupPreselect] = useState<string | null>(null)
  const openPopup = (cohort?: string) => {
    setPopupPreselect(cohort || null)
    setPopupOpen(true)
  }

  const FAQS = [
    { q: 'Is this a recorded course or live sessions?', a: 'Everything is live — no pre-recorded lectures. The 1:1 session is a live video call you schedule at your convenience. The cohort has weekly live sessions with your mentor.' },
    { q: "I'm from a tier-2 or tier-3 college. Will this actually work for me?", a: "Most of our students are from tier-2 and tier-3 colleges. Off-campus hiring is about strategy, not your college name. The tactics we teach are built specifically for students who don't get recruiters walking onto campus." },
    { q: 'What kind of roles do your students get placed in?', a: "Consulting and finance are the most common. We also see a lot of placements in Founder's Office roles at startups, and in marketing, operations, and BD at fast-growing companies." },
    { q: 'How long will it take to see results?', a: 'Most students get their first meaningful signal — a reply, a LinkedIn intro, or an interview call — within two weeks. By week four, most have at least one active conversation going.' },
    { q: 'How much does it cost?', a: 'The 1:1 strategy session is ₹549. The Placement Cohort is ₹2,500. Both come with personalized guidance — the session is a single focused call, the cohort is an extended program with weekly accountability.' },
    { q: 'How is this different from watching YouTube videos or buying a course?', a: "Personalization and accountability. We review your resume, build your specific target list, and stay with you until something moves. No generic content." },
    { q: 'What if I\'ve been scammed by a placement program before?', a: "That's a fair concern — there are a lot of programs that over-promise. We don't. We offer a 30-day refund if you do the work and nothing moves. We also keep the free resources available so you can see exactly how we think before spending anything." },
    { q: 'Is my payment secure?', a: "Yes — payments go through Razorpay. We never store card details." },
  ]

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('scroll', onScroll)
    window.addEventListener('mousemove', onMouse)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse) }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsStarted.current) {
        statsStarted.current = true
        const duration = 2000
        const steps = 60
        const interval = duration / steps
        let step = 0
        const timer = setInterval(() => {
          step++
          const progress = step / steps
          const ease = 1 - Math.pow(1 - progress, 3)
          setCounters({ salary: Math.round(ease * 10), placed: Math.round(ease * 500), rate: Math.round(ease * 3) })
          if (step >= steps) clearInterval(timer)
        }, interval)
      }
    }, { threshold: 0.3 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setHowItWorksVisible(true)
    }, { threshold: 0.15 })
    if (howItWorksRef.current) observer.observe(howItWorksRef.current)
    return () => observer.disconnect()
  }, [])

  const trustItems = ['Personalized Mentorship', 'Weekly Accountability', 'Resume & LinkedIn Reviews', 'Internship & Placement Support']

  const TrustStrip = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center', marginTop: 20 }}>
      {trustItems.map((item, i) => (
        <span key={item} style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: 'var(--line)' }}>·</span>}
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <main style={{ background: 'var(--paper)', color: 'var(--ink)', fontFamily: 'var(--font-hanken), system-ui, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes border-glow { 0%,100%{border-color:rgba(199,91,57,0.3)} 50%{border-color:rgba(199,91,57,0.7)} }
        @keyframes dot-travel { 0%{left:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{left:100%;opacity:0} }
        @keyframes dot-travel-v { 0%{top:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }

        .hero-headline {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(3.25rem, 6vw, 5.5rem);
          line-height: 0.98;
          letter-spacing: -0.03em;
          font-weight: 600;
          color: var(--ink);
        }
        .section-title {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(2rem, 3.5vw, 3.25rem);
          line-height: 1.02;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          color: var(--ink);
        }
        .section-label {
          font-family: var(--font-hanken), system-ui, sans-serif;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--clay);
          margin-bottom: 16px;
          display: block;
        }
        .stat-num {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(2.75rem, 5vw, 4.5rem);
          line-height: 1;
          letter-spacing: -0.03em;
          font-weight: 600;
          color: var(--ink);
        }

        /* Primary CTA — flat terracotta, no glow */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 28px; border-radius: 6px;
          background: var(--clay); color: white;
          font-weight: 700; font-size: 15px;
          font-family: var(--font-hanken), system-ui, sans-serif;
          cursor: pointer; transition: background 0.2s, transform 0.15s;
          border: none;
        }
        .btn-primary:hover { background: var(--clay-deep); transform: translateY(-1px); }
        .btn-primary span { position: relative; }

        /* Secondary — quiet ink border */
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 6px;
          background: transparent; color: var(--ink);
          font-weight: 600; font-size: 15px;
          font-family: var(--font-hanken), system-ui, sans-serif;
          cursor: pointer; transition: all 0.2s;
          border: 1.5px solid var(--line);
        }
        .btn-secondary:hover { background: var(--paper-deep); border-color: var(--ink-soft); }

        /* Nav */
        .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .sticky-nav.scrolled { background: rgba(247,241,230,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--line); padding: 14px 40px; }

        /* Cards */
        .card { background: white; border: 1px solid var(--line); border-radius: 16px; transition: all 0.3s; }
        .card:hover { border-color: var(--clay); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(199,91,57,0.08); }
        .product-card { background: white; border: 1px solid var(--line); border-radius: 20px; padding: 40px; transition: all 0.3s; position: relative; overflow: hidden; }
        .product-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(199,91,57,0.04),transparent); opacity:0; transition:opacity 0.3s; pointer-events:none; }
        .product-card:hover { border-color: var(--clay); transform: translateY(-6px); box-shadow: 0 20px 60px rgba(199,91,57,0.1); }
        .product-card:hover::before { opacity:1; }
        .proof-card { background: white; border: 1px solid var(--line); border-radius: 16px; padding: 28px; transition: all 0.3s; }
        .proof-card:hover { border-color: var(--clay); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(199,91,57,0.08); }

        /* Logo strip */
        .logo-pill { font-size: 13px; font-weight: 700; color: var(--ink-soft); white-space: nowrap; letter-spacing: 0.02em; }

        /* HIW (still dark-bg section — updated in later pass) */
        .hiw-card { background:white; border:1px solid var(--line); border-radius:16px; padding:36px 28px; position:relative; overflow:hidden; transition:border-color 0.3s, transform 0.3s, box-shadow 0.3s; opacity:0; transform:translateY(28px); }
        .hiw-card.visible { opacity:1; transform:translateY(0); }
        .hiw-card:hover { border-color:var(--clay); transform:translateY(-5px); box-shadow:0 14px 40px rgba(199,91,57,0.08); }
        .hiw-step-num { position:absolute; top:-12px; right:12px; font-family:var(--font-fraunces),Georgia,serif; font-size:120px; font-weight:600; color:rgba(199,91,57,0.07); line-height:1; pointer-events:none; user-select:none; }
        .hiw-dot { position:absolute; top:50%; transform:translateY(-50%); width:7px; height:7px; border-radius:50%; background:var(--clay); animation:dot-travel 2.4s ease-in-out infinite; }
        .hiw-dot-v { position:absolute; left:50%; transform:translateX(-50%); width:7px; height:7px; border-radius:50%; background:var(--clay); animation:dot-travel-v 2.4s ease-in-out infinite; }
        .proof-strip-card { background:white; border:1px solid var(--line); border-left:3px solid var(--forest); border-radius:10px; padding:18px 22px; display:flex; align-items:flex-start; gap:12px; transition:transform 0.2s; }
        .proof-strip-card:hover { transform:translateX(3px); }

        /* Comparison table */
        .comp-table { width:100%; border-collapse:collapse; }
        .comp-table th, .comp-table td { padding:14px 16px; text-align:center; font-size:14px; border-bottom:1px solid var(--line); }
        .comp-table th { font-size:13px; font-weight:700; padding-bottom:16px; }
        .comp-table td:first-child { text-align:left; color:var(--ink); font-weight:500; }
        .comp-table tbody tr:last-child td { border-bottom:none; }

        /* Ticker */
        .ticker { display: flex; width: max-content; animation: ticker 30s linear infinite; }
        .ticker-item { white-space: nowrap; padding: 0 40px; font-size: 13px; font-weight: 500; color: var(--ink-soft); display: flex; align-items: center; gap: 12px; }

        /* Reveal */
        .reveal { opacity:0; transform:translateY(32px); transition:opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }

        /* Avatar */
        .avatar-stack { display: flex; }
        .avatar-stack img, .avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--paper); margin-left: -8px; }
        .avatar-stack > :first-child { margin-left: 0; }

        /* FAQ */
        .faq-item { border-bottom: 1px solid var(--line); }

        @media(max-width:768px) {
          .sticky-nav { padding: 16px 20px; }
          .sticky-nav.scrolled { padding: 12px 20px; }
          .hero-headline { font-size: clamp(2.5rem, 10vw, 3.5rem); }
          .hiw-step-num { font-size:100px; }
          .comp-table th, .comp-table td { padding: 10px 8px; font-size: 12px; }
        }
      `}</style>

      <LeadCapturePopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} preselectedCohort={popupPreselect} />

      {/* NAV */}
      <nav className={`sticky-nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 22, letterSpacing: -0.5, fontWeight: 600, color: 'var(--ink)' }}>
          Beyond<span style={{ color: 'var(--clay)' }}>Campus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/summer" style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, color: 'var(--ink)', textDecoration: 'none', borderRadius: 6, background: '#FEF3C7', border: '1px solid #F59E0B', transition: 'all 0.2s', letterSpacing: 0.2 }}>Internship Cohort</a>
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => {
              if (resourcesCloseTimer.current) clearTimeout(resourcesCloseTimer.current)
              setResourcesOpen(true)
            }}
            onMouseLeave={() => {
              resourcesCloseTimer.current = setTimeout(() => setResourcesOpen(false), 120)
            }}
          >
            <a href="/free" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, color: resourcesOpen ? '#93BBFF' : 'rgba(255,255,255,0.75)', background: resourcesOpen ? 'rgba(79,124,255,0.12)' : 'rgba(79,124,255,0.07)', border: `1px solid ${resourcesOpen ? 'rgba(79,124,255,0.45)' : 'rgba(79,124,255,0.2)'}`, borderRadius: 100, cursor: 'pointer', fontFamily: "'DM Sans','Inter',sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              Free Resources <span style={{ fontSize: 10, opacity: 0.5 }}>▾</span>
            </a>
            {resourcesOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 8, zIndex: 200 }}>
              <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 8, minWidth: 240, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                <div style={{ padding: '6px 12px 4px', fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Resources</div>
                <a href="/resources/resume-roast" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>🔥 Resume Roast</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: '#ef4444', color: 'white', letterSpacing: 0.5 }}>NEW</span>
                </a>
                <a href="/resources/career-toolkit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>🛠️ Career Toolkit</span>
                  <span style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700 }}>15 roles</span>
                </a>
                <a href="/resources/cold-email-pack" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>Cold Email Pack</span>
                  <span style={{ fontSize: 11, color: '#93BBFF', fontWeight: 700 }}>50 templates</span>
                </a>
                <a href="/resources/linkedin-scripts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>LinkedIn Scripts</span>
                  <span style={{ fontSize: 11, color: '#7dd3fc', fontWeight: 700 }}>20 scripts</span>
                </a>
                <a href="/resources/resume-guide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>📄 Resume Guide</span>
                  <span style={{ fontSize: 11, color: '#93BBFF', fontWeight: 700 }}>7 chapters</span>
                </a>
                <a href="/resources/resume-templates" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>Resume Templates</span>
                  <span style={{ fontSize: 11, color: '#93BBFF', fontWeight: 700 }}>6 formats</span>
                </a>
                <a href="/resources/resume-builder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>Resume Builder (Free)</span>
                  <span style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700 }}>free</span>
                </a>
                <a href="/resources/consulting" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,124,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>📚 Consulting Resources</span>
                  <span style={{ fontSize: 11, color: '#6ee7b7', fontWeight: 700 }}>free</span>
                </a>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <a href="/free" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,124,255,0.15),rgba(123,97,255,0.1))', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  Unlock Everything — ₹199 →
                </a>
              </div>
              </div>
            )}
          </div>
          <a href="/community" style={{ padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.2s' }}>Community</a>
          <a href="/dashboard" style={{ padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.2s' }}>Dashboard</a>
          <a href="/book" style={{ padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.2s' }}>Book Session</a>
          <a href="/cohort" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>Placement Cohort</span>
            <span>→</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 100px', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 860, textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>

          <h1 className="hero-headline" style={{ marginBottom: 32 }}>
            No campus placements.<br />
            No referrals.{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <svg
                style={{ position: 'absolute', zIndex: 0, left: '-0.25rem', top: '0.1em', width: 'calc(100% + 0.5rem)', height: '0.82em', display: 'block' }}
                viewBox="0 0 300 56"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M5,44 Q80,32 150,36 Q220,40 295,38 L293,14 Q218,10 148,14 Q78,18 7,12 Z" fill="var(--butter)" opacity="0.9"/>
              </svg>
              <span style={{ position: 'relative', zIndex: 1 }}>They got the job anyway.</span>
            </span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--ink-soft)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px', fontWeight: 400 }}>
            We teach non-tech students how to reach companies directly — cold email, LinkedIn, and the right targeting strategy. No campus. No connections required.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 56 }}>
            <button onClick={() => openPopup()} className="btn-primary" style={{ fontSize: 16, padding: '17px 32px' }}>
              <span>Start with a 1:1 strategy call — ₹549</span>
              <span>→</span>
            </button>
            <a href="/free" style={{ fontSize: 14, color: 'var(--ink-soft)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--clay)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-soft)')}>
              or grab the free resources first →
            </a>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, maxWidth: 480, margin: '0 auto 40px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Where our students have interned</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* Logo strip — mono ink, no pills */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {['BCG', 'EY', 'Deloitte', 'Razorpay', 'Swiggy', 'Zepto'].map(c => (
              <span key={c} className="logo-pill">{c}</span>
            ))}
          </div>

        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', padding: '12px 0', background: 'var(--paper-deep)', overflow: 'hidden' }}>
        <div className="ticker">
          {[...Array(2)].map((_, ri) => (
            ["A commerce student from Delhi landed a Founder's Office role at a leading startup", "A BBA student cracked a Big 4 analyst role without a single referral", "A tier-3 college student got a BD internship at a Series B fintech", "A BCom graduate secured 3 competing offers in 30 days", "A student with no network broke into consulting off-campus"].map((item, i) => (
              <span key={`${ri}-${i}`} className="ticker-item">
                <span style={{ color: 'var(--line)' }}>◆</span>
                {item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* PAIN SECTION */}
      <section style={{ padding: '100px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h2 className="section-title">You're doing the work.<br />It's just not landing.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ fontSize: '1.0625rem', color: 'var(--ink-soft)', lineHeight: 1.85 }}>
            You've sent applications. You've updated your resume. You've even tried cold emailing a few times. But the replies aren't coming, the interviews aren't happening, and everyone around you seems to have a connection you don't.
          </p>
          <p style={{ fontSize: '1.0625rem', color: 'var(--ink-soft)', lineHeight: 1.85 }}>
            Most students face the same wall. No campus placements. No alumni network. No idea what's actually wrong or where to start fixing it.
          </p>
          <p style={{ fontSize: '1.0625rem', color: 'var(--ink-soft)', lineHeight: 1.85 }}>
            The hard part isn't effort — you're clearly putting that in. The hard part is knowing exactly what to change and how to reach the right people.
          </p>
        </div>
        <div style={{ marginTop: 40, padding: '24px 32px', background: 'white', border: '1px solid var(--line)', borderLeft: '4px solid var(--clay)', borderRadius: 10 }}>
          <p style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--clay)', lineHeight: 1.6 }}>This isn't a talent problem. It's a strategy problem. That's exactly what we fix.</p>
        </div>
      </section>

      {/* WHAT WE ACTUALLY DO */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', background: 'var(--paper-deep)' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="section-title">What changes when you work with us</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { title: 'A resume that gets read', desc: 'We rewrite it for the roles you\'re targeting — ATS-friendly, human-reviewed, positioned to stand out.' },
            { title: 'A cold outreach strategy that works', desc: 'Templates and targeting that get replies. Most students land their first response within two weeks.' },
            { title: 'A direct line to decision-makers', desc: 'Warm introductions to hiring managers and founders at companies you actually want to work at.' },
            { title: 'Weekly accountability, not passive content', desc: 'We stay in your corner until you have an offer — not just until you finish a module.' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 28 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.35, color: 'var(--ink)' }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.75 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} style={{ padding: '100px 24px', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 className="section-title" style={{ maxWidth: 560, margin: '0 auto 0' }}>From stuck to placed,<br />in three moves</h2>
          </div>

          <style>{`
            .hiw-row { display: flex; align-items: stretch; gap: 0; }
            @media(max-width: 768px) {
              .hiw-row { flex-direction: column; align-items: stretch; }
              .hiw-connector-wrap { display: none; }
              .hiw-row .hiw-card { margin-bottom: 0; }
            }
          `}</style>

          <div className="hiw-row">
            {[
              { num: '01', title: 'Diagnose what\'s blocking you', desc: 'We start by understanding exactly where you\'re stuck — resume, LinkedIn, cold outreach, or targeting. No generic advice. A sharp, honest assessment of what needs to change.', delay: '0s' },
              { num: '02', title: 'Fix your profile and strategy', desc: 'We rebuild your resume and outreach approach for the roles you want — consulting, finance, Founder\'s Office, BD. You get scripts, templates, a target list, and warm introductions.', delay: '0.18s' },
              { num: '03', title: 'Execute until you\'re placed', desc: "Weekly accountability and direct support until you have an offer. We don't disappear after onboarding. We stay until the job is done.", delay: '0.36s' },
            ].flatMap((step, i) => {
              const card = (
                <div
                  key={step.num}
                  className={`hiw-card${howItWorksVisible ? ' visible' : ''}`}
                  style={{ flex: 1, transitionDelay: step.delay, transitionDuration: '0.7s' }}
                >
                  <div className="hiw-step-num">{step.num}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 14 }}>{step.title}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.8 }}>{step.desc}</div>
                </div>
              )
              if (i < 2) {
                return [card, (
                  <div key={`conn-${i}`} className="hiw-connector-wrap" style={{ width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: '100%', height: 1, background: 'repeating-linear-gradient(90deg,var(--line) 0,var(--line) 8px,transparent 8px,transparent 16px)', position: 'relative' }}>
                      <div className="hiw-dot" style={{ animationDelay: `${i * 0.8}s` }} />
                    </div>
                  </div>
                )]
              }
              return [card]
            })}
          </div>

          {/* Proof strip */}
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Cold emails using our templates get replies within 24 hours on average',
              'Most students land their first interview conversation within 30 days',
              'Students from 50+ colleges across India have gone through this process',
            ].map((fact, i) => (
              <div key={i} className="proof-strip-card">
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{fact}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 56, flexWrap: 'wrap' }}>
            <button onClick={() => openPopup()} className="btn-primary" style={{ fontSize: 16, padding: '18px 36px', fontFamily: 'inherit' }}>
              <span>Start with a 1:1 session — ₹549</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </button>
            <a href="#programs" className="btn-secondary" style={{ fontSize: 15, textDecoration: 'none' }}>
              See all options ↓
            </a>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ padding: '80px 24px', background: 'var(--paper-deep)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Two ways to work with us</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16 }}>Not sure which fits? Book the session first — we'll tell you honestly.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

            {/* 1:1 Strategy Session */}
            <div className="product-card">
              <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(199,91,57,0.08)', border: '1px solid rgba(199,91,57,0.2)', borderRadius: 4, fontSize: 11, fontWeight: 700, color: 'var(--clay)', marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>1:1 Strategy Session</div>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 26, marginBottom: 6, lineHeight: 1.1, color: 'var(--ink)', fontWeight: 600 }}>Strategy Session</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>A focused one-hour call. Walk away with a clear, personalized action plan.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '20px 0 24px' }}>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 40, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>₹549</span>
                <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>/ session</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  'Resume review by an industry expert',
                  'Personalized cold email strategy',
                  'LinkedIn & Naukri profile audit',
                  'Target company list for your goals',
                  'A clear next-30-days action plan',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-soft)' }}>
                    <span style={{ color: 'var(--clay)', fontSize: 14, flexShrink: 0, lineHeight: '1.5', fontWeight: 700 }}>—</span>{f}
                  </div>
                ))}
              </div>
              <button onClick={() => openPopup()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box', fontSize: 15, padding: '14px 24px' }}>
                <span>Book a session — ₹549</span>
                <span>→</span>
              </button>
            </div>

            {/* Placement Cohort */}
            <div className="product-card" style={{ border: '2px solid var(--clay)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', background: 'var(--clay)', borderRadius: '0 0 8px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap', color: 'white', textTransform: 'uppercase' }}>Most Popular</div>
              <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(199,91,57,0.08)', border: '1px solid rgba(199,91,57,0.2)', borderRadius: 4, fontSize: 11, fontWeight: 700, color: 'var(--clay)', marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 16 }}>Placement Cohort</div>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 26, marginBottom: 6, lineHeight: 1.1, color: 'var(--ink)', fontWeight: 600 }}>Placement Cohort</div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.6 }}>Weekly accountability, live sessions, and mentor support until you're placed.</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '20px 0 24px' }}>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: 40, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>₹2,500</span>
                <span style={{ color: 'var(--ink-soft)', fontSize: 14 }}>/ program</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {[
                  'Everything in the strategy session',
                  'Weekly live sessions with your mentor',
                  'Company-specific targeting and prep',
                  'Resume and LinkedIn reviewed every week',
                  'Direct introductions at target companies',
                  'Support until you have an offer',
                ].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--ink-soft)' }}>
                    <span style={{ color: 'var(--clay)', fontSize: 14, flexShrink: 0, lineHeight: '1.5', fontWeight: 700 }}>—</span>{f}
                  </div>
                ))}
              </div>
              <a href="/cohort" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', width: '100%', boxSizing: 'border-box', fontSize: 15, padding: '14px 24px' }}>
                <span>Enroll — ₹2,500</span>
                <span>→</span>
              </a>
            </div>

          </div>
          <div style={{ marginTop: 32 }}>
            <TrustStrip />
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: '80px 24px', maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title">Beyond Campus vs. the alternatives</h2>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--line)', background: 'white' }}>
          <table className="comp-table" style={{ color: 'var(--ink)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ textAlign: 'left', color: 'var(--ink-soft)' }}>Feature</th>
                <th style={{ color: 'var(--clay)', background: 'rgba(199,91,57,0.04)', borderLeft: '2px solid rgba(199,91,57,0.25)', borderRight: '2px solid rgba(199,91,57,0.25)' }}>Beyond Campus</th>
                <th style={{ color: 'var(--ink-soft)' }}>YouTube / Free</th>
                <th style={{ color: 'var(--ink-soft)' }}>Online Courses</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Personalized strategy', '✓', '✗', '✗'],
                ['1-on-1 mentor access', '✓', '✗', '✗'],
                ['Resume reviews', '✓', '✗', 'Limited'],
                ['Weekly accountability', '✓', '✗', '✗'],
                ['Small cohort experience', '✓', '✗', '✗'],
                ['Pricing', '₹549+', 'Free', '₹5,000–₹50,000'],
              ].map(([feature, bc, free, course], i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{feature}</td>
                  <td style={{ background: 'rgba(199,91,57,0.04)', borderLeft: '2px solid rgba(199,91,57,0.25)', borderRight: '2px solid rgba(199,91,57,0.25)', fontWeight: 700, color: bc === '✓' ? 'var(--forest)' : bc === '✗' ? '#ef4444' : 'var(--clay)' }}>{bc}</td>
                  <td style={{ color: free === '✓' ? 'var(--forest)' : free === '✗' ? '#ef4444' : 'var(--ink-soft)' }}>{free}</td>
                  <td style={{ color: course === '✓' ? 'var(--forest)' : course === '✗' ? '#ef4444' : 'var(--ink-soft)' }}>{course}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => openPopup()} className="btn-primary" style={{ fontSize: 14, padding: '13px 28px' }}>
            <span>Book a strategy session — ₹549</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      {/* PLACEHOLDER: Replace these cards with real named students, photos, and LinkedIn profile links once collected */}
      <section style={{ padding: '80px 24px', background: 'var(--paper-deep)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="section-title">Students who made it work</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16 }}>Consulting, finance, startups — different paths, same starting point.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { initial: 'P', name: 'Commerce student, Delhi', role: 'Marketing Intern at a D2C Startup', quote: 'I had zero replies for months. After week 2 of the cohort, I got 3 responses from cold emails. Got my internship offer shortly after.', result: 'Internship secured' },
              { initial: 'A', name: 'BBA student, Tier-2 college', role: 'Analyst at a Big 4 Firm', quote: 'My mentor rebuilt my resume and gave me a target company list. Best investment I ever made.', result: 'Big 4 offer without referral' },
              { initial: 'S', name: 'BCom student, Tier-3 college', role: 'BD Intern at a Series B Startup', quote: 'Nobody from my college had ever cracked a startup this good. The LinkedIn outreach strategy completely changed things for me.', result: '3 competing offers' },
              { initial: 'R', name: 'BBA graduate, Tier-2 college', role: "Founder's Office at a Leading Startup", quote: 'No campus placements, no referrals. But with the right outreach strategy, I landed my dream role.', result: "Founder's Office role" },
              { initial: 'A', name: 'MBA student, Delhi', role: 'Consulting Intern at a Boutique Firm', quote: 'I switched my target from finance to consulting through this cohort. The mentor connections and the strategy made it happen.', result: 'Career pivot successful' },
              { initial: 'M', name: 'Commerce graduate, Tier-2 college', role: 'Finance Intern at a Fast-Growing Fintech', quote: "This company wasn't even on my radar. My mentor pushed me to apply and helped me prep. The call came through.", result: 'Dream company cracked' },
            ].map((t, i) => (
              <div key={i} className="proof-card">
                <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--paper-deep)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink)', flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ padding: '5px 12px', background: 'rgba(46,94,84,0.08)', border: '1px solid rgba(46,94,84,0.2)', borderRadius: 4, fontSize: 12, fontWeight: 600, color: 'var(--forest)', display: 'inline-block' }}>{t.result}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: '72px 24px', background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { num: '12', unit: 'days', label: 'fastest placement so far' },
            { num: '300+', unit: '', label: 'students across 50+ colleges' },
            { num: '100%', unit: '', label: 'live sessions, never recorded' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num" style={{ color: 'var(--clay)', marginBottom: 6 }}>
                {s.num}{s.unit && <span style={{ fontSize: '0.45em', fontWeight: 400, color: 'var(--ink-soft)', marginLeft: 4 }}>{s.unit}</span>}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontWeight: 500, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FROM THE FEED */}
      <section style={{ padding: '80px 24px', background: 'var(--paper-deep)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">The Feed</span>
            <h2 className="section-title">What students are actually saying</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16, maxWidth: 460, margin: '0 auto' }}>
              Real interview stories, stipend data, and honest doubts — anonymous and unfiltered.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {[
              { id: 'p1', type: 'experience' as const, content: "Got a Founder's Office offer after 3 rounds — a task, a case discussion, and a founder call. No technical questions at all. Just thinking and communication.", degree: 'BBA', college_tier: 'Tier 2', city: 'Delhi', tags: ["Founder's Office", 'Interview'], upvotes: 47, created_at: new Date(Date.now() - 2*3600000).toISOString(), reply_count: 8 },
              { id: 'p2', type: 'stipend' as const, content: 'BD intern at a fintech startup — ₹12,000/month + ₹3,000 travel allowance. Remote for first month, hybrid after that.', degree: 'BCom', college_tier: 'Tier 3', city: 'Mumbai', tags: ['BD', 'Stipend', 'Fintech'], upvotes: 31, created_at: new Date(Date.now() - 5*3600000).toISOString(), reply_count: 3 },
              { id: 'p3', type: 'doubt' as const, content: "Has anyone gotten a Big 4 HR to reply via LinkedIn DM? Cold emails haven't worked for me in 3 weeks.", degree: 'BBA', college_tier: 'Tier 2', city: 'Pune', tags: ['Big 4', 'Cold Outreach'], upvotes: 22, created_at: new Date(Date.now() - 8*3600000).toISOString(), reply_count: 14 },
            ].map(post => {
              const cfg = post.type === 'experience'
                ? { label: 'Experience', color: 'var(--forest)', borderColor: 'var(--forest)', bg: 'rgba(46,94,84,0.08)' }
                : post.type === 'stipend'
                ? { label: 'Stipend', color: 'var(--clay)', borderColor: 'var(--clay)', bg: 'rgba(199,91,57,0.08)' }
                : { label: 'Doubt', color: 'var(--ink-soft)', borderColor: 'var(--line)', bg: 'rgba(91,82,74,0.08)' }
              const timeAgoStr = (() => {
                const diff = Date.now() - new Date(post.created_at).getTime()
                const m = Math.floor(diff / 60000)
                if (m < 60) return `${m}m ago`
                const h = Math.floor(m / 60)
                if (h < 24) return `${h}h ago`
                return `${Math.floor(h / 24)}d ago`
              })()
              return (
                <div key={post.id} style={{
                  background: 'white', borderRadius: 12, padding: '18px',
                  border: '1px solid var(--line)', borderLeft: `3px solid ${cfg.borderColor}`,
                  minWidth: 280, maxWidth: 340, flex: '0 0 300px',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 4, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{timeAgoStr}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginBottom: 10 }}>
                    {[post.degree, post.college_tier, post.city].filter(Boolean).join(' · ')}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as never, flex: 1 }}>
                    {post.content}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, color: 'var(--ink-soft)', background: 'var(--paper-deep)', border: '1px solid var(--line)' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-soft)' }}>
                    <span>▲ {post.upvotes}</span>
                    <span>· {post.reply_count} replies</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <a href="/community" className="btn-secondary" style={{ textDecoration: 'none', fontSize: 14 }}>
              Join the conversation →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Questions we always get</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item" style={{ borderBottom: '1px solid var(--line)', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '22px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? 'var(--clay)' : 'var(--ink)', lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{ fontSize: 22, color: 'var(--clay)', flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block', lineHeight: 1 }}>+</span>
              </button>
              <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <div style={{ padding: '0 4px 24px', fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.85 }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GUARANTEE */}
      <section style={{ padding: '80px 24px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ padding: '48px 40px', background: 'white', border: '1px solid var(--line)', borderLeft: '4px solid var(--forest)', borderRadius: 16, textAlign: 'center' }}>
          <span className="section-label" style={{ display: 'block', marginBottom: 16 }}>Our guarantee</span>
          <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: 20 }}>
            Do the work for 30 days.<br />If nothing moves, we refund you.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 24px' }}>
            We ask that you show up — attend your sessions, send your emails, and implement the feedback. If you do that for 30 days and don't see a single meaningful signal (a reply, a conversation, a connection that leads somewhere), we'll give your money back.
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.7 }}>
            Not sure yet? Start with the free resources — no credit card, no commitment.{' '}
            <a href="/free" style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>Browse them here →</a>
          </p>
        </div>
      </section>

      {/* FOUNDERS */}
      <section style={{ padding: '100px 24px', background: 'var(--paper-deep)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">Who we are</span>
            <h2 className="section-title">Built by people who've been exactly where you are</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.8 }}>
              No professors. No career coaches who've never applied. Just two people who cracked off-campus hiring — and built a system so you don't have to figure it out alone.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 56 }}>
            {/* Founder 1 — PLACEHOLDER: replace initials div with <img> once photo is provided */}
            <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 20, padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Georgia,serif', fontSize: 120, lineHeight: 1, color: 'rgba(199,91,57,0.05)', userSelect: 'none', pointerEvents: 'none', paddingRight: 16 }}>"</div>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--paper-deep)', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--clay)', marginBottom: 20, letterSpacing: -0.5, fontFamily: 'var(--font-fraunces), serif' }}>AA</div>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.2 }}>Anirudh Agarwal</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(199,91,57,0.08)', border: '1px solid rgba(199,91,57,0.2)', borderRadius: 4, fontSize: 12, fontWeight: 700, color: 'var(--clay)', marginBottom: 4, letterSpacing: '0.3px' }}>
                Associate Consultant @ Aon
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 24 }}>Christ University, Bangalore</div>
              <div style={{ height: 1, background: 'var(--line)', marginBottom: 24 }} />
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.85, marginBottom: 24 }}>
                Cracked consulting off-campus straight after his undergrad. Spent months figuring out what actually gets you interviews — then wrote it down so you don't have to.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Consulting', 'Off-Campus Strategy', 'Cold Outreach'].map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', background: 'var(--paper-deep)', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/anirudh-agarwal-36591220b/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'transparent', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', textDecoration: 'none', fontWeight: 600, transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--clay)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>

            {/* Founder 2 — PLACEHOLDER: replace initials div with <img> once photo is provided */}
            <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 20, padding: '40px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, fontFamily: 'Georgia,serif', fontSize: 120, lineHeight: 1, color: 'rgba(46,94,84,0.05)', userSelect: 'none', pointerEvents: 'none', paddingRight: 16 }}>"</div>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--paper-deep)', border: '2px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--forest)', marginBottom: 20, letterSpacing: -0.5, fontFamily: 'var(--font-fraunces), serif' }}>SS</div>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, lineHeight: 1.2 }}>Sanya Srivastava</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(46,94,84,0.08)', border: '1px solid rgba(46,94,84,0.2)', borderRadius: 4, fontSize: 12, fontWeight: 700, color: 'var(--forest)', marginBottom: 4, letterSpacing: '0.3px' }}>
                FP&A @ Palo Alto Networks
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 24 }}>Finance · Corporate Strategy</div>
              <div style={{ height: 1, background: 'var(--line)', marginBottom: 24 }} />
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.85, marginBottom: 24 }}>
                Built a career in finance and corporate strategy at a global tech company — without the "right" pedigree. Knows exactly what finance and strategy roles look for, and how to get there when no one hands you a roadmap.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Finance', 'FP&A', 'Corporate Strategy'].map(tag => (
                  <span key={tag} style={{ padding: '4px 12px', background: 'var(--paper-deep)', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <a href="https://www.linkedin.com/in/sanya-srivastava-bb8806273/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'transparent', border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', textDecoration: 'none', fontWeight: 600, transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--forest)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>

          {/* shared quote */}
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? 'var(--clay)' : 'var(--line)' }} />)}
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 'clamp(20px, 3vw, 28px)', color: 'var(--ink)', lineHeight: 1.55, fontStyle: 'italic', maxWidth: 600, margin: '0 auto', fontWeight: 500 }}>
              "We built this because the system wasn't built for us.<br />Now it's built for you."
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '0 24px 0', maxWidth: '100%' }}>
        <div style={{ background: 'var(--clay)', padding: '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3.25rem)', marginBottom: 16, lineHeight: 1.1, color: 'white', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Your next offer is one email<br />away from being sent.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, lineHeight: 1.75, maxWidth: 440, margin: '0 auto 36px' }}>
            One session is all it takes to know exactly what to change and who to reach out to first.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <button onClick={() => openPopup()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '18px 40px', borderRadius: 6, background: 'white', color: 'var(--clay)', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-hanken), system-ui, sans-serif', cursor: 'pointer', border: 'none', transition: 'opacity 0.2s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <span>Start with a 1:1 session — ₹549</span>
              <span>→</span>
            </button>
            <a href="/free" style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              Not ready? Browse the free resources →
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '48px 24px 32px', background: 'var(--paper)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontSize: 24, marginBottom: 6, color: 'var(--ink)', fontWeight: 600 }}>Beyond<span style={{ color: 'var(--clay)' }}>Campus</span></div>
              <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Breaking campus barriers since 2023</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => openPopup()} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14, fontFamily: 'inherit' }}>Talk to a Mentor</button>
              <button onClick={() => openPopup()} className="btn-primary" style={{ padding: '12px 24px', fontSize: 14, fontFamily: 'inherit' }}>
                <span>Start with a 1:1 session — ₹549</span>
                <span>→</span>
              </button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>© {new Date().getFullYear()} Beyond Campus. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>beyond-campus.in</p>
          </div>
        </div>
      </footer>

      <ScrollReveal />
    </main>
  )
}

function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return null
}

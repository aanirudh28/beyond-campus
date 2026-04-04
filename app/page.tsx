'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 47, s: 33 })
  const [counters, setCounters] = useState({ salary: 0, placed: 0, rate: 0 })
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [cohortWaitlist, setCohortWaitlist] = useState<'hidden' | 'open' | 'done'>('hidden')
  const [cohortWaitlistEmail, setCohortWaitlistEmail] = useState('')
  const [cohortWaitlistLoading, setCohortWaitlistLoading] = useState(false)

  const submitCohortWaitlist = async () => {
    if (!cohortWaitlistEmail.trim()) return
    setCohortWaitlistLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cohortWaitlistEmail.trim(), source: 'Cohort Waitlist' }),
      })
      setCohortWaitlist('done')
    } catch { setCohortWaitlist('done') }
    setCohortWaitlistLoading(false)
  }
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [howItWorksVisible, setHowItWorksVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsStarted = useRef(false)
  const howItWorksRef = useRef<HTMLDivElement>(null)

  const FAQS = [
    { q: 'Is this a recorded course or live sessions?', a: 'Everything is live. The cohort has weekly live sessions directly with your mentor — no pre-recorded lectures. 1:1 sessions are live calls scheduled at your convenience.' },
    { q: "I'm from a tier-2 or tier-3 college. Will this actually work for me?", a: "Most of our students are from tier-2 and tier-3 colleges. The strategies we teach work regardless of college name — they're built specifically for students who don't get top companies walking onto their campus. Off-campus hiring is about strategy, not your college rank." },
    { q: 'What kind of roles do your students get placed in?', a: "Most students get placed in the domains they're targeting. Consulting and finance remain the most sought-after, with a strong and rising inclination towards Founder's Office roles at leading startups. We also place students in marketing, operations, and business development across fast-growing companies." },
    { q: 'How long will it take to see results?', a: 'Most students see their first meaningful result — a reply to a cold email, a LinkedIn connection with a hiring manager, or a referral introduction — within the first 2 weeks. By week 4, most students have at least one interview conversation in progress. The full transformation — from stuck to placed — typically takes 30 days of consistent execution.' },
    { q: 'What happens immediately after I pay?', a: "You'll receive a confirmation email within 2 minutes with your login details for the student dashboard. For the cohort, you'll also get added to the private WhatsApp group where onboarding starts immediately." },
    { q: 'How is this different from watching YouTube videos or buying a course?', a: "Three things: personalization, accountability, and referrals. We review YOUR resume, build YOUR target list, and help you find your initial introductions at your target companies. No YouTube video does that." },
{ q: 'Is my payment secure?', a: "Yes — payments are processed by Razorpay, India's most trusted payment gateway. We never store your card details." },
  ]

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
    window.addEventListener('scroll', onScroll)
    window.addEventListener('mousemove', onMouse)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse) }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        let { h, m, s } = t
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return { h: 23, m: 59, s: 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
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

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans', 'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #4F7CFF;
          --purple: #7B61FF;
          --bg: #0B0B0F;
          --bg2: #111827;
          --text: #F9FAFB;
          --muted: rgba(255,255,255,0.5);
        }
        html { scroll-behavior: smooth; }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-400% center} 100%{background-position:400% center} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes border-glow { 0%,100%{border-color:rgba(79,124,255,0.3)} 50%{border-color:rgba(79,124,255,0.8)} }

        .hero-headline { font-family: 'DM Serif Display', serif; font-size: clamp(48px, 7vw, 88px); line-height: 1.0; letter-spacing: -2px; font-weight: 400; }
        .gradient-text { background: linear-gradient(135deg, #4F7CFF, #7B61FF, #00D2FF); background-size: 300% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; border-radius: 100px; background: linear-gradient(135deg, #4F7CFF, #7B61FF); color: white; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 30px rgba(79,124,255,0.4); position: relative; overflow: hidden; }
        .btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#7B61FF,#4F7CFF); opacity:0; transition:opacity 0.3s; }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 50px rgba(79,124,255,0.6); }
        .btn-primary:hover::before { opacity:1; }
        .btn-primary span { position:relative; z-index:1; }
        .btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 15px 32px; border-radius: 100px; background: transparent; color: white; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s; border: 1.5px solid rgba(255,255,255,0.2); }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); transform: translateY(-2px); }
        .btn-amber { display: inline-flex; align-items: center; gap: 8px; padding: 16px 32px; border-radius: 100px; background: linear-gradient(135deg,#d97706,#c2410c); color: white; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.3s; border: none; box-shadow: 0 0 20px rgba(194,65,12,0.3); text-decoration: none; }
        .btn-amber:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 36px rgba(194,65,12,0.45); }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; transition: all 0.4s; }
        .card:hover { background: rgba(255,255,255,0.06); border-color: rgba(79,124,255,0.3); transform: translateY(-6px); box-shadow: 0 20px 60px rgba(79,124,255,0.15); }
        .section-label { font-size: 12px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--blue); margin-bottom: 16px; display: block; }
        .section-title { font-family: 'DM Serif Display', serif; font-size: clamp(32px, 4vw, 52px); line-height: 1.1; letter-spacing: -1px; margin-bottom: 20px; }
        .grid-bg { background-image: linear-gradient(rgba(79,124,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,124,255,0.06) 1px, transparent 1px); background-size: 80px 80px; }
        .noise-overlay { position:fixed; inset:0; pointer-events:none; z-index:999; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .reveal { opacity:0; transform:translateY(40px); transition:opacity 0.8s ease, transform 0.8s ease; }
        .reveal.visible { opacity:1; transform:translateY(0); }
        .ticker-wrap { overflow: hidden; }
        .ticker { display: flex; width: max-content; animation: ticker 30s linear infinite; }
        .ticker-item { white-space: nowrap; padding: 0 40px; font-size: 14px; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 12px; }
        .avatar-stack { display: flex; }
        .avatar-stack img, .avatar { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #0B0B0F; margin-left: -10px; }
        .avatar-stack > :first-child { margin-left: 0; }
        .tag { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .countdown-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px 24px; text-align: center; min-width: 80px; }
        .pain-item { display: flex; align-items: flex-start; gap: 16px; padding: 24px; border-radius: 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s; }
        .pain-item:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); }
        .product-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; padding: 40px; transition: all 0.4s; position: relative; overflow: hidden; }
        .product-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(79,124,255,0.08),transparent); opacity:0; transition:opacity 0.4s; }
        .product-card:hover { border-color: rgba(79,124,255,0.4); transform: translateY(-8px); box-shadow: 0 30px 80px rgba(79,124,255,0.15); }
        .product-card:hover::before { opacity:1; }
        .proof-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; transition: all 0.3s; }
        .proof-card:hover { border-color: rgba(79,124,255,0.3); transform: translateY(-4px); }
        .stat-num { font-family: 'DM Serif Display', serif; font-size: clamp(48px, 6vw, 72px); line-height: 1; letter-spacing: -2px; }
        .sticky-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s; padding: 20px 40px; display: flex; align-items: center; justify-content: space-between; }
        .sticky-nav.scrolled { background: rgba(11,11,15,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 14px 40px; }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .feature-pill { display: flex; align-items: center; gap: 10px; padding: 12px 20px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 14px; font-weight: 500; }
        .logo-pill { padding: 10px 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 13px; font-weight: 700; color: var(--muted); transition: all 0.3s; white-space: nowrap; }
        .logo-pill:hover { background: rgba(79,124,255,0.1); border-color: rgba(79,124,255,0.3); color: white; }
        @keyframes dash-move { 0%{stroke-dashoffset:0} 100%{stroke-dashoffset:-400} }
        @keyframes dot-travel { 0%{left:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{left:100%;opacity:0} }
        @keyframes dot-travel-v { 0%{top:0%;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
        .hiw-card { background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:40px 32px; position:relative; overflow:hidden; transition:border-color 0.4s, transform 0.4s, box-shadow 0.4s; opacity:0; transform:translateY(40px); }
        .hiw-card.visible { opacity:1; transform:translateY(0); }
        .hiw-card:hover { border-color:rgba(79,124,255,0.45); transform:translateY(-8px); box-shadow:0 24px 64px rgba(79,124,255,0.18); }
        .hiw-step-num { position:absolute; top:-20px; right:16px; font-family:'DM Serif Display',serif; font-size:140px; font-weight:800; color:rgba(255,255,255,0.025); line-height:1; pointer-events:none; user-select:none; }
        .hiw-icon-wrap { width:56px; height:56px; border-radius:16px; background:linear-gradient(135deg,#4F7CFF,#7B61FF); display:flex; align-items:center; justify-content:center; font-size:26px; margin-bottom:24px; box-shadow:0 8px 24px rgba(79,124,255,0.35); flex-shrink:0; }
        .hiw-connector { position:relative; flex:1; height:2px; margin:0 8px; align-self:center; }
        .hiw-connector-line { width:100%; height:2px; background:repeating-linear-gradient(90deg,rgba(79,124,255,0.5) 0,rgba(79,124,255,0.5) 8px,transparent 8px,transparent 16px); }
        .hiw-dot { position:absolute; top:50%; transform:translateY(-50%); width:10px; height:10px; border-radius:50%; background:#4F7CFF; box-shadow:0 0 10px rgba(79,124,255,0.9); animation:dot-travel 2.4s ease-in-out infinite; }
        .hiw-connector-v { position:relative; width:2px; height:64px; margin:4px auto; }
        .hiw-connector-v-line { width:2px; height:100%; background:repeating-linear-gradient(180deg,rgba(79,124,255,0.5) 0,rgba(79,124,255,0.5) 8px,transparent 8px,transparent 16px); }
        .hiw-dot-v { position:absolute; left:50%; transform:translateX(-50%); width:10px; height:10px; border-radius:50%; background:#4F7CFF; box-shadow:0 0 10px rgba(79,124,255,0.9); animation:dot-travel-v 2.4s ease-in-out infinite; }
        .proof-strip-card { background:#111827; border-left:4px solid #4F7CFF; border-radius:16px; padding:24px 28px; display:flex; align-items:flex-start; gap:14px; transition:transform 0.3s; }
        .proof-strip-card:hover { transform:translateX(4px); }
        @media(max-width:768px) {
          .sticky-nav { padding: 16px 20px; }
          .sticky-nav.scrolled { padding: 12px 20px; }
          .hero-headline { font-size: clamp(36px, 10vw, 56px); }
          .hiw-step-num { font-size:100px; }
        }
      `}</style>

      <div className="noise-overlay" />

      {/* NAV */}
      <nav className={`sticky-nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: 'var(--blue)' }}>Campus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/summer" style={{ padding: '10px 22px', fontSize: 14, fontWeight: 800, color: '#fff', textDecoration: 'none', borderRadius: 100, background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 0 18px rgba(245,158,11,0.45)', transition: 'all 0.2s', letterSpacing: 0.2 }}>Summer ☀️</a>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, color: 'rgba(255,255,255,0.35)', fontSize: 14, fontWeight: 600 }}>
                  <span>Company List</span>
                  <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🔒 ₹199</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                <a href="/free" style={{ display: 'block', padding: '10px 12px', borderRadius: 10, textAlign: 'center', background: 'linear-gradient(135deg,rgba(79,124,255,0.15),rgba(123,97,255,0.1))', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  Unlock Everything — ₹199 →
                </a>
              </div>
              </div>
            )}
          </div>
          <a href="/community" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', transition: 'all 0.2s' }}>Community</a>
          <a href="/dashboard" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>Dashboard</a>
          <a href="/book" className="btn-secondary" style={{ padding: '10px 24px', fontSize: 14 }}>Book Session</a>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a href="/cohort" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
              <span>Join Cohort</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, margin: '8px 0 0' }}>Coming Soon · Join the waitlist</p>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', top: '10%', left: '-10%', animation: 'glow-pulse 6s ease-in-out infinite' }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(123,97,255,0.15), transparent)', bottom: '5%', right: '-5%', animation: 'glow-pulse 8s ease-in-out infinite 2s' }} />
        <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,210,255,0.1), transparent)', top: '40%', left: '60%', animation: 'float 8s ease-in-out infinite' }} />

        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', zIndex: 2, animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#fcd34d', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
            🔥 Summer Internship Program · April 11 · 25 seats · ₹699
          </div>

          <h1 className="hero-headline" style={{ marginBottom: 28 }}>
            Break Into Top Jobs<br />
            <span className="gradient-text">Without Campus</span><br />
            Placements
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px', fontWeight: 400 }}>
            Get mentorship, referrals, and battle-tested strategies from people who've actually done it.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <a href="/summer" className="btn-amber">Get Your Summer Internship — ₹699</a>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <a href="/cohort" className="btn-secondary">Join Next Cohort — ₹999</a>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, margin: '8px 0 0' }}>Coming Soon · Join the waitlist</p>
            </div>
          </div>

          {/* Social proof row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar-stack">
                {['#4F7CFF','#7B61FF','#06b6d4','#10b981','#f59e0b'].map((c, i) => (
                  <div key={i} className="avatar" style={{ background: `linear-gradient(135deg, ${c}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                    {['P','A','S','R','M'][i]}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>A network of 300+</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>students across 50+ Indian colleges</div>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['BCG', 'EY', 'Deloitte', 'Razorpay', 'Swiggy', 'Zepto'].map(c => (
                <span key={c} className="logo-pill">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 0', background: 'rgba(79,124,255,0.04)', overflow: 'hidden' }}>
        <div className="ticker">
          {[...Array(2)].map((_, ri) => (
            ["🎉 A commerce student from Delhi landed a Founder's Office role at a leading startup", "⚡ A BBA student cracked a Big 4 analyst role without a single referral", "🚀 A tier-3 college student got a BD internship at a Series B fintech", "💼 A BCom graduate secured 3 competing offers in 30 days", "🔥 A student with no network broke into consulting off-campus", "✅ A finance student cracked their dream company in 29 days"].map((item, i) => (
              <span key={`${ri}-${i}`} className="ticker-item">
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>◆</span>
                {item}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* PAIN SECTION */}
      <section style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">The Problem</span>
          <h2 className="section-title">Does this sound like you?</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>You're doing everything right. But nothing is working.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { icon: '😤', text: 'Applying to 50+ jobs a week with zero replies' },
            { icon: '🏫', text: 'No campus placements. Left on your own.' },
            { icon: '😶', text: 'No idea what\'s wrong with your resume or profile' },
            { icon: '🔗', text: 'No referrals, no network, no way in' },
            { icon: '⏳', text: 'Watching peers get placed while you\'re still waiting' },
            { icon: '😰', text: 'Confused about what to actually do next' },
          ].map((p, i) => (
            <div key={i} className="pain-item">
              <span style={{ fontSize: 28, flexShrink: 0 }}>{p.icon}</span>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, fontWeight: 500 }}>{p.text}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48, padding: '28px 40px', background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 20 }}>
          <p style={{ fontSize: 18, fontWeight: 600, color: '#93BBFF' }}>You don't have a talent problem. You have a strategy problem. We fix that.</p>
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">The Solution</span>
          <h2 className="section-title">We give you the unfair advantage</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { icon: '🎯', title: 'Crack off-campus roles', desc: 'A proven playbook to get interviews at companies that don\'t come to your campus.' },
            { icon: '📄', title: 'Resume that gets you in', desc: 'ATS-optimized, human-reviewed resumes that actually get read.' },
            { icon: '🔗', title: 'Referrals that convert', desc: 'Direct intros to hiring managers and alumni at your target companies.' },
            { icon: '📈', title: '3x your interview rate', desc: 'Cold email + LinkedIn strategy that gets 10x more responses.' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howItWorksRef} style={{ padding: '120px 24px', background: '#0B0B0F', position: 'relative', overflow: 'hidden' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,124,255,0.07), transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <span className="section-label">THE PROCESS</span>
            <h2 className="section-title" style={{ maxWidth: 640, margin: '0 auto 20px' }}>From stuck to placed —<br />here's how it works</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
              A proven system built for students who don't have the luxury of campus placements
            </p>
          </div>
          {/* Desktop row */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }} className="hiw-desktop-row">
            {[
              { num: '01', icon: '🎯', title: 'Diagnose What\'s Blocking You', desc: 'We start by understanding exactly where you\'re stuck — resume, LinkedIn, cold outreach, or targeting. No generic advice. Just a sharp, honest assessment of what needs to change.', delay: '0s' },
              { num: '02', icon: '🛠️', title: 'Build Your Unfair Advantage', desc: 'We rebuild your profile and strategy from scratch for the roles you want — consulting, finance, Founder\'s Office, marketing, operations. You get scripts, templates, a target list, and warm introductions.', delay: '0.18s' },
              { num: '03', icon: '🎉', title: 'Execute Until You\'re Placed', desc: "Weekly accountability, live sessions, and direct support until you have an offer. We don't disappear after onboarding. We stay in your corner until the job is done.", delay: '0.36s' },
            ].flatMap((step, i) => {
              const card = (
                <div
                  key={step.num}
                  className={`hiw-card${howItWorksVisible ? ' visible' : ''}`}
                  style={{ flex: 1, transitionDelay: step.delay, transitionDuration: '0.7s' }}
                >
                  <div className="hiw-step-num">{step.num}</div>
                  <div className="hiw-icon-wrap">{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#4F7CFF', textTransform: 'uppercase', marginBottom: 12 }}>Step {step.num}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>{step.title}</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{step.desc}</div>
                </div>
              )
              if (i < 2) {
                return [card, (
                  <div key={`conn-${i}`} style={{ width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: '100%', height: 2, background: 'repeating-linear-gradient(90deg,rgba(79,124,255,0.5) 0,rgba(79,124,255,0.5) 8px,transparent 8px,transparent 16px)', position: 'relative' }}>
                      <div className="hiw-dot" style={{ animationDelay: `${i * 0.8}s` }} />
                    </div>
                  </div>
                )]
              }
              return [card]
            })}
          </div>

          {/* Mobile vertical stack */}
          <div className="hiw-mobile-col" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>
            {[
              { num: '01', icon: '🎯', title: 'Diagnose What\'s Blocking You', desc: 'We start by understanding exactly where you\'re stuck — resume, LinkedIn, cold outreach, or targeting. No generic advice. Just a sharp, honest assessment of what needs to change.', delay: '0s' },
              { num: '02', icon: '🛠️', title: 'Build Your Unfair Advantage', desc: 'We rebuild your profile and strategy from scratch for the roles you want — consulting, finance, Founder\'s Office, marketing, operations. You get scripts, templates, a target list, and warm introductions.', delay: '0.18s' },
              { num: '03', icon: '🎉', title: 'Execute Until You\'re Placed', desc: "Weekly accountability, live sessions, and direct support until you have an offer. We don't disappear after onboarding. We stay in your corner until the job is done.", delay: '0.36s' },
            ].map((step, i) => (
              <div key={step.num}>
                <div
                  className={`hiw-card${howItWorksVisible ? ' visible' : ''}`}
                  style={{ transitionDelay: step.delay, transitionDuration: '0.7s' }}
                >
                  <div className="hiw-step-num">{step.num}</div>
                  <div className="hiw-icon-wrap">{step.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#4F7CFF', textTransform: 'uppercase', marginBottom: 12 }}>Step {step.num}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 16 }}>{step.title}</div>
                  <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{step.desc}</div>
                </div>
                {i < 2 && (
                  <div className="hiw-connector-v">
                    <div className="hiw-connector-v-line" />
                    <div className="hiw-dot-v" style={{ animationDelay: `${i * 0.8}s` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <style>{`
            .hiw-desktop-row { display: flex; }
            .hiw-mobile-col { display: none; }
            @media(max-width: 768px) {
              .hiw-desktop-row { display: none; }
              .hiw-mobile-col { display: flex; }
            }
          `}</style>

          {/* Proof strip */}
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '⚡', text: 'Cold emails using our templates get replies within 24 hours on average' },
              { icon: '📅', text: 'Most students land their first interview conversation within 30 days' },
              { icon: '🌍', text: 'Students from 50+ colleges across India have used this system' },
            ].map((fact, i) => (
              <div key={i} className="proof-strip-card">
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{fact.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{fact.text}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 56, flexWrap: 'wrap' }}>
            <a href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 100, background: 'linear-gradient(135deg, #FF6B35, #FF4500)', color: 'white', fontWeight: 700, fontSize: 16, boxShadow: '0 0 36px rgba(255,107,53,0.4)', transition: 'all 0.3s', textDecoration: 'none' }}>
              Get Started →
            </a>
            <a href="/program" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', borderRadius: 100, background: 'transparent', color: 'white', fontWeight: 600, fontSize: 16, border: '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.3s', textDecoration: 'none' }}>
              See the Full Program
            </a>
          </div>
        </div>
      </section>

      {/* SUMMER HIGHLIGHT */}
      <section style={{ padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.04), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent)', top: '50%', right: '-10%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#f59e0b' }}>SUMMER 2025</span>
            <span style={{ padding: '3px 12px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#fcd34d' }}>NEW 🌟</span>
          </div>
          <div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: -1, marginBottom: 16 }}>
                Land Your First<br />
                <span style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Internship This Summer</span>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 28, maxWidth: 440 }}>
                A focused 4-week program for students who want a real internship — not just another rejection email.
              </p>
              <a href="/summer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 32px rgba(245,158,11,0.35)', transition: 'all 0.3s', textDecoration: 'none' }}>
                Join Summer Program →
              </a>
              <div style={{ marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Founding batch · Starts April 11 · 25 seats · ₹699</div>
            </div>
            <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '🗓️', title: '4-Week Program', desc: 'Intensive, focused, and built around the summer hiring calendar' },
                { icon: '🎯', title: 'Internship-First Strategy', desc: 'Everything is optimized for internship applications, not full-time roles' },
                { icon: '⚡', title: 'Fast Results', desc: 'First outreach in week 1. First replies within days. Internship secured by end of program.' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 16, padding: '18px 20px' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">Our Programs</span>
          <h2 className="section-title">Pick your path to placement</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {/* Summer Internship */}
          <div className="product-card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.05))', border: '1px solid rgba(245,158,11,0.25)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', borderRadius: '0 0 16px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>NEW 🌟</div>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#fcd34d', marginBottom: 24, letterSpacing: 1, marginTop: 20 }}>SUMMER INTERNSHIP PROGRAM</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, marginBottom: 6, lineHeight: 1.1 }}>Summer Internship<br />Accelerator</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>4 weeks. Built for students who want their first internship this summer.</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#f59e0b' }}>₹699</span>
              <span style={{ color: 'var(--muted)', fontSize: 15, textDecoration: 'line-through' }}>₹2,999</span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>/ program</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['Resume built for internship applications', 'Cold email strategy for summer hiring season', 'Target startup and corporate list for internships', 'LinkedIn profile optimized for internship search', 'Live weekly sessions (4 weeks)', 'Private WhatsApp community access'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#f59e0b', fontSize: 16, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href="/summer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(245,158,11,0.35)', transition: 'all 0.3s', textDecoration: 'none' }}>
              Apply for Summer Program →
            </a>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>Applications open now · Summer 2025 batch</p>
          </div>

          {/* Cohort */}
          <div className="product-card" style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.25)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: '0 0 16px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>MOST POPULAR</div>
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#C4B5FD', marginBottom: 24, letterSpacing: 1, marginTop: 20 }}>COHORT PROGRAM</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, marginBottom: 8, lineHeight: 1.1 }}>8-Week Placement<br />Accelerator</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '24px 0' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: '#7B61FF' }}>₹999</span>
              <span style={{ color: 'var(--muted)', fontSize: 15, textDecoration: 'line-through' }}>₹4,999</span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>/ program</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['Everything in 1:1 Mentorship', 'Live weekly sessions (8 weeks)', 'Cold email + LinkedIn masterclass', 'Resume + Naukri optimization', 'Company targeting strategy', 'Private WhatsApp community', 'Lifetime access to resources', '50+ templates & scripts'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#7B61FF', fontSize: 16, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            {/* COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form */}
            {/* and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments" */}
            {/* to activate instantly. */}
            <button
              onClick={() => setCohortWaitlist(s => s === 'open' ? 'hidden' : 'open')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #7B61FF, #4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(123,97,255,0.4)', transition: 'all 0.3s', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
              Join Next Cohort →
            </button>
            {cohortWaitlist === 'open' && (
              <div style={{ marginTop: 12, padding: '16px', borderRadius: 16, background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)', animation: 'fadeUp 0.2s ease both' }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 10, fontWeight: 600 }}>Enter your email to get early access</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="email" placeholder="you@email.com" value={cohortWaitlistEmail} onChange={e => setCohortWaitlistEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitCohortWaitlist()} style={{ flex: 1, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit', minWidth: 0 }} />
                  <button onClick={submitCohortWaitlist} disabled={cohortWaitlistLoading} style={{ padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#7B61FF,#4F7CFF)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    {cohortWaitlistLoading ? '...' : 'Notify Me →'}
                  </button>
                </div>
              </div>
            )}
            {cohortWaitlist === 'done' && (
              <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#6ee7b7', fontWeight: 700, margin: 0 }}>✓ You're on the waitlist! We'll notify you first when registrations open.</p>
              </div>
            )}
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>Launching Soon · Join the waitlist</p>
          </div>

          {/* Mentorship */}
          <div className="product-card">
            <div style={{ display: 'inline-flex', padding: '6px 16px', background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#93BBFF', marginBottom: 24, letterSpacing: 1 }}>1:1 MENTORSHIP</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, marginBottom: 8, lineHeight: 1.1 }}>Personal Career<br />Acceleration</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '24px 0' }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: 'var(--blue)' }}>₹299</span>
              <span style={{ color: 'var(--muted)', fontSize: 15, textDecoration: 'line-through' }}>₹999</span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>/ session</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {['Resume review by an industry expert', 'Personalized cold email strategy', 'LinkedIn & Naukri profile overhaul', 'Mock interview + feedback', 'Target company hit list'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#4F7CFF', fontSize: 16, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
            <a href="/book" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Book Session Now</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
          </div>

        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">Social Proof</span>
          <h2 className="section-title">Real students. Real results.</h2>
          <p style={{ color: 'var(--muted)', fontSize: 17 }}>Not just testimonials — actual placement stories.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {[
            { initial: 'P', name: 'Commerce student, Delhi', role: 'Marketing Intern at a D2C Startup', days: '38 days', quote: 'I had zero replies for months. After week 2 of the cohort, I got 3 responses from cold emails. Got my internship offer in 38 days.', color: '#4F7CFF', result: 'Dream internship secured' },
            { initial: 'A', name: 'BBA student, Tier-2 college', role: 'Analyst at a Big 4 Firm', days: '45 days', quote: 'My mentor rebuilt my resume and gave me a target company list. I had an offer in 45 days. Best ₹999 I ever spent.', color: '#7B61FF', result: 'Big 4 offer without referral' },
            { initial: 'S', name: 'BCom student, Tier-3 college', role: 'BD Intern at a Series B Startup', days: '52 days', quote: 'Nobody from my college had ever cracked a startup this good. The LinkedIn DM strategy completely changed the game for me.', color: '#06b6d4', result: '3 competing offers' },
            { initial: 'R', name: 'BBA graduate, Tier-2 college', role: "Founder's Office at a Leading Startup", days: '60 days', quote: 'No campus placements, no referrals, no IIM tag. But with the right outreach strategy, I landed my dream role. This program is real.', color: '#10b981', result: "Founder's Office role" },
            { initial: 'A', name: 'MBA student, Delhi', role: 'Consulting Intern at a Boutique Firm', days: '41 days', quote: 'I switched my target from finance to consulting through this cohort. The mentor connections and the strategy made it happen.', color: '#f59e0b', result: 'Career pivot successful' },
            { initial: 'M', name: 'Commerce graduate, Tier-2 college', role: 'Finance Intern at a Fast-Growing Fintech', days: '29 days', quote: "This company wasn't even on my radar. My mentor pushed me to apply and helped me prep. Got the call in 29 days.", color: '#ec4899', result: 'Dream company cracked' },
          ].map((t, i) => (
            <div key={i} className="proof-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>placed in</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.days}</div>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '8px 14px', background: `${t.color}15`, border: `1px solid ${t.color}30`, borderRadius: 100, fontSize: 12, fontWeight: 700, color: t.color, display: 'inline-block' }}>✓ {t.result}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: '80px 24px', background: 'linear-gradient(135deg, rgba(79,124,255,0.06), rgba(123,97,255,0.04))', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { num: '12 Days', label: 'Fastest placement so far', sub: '' },
            { num: '₹999', label: 'Most affordable placement program in India', sub: '' },
            { num: '100%', label: 'Live sessions, never recorded', sub: '' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num" style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>{s.num}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FROM THE FEED */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-label">THE FEED</span>
          <h2 className="section-title">What students are actually saying</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Real interview stories, stipend data, and honest doubts — anonymous and unfiltered.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' as any }}>
          {[
            { id: 'p1', type: 'experience' as const, content: "Got a Founder's Office offer after 3 rounds — a task, a case discussion, and a founder call. No technical questions at all. Just thinking and communication.", degree: 'BBA', college_tier: 'Tier 2', city: 'Delhi', domain: "Founder's Office", tags: ["Founder's Office", 'Interview'], upvotes: 47, created_at: new Date(Date.now() - 2*3600000).toISOString(), reply_count: 8 },
            { id: 'p2', type: 'stipend' as const, content: 'BD intern at a fintech startup — ₹12,000/month + ₹3,000 travel allowance. Remote for first month, hybrid after that.', degree: 'BCom', college_tier: 'Tier 3', city: 'Mumbai', domain: 'BD', tags: ['BD', 'Stipend', 'Fintech'], upvotes: 31, created_at: new Date(Date.now() - 5*3600000).toISOString(), reply_count: 3 },
            { id: 'p3', type: 'doubt' as const, content: "Has anyone gotten a Big 4 HR to reply via LinkedIn DM? Cold emails haven't worked for me in 3 weeks.", degree: 'BBA', college_tier: 'Tier 2', city: 'Pune', domain: 'Consulting', tags: ['Big 4', 'Cold Outreach'], upvotes: 22, created_at: new Date(Date.now() - 8*3600000).toISOString(), reply_count: 14 },
          ].map(post => {
            const cfg = post.type === 'experience'
              ? { label: 'Experience', color: '#4F7CFF', borderColor: '#4F7CFF', bg: 'rgba(79,124,255,0.12)' }
              : post.type === 'stipend'
              ? { label: 'Stipend', color: '#10b981', borderColor: '#10b981', bg: 'rgba(16,185,129,0.12)' }
              : { label: 'Doubt', color: '#f59e0b', borderColor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' }
            const icon = post.type === 'experience' ? '📖' : post.type === 'stipend' ? '💰' : '❓'
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
                background: '#111827', borderRadius: 18, padding: '18px 18px 14px',
                borderLeft: `4px solid ${cfg.borderColor}`,
                minWidth: 280, maxWidth: 340, flex: '0 0 300px',
                display: 'flex', flexDirection: 'column', gap: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, letterSpacing: 0.5 }}>
                    {icon} {cfg.label.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{timeAgoStr}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
                  {[post.degree, post.college_tier, post.city].filter(Boolean).join(' · ')}
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any, flex: 1 }}>
                  {post.content}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)' }}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  <span>▲ {post.upvotes}</span>
                  <span>💬 {post.reply_count}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <a href="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
            Join the conversation →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title">Questions we always get</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: '#111827', border: `1px solid ${openFaq === i ? 'rgba(79,124,255,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.3s' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: openFaq === i ? 'white' : 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{ fontSize: 22, color: '#4F7CFF', flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block', lineHeight: 1 }}>+</span>
              </button>
              <div style={{ maxHeight: openFaq === i ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                <div style={{ padding: '0 28px 24px', fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 }}>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDERS */}
      <section style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">WHO WE ARE</span>
          <h2 className="section-title">Built by people who've been exactly where you are</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 520, margin: '16px auto 0', lineHeight: 1.8 }}>
            No professors. No career coaches who've never applied. Just two people who cracked off-campus hiring — and built a system so you don't have to figure it out alone.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 2, marginBottom: 56 }}>

          {/* ── Founder 1 ── */}
          <div style={{ padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(79,70,229,0.6) 0%, rgba(123,97,255,0.25) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #131020 0%, #0c0b15 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>

              {/* ambient glows */}
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 220, height: 220, background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* decorative large quote */}
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'Georgia,serif', fontSize: 140, lineHeight: 1, color: 'rgba(79,70,229,0.07)', userSelect: 'none', pointerEvents: 'none' }}>"</div>

              {/* avatar */}
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 24, boxShadow: '0 0 0 5px rgba(79,70,229,0.18), 0 0 40px rgba(79,70,229,0.28)' }}>AA</div>

              {/* name */}
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Anirudh Agarwal</div>

              {/* role badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(79,70,229,0.18)', border: '1px solid rgba(79,70,229,0.35)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 6, letterSpacing: '0.3px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a5b4fc', display: 'inline-block' }} />
                Associate Consultant @ Aon
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28, letterSpacing: '0.2px' }}>Christ University, Bangalore</div>

              {/* divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(79,70,229,0.4), rgba(123,97,255,0.15), transparent)', marginBottom: 28 }} />

              {/* bio */}
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Placed off-campus into consulting from a non-IIM background. Spent months reverse-engineering what actually gets you interviews — cold outreach, positioning, and showing up before others even start applying.
              </p>

              {/* tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {['Consulting', 'Off-Campus Strategy', 'Cold Outreach'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.22)', borderRadius: 100, fontSize: 12, color: '#a5b4fc', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>

              {/* LinkedIn button */}
              <a href="https://www.linkedin.com/in/anirudh-agarwal-36591220b/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'rgba(79,70,229,0.14)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 12, fontSize: 13, color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                View LinkedIn
              </a>
            </div>
          </div>

          {/* ── Founder 2 ── */}
          <div style={{ padding: 2, borderRadius: 32, background: 'linear-gradient(145deg, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.2) 50%, rgba(255,255,255,0.04) 100%)' }}>
            <div style={{ background: 'linear-gradient(160deg, #0a1418 0%, #0b0f14 100%)', borderRadius: 30, padding: '44px 40px', height: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>

              {/* ambient glows */}
              <div style={{ position: 'absolute', top: -100, left: -60, width: 260, height: 260, background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -80, width: 220, height: 220, background: 'radial-gradient(circle, rgba(8,145,178,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* decorative large quote */}
              <div style={{ position: 'absolute', top: 16, right: 24, fontFamily: 'Georgia,serif', fontSize: 140, lineHeight: 1, color: 'rgba(6,182,212,0.07)', userSelect: 'none', pointerEvents: 'none' }}>"</div>

              {/* avatar */}
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg, #0891B2, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 24, boxShadow: '0 0 0 5px rgba(6,182,212,0.15), 0 0 40px rgba(6,182,212,0.22)' }}>SS</div>

              {/* name */}
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, fontWeight: 400, color: 'white', marginBottom: 10, lineHeight: 1.2 }}>Sanya Srivastava</div>

              {/* role badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#67e8f9', marginBottom: 6, letterSpacing: '0.3px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#67e8f9', display: 'inline-block' }} />
                FP&A @ Palo Alto Networks
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28, letterSpacing: '0.2px' }}>Finance · Corporate Strategy</div>

              {/* divider */}
              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(6,182,212,0.4), rgba(8,145,178,0.15), transparent)', marginBottom: 28 }} />

              {/* bio */}
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, marginBottom: 28, position: 'relative', zIndex: 1 }}>
                Built a career in finance and corporate strategy at a global tech company — without the "right" pedigree. Knows exactly what finance and strategy roles look for, and how to get there when no one hands you a roadmap.
              </p>

              {/* tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Finance', 'FP&A', 'Corporate Strategy'].map(tag => (
                  <span key={tag} style={{ padding: '5px 13px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.22)', borderRadius: 100, fontSize: 12, color: '#67e8f9', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* shared quote */}
        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === 1 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)' }} />)}
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(270deg, transparent, rgba(255,255,255,0.1))' }} />
          </div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(20px, 3vw, 28px)', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, fontStyle: 'italic', maxWidth: 600, margin: '0 auto' }}>
            "We built this because the system wasn't built for us.<br />Now it's built for you."
          </p>
        </div>
      </section>

      {/* URGENCY */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 28, padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'border-glow 4s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#FCA5A5', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'glow-pulse 1s ease-in-out infinite' }} />
            CLOSING SOON — 25 SEATS ONLY
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12, lineHeight: 1.1 }}>Summer Internship Batch Starts April 11</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 40 }}>Don't wait. Every day you delay is a day someone else gets the role you wanted.</p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
            {[{ label: 'Hours', val: pad(timeLeft.h) }, { label: 'Minutes', val: pad(timeLeft.m) }, { label: 'Seconds', val: pad(timeLeft.s) }].map(t => (
              <div key={t.label} className="countdown-box">
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, lineHeight: 1, color: '#4F7CFF', marginBottom: 4 }}>{t.val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{t.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/summer" className="btn-amber" style={{ fontSize: 17, padding: '18px 40px' }}>
              Get Your Summer Internship — ₹699
            </a>
            <a href="/book" className="btn-secondary" style={{ fontSize: 17, padding: '17px 36px' }}>Book a Call First</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>Founding batch · April 11 start · 25 seats only</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 6 }}>Beyond<span style={{ color: 'var(--blue)' }}>Campus</span></div>
            <div style={{ fontSize: 14, color: 'var(--muted)' }}>Breaking campus barriers since 2023</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/book" className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>Book Session</a>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <a href="/cohort" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
                <span>Join Cohort</span>
                <span style={{ position: 'relative', zIndex: 1 }}>→</span>
              </a>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 8, margin: '8px 0 0' }}>Coming Soon · Join the waitlist</p>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>© {new Date().getFullYear()} Beyond Campus. All rights reserved.</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>beyond-campus.in</p>
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

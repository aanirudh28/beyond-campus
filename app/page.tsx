'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 47, s: 33 })
  const [counters, setCounters] = useState({ salary: 0, placed: 0, rate: 0 })
  const statsRef = useRef<HTMLDivElement>(null)
  const statsStarted = useRef(false)

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
        @media(max-width:768px) {
          .sticky-nav { padding: 16px 20px; }
          .sticky-nav.scrolled { padding: 12px 20px; }
          .hero-headline { font-size: clamp(36px, 10vw, 56px); }
        }
      `}</style>

      <div className="noise-overlay" />

      {/* NAV */}
      <nav className={`sticky-nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: 'var(--blue)' }}>Campus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderRadius: 100, border: '1px solid rgba(255,255,255,0.12)', transition: 'all 0.2s' }}>Dashboard</a>
          <a href="/book" className="btn-secondary" style={{ padding: '10px 24px', fontSize: 14 }}>Book Session</a>
          <a href="/cohort" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            <span>Join Cohort</span>
            <span style={{ position: 'relative', zIndex: 1 }}>→</span>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="grid-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', top: '10%', left: '-10%', animation: 'glow-pulse 6s ease-in-out infinite' }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(123,97,255,0.15), transparent)', bottom: '5%', right: '-5%', animation: 'glow-pulse 8s ease-in-out infinite 2s' }} />
        <div className="orb" style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,210,255,0.1), transparent)', top: '40%', left: '60%', animation: 'float 8s ease-in-out infinite' }} />

        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', zIndex: 2, animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#93BBFF', marginBottom: 32, animation: 'border-glow 3s ease-in-out infinite' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7CFF', display: 'inline-block', animation: 'glow-pulse 1.5s ease-in-out infinite' }} />
            500+ students placed · Next batch starting April 1
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
            <a href="/book" className="btn-primary"><span>Book 1:1 Mentorship</span><span style={{ position: 'relative', zIndex: 1 }}>→</span></a>
            <a href="/cohort" className="btn-secondary">Join Next Cohort — ₹999</a>
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
                <div style={{ fontSize: 14, fontWeight: 700 }}>2,500+ students</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>placed off-campus</div>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Amazon', 'EY', 'CRED', 'Razorpay', 'Swiggy', 'Zepto'].map(c => (
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
            ['🎉 Rohan got placed at Amazon — ₹18LPA', '⚡ Priya cracked EY in 45 days', '🚀 Arjun landed CRED without referrals', '💼 Sneha got 3 offers in 1 month', '🔥 Aditya broke into Razorpay cold', '✅ Meera secured Swiggy PM role'].map((item, i) => (
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

      {/* PRODUCTS */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label">Our Programs</span>
          <h2 className="section-title">Pick your path to placement</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
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
            <a href="/cohort" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 32px', borderRadius: 100, background: 'linear-gradient(135deg, #7B61FF, #4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 40px rgba(123,97,255,0.4)', transition: 'all 0.3s' }}>
              Join Next Cohort →
            </a>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>Only 30 seats · April 1 start</p>
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
            { name: 'Priya Sharma', role: 'SDE Intern @ Razorpay', days: '38 days', quote: 'I had given up on off-campus. After week 2 of the cohort, I got 3 replies from cold emails. Got my offer in 38 days.', color: '#4F7CFF', result: '₹12 LPA offer' },
            { name: 'Arjun Patel', role: 'Product Intern @ CRED', days: '45 days', quote: 'The mentor reviewed my resume and gave me a company hit list. I had a PPO offer in 45 days. Best ₹999 I ever spent.', color: '#7B61FF', result: 'PPO Secured' },
            { name: 'Sneha Reddy', role: 'Data Science @ Swiggy', days: '52 days', quote: 'Nobody from my college had ever cracked Swiggy. The LinkedIn DM strategy changed everything.', color: '#06b6d4', result: '3 Competing Offers' },
            { name: 'Rohan Mehta', role: 'SDE @ Amazon', days: '60 days', quote: 'Tier-3 college. No IIT tag. But with the right outreach strategy, I landed Amazon. This program is real.', color: '#10b981', result: '₹22 LPA package' },
            { name: 'Aditya Kumar', role: 'PM @ Razorpay', days: '41 days', quote: 'I switched from engineering to product management through this cohort. The mentor connections made it happen.', color: '#f59e0b', result: 'Career Switch Success' },
            { name: 'Meera Joshi', role: 'Data Analyst @ EY', days: '29 days', quote: 'EY wasn\'t even on my radar. My mentor pushed me to apply and helped me prep. Got the call in 29 days.', color: '#ec4899', result: 'Dream Company Cracked' },
          ].map((t, i) => (
            <div key={i} className="proof-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #0B0B0F)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{t.name[0]}</div>
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
            { num: `₹${counters.salary}Cr+`, label: 'Total salaries unlocked', sub: 'and counting' },
            { num: `${counters.placed}+`, label: 'Students placed', sub: 'off-campus' },
            { num: `${counters.rate}x`, label: 'Interview success rate', sub: 'vs average' },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num" style={{ background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 8 }}>{s.num}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER */}
      <section style={{ padding: '100px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-label">Our Story</span>
          <h2 className="section-title">Built by someone who figured it out the hard way</h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(79,124,255,0.15), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>R</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, marginBottom: 4 }}>Rahul Verma</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Senior SDE @ Microsoft · Ex-Razorpay · IIT Bombay</div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 16 }}>
                "I graduated from a tier-3 college with no placements, no network, and no idea what to do. I spent 6 months figuring out cold outreach, LinkedIn, and resume strategy on my own — and eventually landed Razorpay, then Microsoft."
              </p>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                "I built Beyond Campus so you don't have to spend 6 months figuring it out alone. You can do it in 8 weeks."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* URGENCY */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.1), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 28, padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'border-glow 4s ease-in-out infinite' }}>
          <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 300, height: 200, background: 'radial-gradient(circle, rgba(79,124,255,0.2), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, fontSize: 12, fontWeight: 700, color: '#FCA5A5', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'glow-pulse 1s ease-in-out infinite' }} />
            CLOSING SOON — 30 SEATS ONLY
          </div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: 12, lineHeight: 1.1 }}>Next Cohort Starts April 1</h2>
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
            <a href="/cohort" className="btn-primary" style={{ fontSize: 17, padding: '18px 40px' }}>
              <span>Join Cohort — ₹999</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
            <a href="/book" className="btn-secondary" style={{ fontSize: 17, padding: '17px 36px' }}>Book a Call First</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 20 }}>30-day results guarantee · No corporate jargon · Real placements</p>
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
            <a href="/cohort" className="btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              <span>Join Cohort</span>
              <span style={{ position: 'relative', zIndex: 1 }}>→</span>
            </a>
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

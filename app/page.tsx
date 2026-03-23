'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { num: '2,500+', label: 'Students Mentored' },
  { num: '850+', label: 'Offers Secured' },
  { num: '94%', label: 'Success Rate' },
]

const problems = [
  { icon: '🎯', title: 'No Strategy', desc: 'Applying randomly to 100s of jobs with zero results' },
  { icon: '📄', title: 'Weak Resume', desc: 'ATS rejects you before a human even reads your name' },
  { icon: '📩', title: 'No Replies', desc: 'Cold emails and DMs go unanswered for weeks' },
  { icon: '🏫', title: 'No Network', desc: 'Stuck waiting for campus placements that never come' },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'SDE Intern @ Razorpay', initial: 'P', color: '#6366f1', quote: 'After joining the cohort, I got 4 interview calls within a month. The cold email templates worked like magic.' },
  { name: 'Arjun Patel', role: 'Product Intern @ CRED', initial: 'A', color: '#8b5cf6', quote: 'My mentor reviewed my resume and guided my entire outreach plan. I got my first PPO offer in 6 weeks!' },
  { name: 'Sneha Reddy', role: 'Data Science Intern @ Swiggy', initial: 'S', color: '#06b6d4', quote: 'The personalized sessions gave me a crystal-clear roadmap. I finally landed multiple internship offers!' },
]

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })
    }
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('scroll', handleScroll) }
  }, [])

  return (
    <main style={{ fontFamily: "'Inter', 'Poppins', sans-serif", background: '#080818', color: 'white', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fade-up { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes counter { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
        @keyframes orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
        .animate-fade-up { animation: fade-up 0.8s ease forwards; }
        .card-3d { transition: transform 0.3s ease, box-shadow 0.3s ease; transform-style: preserve-3d; }
        .card-3d:hover { transform: perspective(1000px) rotateX(-5deg) rotateY(5deg) scale(1.02); box-shadow: 0 30px 60px rgba(99,102,241,0.3); }
        .shimmer-text { background: linear-gradient(90deg, #6366f1, #a855f7, #06b6d4, #6366f1); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 3s linear infinite; }
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::before { content:''; position:absolute; inset:-2px; background: linear-gradient(90deg, #f97316, #ef4444, #f97316); background-size: 200%; animation: shimmer 2s linear infinite; border-radius: inherit; z-index: -1; }
        .glow-btn::after { content:''; position:absolute; inset:2px; background: #f97316; border-radius: inherit; z-index: -1; transition: background 0.3s; }
        .glow-btn:hover::after { background: #ea6307; }
        .grid-bg { background-image: linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px); background-size: 60px 60px; }
        .noise { position:relative; }
        .noise::before { content:''; position:absolute; inset:0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events:none; z-index:1; }
        .problem-card { background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05)); border: 1px solid rgba(99,102,241,0.2); border-radius: 20px; padding: 32px; transition: all 0.4s ease; cursor: default; }
        .problem-card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(99,102,241,0.5); background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1)); box-shadow: 0 20px 40px rgba(99,102,241,0.2); }
        .testimonial-card { background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px; transition: all 0.4s ease; }
        .testimonial-card:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.2); box-shadow: 0 30px 60px rgba(0,0,0,0.3); }
        .stat-card { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.05)); border: 1px solid rgba(99,102,241,0.25); border-radius: 20px; padding: 32px 24px; text-align: center; transition: all 0.4s ease; }
        .stat-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 20px 40px rgba(99,102,241,0.25); }
        .floating-badge { animation: float 3s ease-in-out infinite; }
        .floating-badge:nth-child(2) { animation-delay: -1s; }
        .floating-badge:nth-child(3) { animation-delay: -2s; }
        section { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
        section.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrollY > 50 ? 'rgba(8,8,24,0.9)' : 'transparent', backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none', borderBottom: scrollY > 50 ? '1px solid rgba(99,102,241,0.2)' : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Beyond Campus</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/book" style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.4)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.3s' }}>Book Session</a>
          <a href="/internship" style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Join Cohort</a>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="noise grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden', opacity: 1, transform: 'none' }}>
        {/* 3D Orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(60px)', transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`, transition: 'transform 0.1s ease', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)', filter: 'blur(60px)', transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`, transition: 'transform 0.1s ease', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(80px)', transform: `translate(-50%, -50%) translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`, pointerEvents: 'none' }} />

        {/* Floating 3D Badges */}
        <div className="floating-badge" style={{ position: 'absolute', top: '20%', right: '12%', background: 'rgba(99,102,241,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#a5b4fc' }}>🚀 500+ Offers This Year</div>
        <div className="floating-badge" style={{ position: 'absolute', bottom: '28%', left: '8%', background: 'rgba(6,182,212,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 16, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#67e8f9' }}>⚡ 94% Success Rate</div>
        <div className="floating-badge" style={{ position: 'absolute', top: '35%', left: '6%', background: 'rgba(168,85,247,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 16, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#d8b4fe' }}>🎯 2500+ Students</div>

        <div style={{ maxWidth: 780, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fdba74', marginBottom: 32 }}>
            🔥 Next Batch — April 1 · Only 30 Seats Left
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2px' }}>
            Land Your Dream<br />
            <span className="shimmer-text">Internship</span><br />
            Without Campus Placement
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
            Join 2,500+ students who've secured offers through personalized mentorship and structured cohorts — designed for real results.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/book" className="glow-btn" style={{ padding: '18px 36px', borderRadius: 16, background: '#f97316', color: 'white', textDecoration: 'none', fontSize: 17, fontWeight: 700, display: 'inline-block', position: 'relative' }}>
              Book Session — ₹299
            </a>
            <a href="/internship" style={{ padding: '18px 36px', borderRadius: 16, background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.5)', color: '#a5b4fc', textDecoration: 'none', fontSize: 17, fontWeight: 600, backdropFilter: 'blur(10px)', transition: 'all 0.3s' }}>
              Join Cohort — ₹999 →
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <SectionReveal>
        <div style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Problem */}
      <SectionReveal>
        <div style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Why Most Students <span style={{ color: '#f87171' }}>Fail</span> Off-Campus</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)' }}>Sound familiar? You're not alone.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {problems.map((p, i) => (
              <div key={i} className="problem-card">
                <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Solution */}
      <SectionReveal>
        <div style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 32, padding: '60px 48px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-1px' }}>The <span className="shimmer-text">Beyond Campus</span> System</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 40, maxWidth: 540, margin: '0 auto 40px' }}>
              We combine 1:1 mentorship, proven cold-outreach strategies, and cohort-based accountability — so you stop guessing and start getting interviews.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/book" style={{ padding: '16px 32px', borderRadius: 14, background: '#f97316', color: 'white', textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>Book Mentorship</a>
              <a href="/internship" style={{ padding: '16px 32px', borderRadius: 14, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>Join Cohort →</a>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* Testimonials */}
      <SectionReveal>
        <div style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Real Students, <span className="shimmer-text">Real Results</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card card-3d">
                <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.6 }}>"</div>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${t.color}, #1e1b4b)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{t.initial}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Final CTA */}
      <SectionReveal>
        <div style={{ padding: '100px 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.2), transparent)', transform: 'translate(-50%,-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-2px', position: 'relative' }}>Ready to <span className="shimmer-text">Get Placed?</span></h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', marginBottom: 48, position: 'relative' }}>Join 2,500+ students who stopped waiting and started getting offers.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            <a href="/book" className="glow-btn" style={{ padding: '20px 40px', borderRadius: 16, background: '#f97316', color: 'white', textDecoration: 'none', fontSize: 18, fontWeight: 700, position: 'relative' }}>Book Session — ₹299</a>
            <a href="/internship" style={{ padding: '20px 40px', borderRadius: 16, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', textDecoration: 'none', fontSize: 18, fontWeight: 700 }}>Join Cohort — ₹999</a>
          </div>
        </div>
      </SectionReveal>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 800, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 12 }}>Beyond Campus</div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 8 }}>Helping students land dream internships through mentorship and strategy.</p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>© {new Date().getFullYear()} Beyond Campus · All rights reserved</p>
      </footer>

      <ScrollRevealScript />
    </main>
  )
}

function SectionReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return (
    <section ref={ref} className={visible ? 'visible' : ''} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}>
      {children}
    </section>
  )
}

function ScrollRevealScript() {
  return null
}
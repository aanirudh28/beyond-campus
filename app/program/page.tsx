'use client'

import { useState, useEffect, useRef } from 'react'

function useFadeUp(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

const WEEKS = [
  { icon: '🎯', label: 'Foundation & Diagnosis', items: ['Resume audit and complete rewrite', 'LinkedIn profile overhaul', 'Naukri optimization', 'Identifying your target roles and companies'] },
  { icon: '📧', label: 'Cold Email Mastery', items: ['Writing cold emails that get replies', 'Subject line formulas that work', 'Follow-up sequences', 'Mail merge setup for scale'] },
  { icon: '💼', label: 'LinkedIn & Networking Strategy', items: ['LinkedIn DM scripts for HRs, founders, and alumni', 'How to build a network from zero', 'Comment strategy to get noticed', 'Turning connections into referrals'] },
  { icon: '🏢', label: 'Company Targeting & Research', items: ['How to build your target company list', 'Finding the right people to contact', 'Using tools like Apollo, Hunter.io', 'Startup vs corporate targeting strategies'] },
  { icon: '🗣️', label: 'Interview Preparation', items: ['HR round preparation for business roles', 'Case study basics for consulting', 'Finance interview fundamentals', 'How to talk about your background confidently'] },
  { icon: '🔗', label: 'Referrals & Warm Introductions', items: ['Getting referrals without knowing anyone', 'Alumni outreach that actually works', "Founder's Office targeting strategy", 'Leveraging LinkedIn for warm intros'] },
  { icon: '📊', label: 'Tracking & Optimizing', items: ["Building your outreach tracker", "What to do when you're not getting replies", 'A/B testing your emails and messages', "Doubling down on what's working"] },
  { icon: '🎉', label: 'Offer Negotiation & Closing', items: ['How to handle multiple offers', 'Salary negotiation basics', 'Following up after interviews', "What to do if you're still searching"] },
]

const INCLUSIONS = [
  { icon: '📧', title: 'Cold Email Templates', desc: '50+ proven templates across industries' },
  { icon: '💼', title: 'Resume Template', desc: 'ATS-optimized for business roles' },
  { icon: '🔗', title: 'LinkedIn DM Scripts', desc: 'Word-for-word messages that get replies' },
  { icon: '📋', title: 'Target Company Spreadsheet', desc: '200+ companies hiring off-campus' },
  { icon: '🎯', title: 'Role-Specific Guides', desc: "Consulting, finance, Founder's Office playbooks" },
  { icon: '📞', title: 'Weekly Live Sessions', desc: '8 weeks of live group calls' },
  { icon: '👥', title: 'Private WhatsApp Community', desc: 'Students, alumni, and mentors' },
  { icon: '🔄', title: 'Lifetime Resource Access', desc: 'All materials updated regularly' },
  { icon: '🤝', title: 'Warm Introductions', desc: 'Direct intros to people at target companies' },
  { icon: '📱', title: 'WhatsApp Support', desc: 'Direct access between sessions' },
]

const FAQS = [
  { q: 'What domains do you help with?', a: "Consulting, finance, Founder's Office, marketing, business development, and operations. We focus exclusively on non-tech business roles — no coding, no SDE prep." },
  { q: "I'm from a tier-2 or tier-3 college. Will this work for me?", a: "Yes — that's exactly who we built this for. Most of our students come from colleges outside the top 10 and break into roles their college placement cell couldn't get them." },
  { q: "What if I'm already applying and getting some responses?", a: "That's genuinely a good sign — keep going. Resilience and consistency eventually show results. If you feel your current approach is working, stick with it. The program is for students who feel stuck or want to add more structure and reach to what they're already doing." },
  { q: "I want to explore before committing. Where do I start?", a: "Start with our free resources — cold email templates, LinkedIn DM scripts, and the target company spreadsheet are all available without paying anything. Try them, see if they work for your situation, and decide from there." },
  { q: "Is the live session schedule flexible?", a: "Sessions are scheduled for evenings and weekends to work around college or work hours. If you miss a session, a recording is shared with the group." },
]

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { ref, visible } = useFadeUp()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(36px)', transition: 'opacity 0.7s ease, transform 0.7s ease', ...style }}>
      {children}
    </div>
  )
}

export default function ProgramPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  const [showMobileSticky, setShowMobileSticky] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      const heroBottom = heroRef.current ? heroRef.current.getBoundingClientRect().bottom : 0
      setShowMobileSticky(heroBottom < 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes glow-pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes dot-pulse{0%,100%{box-shadow:0 0 0 0 rgba(79,124,255,0.7)}50%{box-shadow:0 0 0 8px rgba(79,124,255,0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        .gradient-text{background:linear-gradient(135deg,#4F7CFF,#7B61FF,#00D2FF);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 5s linear infinite}
        .section-label{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#4F7CFF;margin-bottom:14px;display:block}
        .section-title{font-family:"DM Serif Display",serif;font-size:clamp(28px,4vw,48px);line-height:1.1;letter-spacing:-1px}
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;transition:all 0.3s;padding:20px 40px;display:flex;align-items:center;justify-content:space-between}
        .nav.scrolled{background:rgba(11,11,15,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:14px 40px}
        .btn-orange{display:inline-flex;align-items:center;gap:8px;padding:15px 32px;border-radius:100px;background:linear-gradient(135deg,#FF6B35,#FF4500);color:white;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.3s;border:none;box-shadow:0 0 32px rgba(255,107,53,0.35);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-orange:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(255,107,53,0.55)}
        .btn-orange.large{padding:18px 44px;font-size:17px}
        .btn-blue{display:inline-flex;align-items:center;gap:8px;padding:15px 32px;border-radius:100px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);color:white;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.3s;border:none;box-shadow:0 0 28px rgba(79,124,255,0.35);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-blue:hover{transform:translateY(-2px);box-shadow:0 0 48px rgba(79,124,255,0.55)}
        .btn-outlined{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:100px;background:transparent;color:white;font-weight:600;font-size:15px;cursor:pointer;transition:all 0.3s;border:1.5px solid rgba(255,255,255,0.2);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-outlined:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.4);transform:translateY(-2px)}
        .inclusion-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:20px;padding:24px;transition:all 0.3s;cursor:default}
        .inclusion-card:hover{border-color:rgba(79,124,255,0.45);transform:translateY(-4px);box-shadow:0 12px 40px rgba(79,124,255,0.15)}
        .product-card{background:#111827;border:1.5px solid rgba(255,255,255,0.08);border-radius:28px;padding:36px 32px;transition:all 0.35s;position:relative;overflow:hidden;flex:1}
        .product-card.rec{border-color:rgba(79,124,255,0.5);box-shadow:0 0 0 1px rgba(79,124,255,0.2),0 24px 64px rgba(79,124,255,0.18);background:linear-gradient(135deg,rgba(79,124,255,0.07),rgba(123,97,255,0.04))}
        .product-card:hover{transform:translateY(-6px);box-shadow:0 24px 64px rgba(79,124,255,0.2);border-color:rgba(79,124,255,0.4)}
        .check-item{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6}
        .faq-item{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;transition:border-color 0.3s}
        .faq-item.open{border-color:rgba(79,124,255,0.35)}
        .faq-btn{width:100%;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;cursor:pointer;text-align:left;gap:16px;color:white;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:600;line-height:1.5}
        .faq-plus{font-size:20px;color:#4F7CFF;flex-shrink:0;transition:transform 0.3s;display:inline-block;line-height:1}
        .faq-plus.open{transform:rotate(45deg)}
        .faq-body{overflow:hidden;transition:max-height 0.35s ease}
        .timeline-dot{width:16px;height:16px;border-radius:50%;background:#4F7CFF;border:3px solid #0B0B0F;flex-shrink:0;position:relative;z-index:2;animation:dot-pulse 2.5s ease-in-out infinite}
        .mobile-sticky{position:fixed;bottom:0;left:0;right:0;z-index:200;padding:16px 20px;background:rgba(11,11,15,0.96);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,0.08);animation:slideUp 0.35s ease both}
        .x-dot{width:24px;height:24px;border-radius:50%;background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.28);display:flex;align-items:center;justify-content:center;font-size:11px;color:rgba(239,68,68,0.65);flex-shrink:0;font-weight:700;line-height:1}
        .arr-dot{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,rgba(79,124,255,0.18),rgba(123,97,255,0.12));border:1.5px solid rgba(79,124,255,0.38);display:flex;align-items:center;justify-content:center;font-size:12px;color:#6fa3ff;flex-shrink:0;font-weight:700;line-height:1}
        .compare-row{display:flex;align-items:flex-start;gap:14px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,0.045)}
        .compare-row:last-child{border-bottom:none;padding-bottom:0}
        .compare-row:first-child{padding-top:0}
        .for-card{background:#0f1520;border:1px solid rgba(255,255,255,0.07);border-radius:22px;padding:28px 26px;transition:border-color 0.35s,transform 0.35s,box-shadow 0.35s;cursor:default}
        .for-card:hover{border-color:rgba(79,124,255,0.38);transform:translateY(-3px);box-shadow:0 16px 48px rgba(79,124,255,0.12)}
        .notfor-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:100px;font-size:13px;color:rgba(255,255,255,0.4)}
        @media(max-width:768px){
          .nav{padding:16px 20px}
          .nav.scrolled{padding:12px 20px}
          .two-col{flex-direction:column!important}
          .three-col{grid-template-columns:1fr 1fr!important}
          .products-row{flex-direction:column!important}
          .timeline-row.right .timeline-content{margin-left:0!important;margin-right:0!important}
          .notfor-pills{flex-direction:column!important;align-items:flex-start!important}
        }
        @media(min-width:769px){
          .mobile-sticky{display:none!important}
          .three-col{grid-template-columns:repeat(3,1fr)!important}
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrollY > 40 ? ' scrolled' : ''}`}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, letterSpacing: -0.5, color: 'white' }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="/book" className="btn-outlined" style={{ padding: '9px 22px', fontSize: 13 }}>Book Session</a>
          <a href="/cohort" className="btn-blue" style={{ padding: '9px 22px', fontSize: 13 }}>Join Cohort</a>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section ref={heroRef} style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,124,255,0.1),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease both' }}>
          <span className="section-label" style={{ justifyContent: 'center', display: 'block' }}>THE FULL PROGRAM</span>
          <h1 className="section-title" style={{ fontSize: 'clamp(36px,5.5vw,64px)', marginBottom: 24 }}>
            Everything You Get When You<br />
            <span className="gradient-text">Join Beyond Campus</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}>
            Not a course. Not a workshop. A complete placement system built for students who are done waiting.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <a href="/cohort" className="btn-orange large">Join the Next Cohort →</a>
            <a href="/book" className="btn-outlined" style={{ padding: '17px 36px', fontSize: 16 }}>Start with a 1:1 Session</a>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3 }}>
            📱 WhatsApp support · 🌍 Students from 50+ colleges · 📅 Next batch starts April 1 · 🔒 Secure checkout via Razorpay
          </div>
        </div>
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">WHY THIS EXISTS</span>
            <h2 className="section-title">The system was not built for you.<br />So we built a new one.</h2>
          </div>
          <div className="two-col" style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>

            {/* Old Way panel */}
            <div style={{ flex: 1, background: 'rgba(20,10,10,0.7)', border: '1px solid rgba(239,68,68,0.14)', borderRadius: 28, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(239,68,68,0.07), transparent)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(239,68,68,0.7)' }}>Before</span>
              </div>
              {[
                'Applying everywhere with no clear strategy',
                'Waiting for campus placements that never come',
                'Cold emails that go nowhere — no replies, no feedback',
                'Watching peers get placed through referrals you don\'t have',
                'Generic YouTube advice that doesn\'t fit your situation',
                'Months of effort with nothing to show for it',
              ].map((t, i) => (
                <div key={i} className="compare-row">
                  <div className="x-dot">✕</div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, textDecoration: 'none' }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Center VS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 40 }}>
              <div style={{ writingMode: 'vertical-rl', fontSize: 11, fontWeight: 800, letterSpacing: 4, color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>VS</div>
            </div>

            {/* BC Way panel */}
            <div style={{ flex: 1, background: 'rgba(8,12,22,0.9)', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 28, padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle, rgba(79,124,255,0.1), transparent)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F7CFF', boxShadow: '0 0 10px rgba(79,124,255,0.8)' }} />
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#4F7CFF' }}>With Beyond Campus</span>
              </div>
              {[
                'A personalised strategy built around your background and goals',
                'Cold emails using our templates get replies within 24 hours',
                'Direct introductions to people at your target companies',
                'Weekly accountability so you never lose momentum',
                'A community of students going through the exact same journey',
                'A clear path from stuck to placed in 30 days',
              ].map((t, i) => (
                <div key={i} className="compare-row">
                  <div className="arr-dot">→</div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>

          </div>
        </Section>
      </section>

      {/* SECTION 3 — WHO IT'S FOR */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.012)' }}>
        <Section style={{ maxWidth: 960, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">IS THIS FOR YOU?</span>
            <h2 className="section-title">Built for anyone chasing<br />non-tech business roles</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 480, margin: '18px auto 0', lineHeight: 1.75 }}>
              Commerce, humanities, science, engineering — your background doesn't define your ceiling. If you're going after business roles off-campus, read on.
            </p>
          </div>

          {/* For-you cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 48 }}>
            {[
              { icon: '🎓', title: 'Final year or recent grad', desc: "You're entering the job market without a strong campus placement system backing you." },
              { icon: '🎯', title: 'Targeting business roles', desc: "Consulting, finance, Founder's Office, marketing, BD, or operations — any non-tech domain." },
              { icon: '🏫', title: 'Tier-2 or tier-3 college', desc: "Top companies don't come to your campus. You know you have to find your own way in." },
              { icon: '📬', title: 'Applying but not hearing back', desc: "You're putting in the effort — applications, emails — but getting little to no response." },
              { icon: '🗂️', title: 'Want a system, not just advice', desc: "You're done with vague motivation. You want a step-by-step process that actually moves the needle." },
              { icon: '💪', title: 'Ready to do the work', desc: "You're not looking for magic. You'll send the emails and make the calls — if someone shows you exactly how." },
            ].map((c, i) => (
              <div key={i} className="for-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(79,124,255,0.18), rgba(123,97,255,0.12))', border: '1px solid rgba(79,124,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{c.title}</div>
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7 }}>{c.desc}</div>
              </div>
            ))}
          </div>

          {/* Not for you — pill strip */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 16 }}>Not for you if —</div>
            <div className="notfor-pills" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                "You want zero-effort shortcuts",
                "You prefer passive video courses",
                "You won't send cold emails or DMs",
              ].map((t, i) => (
                <span key={i} className="notfor-pill">
                  <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.5)' }}>✕</span>
                  {t}
                </span>
              ))}
            </div>
          </div>

        </Section>
      </section>

      {/* SECTION 4 — CURRICULUM */}
      <section style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label">WHAT YOU GET</span>
            <h2 className="section-title">8 weeks. Every single thing you need.</h2>
          </div>
          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, rgba(79,124,255,0.8), rgba(123,97,255,0.4))', transform: 'translateX(-50%)', zIndex: 1 }} className="timeline-line" />
            <style>{`.timeline-line{display:block}@media(max-width:768px){.timeline-line{left:20px!important;transform:none!important}.timeline-row{flex-direction:column!important;padding-left:52px!important}.timeline-row .timeline-dot-wrap{position:absolute!important;left:12px!important;top:24px!important}.timeline-row .timeline-content{width:100%!important;margin:0!important}}`}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {WEEKS.map((week, i) => {
                const isRight = i % 2 === 0
                return (
                  <div key={i} className="timeline-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative', paddingBottom: 40 }}>
                    {/* Left content */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 32 }}>
                      {!isRight && (
                        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 28px', maxWidth: 360, width: '100%', transition: 'border-color 0.3s' }}>
                          <WeekCard week={week} num={i + 1} />
                        </div>
                      )}
                    </div>
                    {/* Center dot */}
                    <div className="timeline-dot-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                      <div className="timeline-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                    </div>
                    {/* Right content */}
                    <div style={{ flex: 1, paddingLeft: 32 }}>
                      {isRight && (
                        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 28px', maxWidth: 360, width: '100%' }}>
                          <WeekCard week={week} num={i + 1} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>
      </section>

      {/* SECTION 5 — INCLUSIONS */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)' }}>
        <Section style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-label">WHAT'S INCLUDED</span>
            <h2 className="section-title">You get all of this</h2>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
            {INCLUSIONS.map((inc, i) => (
              <div key={i} className="inclusion-card">
                <div style={{ fontSize: 28, marginBottom: 14 }}>{inc.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>{inc.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.1),rgba(123,97,255,0.07))', border: '1.5px solid rgba(79,124,255,0.3)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 4 }}>Bonus: Join before April 1</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>Get a personal 30-minute 1:1 strategy call included at no extra cost.</div>
            </div>
          </div>
        </Section>
      </section>

      {/* SECTION 6 — PRICING */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <Section>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-label">SIMPLE PRICING</span>
            <h2 className="section-title">One decision. One investment.<br />One outcome.</h2>
          </div>
          <div className="products-row" style={{ display: 'flex', gap: 24, alignItems: 'stretch', marginBottom: 28 }}>
            {/* Session card */}
            <div className="product-card">
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>For students who want to start small</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, lineHeight: 1.2, marginBottom: 20 }}>1:1 Mentorship<br />Session</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#4F7CFF' }}>₹299</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₹999</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>1 hour · Live call</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {['Resume audit and rewrite plan', 'Personalized cold outreach strategy', 'LinkedIn and Naukri profile review', 'Target company hit list for your domain', 'Direct WhatsApp access for 7 days'].map((f, i) => (
                  <div key={i} className="check-item"><span style={{ color: '#4F7CFF', fontSize: 15, flexShrink: 0 }}>✓</span>{f}</div>
                ))}
              </div>
              <a href="/book" className="btn-outlined" style={{ width: '100%', justifyContent: 'center' }}>Book My Session →</a>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 12 }}>Most students do this before joining the cohort</p>
            </div>
            {/* Cohort card */}
            <div className="product-card rec">
              <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '5px 20px', background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', borderRadius: '0 0 12px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Recommended</div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>For students who want the complete system</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, lineHeight: 1.2, marginBottom: 20 }}>8-Week Placement<br />Accelerator</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: '#7B61FF' }}>₹999</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₹4,999</span>
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>8 weeks · Live sessions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                  {['Everything in the 1:1 session', 'Weekly live group sessions (8 weeks)', 'Cold email and LinkedIn DM masterclass', 'Resume and Naukri optimization workshop', "Consulting, finance and Founder's Office targeting", 'Private WhatsApp community access', '50+ templates, scripts and resources', 'Lifetime access to all materials'].map((f, i) => (
                    <div key={i} className="check-item"><span style={{ color: '#7B61FF', fontSize: 15, flexShrink: 0 }}>✓</span>{f}</div>
                  ))}
                </div>
                <a href="/cohort" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '15px 32px', borderRadius: 100, background: 'linear-gradient(135deg,#7B61FF,#4F7CFF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 36px rgba(123,97,255,0.35)', transition: 'all 0.3s', fontFamily: "'DM Sans',sans-serif" }}>Join the Cohort →</a>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 12 }}>Next batch April 1 · Only 30 seats</p>
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
            Not sure which one? Start with the session. Most cohort students did.
          </p>
        </Section>
      </section>

      {/* SECTION 7 — FAQ */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.015)' }}>
        <Section style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Common questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.82)' }}>{faq.q}</span>
                  <span className={`faq-plus${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className="faq-body" style={{ maxHeight: openFaq === i ? 240 : 0 }}>
                  <div style={{ padding: '0 24px 22px', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,124,255,0.1),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <Section style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(30px,4.5vw,52px)', lineHeight: 1.1, letterSpacing: -1, marginBottom: 20 }}>
            You've read everything.<br />
            <span className="gradient-text">Now make the move.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, marginBottom: 40 }}>
            Every week you spend without a strategy is a week someone else gets the role you wanted. The next batch starts April 1.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <a href="/cohort" className="btn-orange large">Join the Next Cohort →</a>
            <a href="/book" className="btn-outlined" style={{ padding: '17px 36px', fontSize: 16 }}>Start with a 1:1 Session</a>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', letterSpacing: 0.3 }}>
            📱 WhatsApp support · 🌍 50+ colleges · 📅 Next batch April 1 · 🔒 Secure checkout via Razorpay
          </div>
        </Section>
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        © 2025 Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>beyond-campus.in</a>
      </div>

      {/* MOBILE STICKY CTA */}
      {showMobileSticky && (
        <div className="mobile-sticky">
          <a href="/cohort" className="btn-orange" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
            Join the Cohort — ₹999 →
          </a>
        </div>
      )}
    </main>
  )
}

function WeekCard({ week, num }: { week: typeof WEEKS[0]; num: number }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{week.icon}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF' }}>Week {num}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{week.label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {week.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
            <span style={{ color: '#4F7CFF', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>{item}
          </div>
        ))}
      </div>
    </>
  )
}

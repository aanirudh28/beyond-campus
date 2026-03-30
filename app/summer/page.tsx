'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global { interface Window { Razorpay: any } }

const WEEKS = [
  { icon: '🎯', label: 'Build Your Foundation', items: ['Resume built specifically for internship applications', 'LinkedIn profile optimized for summer hiring', 'Naukri profile setup for internship search', 'Identifying your target internship roles and companies'] },
  { icon: '📧', label: 'Launch Your Outreach', items: ['Cold email templates for internship applications', 'LinkedIn DM scripts for reaching HR and founders', 'Building your target company list (startups + corporates)', 'Sending your first 20 outreach messages with mentor review'] },
  { icon: '🔗', label: 'Get Into Conversations', items: ['Following up on cold emails and DMs', 'How to handle responses and schedule calls', 'Basic interview preparation for internship roles', 'Referral outreach through alumni and seniors'] },
  { icon: '🎉', label: 'Convert to Offer', items: ['Converting conversations to internship offers', 'Negotiating internship terms and stipend', "What to do if you're still searching (backup strategy)", 'Setting yourself up for a PPO (Pre-Placement Offer)'] },
]

const INCLUSIONS = [
  { icon: '📧', title: 'Cold Email Templates for Internships', desc: 'Optimized for summer hiring season' },
  { icon: '💼', title: 'Internship Resume Template', desc: 'Built for students with no prior experience' },
  { icon: '🔗', title: 'LinkedIn DM Scripts', desc: 'For HRs, founders, and alumni' },
  { icon: '📋', title: 'Target Company List', desc: '100+ companies actively taking interns this summer' },
  { icon: '📞', title: '4 Weekly Live Sessions', desc: 'Direct mentor access every week' },
  { icon: '👥', title: 'Private WhatsApp Community', desc: 'Connect with students in the same batch' },
  { icon: '🎯', title: 'Personalized Feedback', desc: 'Resume and outreach reviewed by mentor' },
  { icon: '♾️', title: 'Lifetime Resource Access', desc: 'All materials yours to keep' },
]

const FAQS = [
  { q: 'What year of college should I be in to join?', a: 'Ideally 1st, 2nd, or 3rd year — students who have at least one summer ahead of them. Final year students are better suited for our job placement cohort.' },
  { q: 'I have absolutely no experience. Can I still get an internship?', a: "Yes — that's exactly who this program is built for. The resume template and outreach strategy are specifically designed for students with no prior internship experience." },
  { q: 'What domains do you help with?', a: 'Consulting, finance, Founder\'s Office, marketing, business development, and operations. No coding or tech roles.' },
  { q: 'How is this different from the 8-week cohort?', a: 'The summer program is shorter (4 weeks), cheaper (₹599 vs ₹999), and focused specifically on internship applications during the summer hiring season. The 8-week cohort is more comprehensive and suited for full-time job placement.' },
  { q: "What if I don't get an internship in 4 weeks?", a: "You keep everything — templates, resources, community access — and you can continue applying with the same strategy. Most students see their first responses within the first 2 weeks of outreach." },
  { q: 'How quickly can I get started after paying?', a: 'Immediately. Confirmation email within 2 minutes, WhatsApp group access the same day, and onboarding starts on May 1.' },
]

export default function SummerPage() {
  const [scrollY, setScrollY] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', college: '', year: '', domain: '', source: '', reason: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const curriculumRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required'
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Valid phone required'
    if (!form.college.trim()) e.college = 'Required'
    if (!form.year) e.year = 'Required'
    if (!form.domain) e.domain = 'Required'
    if (!form.reason.trim()) e.reason = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('summer_registrations')
        .insert({ ...form, payment_status: 'pending' })
        .select('id')
        .single()
      if (error) throw error
      setRegistrationId(data.id)

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 599 }),
      })
      const { orderId } = await orderRes.json()

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 59900,
        currency: 'INR',
        name: 'Beyond Campus',
        description: 'Summer Internship Program 2025',
        order_id: orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#f59e0b' },
        handler: async (response: any) => {
          await supabase
            .from('summer_registrations')
            .update({ payment_id: response.razorpay_payment_id, payment_status: 'paid' })
            .eq('id', data.id)

          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              type: 'summer',
            }),
          })
          setSuccess(true)
        },
        modal: { ondismiss: () => setSubmitting(false) },
      })
      rzp.open()
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const amber = '#f59e0b'
  const orange = '#f97316'

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmerAmber{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes glowAmber{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes confetti-fall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes dot-pulse-amber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.7)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
        .gradient-text-amber{background:linear-gradient(135deg,#f59e0b,#f97316,#ef4444);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmerAmber 4s linear infinite}
        .section-label-amber{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;margin-bottom:14px;display:block}
        .nav-s{position:fixed;top:0;left:0;right:0;z-index:100;transition:all 0.3s;padding:20px 40px;display:flex;align-items:center;justify-content:space-between}
        .nav-s.scrolled{background:rgba(11,11,15,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:14px 40px}
        .btn-amber{display:inline-flex;align-items:center;gap:8px;padding:15px 32px;border-radius:100px;background:linear-gradient(135deg,#f59e0b,#f97316);color:white;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.3s;border:none;box-shadow:0 0 32px rgba(245,158,11,0.35);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-amber:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(245,158,11,0.55)}
        .btn-amber.large{padding:18px 44px;font-size:17px}
        .btn-amber.full{width:100%;justify-content:center;font-size:16px;padding:18px 32px}
        .btn-outlined-s{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:100px;background:transparent;color:white;font-weight:600;font-size:15px;cursor:pointer;transition:all 0.3s;border:1.5px solid rgba(255,255,255,0.2);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-outlined-s:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.4);transform:translateY(-2px)}
        .inclusion-card-s{background:#111827;border:1px solid rgba(245,158,11,0.12);border-radius:20px;padding:24px;transition:all 0.3s}
        .inclusion-card-s:hover{border-color:rgba(245,158,11,0.4);transform:translateY(-4px);box-shadow:0 12px 40px rgba(245,158,11,0.12)}
        .faq-item-s{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;transition:border-color 0.3s}
        .faq-item-s.open{border-color:rgba(245,158,11,0.35)}
        .faq-btn-s{width:100%;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;cursor:pointer;text-align:left;gap:16px;color:white;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:600;line-height:1.5}
        .faq-plus-s{font-size:20px;color:#f59e0b;flex-shrink:0;transition:transform 0.3s;display:inline-block;line-height:1}
        .faq-plus-s.open{transform:rotate(45deg)}
        .faq-body-s{overflow:hidden;transition:max-height 0.35s ease}
        .form-field{display:flex;flex-direction:column;gap:6px}
        .form-label{font-size:13px;font-weight:600;color:rgba(255,255,255,0.7)}
        .form-input{background:#111827;border:1.5px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 16px;font-size:15px;color:white;font-family:"DM Sans",sans-serif;transition:border-color 0.25s;outline:none;width:100%}
        .form-input:focus{border-color:rgba(245,158,11,0.6);box-shadow:0 0 0 3px rgba(245,158,11,0.1)}
        .form-input.err{border-color:rgba(239,68,68,0.5)}
        .form-error{font-size:12px;color:rgba(239,68,68,0.8)}
        .timeline-dot-s{width:16px;height:16px;border-radius:50%;background:#f59e0b;border:3px solid #0B0B0F;flex-shrink:0;z-index:2;animation:dot-pulse-amber 2.5s ease-in-out infinite}
        @media(max-width:768px){
          .nav-s{padding:16px 20px}
          .nav-s.scrolled{padding:12px 20px}
          .two-col-s{flex-direction:column!important}
          .three-col-s{grid-template-columns:1fr 1fr!important}
          .form-two-col{grid-template-columns:1fr!important}
          .timeline-line-s{left:20px!important;transform:none!important}
          .timeline-row-s{flex-direction:column!important;padding-left:52px!important}
          .timeline-row-s .timeline-dot-wrap-s{position:absolute!important;left:12px!important;top:24px!important}
          .timeline-row-s .tl-content{width:100%!important;margin:0!important}
        }
        @media(min-width:769px){
          .three-col-s{grid-template-columns:repeat(4,1fr)!important}
        }
      `}</style>

      {/* NAV */}
      <nav className={`nav-s${scrollY > 40 ? ' scrolled' : ''}`}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#f59e0b' }}>Campus</span>
        </a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/program" className="btn-outlined-s" style={{ padding: '9px 22px', fontSize: 13 }}>Full Program</a>
          <a href="#apply" className="btn-amber" style={{ padding: '9px 22px', fontSize: 13 }} onClick={e => { e.preventDefault(); formRef.current?.scrollIntoView({ behavior: 'smooth' }) }}>Apply Now</a>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,158,11,0.08),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'glowAmber 6s ease-in-out infinite' }} />
        <div style={{ maxWidth: 740, position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: '#fcd34d', marginBottom: 28 }}>
            🔥 Applications open · May 1 start · Only 25 seats
          </div>
          <span className="section-label-amber" style={{ display: 'block', marginBottom: 16 }}>SUMMER INTERNSHIP PROGRAM 2025</span>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(38px,6vw,68px)', lineHeight: 1.05, letterSpacing: -2, marginBottom: 24 }}>
            Your First Internship.<br />
            <span className="gradient-text-amber">This Summer. For Real.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}>
            A 4-week intensive program that gets non-tech students their first internship — through cold outreach, smart targeting, and real mentor support.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            <button className="btn-amber large" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>Apply Now — ₹599 →</button>
            <button className="btn-outlined-s" style={{ padding: '17px 36px', fontSize: 16 }} onClick={() => curriculumRef.current?.scrollIntoView({ behavior: 'smooth' })}>See What's Inside ↓</button>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.32)' }}>
            ⚡ 4 weeks · 📱 WhatsApp support · 🎯 Internship-focused strategy · 🌍 Open to all colleges
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHO IT'S FOR */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="section-label-amber">IS THIS FOR YOU?</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, letterSpacing: -1 }}>Built for students who want their first real internship</h2>
          </div>
          <div className="two-col-s" style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1, background: 'rgba(10,18,10,0.8)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 24, padding: '32px 28px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(16,185,129,0.8)', marginBottom: 24 }}>This is for you if</div>
              {[
                "You're in your 1st, 2nd, or 3rd year of college",
                "You've never had a formal internship before",
                "Your college doesn't get good companies on campus",
                "You're targeting consulting, finance, marketing, BD, or operations",
                "You want a structured plan, not generic advice",
                "Summer 2025 is your window and you don't want to waste it",
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1.5px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(16,185,129,0.8)', flexShrink: 0, fontWeight: 700 }}>✓</div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, background: 'rgba(18,12,12,0.6)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '32px 28px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 24 }}>Not for you if</div>
              {[
                "You want a shortcut with zero effort",
                "You're looking for a recorded course to watch passively",
                "You're not willing to send cold emails or reach out directly",
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(239,68,68,0.5)', flexShrink: 0, fontWeight: 700 }}>✕</div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — CURRICULUM */}
      <section ref={curriculumRef} style={{ padding: '80px 24px', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label-amber">WHAT WE COVER</span>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, letterSpacing: -1 }}>4 weeks. Everything you need to land your first internship.</h2>
        </div>
        <div style={{ position: 'relative' }}>
          <div className="timeline-line-s" style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, rgba(245,158,11,0.8), rgba(249,115,22,0.4))', transform: 'translateX(-50%)', zIndex: 1 }} />
          <style>{`.timeline-line-s{display:block}`}</style>
          {WEEKS.map((week, i) => {
            const isRight = i % 2 === 0
            return (
              <div key={i} className="timeline-row-s" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: 40 }}>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 32 }}>
                  {!isRight && (
                    <div style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, padding: '24px 28px', maxWidth: 340, width: '100%' }}>
                      <WeekCardS week={week} num={i + 1} />
                    </div>
                  )}
                </div>
                <div className="timeline-dot-wrap-s" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <div className="timeline-dot-s" style={{ animationDelay: `${i * 0.3}s` }} />
                </div>
                <div style={{ flex: 1, paddingLeft: 32 }}>
                  {isRight && (
                    <div style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, padding: '24px 28px', maxWidth: 340, width: '100%' }}>
                      <WeekCardS week={week} num={i + 1} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 4 — INCLUSIONS */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-label-amber">EVERYTHING INCLUDED</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, letterSpacing: -1 }}>₹599 gets you all of this</h2>
          </div>
          <div className="three-col-s" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {INCLUSIONS.map((inc, i) => (
              <div key={i} className="inclusion-card-s">
                <div style={{ fontSize: 26, marginBottom: 12 }}>{inc.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 6 }}>{inc.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>{inc.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(245,158,11,0.07)', border: '1.5px solid rgba(245,158,11,0.25)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'white', marginBottom: 4 }}>Bonus: Results Wall Feature</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>Students who secure an internship through the program get featured on our Results Wall and receive ₹200 credit toward any future Beyond Campus program.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — PRICING */}
      <section style={{ padding: '80px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 48 }}>
          <span className="section-label-amber">SIMPLE PRICING</span>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, letterSpacing: -1 }}>One investment.<br />Your first internship.</h2>
        </div>
        <div style={{ background: '#111827', border: '2px solid rgba(245,158,11,0.4)', borderRadius: 28, padding: '40px 36px', boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 24px 64px rgba(245,158,11,0.12)', position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius: '0 0 14px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Summer 2025</div>
          <div style={{ marginTop: 16, fontFamily: "'DM Serif Display',serif", fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>Summer Internship Program 2025</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', margin: '20px 0 6px' }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>₹599</span>
            <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>₹2,999</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(245,158,11,0.8)', fontWeight: 600, marginBottom: 28 }}>You save ₹2,400</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, textAlign: 'left' }}>
            {INCLUSIONS.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>✓</span>{f.title}
              </div>
            ))}
          </div>
          <button className="btn-amber full" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}>Apply Now →</button>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>Next batch May 1 · Only 25 seats</p>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>Less than the cost of one coaching class.<br />More impactful than a semester of applications.</p>
      </section>

      {/* SECTION 6 — FAQ */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <span className="section-label-amber">QUESTIONS</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(26px,3.5vw,38px)', lineHeight: 1.15, letterSpacing: -0.5 }}>Everything you want to know</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item-s${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn-s" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.8)' }}>{faq.q}</span>
                  <span className={`faq-plus-s${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className="faq-body-s" style={{ maxHeight: openFaq === i ? 240 : 0 }}>
                  <div style={{ padding: '0 24px 22px', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — REGISTRATION FORM */}
      <section ref={formRef} style={{ padding: '80px 24px 100px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="section-label-amber">APPLY NOW</span>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,44px)', lineHeight: 1.1, letterSpacing: -1, marginBottom: 14 }}>Secure your seat for Summer 2025</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>25 seats only. Fill this in and complete payment to confirm your spot.</p>
        </div>

        {success ? (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.35)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 12 }}>You're in!</h3>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 8 }}>
              Welcome to the Beyond Campus Summer Internship Program 2025, {form.name.split(' ')[0]}!
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Check your email for confirmation. Program starts May 1. WhatsApp group access coming shortly.
            </p>
            <div style={{ marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Questions? <a href="mailto:hello@beyond-campus.in" style={{ color: '#f59e0b' }}>hello@beyond-campus.in</a></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Full Name *</label>
                <input className={`form-input${errors.name ? ' err' : ''}`} placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Email *</label>
                <input type="email" className={`form-input${errors.email ? ' err' : ''}`} placeholder="rahul@gmail.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>
            <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Phone Number *</label>
                <input type="tel" className={`form-input${errors.phone ? ' err' : ''}`} placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">College Name *</label>
                <input className={`form-input${errors.college ? ' err' : ''}`} placeholder="Delhi University" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
                {errors.college && <span className="form-error">{errors.college}</span>}
              </div>
            </div>
            <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-field">
                <label className="form-label">Year of Study *</label>
                <select className={`form-input${errors.year ? ' err' : ''}`} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                  <option value="">Select year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>Other</option>
                </select>
                {errors.year && <span className="form-error">{errors.year}</span>}
              </div>
              <div className="form-field">
                <label className="form-label">Target Domain *</label>
                <select className={`form-input${errors.domain ? ' err' : ''}`} value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
                  <option value="">Select domain</option>
                  <option>Consulting</option>
                  <option>Finance</option>
                  <option>Founder's Office</option>
                  <option>Marketing</option>
                  <option>Business Development</option>
                  <option>Operations</option>
                  <option>Not sure yet</option>
                </select>
                {errors.domain && <span className="form-error">{errors.domain}</span>}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">How did you hear about us?</label>
              <select className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                <option value="">Select source</option>
                <option>LinkedIn</option>
                <option>WhatsApp</option>
                <option>Friend</option>
                <option>Instagram</option>
                <option>Google</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Why do you want to do this program? * <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(max 200 characters)</span></label>
              <textarea className={`form-input${errors.reason ? ' err' : ''}`} rows={4} maxLength={200} placeholder="Tell us a bit about your situation and what you're hoping to achieve..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ resize: 'vertical' }} />
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>{form.reason.length}/200</div>
              {errors.reason && <span className="form-error">{errors.reason}</span>}
            </div>
            <button type="submit" className="btn-amber full" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Processing...' : 'Proceed to Payment — ₹599 →'}
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>🔒 Secure payment via Razorpay · Confirmation email within 2 minutes</p>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        © 2025 Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>beyond-campus.in</a>
      </div>
    </main>
  )
}

function WeekCardS({ week, num }: { week: typeof WEEKS[0]; num: number }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#f59e0b,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{week.icon}</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e0b' }}>Week {num}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{week.label}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {week.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.5 }}>
            <span style={{ color: '#f59e0b', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>{item}
          </div>
        ))}
      </div>
    </>
  )
}

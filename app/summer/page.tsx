'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  { q: 'What domains do you help with?', a: "Consulting, finance, Founder's Office, marketing, business development, and operations. No coding or tech roles." },
  { q: 'How is this different from the 8-week cohort?', a: 'The summer program is shorter (4 weeks), cheaper (₹599 vs ₹999), and focused specifically on internship applications during the summer hiring season. The 8-week cohort is more comprehensive and suited for full-time job placement.' },
  { q: "What if I don't get an internship in 4 weeks?", a: "You keep everything — templates, resources, community access — and you can continue applying with the same strategy. Most students see their first responses within the first 2 weeks of outreach." },
  { q: 'How quickly can I get started after paying?', a: 'Immediately. Confirmation email within 2 minutes, WhatsApp group access the same day, and onboarding starts on May 1.' },
]

const WEEK_BADGES = [
  { label: 'START HERE',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)' },
  { label: 'GET ACTIVE',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.28)' },
  { label: 'BUILD MOMENTUM',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.28)' },
  { label: 'CLOSE THE DEAL',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
]

export default function SummerPage() {
  const [scrollY, setScrollY]               = useState(0)
  const [scrollPct, setScrollPct]           = useState(0)
  const [openFaq, setOpenFaq]               = useState<number | null>(null)
  const [form, setForm]                     = useState({ name: '', email: '', phone: '', college: '', year: '', domain: '', source: '', reason: '' })
  const [errors, setErrors]                 = useState<Record<string, string>>({})
  const [submitting, setSubmitting]         = useState(false)
  const [success, setSuccess]               = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const formRef       = useRef<HTMLDivElement>(null)
  const curriculumRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrollY(y)
      setScrollPct(max > 0 ? (y / max) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const s = document.createElement('script')
    s.src   = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                              e.name   = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) e.email  = 'Valid email required'
    if (!form.phone.trim() || form.phone.length < 10)   e.phone  = 'Valid phone required'
    if (!form.college.trim())                           e.college = 'Required'
    if (!form.year)                                     e.year   = 'Required'
    if (!form.domain)                                   e.domain = 'Required'
    if (!form.reason.trim())                            e.reason = 'Required'
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
        amount: 59900, currency: 'INR',
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
            body: JSON.stringify({ name: form.name, email: form.email, type: 'summer' }),
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

  const showStickyBar = scrollY > 600 && !success

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmerAmber{0%{background-position:-400% center}100%{background-position:400% center}}
        @keyframes glowAmber{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes dot-pulse-amber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.7)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
        @keyframes pulse-red{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
        @keyframes arrow-pulse{0%,100%{opacity:0.35;transform:translateX(0)}50%{opacity:1;transform:translateX(5px)}}
        .gradient-text-amber{background:linear-gradient(135deg,#f59e0b,#f97316,#ef4444);background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmerAmber 4s linear infinite}
        .section-label-amber{font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#f59e0b;margin-bottom:14px;display:block}
        .nav-s{position:fixed;top:0;left:0;right:0;z-index:100;transition:all 0.3s;padding:20px 40px;display:flex;align-items:center;justify-content:space-between}
        .nav-s.scrolled{background:rgba(11,11,15,0.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:14px 40px}
        .btn-amber{display:inline-flex;align-items:center;gap:8px;padding:15px 32px;border-radius:100px;background:linear-gradient(135deg,#f59e0b,#f97316);color:white;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.3s;border:none;box-shadow:0 0 32px rgba(245,158,11,0.35);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-amber:hover{transform:translateY(-2px);box-shadow:0 0 52px rgba(245,158,11,0.55)}
        .btn-amber.large{padding:18px 44px;font-size:17px}
        .btn-amber.full{width:100%;justify-content:center}
        .btn-outlined-s{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:100px;background:transparent;color:white;font-weight:600;font-size:15px;cursor:pointer;transition:all 0.3s;border:1.5px solid rgba(255,255,255,0.2);font-family:"DM Sans",sans-serif;text-decoration:none}
        .btn-outlined-s:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.4);transform:translateY(-2px)}
        .faq-item-s{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;transition:border-color 0.3s}
        .faq-item-s.open{border-color:rgba(245,158,11,0.35)}
        .faq-btn-s{width:100%;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;background:transparent;border:none;cursor:pointer;text-align:left;gap:16px;color:white;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:600;line-height:1.5}
        .faq-plus-s{font-size:20px;color:#f59e0b;flex-shrink:0;transition:transform 0.3s;display:inline-block;line-height:1}
        .faq-plus-s.open{transform:rotate(45deg)}
        .faq-body-s{overflow:hidden;transition:max-height 0.35s ease}
        .for-you-pill{display:inline-flex;align-items:center;padding:9px 18px;border-radius:100px;border:1.5px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.07);color:rgba(245,158,11,0.9);font-size:13.5px;font-weight:600;line-height:1.3;transition:all 0.2s;cursor:default}
        .for-you-pill:hover{border-color:rgba(245,158,11,0.6);background:rgba(245,158,11,0.13);transform:scale(1.02);box-shadow:0 0 16px rgba(245,158,11,0.15)}
        .week-card{background:#0f172a;border:1px solid rgba(245,158,11,0.1);border-radius:20px;padding:28px 24px 28px;position:relative;overflow:hidden;transition:all 0.3s;flex-shrink:0}
        .week-card:hover{border-color:rgba(245,158,11,0.35);box-shadow:0 16px 48px rgba(245,158,11,0.1);transform:translateY(-4px)}
        .incl-row{display:flex;gap:20px;align-items:flex-start;padding:24px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
        .incl-row:last-child{border-bottom:none}
        .summary-sticky{position:sticky;top:80px}
        .form-field{display:flex;flex-direction:column;gap:8px}
        .form-label{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(245,158,11,0.65);transition:color 0.2s}
        .form-field:focus-within .form-label{color:#f59e0b}
        .form-input{background:transparent;border:none;border-bottom:2px solid rgba(245,158,11,0.22);border-radius:0;padding:10px 0;font-size:15px;color:white;font-family:"DM Sans",sans-serif;transition:border-color 0.25s;outline:none;width:100%}
        .form-input:focus{border-bottom-color:#f59e0b}
        .form-input.err{border-bottom-color:rgba(239,68,68,0.6)}
        .form-input option{background:#111827;color:white}
        .form-error{font-size:12px;color:rgba(239,68,68,0.8)}
        .curr-scroll{display:flex;gap:16px;align-items:stretch}
        @media(max-width:768px){
          .nav-s{padding:16px 20px}.nav-s.scrolled{padding:12px 20px}
          .for-you-split{flex-direction:column!important}
          .for-you-left,.for-you-right{width:100%!important}
          .for-you-right{border-left:none!important;border-top:1px solid rgba(255,255,255,0.05)!important}
          .curr-scroll{flex-direction:column;gap:24px}
          .curr-arrow{display:none!important}
          .week-card{width:100%!important;min-width:unset!important}
          .incl-split{flex-direction:column!important}
          .incl-left,.incl-right{width:100%!important}
          .summary-sticky{position:static!important}
          .form-two-col{grid-template-columns:1fr!important}
          .mobile-only-bar{display:flex!important}
        }
        @media(min-width:769px){
          .mobile-only-bar{display:none!important}
          .curr-scroll-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:8px}
          .curr-scroll-wrap::-webkit-scrollbar{height:3px}
          .curr-scroll-wrap::-webkit-scrollbar-track{background:rgba(255,255,255,0.04);border-radius:2px}
          .curr-scroll-wrap::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.35);border-radius:2px}
        }
      `}</style>

      {/* SCROLL PROGRESS */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 200, pointerEvents: 'none', background: 'rgba(245,158,11,0.1)' }}>
        <div style={{ height: '100%', width: `${scrollPct}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)', transition: 'width 0.1s linear', borderRadius: '0 2px 2px 0' }} />
      </div>

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

      {/* HERO */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 100px', position: 'relative', textAlign: 'center' }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,158,11,0.08),transparent)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', animation: 'glowAmber 6s ease-in-out infinite' }} />
        <div style={{ maxWidth: 740, position: 'relative', zIndex: 1, animation: 'fadeUp 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 100, fontSize: 13, fontWeight: 700, color: '#fcd34d', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0, animation: 'pulse-red 1.5s ease-in-out infinite' }} />
            🔥 Applications open · May 1 start · Only 25 seats
          </div>
          <span className="section-label-amber" style={{ display: 'block', marginBottom: 16 }}>SUMMER INTERNSHIP PROGRAM 2025</span>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(38px,6vw,68px)', lineHeight: 1.05, letterSpacing: -2, marginBottom: 24 }}>
            Your First Internship.<br />
            <span className="gradient-text-amber">This Summer. For Real.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.52)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto 40px' }}>
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

      {/* IS THIS FOR YOU — Split screen */}
      <section style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label-amber">IS THIS FOR YOU?</span>
          <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>Built for students who want their first real internship</h2>
        </div>

        <div className="for-you-split" style={{ display: 'flex', maxWidth: 1200, margin: '0 auto' }}>
          {/* YES side — 60% */}
          <div className="for-you-left" style={{ width: '60%', background: 'linear-gradient(135deg,#0B0B0F 55%,rgba(245,158,11,0.055) 100%)', padding: '60px 52px 60px 6%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: -40, right: -10, fontSize: 220, fontWeight: 900, color: 'rgba(245,158,11,0.03)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: -12, fontFamily: "'DM Serif Display',serif" }}>YES</div>
            <h3 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, color: '#f59e0b', letterSpacing: -1, marginBottom: 12, lineHeight: 1.1 }}>This was built for you</h3>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 36 }}>If any of these sound like you, you're in the right place.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                '1st, 2nd, or 3rd year student',
                'Never had a formal internship',
                'College skips the good companies',
                'Targeting consulting or finance',
                'Want a real plan, not motivation',
                'Summer 2025 is your window',
              ].map((pill, i) => <span key={i} className="for-you-pill">{pill}</span>)}
            </div>
          </div>

          {/* NO side — 40% */}
          <div className="for-you-right" style={{ width: '40%', background: 'rgba(239,68,68,0.035)', padding: '60px 44px', position: 'relative', overflow: 'hidden', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ position: 'absolute', bottom: -40, right: -10, fontSize: 180, fontWeight: 900, color: 'rgba(239,68,68,0.03)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: -10, fontFamily: "'DM Serif Display',serif" }}>NO</div>
            <h3 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: '#f87171', letterSpacing: -0.5, marginBottom: 36, lineHeight: 1.2 }}>This is not for you</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
              {[
                'Looking for a shortcut with zero effort',
                'Want to watch recorded videos passively',
                'Not willing to cold email or reach out',
              ].map((item, i) => (
                <span key={i} style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, textDecoration: 'line-through', textDecorationColor: 'rgba(239,68,68,0.35)', textDecorationThickness: '2px' }}>{item}</span>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', lineHeight: 1.7 }}>If that's you, that's okay — this program just isn't the right fit.</p>
          </div>
        </div>
      </section>

      {/* 4-WEEK CURRICULUM — Horizontal timeline */}
      <section ref={curriculumRef} style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-label-amber">THE JOURNEY</span>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 28 }}>
              4 weeks. Everything you need to land your first internship.
            </h2>
            {/* Progress bar split into 4 segments */}
            <div style={{ display: 'flex', gap: 4, maxWidth: 480, margin: '0 auto' }}>
              {['Week 1','Week 2','Week 3','Week 4'].map((w, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#f59e0b,#f97316)', marginBottom: 7 }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5 }}>{w}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="curr-scroll-wrap">
            <div className="curr-scroll">
              {WEEKS.map((week, i) => {
                const badge   = WEEK_BADGES[i]
                const fillPct = [25, 50, 75, 100][i]
                return (
                  <React.Fragment key={i}>
                    <div className="week-card" style={{ width: 272, minWidth: 256 }}>
                      {/* Top progress border */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: '20px 20px 0 0' }}>
                        <div style={{ height: '100%', width: `${fillPct}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius: 'inherit' }} />
                      </div>
                      {/* Watermark */}
                      <div style={{ position: 'absolute', bottom: 4, right: 10, fontSize: 110, fontWeight: 900, color: 'rgba(245,158,11,0.045)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: "'DM Serif Display',serif" }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      {/* Badge */}
                      <div style={{ display: 'inline-flex', padding: '4px 11px', borderRadius: 100, background: badge.bg, border: `1px solid ${badge.border}`, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: badge.color, marginBottom: 18, marginTop: 6 }}>
                        {badge.label}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,158,11,0.55)', marginBottom: 6 }}>Week {i + 1}</div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: -0.5, lineHeight: 1.25, marginBottom: 20 }}>{week.label}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {week.items.map((item, j) => (
                          <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'rgba(255,255,255,0.52)', lineHeight: 1.55 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,158,11,0.45)', flexShrink: 0, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{j + 1}.</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="curr-arrow" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'rgba(245,158,11,0.4)', fontSize: 22, animation: 'arrow-pulse 1.8s ease-in-out infinite', animationDelay: `${i * 0.35}s` }}>→</div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          {/* Outcome card */}
          <div style={{ marginTop: 28, padding: '22px 28px', background: 'rgba(245,158,11,0.07)', border: '1.5px solid rgba(245,158,11,0.22)', borderRadius: 18, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>🎯</span>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
              <strong style={{ color: 'white', fontWeight: 700 }}>By the end of Week 4:</strong> You'll have sent 50+ targeted outreach messages, had at least 3 real conversations with companies, and be in active consideration for internship roles.
            </p>
          </div>
        </div>
      </section>

      {/* EVERYTHING INCLUDED — Numbered list + sticky summary */}
      <section style={{ padding: '100px 0', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="section-label-amber">EVERYTHING INCLUDED</span>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>₹599 gets you all of this</h2>
          </div>
          <div className="incl-split" style={{ display: 'flex', gap: 52, alignItems: 'flex-start' }}>
            {/* Left — numbered list 65% */}
            <div className="incl-left" style={{ width: '65%' }}>
              {INCLUSIONS.map((inc, i) => (
                <div key={i} className="incl-row">
                  <div style={{ fontSize: 30, fontWeight: 900, color: 'rgba(245,158,11,0.22)', lineHeight: 1, flexShrink: 0, minWidth: 44, fontVariantNumeric: 'tabular-nums' }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'white', letterSpacing: -0.5, marginBottom: 5, lineHeight: 1.3 }}>{inc.title}</div>
                    <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{inc.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 28, padding: '24px 28px', background: 'rgba(245,158,11,0.07)', border: '1.5px solid rgba(245,158,11,0.22)', borderRadius: 18 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>🎁 Bonus: Results Wall Feature</div>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>Students who secure an internship through the program get featured on our Results Wall and receive ₹200 credit toward any future Beyond Campus program.</div>
              </div>
            </div>
            {/* Right — sticky summary 35% */}
            <div className="incl-right" style={{ width: '35%' }}>
              <div className="summary-sticky" style={{ background: '#111827', border: '2px solid rgba(245,158,11,0.35)', borderRadius: 24, padding: '32px 28px', boxShadow: '0 0 64px rgba(245,158,11,0.1), 0 0 0 1px rgba(245,158,11,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(245,158,11,0.65)', marginBottom: 24 }}>What you get</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Total value</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.28)', textDecoration: 'line-through' }}>₹2,999</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>You save</span>
                    <span style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}>₹2,400</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Your price</span>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', letterSpacing: -1.5 }}>₹599</span>
                  </div>
                </div>
                <button className="btn-amber full" onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ borderRadius: 14, padding: '15px 24px', fontSize: 15 }}>
                  Apply Now →
                </button>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12 }}>Next batch May 1 · Only 25 seats</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: 48 }}>
          <span className="section-label-amber">SIMPLE PRICING</span>
          <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>One investment.<br />Your first internship.</h2>
        </div>
        <div style={{ background: '#111827', border: '2px solid rgba(245,158,11,0.4)', borderRadius: 28, padding: '40px 36px', boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 24px 64px rgba(245,158,11,0.12)', position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '6px 20px', background: 'linear-gradient(135deg,#f59e0b,#f97316)', borderRadius: '0 0 14px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Summer 2025</div>
          <div style={{ marginTop: 16, fontFamily: "'DM Serif Display',serif", fontSize: 26, marginBottom: 8, lineHeight: 1.2 }}>Summer Internship Program 2025</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', margin: '20px 0 6px' }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: '#f59e0b', letterSpacing: -2 }}>₹599</span>
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
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>Less than the cost of one coaching class.<br />More impactful than a semester of applications.</p>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.012)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span className="section-label-amber">QUESTIONS</span>
            <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>Everything you want to know</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item-s${openFaq === i ? ' open' : ''}`}>
                <button className="faq-btn-s" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ color: openFaq === i ? 'white' : 'rgba(255,255,255,0.8)' }}>{faq.q}</span>
                  <span className={`faq-plus-s${openFaq === i ? ' open' : ''}`}>+</span>
                </button>
                <div className="faq-body-s" style={{ maxHeight: openFaq === i ? 280 : 0 }}>
                  <div style={{ padding: '0 24px 22px', fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.85 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM */}
      <section ref={formRef} style={{ padding: '100px 24px 120px', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className="section-label-amber">APPLY NOW</span>
          <h2 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 14 }}>
            Secure your seat for <span style={{ color: '#f59e0b' }}>Summer</span> 2025
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>25 seats only. Fill this in and complete payment to confirm your spot.</p>
        </div>

        {/* 3-step strip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 44, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 15, left: '16.6%', right: '16.6%', height: 1, background: 'rgba(255,255,255,0.07)' }} />
          {[
            { n: 1, label: 'Fill your details',   active: true },
            { n: 2, label: 'Complete payment',    active: false },
            { n: 3, label: 'Get instant access',  active: false },
          ].map((step) => (
            <div key={step.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: step.active ? 'linear-gradient(135deg,#f59e0b,#f97316)' : '#111827', border: `2px solid ${step.active ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step.active ? 'white' : 'rgba(255,255,255,0.22)', boxShadow: step.active ? '0 0 18px rgba(245,158,11,0.45)' : 'none' }}>{step.n}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: step.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)', textAlign: 'center', lineHeight: 1.4 }}>{step.label}</div>
            </div>
          ))}
        </div>

        {success ? (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '2px solid rgba(245,158,11,0.35)', borderRadius: 28, padding: '48px 40px', textAlign: 'center', animation: 'fadeUp 0.6s ease both' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, marginBottom: 12 }}>You're in!</h3>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 8 }}>
              Welcome to the Beyond Campus <span style={{ color: '#f59e0b' }}>Summer</span> Internship Program 2025, {form.name.split(' ')[0]}!
            </p>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Check your email for confirmation. Program starts May 1. WhatsApp group access coming shortly.
            </p>
            <div style={{ marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Questions? <a href="mailto:hello@beyond-campus.in" style={{ color: '#f59e0b' }}>hello@beyond-campus.in</a></div>
          </div>
        ) : (
          <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(249,115,22,0.035))', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 28, padding: '48px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
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
              <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
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
              <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div className="form-field">
                  <label className="form-label">Year of Study *</label>
                  <select className={`form-input${errors.year ? ' err' : ''}`} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                    <option value="">Select year</option>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>Other</option>
                  </select>
                  {errors.year && <span className="form-error">{errors.year}</span>}
                </div>
                <div className="form-field">
                  <label className="form-label">Target Domain *</label>
                  <select className={`form-input${errors.domain ? ' err' : ''}`} value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
                    <option value="">Select domain</option>
                    <option>Consulting</option><option>Finance</option><option>Founder's Office</option>
                    <option>Marketing</option><option>Business Development</option><option>Operations</option><option>Not sure yet</option>
                  </select>
                  {errors.domain && <span className="form-error">{errors.domain}</span>}
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">How did you hear about us?</label>
                <select className="form-input" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                  <option value="">Select source</option>
                  <option>LinkedIn</option><option>WhatsApp</option><option>Friend</option>
                  <option>Instagram</option><option>Google</option><option>Other</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Why do you want to do this program? * <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>(max 200 characters)</span></label>
                <textarea className={`form-input${errors.reason ? ' err' : ''}`} rows={4} maxLength={200} placeholder="Tell us a bit about your situation and what you're hoping to achieve..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ resize: 'vertical' }} />
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>{form.reason.length}/200</div>
                {errors.reason && <span className="form-error">{errors.reason}</span>}
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', height: 60, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, cursor: submitting ? 'not-allowed' : 'pointer', color: 'white', fontSize: 18, fontWeight: 800, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif", boxShadow: '0 0 40px rgba(245,158,11,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(245,158,11,0.5)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.3)' }}
              >
                {submitting ? 'Processing…' : 'Secure My Seat — ₹599 →'}
              </button>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>🔒 Secured by Razorpay · ✅ Instant confirmation · 📱 WhatsApp access same day</p>
            </form>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        © 2025 Beyond Campus · <a href="/" style={{ color: 'rgba(255,255,255,0.3)' }}>beyond-campus.in</a>
      </div>

      {/* STICKY MOBILE APPLY BAR */}
      {showStickyBar && (
        <div className="mobile-only-bar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150, background: 'linear-gradient(135deg,#f59e0b,#f97316)', padding: '14px 20px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -8px 32px rgba(245,158,11,0.3)', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>25 seats · May 1 · ₹599</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.72)' }}>Summer Internship Program 2025</div>
          </div>
          <button onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'rgba(0,0,0,0.18)', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 100, padding: '9px 18px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>
            Apply Now →
          </button>
        </div>
      )}
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

declare global { interface Window { Razorpay: any } }

export default function SummerRegisterPage() {
  const [form, setForm]           = useState({ name: '', email: '', phone: '', college: '', year: '', domain: '' })
  const [errors, setErrors]       = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)

  useEffect(() => {
    const s = document.createElement('script')
    s.src   = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.body.appendChild(s)
    return () => { document.body.removeChild(s) }
  }, [])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                               e.name    = 'Required'
    if (!form.email.trim() || !form.email.includes('@')) e.email   = 'Valid email required'
    if (!form.phone.trim() || form.phone.length < 10)    e.phone   = 'Valid phone required'
    if (!form.college.trim())                            e.college = 'Required'
    if (!form.year)                                      e.year    = 'Required'
    if (!form.domain)                                    e.domain  = 'Required'
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

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 599 }),
      })
      const { orderId, key } = await orderRes.json()

      console.log('Razorpay key being used:', (key || '').substring(0, 12))
      const rzp = new window.Razorpay({
        key,
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

  const inputStyle: React.CSSProperties = {
    background: 'transparent', border: 'none',
    borderBottom: '2px solid rgba(245,158,11,0.22)',
    borderRadius: 0, padding: '10px 0', fontSize: 15,
    color: 'white', fontFamily: "'DM Sans',sans-serif",
    outline: 'none', width: '100%', transition: 'border-color 0.2s',
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: '#fff', fontFamily: "'DM Sans','Inter',sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .field-wrap{display:flex;flex-direction:column;gap:8px}
        .field-label{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(245,158,11,0.65);transition:color 0.2s}
        .field-wrap:focus-within .field-label{color:#f59e0b}
        .field-err{font-size:12px;color:rgba(239,68,68,0.8)}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:28px}
        select.field-input option{background:#111827;color:white}
        @media(max-width:600px){.two-col{grid-template-columns:1fr}}
      `}</style>

      {/* Top bar */}
      <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#f59e0b' }}>Campus</span>
        </a>
        <a href="/summer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to program
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 560, animation: 'fadeUp 0.6s ease both' }}>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 24px' }}>🎉</div>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, marginBottom: 14 }}>You're in!</h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 8 }}>
                Welcome to the Beyond Campus <span style={{ color: '#f59e0b' }}>Summer</span> Internship Program 2025, {form.name.split(' ')[0]}!
              </p>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: 28 }}>
                Check your email for confirmation. Program starts May 1.<br />WhatsApp group access coming shortly.
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
                Questions? <a href="mailto:hello@beyond-campus.in" style={{ color: '#f59e0b' }}>hello@beyond-campus.in</a>
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#fcd34d', textTransform: 'uppercase', marginBottom: 18 }}>
                  Summer 2025 · 25 seats only
                </div>
                <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 'clamp(28px,4vw,40px)', lineHeight: 1.1, marginBottom: 10 }}>
                  Secure your seat
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7 }}>
                  Fill in your details and complete payment — your spot is confirmed instantly.
                </p>
              </div>

              {/* 3-step strip */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 44, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, left: '16.6%', right: '16.6%', height: 1, background: 'rgba(255,255,255,0.07)' }} />
                {[
                  { n: 1, label: 'Your details',      active: true },
                  { n: 2, label: 'Payment',           active: false },
                  { n: 3, label: 'Instant access',    active: false },
                ].map((step) => (
                  <div key={step.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.active ? 'linear-gradient(135deg,#f59e0b,#f97316)' : '#111827', border: `2px solid ${step.active ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: step.active ? 'white' : 'rgba(255,255,255,0.2)', boxShadow: step.active ? '0 0 16px rgba(245,158,11,0.4)' : 'none' }}>{step.n}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: step.active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.22)', textAlign: 'center' }}>{step.label}</div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.055),rgba(249,115,22,0.03))', border: '1px solid rgba(245,158,11,0.16)', borderRadius: 24, padding: '40px 36px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  <div className="two-col">
                    <div className="field-wrap">
                      <label className="field-label">Full Name *</label>
                      <input style={{ ...inputStyle, ...(errors.name ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} placeholder="Rahul Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        onFocus={e => e.currentTarget.style.borderBottomColor = '#f59e0b'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = errors.name ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}
                      />
                      {errors.name && <span className="field-err">{errors.name}</span>}
                    </div>
                    <div className="field-wrap">
                      <label className="field-label">Email *</label>
                      <input type="email" style={{ ...inputStyle, ...(errors.email ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} placeholder="rahul@gmail.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        onFocus={e => e.currentTarget.style.borderBottomColor = '#f59e0b'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = errors.email ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}
                      />
                      {errors.email && <span className="field-err">{errors.email}</span>}
                    </div>
                  </div>
                  <div className="two-col">
                    <div className="field-wrap">
                      <label className="field-label">Phone *</label>
                      <input type="tel" style={{ ...inputStyle, ...(errors.phone ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        onFocus={e => e.currentTarget.style.borderBottomColor = '#f59e0b'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = errors.phone ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}
                      />
                      {errors.phone && <span className="field-err">{errors.phone}</span>}
                    </div>
                    <div className="field-wrap">
                      <label className="field-label">College *</label>
                      <input style={{ ...inputStyle, ...(errors.college ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} placeholder="Delhi University" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))}
                        onFocus={e => e.currentTarget.style.borderBottomColor = '#f59e0b'}
                        onBlur={e => e.currentTarget.style.borderBottomColor = errors.college ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.22)'}
                      />
                      {errors.college && <span className="field-err">{errors.college}</span>}
                    </div>
                  </div>
                  <div className="two-col">
                    <div className="field-wrap">
                      <label className="field-label">Year of Study *</label>
                      <select className="field-input" style={{ ...inputStyle, ...(errors.year ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                        <option value="">Select year</option>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>Other</option>
                      </select>
                      {errors.year && <span className="field-err">{errors.year}</span>}
                    </div>
                    <div className="field-wrap">
                      <label className="field-label">Target Domain *</label>
                      <select className="field-input" style={{ ...inputStyle, ...(errors.domain ? { borderBottomColor: 'rgba(239,68,68,0.6)' } : {}) }} value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}>
                        <option value="">Select domain</option>
                        <option>Consulting</option>
                        <option>Finance</option>
                        <option>Founder's Office</option>
                        <option>Marketing</option>
                        <option>Business Development</option>
                        <option>Operations</option>
                        <option>Not sure yet</option>
                      </select>
                      {errors.domain && <span className="field-err">{errors.domain}</span>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ width: '100%', height: 58, marginTop: 4, background: 'linear-gradient(135deg,#f59e0b,#f97316)', border: 'none', borderRadius: 14, cursor: submitting ? 'not-allowed' : 'pointer', color: 'white', fontSize: 17, fontWeight: 800, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif", boxShadow: '0 0 36px rgba(245,158,11,0.28)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 56px rgba(245,158,11,0.48)' } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(245,158,11,0.28)' }}
                  >
                    {submitting ? 'Processing…' : 'Secure My Seat — ₹599 →'}
                  </button>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', textAlign: 'center' }}>
                    🔒 Secured by Razorpay · ✅ Instant confirmation · 📱 WhatsApp access same day
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

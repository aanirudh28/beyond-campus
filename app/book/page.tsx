'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

declare global {
  interface Window { Razorpay: any }
}

const mentors = [
  {
    id: 'anirudh',
    initials: 'AA',
    name: 'Anirudh Agarwal',
    role: 'Associate Consultant @ Aon',
    college: 'Christ University, Bangalore',
    tags: ['Consulting', 'Off-Campus Strategy', 'Cold Outreach'],
    bio: 'Placed off-campus into consulting from a non-IIM background. Reverse-engineered what actually gets you interviews — cold outreach, positioning, and showing up before others even start applying.',
    days: ['Mon', 'Wed', 'Fri'],
    accent: '#4F46E5',
    accentLight: '#7B61FF',
    badgeColor: '#a5b4fc',
    tagBg: 'rgba(79,70,229,0.14)',
    tagBorder: 'rgba(79,70,229,0.28)',
    glow: 'rgba(79,70,229,0.22)',
  },
  {
    id: 'sanya',
    initials: 'SS',
    name: 'Sanya Srivastava',
    role: 'FP&A @ Palo Alto Networks',
    college: 'Finance · Corporate Strategy',
    tags: ['Finance', 'FP&A', 'Corporate Strategy'],
    bio: 'Built a career in finance and corporate strategy at a global tech company — without the "right" pedigree. Knows exactly what these roles look for and how to get there without a roadmap.',
    days: ['Tue', 'Thu', 'Sat'],
    accent: '#0891B2',
    accentLight: '#06b6d4',
    badgeColor: '#67e8f9',
    tagBg: 'rgba(6,182,212,0.12)',
    tagBorder: 'rgba(6,182,212,0.26)',
    glow: 'rgba(6,182,212,0.18)',
  },
]

const timeSlots = ['10 AM – 11 AM', '11 AM – 12 PM', '2 PM – 3 PM', '4 PM – 5 PM', '6 PM – 7 PM']

function StepLabel({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: 'rgba(79,70,229,0.18)', border: '1px solid rgba(79,70,229,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#a5b4fc', flexShrink: 0,
      }}>{n}</div>
      <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{label}</span>
    </div>
  )
}

export default function BookPage() {
  const [selectedMentor, setSelectedMentor] = useState<typeof mentors[0] | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isBooked, setIsBooked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [resumeStatus, setResumeStatus] = useState('')

  const handleSelectMentor = (mentor: typeof mentors[0]) => {
    setSelectedMentor(mentor)
    setSelectedDate('')
    setSelectedTime('')
  }

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const saveBooking = async (paymentId: string) => {
    const { error } = await supabase.from('bookings').insert({
      name, email, phone,
      resume_status: resumeStatus,
      date: selectedDate,
      time_slot: selectedTime,
      mentor: selectedMentor?.name,
      payment_id: paymentId,
      amount: 299,
      type: 'mentorship',
    })
    if (error) console.error('Booking save error:', error)

    await fetch('/api/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, type: 'mentorship' }),
    })

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, date: selectedDate, timeSlot: selectedTime, mentor: selectedMentor?.name, type: 'mentorship', amount: 299 }),
    })
  }

  const handleBook = async () => {
    if (!selectedMentor) return alert('Please select a mentor.')
    if (!selectedDate || !selectedTime) return alert('Please select a date and time.')
    if (!name || !email || !phone) return alert('Please enter your name, email, and phone.')
    if (!resumeStatus) return alert('Please answer the resume question.')

    setIsLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway.'); setIsLoading(false); return }

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 299 }),
      })
      const { orderId, amount } = await res.json()

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
      console.log('Razorpay key being used:', key.substring(0, 12))
      const options = {
        key,
        amount, currency: 'INR',
        name: 'Beyond Campus',
        description: `Mentorship with ${selectedMentor.name} – ${selectedDate}, ${selectedTime}`,
        order_id: orderId,
        prefill: { name, email },
        theme: { color: selectedMentor.accent },
        handler: async (response: any) => {
          await saveBooking(response.razorpay_payment_id)
          setIsBooked(true)
          setIsLoading(false)
        },
        modal: { ondismiss: () => setIsLoading(false) },
      }

      new window.Razorpay(options).open()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  if (isBooked) {
    return (
      <main style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✓</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12 }}>Session Booked!</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 8 }}>
            Your 1:1 session with <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedMentor?.name}</strong> on <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedDate}</strong> at <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedTime}</strong> is confirmed.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Confirmation sent to <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{email}</strong></p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Nav */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Beyond Campus
          </a>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', padding: '5px 16px', background: 'rgba(79,70,229,0.14)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#a5b4fc', letterSpacing: 1, marginBottom: 20 }}>
            1:1 MENTORSHIP
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 700, color: 'white', marginBottom: 12, lineHeight: 1.2 }}>
            Book a Session
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7 }}>
            One hour. Real strategy. Built around you. — ₹299
          </p>
        </div>

        {/* Step 1 — Choose mentor */}
        <div style={{ marginBottom: 40 }}>
          <StepLabel n={1} label="Choose your mentor" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {mentors.map((mentor) => {
              const isSelected = selectedMentor?.id === mentor.id
              return (
                <button
                  key={mentor.id}
                  onClick={() => handleSelectMentor(mentor)}
                  style={{
                    textAlign: 'left', padding: 24, borderRadius: 20, cursor: 'pointer',
                    background: isSelected
                      ? `linear-gradient(145deg, ${mentor.accent}1a, ${mentor.accentLight}0d)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? mentor.accent + '60' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isSelected ? `0 0 32px ${mentor.glow}` : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${mentor.accent}, ${mentor.accentLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: 'white',
                      boxShadow: isSelected ? `0 0 20px ${mentor.glow}` : 'none',
                    }}>{mentor.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 2 }}>{mentor.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{mentor.role}</div>
                    </div>
                    {isSelected && (
                      <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: mentor.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 14 }}>{mentor.bio}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {mentor.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: mentor.tagBg, border: `1px solid ${mentor.tagBorder}`, color: mentor.badgeColor }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                    Available: <span style={{ color: isSelected ? mentor.badgeColor : 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{mentor.days.join('  ·  ')}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedMentor && (
          <>
            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40 }} />

            {/* Step 2 — Your details */}
            <div style={{ marginBottom: 40 }}>
              <StepLabel n={2} label="Your details" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { placeholder: 'Full name', value: name, onChange: setName, type: 'text' },
                  { placeholder: 'Email address', value: email, onChange: setEmail, type: 'email' },
                  { placeholder: 'Phone number', value: phone, onChange: setPhone, type: 'tel' },
                ].map(({ placeholder, value, onChange, type }) => (
                  <input
                    key={placeholder}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40 }} />

            {/* Step 3 — Resume */}
            <div style={{ marginBottom: 40 }}>
              <StepLabel n={3} label="Do you have a resume?" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { value: 'has_resume', label: 'Yes, I have an existing resume' },
                  { value: 'needs_resume', label: 'No, I need help building one from scratch' },
                ].map((opt) => {
                  const isActive = resumeStatus === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setResumeStatus(opt.value)}
                      style={{
                        textAlign: 'left', padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                        background: isActive ? `${selectedMentor.accent}1a` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isActive ? selectedMentor.accent + '60' : 'rgba(255,255,255,0.08)'}`,
                        color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                        fontSize: 14, fontWeight: isActive ? 600 : 400,
                        transition: 'all 0.15s ease',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${isActive ? selectedMentor.accent : 'rgba(255,255,255,0.2)'}`,
                        background: isActive ? selectedMentor.accent : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'white',
                      }}>{isActive ? '✓' : ''}</span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40 }} />

            {/* Step 4 — Pick a day */}
            <div style={{ marginBottom: 40 }}>
              <StepLabel n={4} label="Pick a day" />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {selectedMentor.days.map((d) => {
                  const isActive = selectedDate === d
                  return (
                    <button
                      key={d}
                      onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                      style={{
                        padding: '10px 22px', borderRadius: 12, cursor: 'pointer',
                        background: isActive ? selectedMentor.accent : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${isActive ? selectedMentor.accent : 'rgba(255,255,255,0.1)'}`,
                        color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                        fontSize: 14, fontWeight: 600,
                        boxShadow: isActive ? `0 0 18px ${selectedMentor.glow}` : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >{d}</button>
                  )
                })}
              </div>
            </div>

            {/* Step 5 — Pick a time */}
            {selectedDate && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40 }} />
                <div style={{ marginBottom: 40 }}>
                  <StepLabel n={5} label="Pick a time slot" />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {timeSlots.map((t) => {
                      const isActive = selectedTime === t
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          style={{
                            padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                            background: isActive ? 'rgba(249,115,22,0.9)' : 'rgba(255,255,255,0.04)',
                            border: `1.5px solid ${isActive ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                            color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                            fontSize: 13, fontWeight: 600,
                            boxShadow: isActive ? '0 0 18px rgba(249,115,22,0.28)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >{t}</button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Booking summary + CTA */}
            {selectedDate && selectedTime && (
              <>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />

                {/* Summary */}
                <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      Mentor: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedMentor.name}</strong>
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      Day: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedDate}</strong>
                    </span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      Time: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{selectedTime}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>₹299</span>
                </div>

                <button
                  onClick={handleBook}
                  disabled={isLoading}
                  style={{
                    width: '100%', padding: '15px 24px', borderRadius: 14,
                    background: isLoading
                      ? 'rgba(79,70,229,0.5)'
                      : `linear-gradient(135deg, ${selectedMentor.accent}, ${selectedMentor.accentLight})`,
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    color: 'white', fontSize: 15, fontWeight: 700,
                    boxShadow: isLoading ? 'none' : `0 4px 28px ${selectedMentor.glow}`,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.2px',
                  }}
                >
                  {isLoading ? 'Processing…' : 'Pay & Book — ₹299'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </main>
  )
}

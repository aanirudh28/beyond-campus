'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  isOpen: boolean
  onClose: () => void
  preselectedCohort?: string | null
}

export default function LeadCapturePopup({ isOpen, onClose, preselectedCohort }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestedIn: '',
    college: '',
    graduationYear: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (preselectedCohort === 'Internship Cohort') {
      setFormData(f => ({ ...f, interestedIn: 'Internship Cohort (₹1,750)' }))
    } else if (preselectedCohort === 'Placement Cohort') {
      setFormData(f => ({ ...f, interestedIn: 'Placement Cohort (₹2,500)' }))
    } else {
      setFormData(f => ({ ...f, interestedIn: '' }))
    }
  }, [preselectedCohort, isOpen])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFormData({ name: '', phone: '', email: '', interestedIn: '', college: '', graduationYear: '' })
        setErrors({})
        setIsLoading(false)
        setIsSubmitted(false)
        setSubmitError(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const setField = (field: string, value: string) => {
    setFormData(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
    setSubmitError(null)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.phone.trim()) e.phone = 'Phone number is required'
    else if (formData.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!formData.email.includes('@') || !formData.email.includes('.')) e.email = 'Enter a valid email address'
    if (!formData.interestedIn) e.interestedIn = 'Please select an option'
    return e
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsLoading(true)
    setSubmitError(null)
    const supabase = createClient()
    const { error } = await supabase.from('consultation_leads').insert([{
      full_name: formData.name,
      phone: formData.phone,
      email: formData.email,
      interested_in: formData.interestedIn,
      college: formData.college || null,
      graduation_year: formData.graduationYear || null,
      source_page: 'homepage',
    }])
    setIsLoading(false)
    if (error) {
      setSubmitError('Something went wrong. Please try again or WhatsApp us directly.')
      console.error('Supabase insert error:', error)
      return
    }
    setIsSubmitted(true)
  }

  if (!isOpen) return null

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1.5px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
    fontSize: 14,
    color: '#111',
    outline: 'none',
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    background: '#fff',
    minHeight: 48,
    boxSizing: 'border-box',
  })

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: '#333',
    display: 'block',
    marginBottom: 6,
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'popup-fade-in 0.2s ease',
      }}
    >
      <style>{`
        @keyframes popup-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popup-slide-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popup-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          animation: 'popup-slide-up 0.25s ease',
          boxShadow: '0 32px 100px rgba(0,0,0,0.55)',
          WebkitOverflowScrolling: 'touch' as never,
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.07)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444',
            zIndex: 1,
            lineHeight: 1,
          }}
        >×</button>

        <div style={{ padding: '36px 32px 32px' }}>
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 12, fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
                You're In!
              </h2>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.75, marginBottom: 32 }}>
                Our team will contact you within 24 hours. Keep an eye on your email and WhatsApp for updates.
              </p>
              <button
                onClick={onClose}
                style={{
                  padding: '14px 32px',
                  borderRadius: 100,
                  background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                }}
              >
                Back to Website
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111', marginBottom: 8, fontFamily: "'DM Serif Display', serif", lineHeight: 1.2, paddingRight: 32 }}>
                Book Your Free Career Consultation
              </h2>
              <p style={{ fontSize: 13, color: '#555', marginBottom: 8, lineHeight: 1.6 }}>
                Speak with our team to understand:
              </p>
              <ul style={{ fontSize: 13, color: '#444', marginBottom: 22, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {['Which cohort is right for you', 'Your current profile strengths', 'Areas for improvement', 'A roadmap for internships or placements'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: '#4F7CFF', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={e => setField('name', e.target.value)}
                  style={inputStyle(!!errors.name)}
                />
                {errors.name && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name}</p>}
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={e => setField('phone', e.target.value)}
                  style={inputStyle(!!errors.phone)}
                />
                {errors.phone && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.phone}</p>}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={e => setField('email', e.target.value)}
                  style={inputStyle(!!errors.email)}
                />
                {errors.email && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.email}</p>}
              </div>

              {/* Interested In */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Interested In <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.interestedIn}
                  onChange={e => setField('interestedIn', e.target.value)}
                  style={{ ...inputStyle(!!errors.interestedIn), color: formData.interestedIn ? '#111' : '#999', appearance: 'auto' as never }}
                >
                  <option value="">Select a cohort...</option>
                  <option value="Internship Cohort (₹1,750)">Internship Cohort (₹1,750)</option>
                  <option value="Placement Cohort (₹2,500)">Placement Cohort (₹2,500)</option>
                  <option value="Not Sure Yet">Not Sure Yet</option>
                </select>
                {errors.interestedIn && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.interestedIn}</p>}
              </div>

              {/* College */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Current College <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Your college name"
                  value={formData.college}
                  onChange={e => setField('college', e.target.value)}
                  style={inputStyle()}
                />
              </div>

              {/* Graduation Year */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>
                  Graduation Year <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>(Optional)</span>
                </label>
                <select
                  value={formData.graduationYear}
                  onChange={e => setField('graduationYear', e.target.value)}
                  style={{ ...inputStyle(), color: formData.graduationYear ? '#111' : '#999', appearance: 'auto' as never }}
                >
                  <option value="">Select year...</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>

              {submitError && (
                <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 12, textAlign: 'center', lineHeight: 1.5 }}>
                  {submitError}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 100,
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #4F7CFF, #7B61FF)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'DM Sans', 'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                  boxShadow: isLoading ? 'none' : '0 0 30px rgba(79,124,255,0.35)',
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'popup-spin 0.8s linear infinite', flexShrink: 0 }} />
                    Submitting...
                  </>
                ) : 'Schedule My Free Consultation'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'

const WHATSAPP_LINK = 'https://chat.whatsapp.com/HUe0nBmwKLWBIgnHaA6Pp0'

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
    } else if (preselectedCohort === 'Strategy Session') {
      setFormData(f => ({ ...f, interestedIn: '1:1 Strategy Session (₹549)' }))
    } else {
      setFormData(f => ({ ...f, interestedIn: '' }))
    }
  }, [preselectedCohort, isOpen])

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setFormData({ name: '', phone: '', email: '', interestedIn: '' })
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
    if (!formData.phone.trim()) e.phone = 'WhatsApp number is required'
    else if (formData.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number'
    if (formData.email.trim() && (!formData.email.includes('@') || !formData.email.includes('.'))) e.email = 'Enter a valid email address'
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
      email: formData.email.trim() || '',
      interested_in: formData.interestedIn || 'Not Sure Yet',
      source_page: 'homepage',
    }])
    setIsLoading(false)
    if (error) {
      track('lead_submit_error', { message: error.message })
      setSubmitError('Something went wrong. Please try again or WhatsApp us directly.')
      console.error('Supabase insert error:', error)
      return
    }
    track('lead_submit_success', { interested_in: formData.interestedIn || 'Not Sure Yet' })
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
    fontFamily: "var(--font-dm-sans), 'Inter', sans-serif",
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
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 12, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1.2 }}>
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
                  fontFamily: "var(--font-dm-sans), 'Inter', sans-serif",
                }}
              >
                Back to Website
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 21, fontWeight: 800, color: '#111', marginBottom: 8, fontFamily: "var(--font-dm-serif), serif", lineHeight: 1.2, paddingRight: 32 }}>
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

              {/* WhatsApp number */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  WhatsApp Number <span style={{ color: '#ef4444' }}>*</span>
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

              {/* Email (optional) */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Email <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>(Optional)</span>
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

              {/* Interested In (optional) */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>
                  Interested In <span style={{ fontSize: 12, color: '#999', fontWeight: 400 }}>(Optional)</span>
                </label>
                <select
                  value={formData.interestedIn}
                  onChange={e => setField('interestedIn', e.target.value)}
                  style={{ ...inputStyle(), color: formData.interestedIn ? '#111' : '#999', appearance: 'auto' as never }}
                >
                  <option value="">Not sure yet — help me decide</option>
                  <option value="1:1 Strategy Session (₹549)">1:1 Strategy Session (₹549)</option>
                  <option value="Placement Cohort (₹2,500)">Placement Cohort (₹2,500)</option>
                  <option value="Internship Cohort (₹1,750)">Internship Cohort (₹1,750)</option>
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
                  fontFamily: "var(--font-dm-sans), 'Inter', sans-serif",
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

              {/* WhatsApp escape hatch — lower friction than any form */}
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('lead_whatsapp_click')}
                style={{
                  marginTop: 12,
                  width: '100%',
                  padding: '14px',
                  borderRadius: 100,
                  background: '#fff',
                  border: '1.5px solid #25D366',
                  color: '#128C4B',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Or chat with us on WhatsApp instead
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  // matches the existing declaration in app/book/page.tsx
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { Razorpay: any }
}

const PERKS = [
  ['♾️', 'Unlimited applications', 'Track every single company, forever'],
  ['✨', 'Unlimited AI writing', 'Cold emails, follow-ups & DMs on tap'],
  ['📊', 'Full analytics', 'Reply rates by source, funnel, best days'],
  ['📧', '50+ cold email templates', 'The complete Beyond Campus pack'],
  ['💼', 'LinkedIn DM scripts', 'Word-for-word outreach scripts'],
  ['📄', 'Resume guide + templates', '7-chapter guide & 6 formats'],
]

export default function ProUpgradeModal({
  email,
  name,
  reason,
  onClose,
  onUpgraded,
}: {
  email: string
  name: string | null
  reason?: 'app_cap' | 'ai_cap' | 'analytics' | null
  onClose: () => void
  onUpgraded: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headline =
    reason === 'app_cap' ? "You've outgrown the free tier 🚀"
    : reason === 'ai_cap' ? "You've used your 5 free AI generations"
    : reason === 'analytics' ? 'Unlock your full analytics'
    : 'Go Pro. Get hired faster.'

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { setError('Failed to load payment gateway.'); setLoading(false); return }

      const res = await fetch('/api/create-resource-order', { method: 'POST' })
      const { orderId, amount } = await res.json()
      if (!orderId) { setError('Could not start payment. Try again.'); setLoading(false); return }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount, currency: 'INR',
        name: 'Beyond Campus',
        description: 'Tracker Pro + Complete Resource Pack',
        order_id: orderId,
        prefill: { name: name || '', email },
        theme: { color: '#4F7CFF' },
        handler: async (response: RazorpayResponse) => {
          const verify = await fetch('/api/tracker/verify-pro-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })
          const data = await verify.json()
          setLoading(false)
          if (data.success) onUpgraded()
          else setError('Payment verification failed. Contact us if you were charged.')
        },
        modal: { ondismiss: () => setLoading(false) },
      }
      new window.Razorpay(options).open()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', background: '#111827', border: '1px solid rgba(123,97,255,0.35)', borderRadius: 26, padding: 30, boxShadow: '0 0 80px rgba(123,97,255,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1.5, marginBottom: 14 }}>
            TRACKER PRO
          </div>
          <h2 style={{ color: 'white', fontSize: 23, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>{headline}</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
            One payment. Everything unlocked. Includes the complete Beyond Campus resource pack.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {PERKS.map(([emoji, title, sub]) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 13, padding: '10px 14px' }}>
              <span style={{ fontSize: 18 }}>{emoji}</span>
              <div>
                <div style={{ color: 'white', fontSize: 13.5, fontWeight: 700 }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, textDecoration: 'line-through', marginRight: 10 }}>₹999</span>
          <span style={{ color: 'white', fontSize: 32, fontWeight: 800 }}>₹299</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}> one-time, forever</span>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{ width: '100%', padding: 15, borderRadius: 14, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 24px rgba(79,124,255,0.35)' }}
        >
          {loading ? '⏳ Opening payment...' : 'Unlock everything for ₹299 →'}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer' }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

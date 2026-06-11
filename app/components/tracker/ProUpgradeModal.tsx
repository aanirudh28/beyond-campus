'use client'

import { useState } from 'react'
import { GRAD, Icon, IconName } from './ui'

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

const PERKS: [IconName, string, string][] = [
  ['sparkles', 'AI Smart Paste', 'Drop in any JD — details filled in instantly'],
  ['send', 'Unlimited AI writing', 'Cold emails, follow-ups & DMs on tap'],
  ['brain', 'Full weekly AI insights', 'Know exactly what\'s working in your pipeline'],
  ['chart', 'Full analytics', 'Reply rates by source, funnel, best days'],
  ['mail', '50+ cold email templates', 'The complete Beyond Campus pack'],
  ['briefcase', 'LinkedIn DM scripts', 'Word-for-word outreach scripts'],
  ['pencil', 'Resume guide + templates', '7-chapter guide & 6 formats'],
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
  reason?: 'ai_cap' | 'analytics' | 'extract' | null
  onClose: () => void
  onUpgraded: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const headline =
    reason === 'ai_cap' ? "You've used your 5 free AI generations"
    : reason === 'analytics' ? 'Unlock your full analytics'
    : reason === 'extract' ? 'AI Smart Paste is a Pro feature'
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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'overlayIn 0.2s ease both' }}>
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', background: 'linear-gradient(180deg, #141b30, #0f1424)', border: '1px solid rgba(123,97,255,0.35)', borderRadius: 26, padding: 30, boxShadow: '0 0 80px rgba(123,97,255,0.25)', animation: 'modalIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) both' }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: GRAD, borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1.5, marginBottom: 14, boxShadow: '0 4px 16px rgba(79,124,255,0.4)' }}>
            <Icon name="zap" size={12} /> TRACKER PRO
          </div>
          <h2 style={{ color: 'white', fontSize: 23, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.5 }}>{headline}</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
            One payment. Everything unlocked. Includes the complete Beyond Campus resource pack.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {PERKS.map(([icon, title, sub], i) => (
            <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 13, padding: '10px 14px', animation: 'modalIn 0.3s ease both', animationDelay: `${i * 40}ms` }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: 'rgba(123,97,255,0.14)', color: '#a5b4fc', flexShrink: 0 }}>
                <Icon name={icon} size={15} />
              </span>
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

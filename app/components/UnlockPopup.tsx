'use client'

import { useState, useEffect } from 'react'

export interface UnlockPopupProps {
  isOpen: boolean
  onClose: () => void
  onEmailUnlock: () => void
  resourceName: string
  localStorageKey: string
  showEmailOption: boolean
  emailAlreadySubmitted: boolean
}

export default function UnlockPopup({
  isOpen, onClose, onEmailUnlock, resourceName, localStorageKey, showEmailOption, emailAlreadySubmitted,
}: UnlockPopupProps) {
  const [email, setEmail]                   = useState('')
  const [submittingEmail, setSubmittingEmail] = useState(false)
  const [emailDone, setEmailDone]           = useState(false)
  const [payLoading, setPayLoading]         = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (typeof window === 'undefined' || (window as any).Razorpay) return
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    document.head.appendChild(s)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmittingEmail(true)
    try {
      await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resource: `${resourceName} - Email Unlock` }),
      })
    } catch {}
    localStorage.setItem(`${localStorageKey}EmailUnlocked`, 'true')
    setEmailDone(true)
    setSubmittingEmail(false)
    onEmailUnlock()
  }

  const handleResourcePack = async () => {
    setPayLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 199 }),
      })
      const { orderId, amount } = await res.json()
      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        order_id: orderId,
        name: 'Beyond Campus',
        description: 'Resource Pack — All 5 Resources',
        prefill: { email },
        theme: { color: '#4F7CFF' },
        handler: async (response: any) => {
          try {
            await fetch('/api/save-resource-purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, paymentId: response.razorpay_payment_id }),
            })
          } catch {}
          localStorage.setItem('resourcePackUnlocked', 'true')
          onClose()
          window.location.reload()
        },
      })
      rzp.open()
    } catch (err) {
      console.error('Payment error:', err)
    }
    setPayLoading(false)
  }

  if (!isOpen) return null

  const showEmailSection = showEmailOption && !emailAlreadySubmitted && !emailDone

  return (
    <>
      <style>{`
        @keyframes popupIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .unlock-popup-card { animation: popupIn 0.25s ease forwards; }
        @media(max-width:640px){
          .unlock-popup-outer { align-items:flex-end !important; padding:0 !important; }
          .unlock-popup-card { border-radius:28px 28px 0 0 !important; max-width:100% !important; width:100% !important; }
        }
      `}</style>

      <div
        className="unlock-popup-outer"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      >
        <div
          className="unlock-popup-card"
          style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, overflow:'hidden', width:'90%', maxWidth:540, maxHeight:'90vh', overflowY:'auto', position:'relative' }}
        >
          {/* Top section */}
          <div style={{ background:'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.05))', padding:'28px 32px 24px', position:'relative' }}>
            <button onClick={onClose} style={{ position:'absolute', top:18, right:18, background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:22, cursor:'pointer', lineHeight:1, padding:6 }}>×</button>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:10 }}>BEYOND CAMPUS RESOURCES</div>
            <h2 style={{ fontSize:24, fontWeight:800, color:'white', letterSpacing:-0.5, lineHeight:1.2, marginBottom:8 }}>
              Unlock the full {resourceName}
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.65, margin:0 }}>
              Join 700+ students who've used these resources to land internships off-campus.
            </p>
          </div>

          {/* Email section */}
          {showEmailSection && (
            <div style={{ padding:'20px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:12 }}>STEP 1 — GET 2 MORE FREE</div>
              <form onSubmit={handleEmailSubmit} style={{ display:'flex', gap:10 }}>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'white', fontSize:14, fontFamily:"'DM Sans',sans-serif", outline:'none', minWidth:0 }}
                />
                <button
                  type="submit"
                  disabled={submittingEmail}
                  style={{ padding:'10px 18px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.25)', background:'transparent', color:'white', fontWeight:700, fontSize:14, cursor:submittingEmail?'wait':'pointer', fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', flexShrink:0 }}
                >
                  {submittingEmail ? '...' : 'Unlock Free →'}
                </button>
              </form>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.25)', marginTop:8 }}>✓ Instant access · No spam · Unsubscribe anytime</div>
            </div>
          )}

          {emailDone && (
            <div style={{ padding:'14px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(16,185,129,0.06)' }}>
              <div style={{ fontSize:14, color:'#6ee7b7', fontWeight:600 }}>✅ 2 more {resourceName} unlocked! Scroll down to see them.</div>
            </div>
          )}

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 32px' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:2, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', whiteSpace:'nowrap' }}>
              {showEmailSection ? 'WANT EVERYTHING? CHOOSE A PLAN BELOW' : 'UNLOCK FULL ACCESS'}
            </span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Pricing cards */}
          <div style={{ padding:'0 32px 28px', display:'flex', flexDirection:'column', gap:12 }}>

            {/* Card 1: Resource Pack ₹199 */}
            <div style={{ background:'linear-gradient(135deg,rgba(79,124,255,0.12),rgba(123,97,255,0.08))', border:'1.5px solid rgba(79,124,255,0.4)', borderRadius:16, padding:20, position:'relative' }}>
              <div style={{ position:'absolute', top:14, right:14, background:'rgba(79,124,255,0.2)', border:'1px solid rgba(79,124,255,0.4)', borderRadius:100, padding:'2px 10px', fontSize:10, fontWeight:700, color:'#93BBFF', letterSpacing:1 }}>BEST VALUE</div>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'white', marginBottom:6 }}>Resource Pack</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
                    <span style={{ fontSize:22, fontWeight:800, color:'#4F7CFF' }}>₹199</span>
                    <span style={{ fontSize:14, color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>₹999</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {['All 50 cold email templates','All 20 LinkedIn DM scripts','Resume guide + template','Off-campus playbook'].map(item => (
                      <div key={item} style={{ fontSize:12, color:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:'#4F7CFF', fontWeight:700, flexShrink:0 }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleResourcePack}
                  disabled={payLoading}
                  style={{ padding:'14px 20px', borderRadius:12, background:'linear-gradient(135deg,#4F7CFF,#7B61FF)', color:'white', fontWeight:700, fontSize:14, border:'none', cursor:payLoading?'wait':'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 16px rgba(79,124,255,0.3)', whiteSpace:'nowrap', flexShrink:0 }}
                >
                  {payLoading ? '...' : 'Unlock All →\n₹199'}
                </button>
              </div>
            </div>

            {/* Card 2: Summer ₹599 */}
            <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(249,115,22,0.06))', border:'1px solid rgba(245,158,11,0.25)', borderRadius:16, padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:4 }}>Summer Internship Program</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:20, fontWeight:800, color:'#f59e0b' }}>₹599</span>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>₹2,999</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                    {['Everything in Resource Pack','4-week live program + mentor','Community + warm introductions'].map(item => (
                      <div key={item} style={{ fontSize:12, color:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:'#f59e0b', flexShrink:0 }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <a href="/summer" style={{ display:'block', padding:'12px 20px', borderRadius:12, background:'linear-gradient(135deg,#f59e0b,#f97316)', color:'white', fontWeight:700, fontSize:14, textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
                  Join Summer →
                </a>
              </div>
            </div>

            {/* Card 3: Cohort ₹999 */}
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:4 }}>8-Week Job Placement Cohort</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:20, fontWeight:800, color:'white' }}>₹999</span>
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.3)', textDecoration:'line-through' }}>₹4,999</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                    {['Everything in Resource Pack','8-week live program + mentor','Full-time job placement focus'].map(item => (
                      <div key={item} style={{ fontSize:12, color:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ color:'rgba(255,255,255,0.35)', flexShrink:0 }}>✓</span> {item}
                      </div>
                    ))}
                  </div>
                </div>
                <a href="/internship" style={{ display:'block', padding:'12px 20px', borderRadius:12, border:'1.5px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.75)', fontWeight:700, fontSize:14, textDecoration:'none', flexShrink:0, whiteSpace:'nowrap' }}>
                  Join Cohort →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ padding:'0 32px 24px', textAlign:'center' }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.2)' }}>🔒 Payments secured by Razorpay</span>
          </div>
        </div>
      </div>
    </>
  )
}

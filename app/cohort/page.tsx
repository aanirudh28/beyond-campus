'use client'

import { useState } from 'react'

// COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form
// and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments"
// to activate instantly.

export default function CohortPage() {
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const [waitlistDone, setWaitlistDone] = useState(false)

  const handleWaitlist = async () => {
    if (!waitlistEmail.trim()) return
    setWaitlistLoading(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail.trim(), source: 'Cohort Waitlist' }),
      })
    } catch { /* silent fail — still show success */ }
    setWaitlistDone(true)
    setWaitlistLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center font-sans">

      {/* Coming Soon Banner */}
      <div style={{ width: '100%', background: 'rgba(79,124,255,0.1)', borderBottom: '1px solid rgba(79,124,255,0.2)', padding: '12px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'white', margin: 0, fontFamily: 'inherit' }}>
          🚀 The 8-Week Job Placement Cohort is launching soon — join the waitlist to get early access and a founding member discount.
        </p>
      </div>

      <div className="max-w-lg w-full py-12 px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
            🚀 Launching Soon · Join the Waitlist
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join the 8-Week Placement Accelerator</h1>
          <p className="text-gray-500">Get structured guidance, live sessions, and proven strategies to land your first off-campus offer.</p>
        </div>

        {/* What's included card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">What you get</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              '8 weeks of structured curriculum',
              'Live weekly sessions with mentors',
              '50+ cold email templates',
              'ATS-optimized resume template',
              'LinkedIn DM scripts',
              'Company hit list spreadsheet',
              'Private WhatsApp community',
              'Lifetime access to all resources',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t mt-5 pt-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">₹999</span>
              <span className="text-gray-400 line-through ml-2 text-sm">₹4,999</span>
            </div>
            <span className="text-green-600 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">80% off</span>
          </div>
        </div>

        {/* Waitlist form card */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          {waitlistDone ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>You&apos;re on the list!</p>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                We&apos;ll reach out as soon as registrations open — founding members get early access and a special discount.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Get Early Access</h2>
              <p className="text-sm text-gray-500 mb-5">
                Registrations are opening soon. Drop your email and we&apos;ll notify you first — founding members get a special discount.
              </p>

              <div className="flex flex-col gap-3 mb-5">
                <input
                  type="email"
                  placeholder="Your Email"
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWaitlist()}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* COHORT PAYMENTS DISABLED — to re-enable, remove the waitlist form */}
              {/* and restore the Razorpay payment flow. Run prompt: "Re-enable cohort payments" */}
              {/* to activate instantly. */}
              <button
                onClick={handleWaitlist}
                disabled={waitlistLoading || !waitlistEmail.trim()}
                className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
              >
                {waitlistLoading ? '⏳ Saving...' : 'Notify Me →'}
              </button>

              <p className="text-gray-400 text-xs text-center mt-3">
                No spam · We&apos;ll only email you when registrations open
              </p>
            </>
          )}
        </div>

      </div>
    </main>
  )
}

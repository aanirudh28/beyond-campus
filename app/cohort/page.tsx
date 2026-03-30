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

export default function CohortPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [resumeStatus, setResumeStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const saveBooking = async (paymentId: string) => {
    const { error } = await supabase.from('bookings').insert({
      name,
      email,
      phone,
      resume_status: resumeStatus,
      date: 'April 1',
      time_slot: '8-Week Cohort',
      payment_id: paymentId,
      amount: 999,
      type: 'cohort',
    })
    if (error) console.error('Booking save error:', error)

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        date: 'April 1',
        timeSlot: '8-Week Cohort',
        type: 'cohort',
        amount: 999,
      }),
    })
  }

  const handleJoin = async () => {
    if (!name || !email || !phone) {
      alert('Please enter your name, email, and phone number.')
      return
    }
    if (!resumeStatus) {
      alert('Please answer the resume question.')
      return
    }

    setIsLoading(true)

    try {
      const loaded = await loadRazorpay()
      if (!loaded) {
        alert('Failed to load payment gateway.')
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999 }),
      })

      const { orderId, amount } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Beyond Campus',
        description: '8-Week Placement Accelerator Cohort',
        order_id: orderId,
        prefill: { name, email },
        theme: { color: '#7c3aed' },
        handler: async function (response: any) {
          await saveBooking(response.razorpay_payment_id)
          setIsJoined(true)
          setIsLoading(false)
        },
        modal: { ondismiss: () => setIsLoading(false) },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
            🔥 Next Batch — April 1 · Only 30 Seats
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

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reserve your seat</h2>

          <div className="flex flex-col gap-3 mb-5">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="tel"
              placeholder="Your Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">Do you have a resume?</p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              { value: 'has_resume', label: 'Yes, I have an existing resume' },
              { value: 'needs_resume', label: 'No, I need help building my resume from scratch' },
            ].map((option) => (
              <button key={option.value} onClick={() => setResumeStatus(option.value)}
                className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${resumeStatus === option.value ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleJoin}
            disabled={isLoading || isJoined}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
          >
            {isJoined ? '✅ You\'re In!' : isLoading ? '⏳ Processing...' : 'Pay & Join Cohort – ₹999'}
          </button>

          {isJoined && (
            <p className="text-green-600 text-center font-medium mt-4">
              🎉 Welcome aboard! Check your email at <strong>{email}</strong> for next steps.
            </p>
          )}

          <p className="text-gray-400 text-xs text-center mt-3">
            One-time payment · Secure checkout via Razorpay
          </p>
        </div>

      </div>
    </main>
  )
}

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
    bio: 'Placed off-campus into consulting from a non-IIM background. Spent months reverse-engineering what actually gets you interviews — cold outreach, positioning, and showing up before others even start applying.',
    days: ['Mon', 'Wed', 'Fri'],
    accentFrom: '#4F46E5',
    accentTo: '#7B61FF',
    badgeText: '#a5b4fc',
    tagBg: 'rgba(79,70,229,0.12)',
    tagBorder: 'rgba(79,70,229,0.22)',
    borderGrad: 'linear-gradient(145deg, rgba(79,70,229,0.6) 0%, rgba(123,97,255,0.25) 50%, rgba(255,255,255,0.04) 100%)',
    cardBg: 'linear-gradient(160deg, #131020 0%, #0c0b15 100%)',
  },
  {
    id: 'sanya',
    initials: 'SS',
    name: 'Sanya Srivastava',
    role: 'FP&A @ Palo Alto Networks',
    college: 'Finance · Corporate Strategy',
    tags: ['Finance', 'FP&A', 'Corporate Strategy'],
    bio: 'Built a career in finance and corporate strategy at a global tech company — without the "right" pedigree. Knows exactly what finance and strategy roles look for, and how to get there when no one hands you a roadmap.',
    days: ['Tue', 'Thu', 'Sat'],
    accentFrom: '#0891B2',
    accentTo: '#06b6d4',
    badgeText: '#67e8f9',
    tagBg: 'rgba(6,182,212,0.10)',
    tagBorder: 'rgba(6,182,212,0.22)',
    borderGrad: 'linear-gradient(145deg, rgba(6,182,212,0.5) 0%, rgba(8,145,178,0.2) 50%, rgba(255,255,255,0.04) 100%)',
    cardBg: 'linear-gradient(160deg, #0a1418 0%, #0b0f14 100%)',
  },
]

const timeSlots = ['10 AM – 11 AM', '11 AM – 12 PM', '2 PM – 3 PM', '4 PM – 5 PM', '6 PM – 7 PM']

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
      body: JSON.stringify({
        name,
        email,
        date: selectedDate,
        timeSlot: selectedTime,
        mentor: selectedMentor?.name,
        type: 'mentorship',
        amount: 299,
      }),
    })
  }

  const handleBook = async () => {
    if (!selectedMentor) {
      alert('Please select a mentor.')
      return
    }
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time.')
      return
    }
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
        body: JSON.stringify({ amount: 299 }),
      })

      const { orderId, amount } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'Beyond Campus',
        description: `Mentorship with ${selectedMentor.name} – ${selectedDate}, ${selectedTime}`,
        order_id: orderId,
        prefill: { name, email },
        theme: { color: selectedMentor.accentFrom },
        handler: async function (response: any) {
          await saveBooking(response.razorpay_payment_id)
          setIsBooked(true)
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

  const accent = selectedMentor?.accentFrom ?? '#4f46e5'

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-3xl w-full">

        {/* Mentor selection */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Mentor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mentors.map((mentor) => {
              const isSelected = selectedMentor?.id === mentor.id
              return (
                <button
                  key={mentor.id}
                  onClick={() => handleSelectMentor(mentor)}
                  className="text-left rounded-2xl border-2 p-5 transition-all"
                  style={{
                    borderColor: isSelected ? mentor.accentFrom : '#e5e7eb',
                    background: isSelected ? `linear-gradient(135deg, ${mentor.accentFrom}15, ${mentor.accentTo}08)` : 'white',
                    boxShadow: isSelected ? `0 0 0 1px ${mentor.accentFrom}40, 0 4px 20px ${mentor.accentFrom}18` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${mentor.accentFrom}, ${mentor.accentTo})` }}
                    >
                      {mentor.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{mentor.name}</div>
                      <div className="text-xs text-gray-500">{mentor.role}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mentor.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: mentor.tagBg, border: `1px solid ${mentor.tagBorder}`, color: mentor.badgeText }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Available: {mentor.days.join(' · ')}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedMentor && (
          <div className="bg-white rounded-2xl shadow p-8">
            {/* Selected mentor header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${selectedMentor.accentFrom}, ${selectedMentor.accentTo})` }}
              >
                {selectedMentor.initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedMentor.name}</h1>
                <p className="text-gray-600 mb-1">{selectedMentor.role}</p>
                <p className="text-gray-400 text-sm mb-2">{selectedMentor.college}</p>
                <p className="text-sm text-gray-600 mb-2">{selectedMentor.bio}</p>
                <p className="font-semibold text-lg" style={{ color: selectedMentor.accentFrom }}>₹299 / 1 hour session</p>
              </div>
            </div>

            {/* Details */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Details</h2>
            <div className="flex flex-col gap-3 mb-6">
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="tel" placeholder="Your Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">Do you have a resume?</h2>
            <div className="flex flex-col gap-3 mb-6">
              {[
                { value: 'has_resume', label: 'Yes, I have an existing resume' },
                { value: 'needs_resume', label: 'No, I need help building my resume from scratch' },
              ].map((option) => (
                <button key={option.value} onClick={() => setResumeStatus(option.value)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${resumeStatus === option.value ? 'border-indigo-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  style={resumeStatus === option.value ? { background: accent, borderColor: accent } : {}}>
                  {option.label}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Date</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {selectedMentor.days.map((d) => (
                <button key={d} onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                  className={`px-4 py-2 rounded-lg border font-medium transition ${selectedDate === d ? 'text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  style={selectedDate === d ? { background: accent, borderColor: accent } : {}}>
                  {d}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Time Slot</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {timeSlots.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={`px-4 py-2 rounded-lg border font-medium transition ${selectedTime === t ? 'text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  style={selectedTime === t ? { background: '#f97316', borderColor: '#f97316' } : {}}>
                  {t}
                </button>
              ))}
            </div>

            <button onClick={handleBook} disabled={isLoading || isBooked}
              className="w-full text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
              style={{ background: isBooked ? '#16a34a' : accent }}>
              {isBooked ? '✅ Session Booked!' : isLoading ? '⏳ Processing...' : 'Pay & Book Session – ₹299'}
            </button>

            {isBooked && (
              <p className="text-green-600 text-center font-medium mt-4">
                🎉 Booking confirmed! Check your email at <strong>{email}</strong> for confirmation.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

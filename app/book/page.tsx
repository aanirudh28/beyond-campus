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

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isBooked, setIsBooked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const timeSlots = ['10 AM – 11 AM', '11 AM – 12 PM', '2 PM – 3 PM', '4 PM – 5 PM', '6 PM – 7 PM']

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
      date: selectedDate,
      time_slot: selectedTime,
      payment_id: paymentId,
      amount: 299,
      type: 'mentorship',
    })
    if (error) console.error('Booking save error:', error)

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        date: selectedDate,
        timeSlot: selectedTime,
        type: 'mentorship',
        amount: 299,
      }),
    })
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time.')
      return
    }
    if (!name || !email) {
      alert('Please enter your name and email.')
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
        description: `Mentorship Session – ${selectedDate}, ${selectedTime}`,
        order_id: orderId,
        prefill: { name, email },
        theme: { color: '#4f46e5' },
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

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
            R
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Rahul Verma</h1>
            <p className="text-gray-600 mb-2">Senior SDE @ Microsoft | Ex‑Razorpay | 500+ students mentored</p>
            <p className="text-indigo-600 font-semibold text-lg">₹299 / 1 hour session</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Details</h2>
        <div className="flex flex-col gap-3 mb-6">
          <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Date</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {dates.map((d) => (
            <button key={d} onClick={() => setSelectedDate(d)}
              className={`px-4 py-2 rounded-lg border ${selectedDate === d ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 hover:bg-gray-100'}`}>
              {d}
            </button>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Time Slot</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {timeSlots.map((t) => (
            <button key={t} onClick={() => setSelectedTime(t)}
              className={`px-4 py-2 rounded-lg border ${selectedTime === t ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        <button onClick={handleBook} disabled={isLoading || isBooked}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">
          {isBooked ? '✅ Session Booked!' : isLoading ? '⏳ Processing...' : 'Pay & Book Session – ₹299'}
        </button>

        {isBooked && (
          <p className="text-green-600 text-center font-medium mt-4">
            🎉 Booking confirmed! Check your email at <strong>{email}</strong> for confirmation.
          </p>
        )}
      </div>
    </main>
  )
}

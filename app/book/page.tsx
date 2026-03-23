'use client'

import { useState } from 'react'

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [isBooked, setIsBooked] = useState(false)

  const dates = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const timeSlots = ['10 AM – 11 AM', '11 AM – 12 PM', '2 PM – 3 PM', '4 PM – 5 PM', '6 PM – 7 PM']

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both a date and time before paying.')
      return
    }
    setIsBooked(true)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow p-8">
        {/* Mentor Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b pb-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl text-white font-bold">
            R
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Rahul Verma</h1>
            <p className="text-gray-600 mb-2">Senior SDE @ Microsoft | Ex‑Razorpay | 500+ students mentored</p>
            <p className="text-indigo-600 font-semibold text-lg">₹299 / 1 hour session</p>
          </div>
        </div>

        {/* Date Selection */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Date</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-4 py-2 rounded-lg border ${
                selectedDate === d
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Time Slot Selection */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Select a Time Slot</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {timeSlots.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTime(t)}
              className={`px-4 py-2 rounded-lg border ${
                selectedTime === t
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Book Button */}
        <button
          onClick={handleBook}
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          {isBooked ? '✅ Session Booked (Simulated)' : 'Pay & Book Session – ₹299'}
        </button>

        {isBooked && (
          <p className="text-green-600 text-center font-medium mt-4">
            🎉 Booking confirmed! You’ll receive a confirmation email shortly.
          </p>
        )}
      </div>
    </main>
  )
}

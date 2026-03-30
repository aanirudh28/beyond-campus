'use client'

import { useState } from 'react'

declare global {
  interface Window { Razorpay: any }
}

export default function InternshipPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const curriculum = [
    { week: 'Week 1', title: 'Resume & LinkedIn Makeover', desc: 'Build an ATS-friendly resume and optimize your LinkedIn to attract recruiters.' },
    { week: 'Week 2', title: 'Cold Email Mastery', desc: 'Write cold emails that get replies. Includes templates + Mail Merge setup.' },
    { week: 'Week 3', title: 'LinkedIn Cold Messaging', desc: 'DM strategy to reach HRs, founders, and SDEs directly.' },
    { week: 'Week 4', title: 'Naukri & Job Portals', desc: 'Optimize Naukri profile and learn to apply strategically at scale.' },
    { week: 'Week 5', title: 'Company Targeting Strategy', desc: 'Identify the right companies, find contacts, and build your hit list.' },
    { week: 'Week 6', title: 'Tools & Automation', desc: 'Use Porro.io, Hunter.io, and Mail Merge to 10x your outreach.' },
    { week: 'Week 7', title: 'Interview Prep', desc: 'HR rounds, technical basics, and how to ace off-campus interviews.' },
    { week: 'Week 8', title: 'Offer Negotiation & Closing', desc: 'How to follow up, negotiate offers, and convert interviews to offers.' },
  ]

  const mentors = [
    { initial: 'R', name: 'Rahul Verma', role: 'Senior SDE @ Microsoft', bio: 'Ex-Razorpay. Helped 500+ students land off-campus roles. Specializes in cold outreach and resume strategy.', tags: ['Resume', 'Cold Email', 'SDE Roles'] },
    { initial: 'P', name: 'Priya Nair', role: 'Product Manager @ Swiggy', bio: 'Ex-Flipkart. Expert in LinkedIn strategy and startup hiring. Has reviewed 1000+ student profiles.', tags: ['LinkedIn', 'PM Roles', 'Startups'] },
    { initial: 'A', name: 'Arjun Singh', role: 'Founder @ EduTech Startup', bio: 'Built 3 companies from scratch. Teaches students how to think like founders and get noticed.', tags: ['Networking', 'Negotiation', 'Founder Mindset'] },
  ]

  const testimonials = [
    { name: 'Priya S.', college: 'Tier-3 College, Delhi', result: 'Got internship at Razorpay', quote: 'I had zero connections. After week 2, I got 3 replies from cold emails. By week 5, I had an internship offer!' },
    { name: 'Rohan M.', college: 'GGSIPU, Delhi', result: 'Placed at a Series B startup', quote: 'The cold messaging strategy alone was worth ₹999. I landed my dream role without a single campus placement.' },
    { name: 'Sneha K.', college: 'Amity University', result: 'Internship at a product company', quote: 'The resume template and LinkedIn tips got me 5x more profile views in a week.' },
  ]

  const bonuses = [
    '📧 50+ Cold Email Templates',
    '💼 Resume Template (ATS-Optimized)',
    '🔗 LinkedIn DM Scripts',
    '📋 Company Hit List Spreadsheet',
    '🎯 Naukri Optimization Checklist',
    '📞 Weekly Live Q&A Sessions',
    '👥 Private WhatsApp Community',
    '♾️ Lifetime Access to Resources',
  ]

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

  const handleJoin = async () => {
    if (!name || !email) { alert('Please enter your name and email.'); return }
    setIsLoading(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) { alert('Failed to load payment gateway.'); setIsLoading(false); return }

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
        description: '2-Month Internship Cohort Program',
        order_id: orderId,
        prefill: { name, email },
        theme: { color: '#7c3aed' },
        handler: function () { setIsJoined(true); setIsLoading(false) },
        modal: { ondismiss: () => setIsLoading(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      alert('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block">🔥 Next Batch Starting April 1 — Only 30 Seats</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">Land an Internship in 8 Weeks — Without Campus Placement</h1>
          <p className="text-indigo-200 text-lg mb-8">A structured cohort with real mentors, proven strategies, and weekly accountability — designed for Indian students who want results.</p>
          <a href="/cohort"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition">
            Join Cohort – ₹999
          </a>
          <p className="text-indigo-300 text-sm mt-3">One-time payment • Lifetime access • 100% practical</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-50 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[['2,500+', 'Students Mentored'], ['850+', 'Offers Secured'], ['94%', 'Success Rate']].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-indigo-700">{num}</div>
              <div className="text-gray-600 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Most Students Fail Off-Campus</h2>
        <div className="space-y-3">
          {['❌ Spamming job portals with no strategy', '❌ Resume rejected by ATS before a human sees it', '❌ No network, no referrals, no idea where to start', '❌ Waiting for campus placements that never come', '❌ Sending cold emails that get zero replies'].map(p => (
            <div key={p} className="bg-red-50 border border-red-100 rounded-lg px-5 py-3 text-gray-700">{p}</div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">8-Week Curriculum</h2>
          <p className="text-gray-500 text-center mb-10">Everything you need, in the exact order you need it.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {curriculum.map((item) => (
              <div key={item.week} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{item.week}</span>
                <h3 className="font-bold text-gray-900 mt-1 mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentors */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Your Mentors</h2>
        <p className="text-gray-500 text-center mb-10">Learn from people who've actually done it.</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {mentors.map(m => (
            <div key={m.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl text-white font-bold mx-auto mb-3">
                {m.initial}
              </div>
              <h3 className="font-bold text-gray-900">{m.name}</h3>
              <p className="text-indigo-600 text-sm mb-2">{m.role}</p>
              <p className="text-gray-500 text-sm mb-3">{m.bio}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {m.tags.map(t => <span key={t} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bonuses */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">What's Included</h2>
          <p className="text-gray-500 text-center mb-8">Everything you get when you join today.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {bonuses.map(b => (
              <div key={b} className="bg-white rounded-lg px-4 py-3 text-gray-800 font-medium border border-gray-100 shadow-sm">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Students Who Made It</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mb-3">
                  {t.name[0]}
                </div>
                <p className="text-gray-600 text-sm mb-3 italic">"{t.quote}"</p>
                <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                <div className="text-gray-400 text-xs">{t.college}</div>
                <div className="text-green-600 text-xs font-semibold mt-1">✅ {t.result}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Ready to Land Your Internship?</h2>
          <p className="text-indigo-200 mb-6">Join 2,500+ students who stopped waiting and started getting offers.</p>
          <p className="text-2xl font-bold mb-1">₹999 <span className="text-indigo-300 line-through text-lg ml-2">₹4,999</span></p>
          <p className="text-indigo-300 text-sm mb-6">Limited seats • Next batch April 1</p>
          <a href="/cohort"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition">
            Join Now – ₹999
          </a>
        </div>
      </section>

    </main>
  )
}
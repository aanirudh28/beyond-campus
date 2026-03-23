export default function Home() {
  return (
    <main className="font-sans bg-white text-gray-900">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-b from-indigo-50 to-white px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-indigo-700 mb-4">
          Land Your Dream Internship — Without Campus Placement
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mb-8">
          Join 2,500+ students who’ve secured offers through personalized mentorship and structured cohorts designed for real results.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/book"
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Book a Mentorship Session ₹299
          </a>
          <a
            href="/cohort"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Join Internship Cohort ₹999
          </a>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row gap-6 text-gray-700">
          <div>
            <p className="text-3xl font-bold text-indigo-700">2,500+</p>
            <p>Students Mentored</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-700">850+</p>
            <p>Offers Secured</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-700">94%</p>
            <p>Success Rate</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-gray-50 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Why Most Students Struggle Off‑Campus</h2>
        <div className="max-w-4xl mx-auto text-gray-600 text-lg">
          <p className="mb-4">🎯 No clear roadmap — Applying randomly without strategy</p>
          <p className="mb-4">📄 Weak resume — Not optimized for real recruiters</p>
          <p>📩 No replies to cold emails & LinkedIn messages</p>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-indigo-700">The CareerLaunch System</h2>
        <p className="max-w-2xl mx-auto text-gray-600 mb-8">
          We combine 1:1 mentorship, proven cold‑outreach strategies, and cohort‑based accountability — so you stop guessing and start getting interviews.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/book"
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition"
          >
            Book Mentorship
          </a>
          <a
            href="/cohort"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Join Cohort
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-indigo-50 text-center px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-indigo-700 mb-10">
          Real Students, Real Results
        </h2>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "Priya Sharma",
              role: "SDE Intern at Razorpay",
              quote:
                "After joining the cohort, I got 4 interview calls within a month. The cold email templates worked like magic.",
            },
            {
              name: "Arjun Patel",
              role: "Product Intern at CRED",
              quote:
                "My mentor reviewed my resume and guided my entire outreach plan. I got my first PPO offer in 6 weeks!",
            },
            {
              name: "Sneha Reddy",
              role: "Data Science Intern at Swiggy",
              quote:
                "The personalized sessions gave me a crystal‑clear roadmap. I finally landed multiple internship offers!",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <p className="italic text-gray-700 mb-4">“{t.quote}”</p>
              <p className="font-semibold text-indigo-700">{t.name}</p>
              <p className="text-sm text-gray-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8">
        <h3 className="text-2xl font-bold mb-2">CareerLaunch</h3>
        <p className="text-gray-400 mb-4">
          Helping students land dream internships through mentorship and strategy.
        </p>
        <p className="text-gray-500 text-sm">© {new Date().getFullYear()} CareerLaunch · All rights reserved</p>
      </footer>
    </main>
  )
}

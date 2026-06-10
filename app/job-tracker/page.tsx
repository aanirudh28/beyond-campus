import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Job Application Tracker for Students | Beyond Campus',
  description:
    'Track every off-campus job application on a free kanban board. AI writes your cold emails and follow-ups, smart reminders make sure no company forgets you. Built for Indian students.',
  keywords: [
    'job application tracker',
    'free job tracker',
    'job tracker for students',
    'off campus job tracker India',
    'internship application tracker',
    'cold email tracker',
    'job application tracker excel alternative',
  ],
  alternates: { canonical: 'https://www.beyond-campus.in/job-tracker' },
  openGraph: {
    title: 'Free Job Application Tracker for Students',
    description:
      'Stop tracking applications in your Notes app. Kanban board, AI-written cold emails, follow-up reminders and streaks — free forever.',
    url: 'https://www.beyond-campus.in/job-tracker',
    siteName: 'Beyond Campus',
    type: 'website',
  },
}

const FEATURES = [
  {
    emoji: '🗂️',
    title: 'A board, not a spreadsheet',
    desc: 'Drag every application through Saved → Applied → Replied → Interview → Offer. One glance tells you exactly where your job hunt stands.',
  },
  {
    emoji: '✨',
    title: 'AI writes your outreach',
    desc: 'Paste a job link and AI fills in the details. Then it writes the cold email, the follow-up, and the LinkedIn DM — tailored to that company, in your voice, zero cringe.',
  },
  {
    emoji: '⏰',
    title: 'Never miss a follow-up',
    desc: 'Every application gets a follow-up date. Overdue ones surface in your Today queue and land in your inbox at 9 AM. A polite follow-up doubles your reply rate.',
  },
  {
    emoji: '🔥',
    title: 'Streaks keep you applying',
    desc: 'Application streaks, weekly goals, and a progress ring that fills as you apply. The job hunt is a numbers game — we make the numbers addictive.',
  },
  {
    emoji: '📊',
    title: 'Know what actually works',
    desc: 'Reply rate by source, funnel conversion, best day to apply. Stop guessing whether LinkedIn or cold email works better — see it in your own data.',
  },
  {
    emoji: '🧠',
    title: 'Weekly AI coaching',
    desc: 'Every week, AI reads your pipeline and tells you one thing to change — like "your reply rate doubles when you follow up within 3 days."',
  },
]

const FAQS = [
  {
    q: 'Is it really free?',
    a: 'Yes. Unlimited applications, the board, reminders, streaks and basic analytics are free forever. AI writing is free for 5 generations a month; unlimited AI plus full analytics comes with the ₹299 one-time Resource Pack (which also includes 50 cold email templates, LinkedIn scripts and our resume guide).',
  },
  {
    q: 'How is this better than my Excel sheet / Notes app?',
    a: 'Your spreadsheet doesn\'t remind you to follow up, doesn\'t write your cold emails, and doesn\'t tell you that your referral applications get 4x more replies than job portals. The tracker does all three.',
  },
  {
    q: 'Who is this built for?',
    a: 'Indian students and fresh graduates doing off-campus applications — especially BBA, BCom, and non-tech students targeting consulting, finance, marketing, BD, operations and Founder\'s Office roles.',
  },
  {
    q: 'How do I sign up?',
    a: 'Continue with Google or LinkedIn — it takes about 30 seconds. No credit card, no trial countdown.',
  },
]

const BOARD_PREVIEW: { label: string; color: string; cards: string[] }[] = [
  { label: 'Applied', color: '#4F7CFF', cards: ['Zomato · BD Associate', 'Razorpay · Ops'] },
  { label: 'Replied', color: '#00D2FF', cards: ['Swiggy · Marketing'] },
  { label: 'Interview', color: '#f59e0b', cards: ['Deloitte · Analyst'] },
  { label: 'Offer', color: '#10b981', cards: ['CRED · Founder\'s Office'] },
]

export default function JobTrackerLanding() {
  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: 'white', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        details > summary { list-style: none; cursor: pointer; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .faq-arrow { transform: rotate(180deg); }
        .cta-btn { transition: transform 0.15s, box-shadow 0.15s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(79,124,255,0.5); }
      `}</style>

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', fontFamily: "'DM Serif Display', serif", fontSize: 21, color: 'white', letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </Link>
        <Link href="/login?next=/tracker" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
          Log in →
        </Link>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px 40px', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.35)', color: '#93BBFF', marginBottom: 22 }}>
          Free · Built for off-campus applications
        </span>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(34px, 6vw, 58px)', lineHeight: 1.12, margin: '0 0 18px', letterSpacing: -1 }}>
          Your job hunt deserves better than a Notes app.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(15px, 2.3vw, 18px)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 30px' }}>
          Track every application on a kanban board, let AI write your cold emails and follow-ups,
          and get reminded before companies forget you. Free, forever.
        </p>
        <Link
          href="/signup"
          className="cta-btn"
          style={{ display: 'inline-block', padding: '16px 36px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 28px rgba(79,124,255,0.4)' }}
        >
          Start tracking free →
        </Link>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12.5, marginTop: 14 }}>
          Sign in with Google or LinkedIn · 30-second setup · No credit card
        </p>
      </section>

      {/* Board preview */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 64px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 20, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 12, minWidth: 640 }}>
            {BOARD_PREVIEW.map(col => (
              <div key={col.label} style={{ flex: 1, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, padding: '0 4px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{col.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11.5, fontWeight: 600 }}>{col.cards.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.cards.map(card => (
                    <div key={card} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `3px solid ${col.color}`, borderRadius: 11, padding: '10px 12px', fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {card}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 70px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px, 4vw, 38px)', textAlign: 'center', margin: '0 0 40px', letterSpacing: -0.5 }}>
          Everything your spreadsheet can&apos;t do
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '26px 24px' }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof / pitch */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 70px', textAlign: 'center' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,124,255,0.08), rgba(123,97,255,0.08))', border: '1px solid rgba(79,124,255,0.25)', borderRadius: 24, padding: '36px 28px' }}>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(19px, 3vw, 24px)', lineHeight: 1.5, margin: '0 0 10px' }}>
            &ldquo;The off-campus job hunt is a numbers game. The students who win are the ones who apply consistently and follow up relentlessly.&rdquo;
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, margin: 0 }}>
            — the playbook behind every Beyond Campus placement
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 70px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(24px, 4vw, 32px)', textAlign: 'center', margin: '0 0 28px', letterSpacing: -0.5 }}>
          Questions, answered
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map(faq => (
            <details key={faq.q} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 22px' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 700 }}>
                {faq.q}
                <span className="faq-arrow" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
              </summary>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.75, margin: '12px 0 0' }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 90px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(26px, 4.5vw, 40px)', margin: '0 0 14px', letterSpacing: -0.5 }}>
          The next application you send deserves a follow-up.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15.5, margin: '0 0 28px' }}>
          Set up your pipeline in 30 seconds. Your future self (the one with interview calls) says thanks.
        </p>
        <Link
          href="/signup"
          className="cta-btn"
          style={{ display: 'inline-block', padding: '16px 38px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 8px 28px rgba(79,124,255,0.4)' }}
        >
          Start tracking free →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Beyond Campus</Link>
          {' '}· Helping non-tech students break in, off-campus ·{' '}
          <Link href="/resources/resume-roast" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none' }}>Try the free Resume Roast</Link>
        </p>
      </footer>
    </main>
  )
}

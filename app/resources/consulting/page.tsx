'use client'

import { useState } from 'react'
import Link from 'next/link'

const CASEBOOKS = [
  {
    id: 'iima-2025',
    title: 'IIM Ahmedabad Consult Prep Book 2025-26',
    description: 'The most comprehensive consulting prep resource from IIM-A\'s consulting club. Covers case frameworks, industry primers, and interview strategies.',
    size: '16 MB',
    downloads: 1243,
    url: '/api/resources/iima-2025',
  },
  {
    id: 'iimb-2025',
    title: 'IIM Bangalore Casebook 2025',
    description: 'Case studies and frameworks from IIM Bangalore\'s placement cell. Strong focus on strategy, operations, and market entry cases.',
    size: '11 MB',
    downloads: 987,
    url: '/api/resources/iimb-2025',
  },
  {
    id: 'iimc-2025',
    title: 'IIM Calcutta Casebook 2025-26',
    description: 'Curated cases from IIM Calcutta\'s consulting club — includes live case examples and interviewer notes.',
    size: '7 MB',
    downloads: 876,
    url: '/api/resources/iimc-2025',
  },
  {
    id: 'iiml-2025',
    title: 'IIM Lucknow Casebook 2025',
    description: 'Practice cases and solved examples from IIM Lucknow. Ideal for students preparing for Big 4 and boutique consulting interviews.',
    size: '5 MB',
    downloads: 743,
    url: '/api/resources/iiml-2025',
  },
  {
    id: 'isb-2025',
    title: 'ISB Casebook 2025',
    description: 'Case interviews and frameworks from ISB\'s consulting club. Covers profitability, market sizing, and strategic cases.',
    size: '4 MB',
    downloads: 654,
    url: '/api/resources/isb-2025',
  },
  {
    id: 'bitsom-2024',
    title: 'BITSoM Casebook 2023-24',
    description: 'Consulting case studies from BITS School of Management — great for students from non-IIM backgrounds targeting consulting roles.',
    size: '4 MB',
    downloads: 521,
    url: '/api/resources/bitsom-2024',
  },
  {
    id: 'case-interview-guide',
    title: 'Case Interview Guide',
    description: 'A structured guide to cracking case interviews — covers frameworks, communication tips, and common mistakes to avoid.',
    size: '12 MB',
    downloads: 432,
    url: '/api/resources/case-interview-guide',
  },
]

const GUESTIMATE = {
  id: 'srcc-guestimates',
  title: 'SRCC Guestimates Book — Volume 1-6',
  description: 'The most comprehensive guestimate resource available — 6 volumes of market sizing problems with structured solutions. Covers FMCG, tech, infrastructure, and consumer sectors. Used by students who cracked consulting roles at Big 4 and boutique firms.',
  size: '5 MB',
  downloads: 1891,
  url: '/api/resources/srcc-guestimates',
}

// Soft, optional email capture revealed right after a download — files still open
// instantly and ungated. Feeds the `leads` table → nurture "Leads sequence".
function LeadCapture({ resource, accent = 'blue' }: { resource: string; accent?: 'blue' | 'purple' }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const color = accent === 'purple' ? '#c4b5fd' : '#93BBFF'
  const border = accent === 'purple' ? 'rgba(123,97,255,0.5)' : 'rgba(79,124,255,0.45)'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setState('error'); return }
    setState('sending')
    try {
      const res = await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resource }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch { setState('error') }
  }

  if (state === 'done') {
    return (
      <div style={{ marginTop: 10, padding: '11px 13px', borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 12.5, color: '#6ee7b7', fontWeight: 600, textAlign: 'center', lineHeight: 1.5 }}>
        ✓ On its way. Check your inbox for the full pack.
        <span style={{ display: 'block', marginTop: 4, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
          Not there in a minute? Check spam or promotions, and mark it &ldquo;not spam&rdquo; so the weekly cases land too.
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
        Want all 8 casebooks + a fresh case emailed weekly?
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
          placeholder="you@email.com"
          style={{ flex: 1, minWidth: 0, padding: '9px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${state === 'error' ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`, color: 'white', fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none' }}
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 100, background: 'transparent', border: `1.5px solid ${border}`, color, fontWeight: 700, fontSize: 13, cursor: state === 'sending' ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          {state === 'sending' ? '…' : 'Send →'}
        </button>
      </div>
      {state === 'error' && <div style={{ fontSize: 11, color: '#fca5a5' }}>Enter a valid email address.</div>}
    </form>
  )
}

function CasebookCard({ resource }: { resource: typeof CASEBOOKS[0] }) {
  const [downloading, setDownloading] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceName: resource.title }),
      })
    } catch {}
    window.open(resource.url, '_blank')
    setDownloading(false)
    setShowCapture(true)
  }

  return (
    <div
      className="resource-card"
      style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, borderLeft: '4px solid #4F7CFF', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF' }}>
                Casebook
              </span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.35, margin: 0 }}>{resource.title}</h3>
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500, flexShrink: 0, paddingTop: 2 }}>PDF · {resource.size}</span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, margin: 0 }}>{resource.description}</p>

      {/* Downloads */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>↓ {resource.downloads.toLocaleString()} downloads</div>

      {/* Button */}
      <div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="download-btn"
          style={{ width: '100%', padding: '11px 0', borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(79,124,255,0.45)', color: '#93BBFF', fontWeight: 700, fontSize: 13, cursor: downloading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}
        >
          {downloading ? 'Opening...' : 'Download Free →'}
        </button>
        {showCapture
          ? <LeadCapture resource={resource.title} accent="blue" />
          : <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 7 }}>No sign-up required · Opens in new tab</div>}
      </div>
    </div>
  )
}

function GuestimateFeaturedCard() {
  const [downloading, setDownloading] = useState(false)
  const [showCapture, setShowCapture] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceName: GUESTIMATE.title }),
      })
    } catch {}
    window.open(GUESTIMATE.url, '_blank')
    setDownloading(false)
    setShowCapture(true)
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(123,97,255,0.1),rgba(79,124,255,0.06))', border: '1px solid rgba(123,97,255,0.25)', borderRadius: 20, padding: 28, borderLeft: '4px solid #7B61FF', position: 'relative' }}>
      {/* Most downloaded badge */}
      <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(123,97,255,0.2)', border: '1px solid rgba(123,97,255,0.4)', borderRadius: 100, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: '#c4b5fd', letterSpacing: 0.5 }}>
        ⭐ Most Downloaded
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#7B61FF,#9d4edd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
        <div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 100, background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.35)', color: '#c4b5fd' }}>
              Guestimate
            </span>
          </div>
          <h3 style={{ fontSize: 19, fontWeight: 800, color: 'white', lineHeight: 1.3, margin: 0, paddingRight: 100 }}>{GUESTIMATE.title}</h3>
        </div>
      </div>

      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 16 }}>{GUESTIMATE.description}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>PDF · {GUESTIMATE.size}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>↓ {GUESTIMATE.downloads.toLocaleString()} downloads</span>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{ width: '100%', padding: '13px 0', borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(123,97,255,0.5)', color: '#c4b5fd', fontWeight: 700, fontSize: 14, cursor: downloading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(123,97,255,0.12)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
      >
        {downloading ? 'Opening...' : 'Download Free →'}
      </button>
      {showCapture
        ? <LeadCapture resource={GUESTIMATE.title} accent="purple" />
        : <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 8 }}>No sign-up required · Opens in new tab</div>}
    </div>
  )
}

export default function ConsultingResourcesPage() {
  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        .resource-card { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
        .resource-card:hover { border-color: rgba(79,124,255,0.3) !important; box-shadow: 0 8px 32px rgba(79,124,255,0.1); transform: translateY(-2px); }
        .download-btn { transition: background 0.2s, border-color 0.2s; }
        .download-btn:hover { background: rgba(79,124,255,0.1) !important; border-color: rgba(79,124,255,0.7) !important; }
        .section-divider { display: flex; align-items: center; gap: 16px; margin: 48px 0 28px; }
        .section-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        @media (max-width: 640px) {
          .resource-grid { grid-template-columns: 1fr !important; }
          .stat-pills { flex-wrap: wrap; }
        }
      `}</style>

      {/* STICKY TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5, flexShrink: 0 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Consulting Resources</span>
        <a href="/free" style={{ flexShrink: 0, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← All Resources
        </a>
      </div>

      {/* HERO */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: 20 }}>
          Free Resource
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, marginBottom: 16 }}>
          Consulting Resources
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 32px' }}>
          Casebooks, guestimate frameworks, and prep guides from India&apos;s top business schools — free to download.
        </p>
        <div className="stat-pills" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '8 Casebooks', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
            { label: '1 Guestimate Book', color: '#c4b5fd', bg: 'rgba(123,97,255,0.1)', border: 'rgba(123,97,255,0.25)' },
            { label: '100% Free', color: '#6ee7b7', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
          ].map(p => (
            <span key={p.label} style={{ padding: '8px 18px', borderRadius: 100, background: p.bg, border: `1px solid ${p.border}`, color: p.color, fontSize: 13, fontWeight: 700 }}>{p.label}</span>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* CASEBOOKS SECTION */}
        <div className="section-divider" style={{ marginTop: 0 }}>
          <div className="section-divider-line" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#93BBFF', whiteSpace: 'nowrap' }}>CASEBOOKS</span>
          <div className="section-divider-line" />
        </div>

        <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
          Practice cases from India&apos;s top consulting clubs
        </h2>

        <div className="resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 56 }}>
          {CASEBOOKS.map(r => <CasebookCard key={r.id} resource={r} />)}
        </div>

        {/* GUESTIMATES SECTION */}
        <div className="section-divider">
          <div className="section-divider-line" />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c4b5fd', whiteSpace: 'nowrap' }}>GUESTIMATES</span>
          <div className="section-divider-line" />
        </div>

        <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
          Market sizing frameworks and practice problems
        </h2>

        <div style={{ marginBottom: 64 }}>
          <GuestimateFeaturedCard />
        </div>

        {/* BOTTOM CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.2)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
            Casebooks are step one.
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 540, margin: '0 auto 28px' }}>
            You&apos;ve got the frameworks. Now sharpen the rest — roast your resume in 30 seconds, drill company-style aptitude, and when you&apos;re ready to actually get placed, our 8-week Placement Cohort takes you there with personalized targeting and direct introductions.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cohort" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#4F7CFF,#7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 24px rgba(123,97,255,0.3)' }}>
              Join the Placement Cohort — ₹2,500 →
            </a>
            <a href="/resources/resume-roast" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}>
              🔥 Roast my resume — free
            </a>
            <a href="/aptitude" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 14 }}>
              🧮 Practice aptitude — free
            </a>
          </div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 22 }}>
            Not sure where you fit?{' '}
            <Link href="/guides/consulting-internship-without-an-iim" style={{ color: '#93BBFF' }}>
              Read the free guide: breaking into consulting without an IIM tag →
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}

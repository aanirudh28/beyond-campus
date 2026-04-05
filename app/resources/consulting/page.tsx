'use client'

import { useState } from 'react'

const CASEBOOKS = [
  {
    id: 'iima-2023',
    title: 'IIM Ahmedabad Casebook 2023',
    description: 'Case studies across consulting, strategy, and operations. Used by students who cracked McKinsey, BCG, and Deloitte.',
    size: 'PDF · 4.2 MB',
    downloads: 1842,
    url: '#', // Replace with real Supabase Storage URL after upload
  },
  {
    id: 'isb-consulting',
    title: 'ISB Consulting Casebook',
    description: 'Strategy and operations cases from India\'s top business school placement cell.',
    size: 'PDF · 3.8 MB',
    downloads: 1203,
    url: '#',
  },
  {
    id: 'tier2-edition',
    title: 'Consulting Club Casebook — Tier 2 Edition',
    description: 'Cases specifically selected for students from non-IIM backgrounds targeting boutique and Big 4 firms.',
    size: 'PDF · 2.1 MB',
    downloads: 987,
    url: '#',
  },
]

const GUESTIMATES = [
  {
    id: 'guestimate-bible',
    title: 'The Guestimate Bible',
    description: '50 market sizing problems with structured solutions. Covers FMCG, tech, infrastructure, and consumer sectors.',
    size: 'PDF · 1.8 MB',
    downloads: 2341,
    url: '#',
  },
  {
    id: 'top-20-guestimates',
    title: 'Top 20 Consulting Guestimates',
    description: 'The most commonly asked market sizing questions in consulting interviews — with step-by-step frameworks.',
    size: 'PDF · 0.9 MB',
    downloads: 1567,
    url: '#',
  },
]

function ResourceCard({ resource, type }: { resource: typeof CASEBOOKS[0], type: 'casebook' | 'guestimate' }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceName: resource.title }),
      })
    } catch {}
    // Trigger download
    if (resource.url !== '#') {
      const a = document.createElement('a')
      a.href = resource.url
      a.download = resource.title
      a.click()
    }
    setDownloading(false)
  }

  const isBlue = type === 'casebook'

  return (
    <div style={{
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: 24,
      borderLeft: `4px solid ${isBlue ? '#4F7CFF' : '#7B61FF'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${isBlue ? 'rgba(79,124,255,0.1)' : 'rgba(123,97,255,0.1)'}` }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: isBlue ? 'linear-gradient(135deg,#4F7CFF,#7B61FF)' : 'linear-gradient(135deg,#7B61FF,#9d4edd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>📄</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 100,
              background: isBlue ? 'rgba(79,124,255,0.12)' : 'rgba(123,97,255,0.12)',
              border: `1px solid ${isBlue ? 'rgba(79,124,255,0.3)' : 'rgba(123,97,255,0.3)'}`,
              color: isBlue ? '#93BBFF' : '#c4b5fd',
            }}>
              {isBlue ? 'Casebook' : 'Guestimate'}
            </span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1.3, margin: 0 }}>{resource.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{resource.description}</p>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>{resource.size}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>↓ {resource.downloads.toLocaleString()} downloads</span>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          width: '100%', padding: '12px 0', borderRadius: 100,
          background: 'transparent',
          border: `1.5px solid ${isBlue ? 'rgba(79,124,255,0.5)' : 'rgba(123,97,255,0.5)'}`,
          color: isBlue ? '#93BBFF' : '#c4b5fd',
          fontWeight: 700, fontSize: 14, cursor: downloading ? 'wait' : 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = isBlue ? 'rgba(79,124,255,0.1)' : 'rgba(123,97,255,0.1)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        {downloading ? 'Preparing...' : 'Download Free →'}
      </button>
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
        @media (max-width: 640px) {
          .resource-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/free" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← All Resources
        </a>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px 100px' }}>

        {/* HERO */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7' }}>
              FREE RESOURCE
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
            Consulting Resources
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 580, marginBottom: 28 }}>
            Casebooks, guestimate frameworks, and preparation guides — everything you need to crack consulting interviews off-campus.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Free Downloads', 'Consulting-Specific', 'Updated Regularly'].map(pill => (
              <span key={pill} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '7px 16px', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* CASEBOOKS SECTION */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#93BBFF' }}>CASEBOOKS</span>
          </div>
          <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
            Practice cases used by consulting students worldwide
          </h2>
          <div className="resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {CASEBOOKS.map(r => <ResourceCard key={r.id} resource={r} type="casebook" />)}
          </div>
        </div>

        {/* GUESTIMATES SECTION */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c4b5fd' }}>GUESTIMATES</span>
          </div>
          <h2 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 24 }}>
            Frameworks and practice problems for market sizing
          </h2>
          <div className="resource-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {GUESTIMATES.map(r => <ResourceCard key={r.id} resource={r} type="guestimate" />)}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div style={{ background: 'linear-gradient(135deg,rgba(79,124,255,0.08),rgba(123,97,255,0.05))', border: '1px solid rgba(79,124,255,0.15)', borderRadius: 24, padding: '40px 36px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, letterSpacing: -0.5, marginBottom: 12 }}>
            Resources prepare you. Strategy places you.
          </h3>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 28px' }}>
            The casebooks teach you the framework. Our Summer Internship Program gets you in front of the right people to use it.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/summer/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 0 24px rgba(245,158,11,0.3)', textDecoration: 'none' }}>
              Join Summer Program — ₹699 →
            </a>
            <a href="/book" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 100, border: '1.5px solid rgba(79,124,255,0.4)', color: '#93BBFF', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              Book a Session — ₹299
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}

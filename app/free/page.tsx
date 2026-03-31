'use client'

import { useState } from 'react'

type ResourceCard = {
  id: string
  badge: string
  badgeColor: { bg: string; border: string; color: string }
  title: string
  description: string
  stats: { label: string; color: string; bg: string; border: string }[]
  ctaLabel: string
  resourcePath: string
  viewLabel: string
}

const RESOURCES: ResourceCard[] = [
  {
    id: 'cold-email-pack',
    badge: 'Free Download',
    badgeColor: { bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.3)', color: '#93BBFF' },
    title: 'Cold Email Pack',
    description: '50 proven email templates + 20 LinkedIn DM scripts used by students to get replies from HRs, founders, and hiring managers — across 6 categories.',
    stats: [
      { label: '50 Templates', color: '#93BBFF', bg: 'rgba(79,124,255,0.1)', border: 'rgba(79,124,255,0.25)' },
      { label: '20 LinkedIn Scripts', color: '#7dd3fc', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)' },
      { label: '6 Categories', color: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    ],
    ctaLabel: 'Get Free Access →',
    resourcePath: '/resources/cold-email-pack',
    viewLabel: 'View Templates →',
  },
]

export default function FreePage() {
  const [emailMap, setEmailMap] = useState<Record<string, string>>({})
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({})
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent, resourceId: string, resourceName: string) => {
    e.preventDefault()
    const email = emailMap[resourceId]
    if (!email) return
    setSubmittingMap(p => ({ ...p, [resourceId]: true }))
    try {
      await fetch('/api/capture-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resource: resourceName }),
      })
    } catch {}
    setSuccessMap(p => ({ ...p, [resourceId]: true }))
    setSubmittingMap(p => ({ ...p, [resourceId]: false }))
  }

  return (
    <main style={{ background: '#0B0B0F', color: '#fff', minHeight: '100vh', fontFamily: "'DM Sans','Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        .resource-card{background:#111827;border:1px solid rgba(255,255,255,0.07);border-radius:24px;padding:36px;transition:border-color 0.2s,box-shadow 0.2s}
        .resource-card:hover{border-color:rgba(79,124,255,0.25);box-shadow:0 12px 48px rgba(79,124,255,0.07)}
        .email-input{width:100%;padding:13px 18px;border-radius:12px;border:1.5px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#fff;font-size:15px;font-family:"DM Sans",sans-serif;outline:none;transition:border-color 0.2s}
        .email-input:focus{border-color:rgba(79,124,255,0.4)}
        .email-input::placeholder{color:rgba(255,255,255,0.25)}
        .cta-btn{width:100%;padding:14px 0;border-radius:12px;background:linear-gradient(135deg,#4F7CFF,#7B61FF);color:#fff;font-weight:700;font-size:15px;font-family:"DM Sans",sans-serif;border:none;cursor:pointer;transition:opacity 0.2s,box-shadow 0.2s;box-shadow:0 4px 20px rgba(79,124,255,0.25)}
        .cta-btn:hover{opacity:0.9;box-shadow:0 6px 28px rgba(79,124,255,0.35)}
        .cta-btn:disabled{opacity:0.6;cursor:wait}
        .view-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;padding:13px 0;border-radius:12px;border:1.5px solid rgba(79,124,255,0.35);background:rgba(79,124,255,0.08);color:#93BBFF;font-weight:700;font-size:15px;font-family:"DM Sans",sans-serif;cursor:pointer;transition:all 0.2s;text-decoration:none}
        .view-btn:hover{background:rgba(79,124,255,0.15);border-color:rgba(79,124,255,0.5)}
        @media(max-width:640px){
          .page-hero h1{font-size:32px !important}
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(11,11,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, letterSpacing: -0.5 }}>
          Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
        </a>
        <a href="/" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back to home
        </a>
      </div>

      {/* HERO */}
      <section className="page-hero" style={{ padding: '64px 24px 52px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#93BBFF', textTransform: 'uppercase', marginBottom: 20 }}>
          Free Resources
        </div>
        <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
          Tools to help you land your internship
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
          Free templates, scripts, and playbooks built by the Beyond Campus team. No fluff, no paywalls — just the good stuff.
        </p>
      </section>

      {/* RESOURCE CARDS */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {RESOURCES.map(r => {
          const isSuccess = successMap[r.id]
          const isSubmitting = submittingMap[r.id]
          const email = emailMap[r.id] ?? ''

          return (
            <div key={r.id} className="resource-card">
              {/* Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, background: r.badgeColor.bg, border: `1px solid ${r.badgeColor.border}`, color: r.badgeColor.color }}>
                  {r.badge}
                </span>
                <a href={r.resourcePath} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {r.viewLabel}
                </a>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 10 }}>{r.title}</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 20 }}>{r.description}</p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                {r.stats.map(s => (
                  <span key={s.label} style={{ padding: '6px 14px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 12, fontWeight: 700 }}>
                    {s.label}
                  </span>
                ))}
              </div>

              {/* CTA */}
              {isSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#6ee7b7' }}>
                    Check your inbox! 📬
                  </div>
                  <a href={r.resourcePath} className="view-btn">
                    View Templates Now →
                  </a>
                </div>
              ) : (
                <form onSubmit={e => handleSubmit(e, r.id, r.title)} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email for instant access"
                    className="email-input"
                    value={email}
                    onChange={e => setEmailMap(p => ({ ...p, [r.id]: e.target.value }))}
                  />
                  <button type="submit" className="cta-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : r.ctaLabel}
                  </button>
                  <a href={r.resourcePath} style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    or browse directly without email →
                  </a>
                </form>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}

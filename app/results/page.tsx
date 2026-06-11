'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { RESULTS } from '@/lib/results'

const STATS = [
  { num: String(RESULTS.length), label: 'students placed' },
  { num: String(new Set(RESULTS.map(r => r.company)).size), label: 'companies' },
  { num: '100%', label: 'off-campus — zero referrals' },
]

export default function ResultsPage() {
  // shared reveal observer, same pattern as the homepage
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target) } }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', color: '#fff', fontFamily: "var(--font-dm-sans), 'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        ::selection { background: rgba(79,124,255,0.4); }
        [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.2,0.6,0.2,1), transform 0.7s cubic-bezier(0.2,0.6,0.2,1); }
        [data-reveal].in { opacity: 1; transform: translateY(0); }

        .rw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 20px; }
        .rw-card { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015)); border: 1px solid rgba(255,255,255,0.09); border-radius: 24px; padding: 30px 28px; display: flex; flex-direction: column; position: relative; overflow: hidden; transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s; }
        .rw-card:hover { border-color: rgba(79,124,255,0.4); transform: translateY(-5px); box-shadow: 0 24px 64px rgba(79,124,255,0.13); }
        .rw-card::before { content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 1px; background: linear-gradient(90deg, transparent, rgba(79,124,255,0.5), transparent); }
        .rw-placed { display: inline-flex; align-items: center; gap: 6px; padding: 5px 13px; border-radius: 100px; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #4ade80; font-size: 10.5px; font-weight: 800; letter-spacing: 1.5px; }
        .rw-logo { filter: brightness(0) invert(1); opacity: 0.92; display: inline-flex; align-items: center; }
        .rw-quote { font-size: 14.5px; color: rgba(255,255,255,0.68); line-height: 1.8; font-style: italic; }
        .mono-label { font-family: var(--font-geist-mono), monospace; font-size: 11px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.38); }
      `}</style>

      {/* nav */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 21, letterSpacing: -0.5 }}>
            Beyond<span style={{ color: '#4F7CFF' }}>Campus</span>
          </Link>
          <a href="/cohort" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 13.5, boxShadow: '0 0 24px rgba(79,124,255,0.35)' }}>
            Join them →
          </a>
        </div>
      </div>

      {/* header */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '90px 24px 50px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 380, background: 'radial-gradient(ellipse at center, rgba(79,124,255,0.12), transparent 65%)', pointerEvents: 'none' }} />
        <span className="mono-label" data-reveal style={{ display: 'block', marginBottom: 18, color: '#4F7CFF' }}>The results wall</span>
        <h1 data-reveal style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 'clamp(38px, 5.5vw, 64px)', lineHeight: 1.05, letterSpacing: -1.5, fontWeight: 400, marginBottom: 18, maxWidth: 720 }}>
          Students who made it.<br /><em style={{ fontStyle: 'italic', color: '#93BBFF' }}>Receipts attached.</em>
        </h1>
        <p data-reveal style={{ fontSize: 16.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 540, marginBottom: 40 }}>
          Real students, real companies, real offers — every one of them landed off-campus,
          without a placement cell making introductions.
        </p>
        <div data-reveal style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 38, color: '#4F7CFF', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* the wall */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '10px 24px 80px' }}>
        <div className="rw-grid">
          {RESULTS.map((r, i) => (
            <div key={r.slug} className="rw-card" data-reveal style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <Image src={r.photo} alt={r.name} width={76} height={76} quality={85}
                  style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 3px rgba(79,124,255,0.25), 0 8px 28px rgba(0,0,0,0.4)' }} />
                <span className="rw-placed">✓ PLACED</span>
              </div>

              <div style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 25, marginBottom: 4 }}>{r.name}</div>
              {r.college && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{r.college}</div>}

              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(79,124,255,0.35), transparent)', margin: '16px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                {r.companyLogo ? (
                  <span className="rw-logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.companyLogo} alt={r.company} style={{ height: r.logoH || 20 }} />
                  </span>
                ) : (
                  <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.3, color: 'white' }}>{r.company}</span>
                )}
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{r.role}</span>
              </div>
              {r.location && (
                <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 11, letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
                  {r.location.toUpperCase()}
                </div>
              )}

              {r.quote && <p className="rw-quote" style={{ margin: '16px 0 18px' }}>&ldquo;{r.quote}&rdquo;</p>}

              {r.linkedin && (
                <a href={r.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)', fontSize: 12.5, color: '#93BBFF', fontWeight: 600, alignSelf: 'flex-start' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  Verify on LinkedIn
                </a>
              )}
            </div>
          ))}

          {/* you're next card */}
          <a href="/cohort" className="rw-card" data-reveal style={{ transitionDelay: '0.16s', border: '1px dashed rgba(79,124,255,0.35)', background: 'rgba(79,124,255,0.04)', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 280 }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', border: '2px dashed rgba(79,124,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#4F7CFF', marginBottom: 18 }}>+</div>
            <div style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 24, marginBottom: 8 }}>You&apos;re next.</div>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 240, marginBottom: 16 }}>
              Every student on this wall started with zero replies. The system is the difference.
            </p>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#93BBFF' }}>See the cohorts →</span>
          </a>
        </div>
      </section>

      {/* footer cta */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 80px', textAlign: 'center' }}>
        <p style={{ fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif", fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.4, maxWidth: 560, margin: '0 auto 28px', color: 'rgba(255,255,255,0.85)' }}>
          Your name belongs up there.<br />
          <em style={{ color: '#93BBFF' }}>Start this week.</em>
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/cohort" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 34px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, boxShadow: '0 0 30px rgba(79,124,255,0.35)' }}>
            Explore Placement Cohort →
          </a>
          <a href="/resources/resume-roast" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 34px', borderRadius: 100, border: '1.5px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: 15 }}>
            Not ready? Get the free roast 🔥
          </a>
        </div>
      </section>
    </main>
  )
}

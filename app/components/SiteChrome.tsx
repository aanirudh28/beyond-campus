'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'

/* ----------------------------------------------------------------------------
   Shared site chrome for Beyond Campus.
   These are the premium homepage patterns — grain, aurora, scroll-reveal,
   glass nav, footer — packaged as drop-in pieces so every page matches without
   re-hand-rolling them. Styling lives in globals.css.
---------------------------------------------------------------------------- */

/** Reveals every [data-reveal] element on scroll. Call once per page. */
export function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            obs.unobserve(e.target)
          }
        }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

/** Tracks whether the page has scrolled past `threshold` px. */
export function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

/** Fixed fractal-noise grain that sits over the whole viewport. */
export function NoiseOverlay() {
  return <div className="noise-overlay" aria-hidden="true" />
}

/**
 * Two slow drifting aurora glows. Drop as the FIRST child of a
 * `position: relative; overflow: hidden` section (e.g. a hero) so they sit
 * behind that section's content.
 */
export function HeroGlow() {
  return (
    <>
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
    </>
  )
}

/** Editorial section header: ledger number · rule · mono label. */
export function Ledger({ no, label }: { no: string; label: string }) {
  return (
    <div className="ledger" data-reveal>
      <span className="ledger-no">{no}</span>
      <span className="ledger-rule" />
      <span className="ledger-label">{label}</span>
    </div>
  )
}

type NavLink = { label: string; href: string }

/**
 * Glass sticky nav. Logo → home, a configurable primary CTA, and optional
 * quiet links that hide on mobile.
 */
export function SiteNav({
  cta = { label: 'Get the free roast 🔥', href: '/resources/resume-roast' },
  links = [],
}: {
  cta?: NavLink
  links?: NavLink[]
}) {
  const scrolled = useScrolled(40)
  return (
    <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
      <Link href="/" className="site-logo">
        Beyond<span>Campus</span>
      </Link>
      <div className="nav-links">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="nav-link nav-hide-mobile">
            {l.label}
          </Link>
        ))}
        <Link href="/aptitude" className="nav-link nav-hide-mobile">
          Aptitude Practice
        </Link>
        <a href={cta.href} className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
          <span>{cta.label}</span>
        </a>
      </div>
    </nav>
  )
}

type FooterCol = { heading: string; links: NavLink[] }

/** Shared footer: brand mark, optional link columns, and a primary CTA. */
export function SiteFooter({
  tagline = 'Off-campus placements for non-tech students. No campus required.',
  columns = [],
  cta = { label: 'Explore the cohorts →', href: '/cohort' },
}: {
  tagline?: string
  columns?: FooterCol[]
  cta?: NavLink
}) {
  return (
    <footer className="site-footer">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 40,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ maxWidth: 300 }}>
          <div className="site-logo" style={{ fontSize: 24, marginBottom: 8 }}>
            Beyond<span>Campus</span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7 }}>{tagline}</p>
          <a
            href={cta.href}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: 14, marginTop: 20 }}
          >
            <span>{cta.label}</span>
          </a>
        </div>
        {columns.map(col => (
          <div key={col.heading}>
            <div className="mono-label" style={{ marginBottom: 16 }}>
              {col.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {col.links.map(l => (
                <Link
                  key={l.href + l.label}
                  href={l.href}
                  style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 40,
          paddingTop: 24,
          borderTop: '1px solid var(--hair)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          fontSize: 12.5,
          color: 'var(--muted-2)',
        }}
      >
        <span>© {new Date().getFullYear()} Beyond Campus · beyond-campus.in</span>
        <span style={{ fontFamily: 'var(--mono)', letterSpacing: 2 }}>EST. 2026</span>
      </div>
    </footer>
  )
}

/**
 * Optional page wrapper: solid dark, relative, clips overflow-x, and runs the
 * reveal observer. Children render above any HeroGlow placed inside sections.
 */
export function PageShell({ children }: { children: ReactNode }) {
  useReveal()
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: '#fff',
        fontFamily: 'var(--sans)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <NoiseOverlay />
      {children}
    </main>
  )
}

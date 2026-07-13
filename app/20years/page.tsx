'use client'

import Link from 'next/link'
import { HeroGlow, Ledger, SiteFooter, SiteNav, useReveal } from '@/app/components/SiteChrome'
import { ENDINGS } from '@/lib/life/content/endings'

const SHOWCASE_IDS = [
  'the_corner_office',
  'the_comfortable_trap',
  'the_recession_alchemist',
  'the_burnout',
  'the_hometown_king',
  'the_ghost_of_linkedin',
  'the_quiet_crorepati',
  'the_beautiful_failure',
]

const TONE_COLOR = { good: '#93BBFF', bad: '#FF8F8F', weird: '#FFC65C' } as const

const STEPS = [
  {
    no: '01',
    title: 'Start as yourself, today',
    desc: 'Final year, three questions, no signup. Then it is 2026 and the applications are not getting replies.',
  },
  {
    no: '02',
    title: 'Make 35 choices across 20 years',
    desc: 'The bank exam your father wants. The 40 percent switch offer. The wedding budget. The 2039 correction. Every choice compounds: salary, savings, skills, burnout, family.',
  },
  {
    no: '03',
    title: 'Meet your ending at 45',
    desc: 'One of 27 endings, with a rarity score, a written epilogue of your life, and a Life Report showing exactly which choices decided it and what to do about them now, at 21.',
  },
]

export default function TwentyYearsLanding() {
  useReveal()
  const showcase = SHOWCASE_IDS.map((id) => ENDINGS.find((e) => e.id === id)!).filter(Boolean)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <SiteNav
        cta={{ label: 'Play free →', href: '/20years/play' }}
        links={[
          { label: 'How it works', href: '#how' },
          { label: 'The endings', href: '#endings' },
        ]}
      />

      {/* ── Hero ── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '150px 24px 90px',
          textAlign: 'center',
        }}
      >
        <HeroGlow />
        <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto' }}>
          <div className="mono-label" data-reveal style={{ marginBottom: 20 }}>
            A CAREER LIFE-SIMULATOR · FREE · NO SIGNUP
          </div>
          <h1
            className="section-title"
            data-reveal
            style={{ fontSize: 'clamp(40px, 7vw, 72px)', marginBottom: 22 }}
          >
            Live the next <em>20 years</em>
            <br />
            of your career. Tonight.
          </h1>
          <p
            data-reveal
            style={{
              fontSize: 17,
              lineHeight: 1.75,
              color: 'var(--muted)',
              maxWidth: 560,
              margin: '0 auto 36px',
            }}
          >
            You, final year, 21. Thirty-five choices later you are 45, and the simulation hands you
            your life: the salary, the savings, the Sundays, and the name of your ending. Then it
            shows you which choices decided everything, while you are still young enough to change
            them.
          </p>
          <div data-reveal style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/20years/play" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Begin the 20 years →</span>
            </Link>
          </div>
          <p data-reveal style={{ fontSize: 12.5, color: 'var(--muted-2)', marginTop: 18 }}>
            Around 15 minutes · 27 possible endings · every run is different
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '90px 24px', borderTop: '1px solid var(--hair)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Ledger no="Nº 01" label="How it works" />
          <h2 className="section-title" data-reveal style={{ marginBottom: 48 }}>
            A time machine, <em>pointed forward.</em>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.no}
                className="bc-card"
                data-reveal
                style={{ padding: '30px 26px', transitionDelay: `${i * 0.08}s` }}
              >
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 44,
                    lineHeight: 1,
                    background: 'var(--grad)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: 16,
                  }}
                >
                  {step.no}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{step.title}</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Endings wall ── */}
      <section
        id="endings"
        style={{
          padding: '90px 24px',
          borderTop: '1px solid var(--hair)',
          background: 'linear-gradient(180deg, rgba(79,124,255,0.04), transparent)',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Ledger no="Nº 02" label="The endings" />
          <h2 className="section-title" data-reveal style={{ marginBottom: 14 }}>
            27 ways a career can go<em>.</em>
          </h2>
          <p
            data-reveal
            style={{ color: 'var(--muted)', fontSize: 16, maxWidth: 540, lineHeight: 1.7, marginBottom: 44 }}
          >
            Some endings are trophies. Some are warnings wearing good salaries. The rarest ones,
            players find by accident and screenshot immediately.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 14,
            }}
          >
            {showcase.map((ending, i) => (
              <div
                key={ending.id}
                className="bc-card"
                data-reveal
                style={{ padding: '24px 22px', transitionDelay: `${(i % 4) * 0.06}s` }}
              >
                <div style={{ fontSize: 34, marginBottom: 12 }}>{ending.emoji}</div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 21,
                    letterSpacing: -0.3,
                    marginBottom: 8,
                  }}
                >
                  {ending.name}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9.5,
                    letterSpacing: 1.5,
                    color: TONE_COLOR[ending.tone],
                    marginBottom: 10,
                  }}
                >
                  {ending.tone === 'good' ? 'EARN IT' : ending.tone === 'bad' ? 'AVOID IT' : 'STUMBLE INTO IT'}
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--muted)', margin: 0 }}>
                  {ending.blurb.split('. ')[0]}.
                </p>
              </div>
            ))}
            <div
              className="bc-card"
              data-reveal
              style={{
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                borderStyle: 'dashed',
              }}
            >
              <div style={{ fontSize: 34, marginBottom: 12 }}>❓</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 21, marginBottom: 8 }}>
                + 19 more
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
                Including the one only a handful of players have ever unlocked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section style={{ padding: '90px 24px', borderTop: '1px solid var(--hair)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <Ledger no="Nº 03" label="Why we built this" />
          <h2 className="section-title" data-reveal style={{ marginBottom: 20 }}>
            Hindsight, <em>20 years early.</em>
          </h2>
          <p
            data-reveal
            style={{ fontSize: 16.5, lineHeight: 1.8, color: 'var(--muted)', marginBottom: 12 }}
          >
            Every 40-something professional knows exactly which choices at 21 mattered: the skill
            they skipped, the mentor they lost touch with, the money they never invested, the
            message they never sent. That knowledge usually arrives twenty years too late to use.
          </p>
          <p
            data-reveal
            style={{ fontSize: 16.5, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', marginBottom: 40 }}
          >
            The simulation compresses those twenty years into twenty minutes, so the lesson arrives
            while it is still cheap. Play it twice. Your second life will be smarter than your
            first. So will your real one.
          </p>
          <Link href="/20years/play" className="btn-primary" data-reveal style={{ textDecoration: 'none' }}>
            <span>Meet your 45-year-old self →</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

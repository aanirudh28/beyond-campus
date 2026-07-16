'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import type { Ending, Stats, TrailPoint } from '@/lib/life/types'
import type { GhostSummary } from '@/lib/life/ghosts'
import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import LifeTimeline from '@/app/components/life/LifeTimeline'

interface PublicRun {
  ending: Ending
  epilogue: string
  oneLiner: string
  rarity: number
  stats: Stats
  trail?: TrailPoint[] | null
  ghosts?: GhostSummary[] | null
  challenge?: string | null
}

const TONE_COLOR = { good: '#93BBFF', bad: '#FF8F8F', weird: '#FFC65C' } as const

export default function LifeResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [run, setRun] = useState<PublicRun | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    fetch(`/api/life/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setRun)
      .catch(() => setFailed(true))
  }, [id])

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <SiteNav cta={{ label: 'Play free →', href: '/20years/play' }} />
      <section style={{ maxWidth: 620, margin: '0 auto', padding: '130px 24px 80px', textAlign: 'center' }}>
        {failed && (
          <>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, marginBottom: 14 }}>
              This life could not be found.
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 15.5, marginBottom: 28 }}>
              The run may not have finished, or the link is broken. Yours is waiting either way.
            </p>
            <Link href="/20years/play" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Live your own 20 years →</span>
            </Link>
          </>
        )}

        {!failed && !run && (
          <p className="mono-label" style={{ paddingTop: 60 }}>
            OPENING THE LEDGER…
          </p>
        )}

        {run && (
          <>
            <div className="mono-label" style={{ marginBottom: 22 }}>
              SOMEONE LIVED 20 YEARS AND GOT
            </div>
            <div style={{ fontSize: 68, lineHeight: 1, marginBottom: 14 }}>{run.ending.emoji}</div>
            <h1
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(38px, 9vw, 56px)',
                letterSpacing: -1.5,
                lineHeight: 1.05,
                margin: '0 0 16px',
                background: 'var(--grad)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {run.ending.name}
            </h1>
            <div
              style={{
                display: 'inline-block',
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: 2,
                color: TONE_COLOR[run.ending.tone],
                border: `1px solid ${TONE_COLOR[run.ending.tone]}55`,
                borderRadius: 100,
                padding: '7px 16px',
                marginBottom: 30,
              }}
            >
              ONLY {run.rarity}% OF PLAYERS GET THIS ENDING
            </div>

            <div
              className="bc-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                padding: '16px 12px',
                marginBottom: 30,
                maxWidth: 380,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              {[
                ['FINAL CTC', run.stats.salary > 0 ? `₹${Number(run.stats.salary).toFixed(1)} LPA` : 'Off payroll'],
                ['NET WORTH', `${run.stats.savings < 0 ? '-' : ''}₹${Math.abs(Number(run.stats.savings)).toFixed(0)}L`],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div className="mono-label" style={{ fontSize: 9.5, marginBottom: 6 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{value}</div>
                </div>
              ))}
            </div>

            {run.trail && <LifeTimeline trail={run.trail} />}

            <div style={{ textAlign: 'left', marginBottom: 40 }}>
              {run.epilogue.split(/\n\n+/).map((para, i) => (
                <p
                  key={i}
                  style={{ fontSize: 15.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', margin: '0 0 13px' }}
                >
                  {para}
                </p>
              ))}
            </div>

            {run.ghosts && run.ghosts.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 40 }}>
                <div className="mono-label" style={{ marginBottom: 8 }}>
                  THE ROADS THEY DIDN&apos;T TAKE
                </div>
                {run.ghosts.map((ghost, i) => (
                  <div key={i} className="bc-card" style={{ padding: '18px 18px 16px', marginBottom: 10 }}>
                    {ghost.kind === 'disciplined' ? (
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 8px' }}>
                        <span className="mono-label" style={{ color: '#b4a6ff' }}>THE DISCIPLINED GHOST</span>
                        {' '}Same luck, every choice the long game. That version ended as:
                      </p>
                    ) : (
                      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 8px' }}>
                        {ghost.forkTitle && (
                          <span className="mono-label" style={{ color: 'var(--blue-soft)', display: 'block', marginBottom: 4 }}>
                            THE FORK · {ghost.forkTitle}
                          </span>
                        )}
                        {ghost.ageLine}{' '}
                        <span style={{ color: 'rgba(255,255,255,0.85)' }}>“{ghost.takenLabel}”</span>. Had
                        they chosen <span style={{ color: 'var(--blue-soft)' }}>“{ghost.otherLabel}”</span>:
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 20 }}>{ghost.emoji}</span>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{ghost.endingName}</span>
                      <span
                        style={{
                          fontFamily: 'var(--mono)',
                          fontSize: 10,
                          letterSpacing: 1,
                          padding: '3px 9px',
                          borderRadius: 100,
                          border: `1px solid ${ghost.savingsDelta >= 0 ? 'rgba(122,183,255,0.35)' : 'rgba(255,107,107,0.35)'}`,
                          color: ghost.savingsDelta >= 0 ? 'var(--blue-soft)' : '#FF8F8F',
                        }}
                      >
                        {ghost.savingsDelta >= 0 ? '+' : '-'}₹{Math.abs(ghost.savingsDelta)}L NET WORTH
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bc-card" style={{ padding: '30px 24px' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, margin: '0 0 10px' }}>
                Your 20 years will go differently<em style={{ color: 'var(--blue-soft)' }}>.</em>
              </h2>
              <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.7, margin: '0 0 20px' }}>
                35 choices. 32 endings. 15 minutes. Free, no signup, and the ending is yours to
                earn or avoid.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/20years/play" className="btn-primary" style={{ textDecoration: 'none' }}>
                  <span>Play your 20 years →</span>
                </Link>
                {run.challenge && (
                  <Link
                    href={`/20years/play?l=${run.challenge}&c=${id}`}
                    style={{
                      padding: '13px 22px',
                      borderRadius: 100,
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'var(--fg)',
                      fontSize: 14,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    ⚔ Live this exact life
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </section>
      <SiteFooter />
    </main>
  )
}

'use client'

import { useMemo, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { SiteFooter, SiteNav } from '@/app/components/SiteChrome'
import { ENDINGS, getEnding } from '@/lib/life/content/endings'
import { ORIGINS } from '@/lib/life/origins'
import { LEGACY_ORIGINS } from '@/lib/life/legacy'
import { parsePastLives, readPastLivesRaw } from '@/lib/life/lives'

// The ending collection: every life this device has lived, and the
// silhouettes of the ones still out there. Pure localStorage, no account.

const TONE_COLOR = { good: '#93BBFF', bad: '#FF8F8F', weird: '#FFC65C' } as const
const TONE_LABEL = { good: 'EARN IT', bad: 'AVOID IT', weird: 'STUMBLE INTO IT' } as const

const emptySubscribe = () => () => {}

export default function CollectionPage() {
  const raw = useSyncExternalStore(
    emptySubscribe,
    () => {
      try {
        return localStorage.getItem('bc20_endings') ?? '[]'
      } catch {
        return '[]'
      }
    },
    () => '[]',
  )
  const discovered = useMemo(() => {
    try {
      return new Set<string>(JSON.parse(raw))
    } catch {
      return new Set<string>()
    }
  }, [raw])
  const livesRaw = useSyncExternalStore(emptySubscribe, readPastLivesRaw, () => '[]')
  const lives = useMemo(() => parsePastLives(livesRaw), [livesRaw])

  const found = ENDINGS.filter((e) => discovered.has(e.id)).length
  const rarest = ENDINGS.filter((e) => discovered.has(e.id)).reduce(
    (min, e) => Math.min(min, e.baselineRarity),
    100,
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <SiteNav cta={{ label: 'Play free →', href: '/20years/play' }} />
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '130px 20px 80px' }}>
        <div className="mono-label" style={{ marginBottom: 14, textAlign: 'center' }}>
          THE COLLECTION · {found} OF {ENDINGS.length} DISCOVERED
        </div>
        <h1
          className="section-title"
          style={{ textAlign: 'center', marginBottom: 14 }}
        >
          Every life you have lived<em>.</em>
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: 15.5,
            color: 'var(--muted)',
            lineHeight: 1.7,
            maxWidth: 520,
            margin: '0 auto 20px',
          }}
        >
          {found === 0
            ? 'No endings yet. Your first fifteen years are waiting.'
            : found < ENDINGS.length
              ? 'The dimmed cards are lives this device has not lived yet. Different choices find them.'
              : 'All of them. Every single life. Frame this page.'}
        </p>
        <div
          style={{
            maxWidth: 320,
            height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.08)',
            margin: '0 auto 44px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${(found / ENDINGS.length) * 100}%`,
              height: '100%',
              background: 'var(--grad)',
              borderRadius: 2,
            }}
          />
        </div>

        {lives.length > 0 && (
          <div style={{ maxWidth: 560, margin: '0 auto 48px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 26,
                marginBottom: 22,
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                letterSpacing: 1.5,
                color: 'var(--muted)',
              }}
            >
              <span>{lives.length} {lives.length === 1 ? 'LIFE' : 'LIVES'} LIVED</span>
              <span>{found} OF {ENDINGS.length} FOUND</span>
              {found > 0 && <span>RAREST ~{rarest}%</span>}
            </div>
            <div className="mono-label" style={{ marginBottom: 12 }}>
              YOUR LIVES, MOST RECENT FIRST
            </div>
            {lives
              .slice(-12)
              .reverse()
              .map((life, i) => {
                const ending = getEnding(life.e)
                const origin = [...ORIGINS, ...LEGACY_ORIGINS].find((o) => o.id === life.o)
                return (
                  <div
                    key={`${life.ts}-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      padding: '9px 2px',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span style={{ fontSize: 17 }}>{ending.emoji}</span>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 15.5 }}>{ending.name}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        letterSpacing: 1,
                        color: 'var(--muted-2)',
                        textAlign: 'right',
                      }}
                    >
                      {life.s < 0 ? '-' : ''}₹{Math.abs(life.s)}L{origin ? ` · ${origin.identity.toUpperCase()}` : ''}
                    </span>
                  </div>
                )
              })}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {ENDINGS.map((ending) => {
            const got = discovered.has(ending.id)
            return (
              <div
                key={ending.id}
                className="bc-card"
                style={{
                  padding: '20px 18px',
                  opacity: got ? 1 : 0.55,
                  borderStyle: got ? 'solid' : 'dashed',
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 10, filter: got ? 'none' : 'grayscale(1) blur(3px)' }}>
                  {got ? ending.emoji : '❓'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 18,
                    letterSpacing: -0.3,
                    marginBottom: 7,
                    color: got ? 'var(--fg)' : 'var(--muted-2)',
                  }}
                >
                  {got ? ending.name : '?????'}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: TONE_COLOR[ending.tone],
                    marginBottom: 8,
                  }}
                >
                  {TONE_LABEL[ending.tone]}
                </div>
                <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}>
                  {got ? ending.blurb.split('. ')[0] + '.' : ending.hint}
                </p>
                {!got && (
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 8.5,
                      letterSpacing: 1.5,
                      color: 'var(--muted-2)',
                      marginTop: 8,
                    }}
                  >
                    ~{ending.baselineRarity}% OF PLAYERS FIND IT
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <Link href="/20years/play" className="btn-primary" style={{ textDecoration: 'none' }}>
            <span>{found === 0 ? 'Live your first life →' : 'Hunt the next ending →'}</span>
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

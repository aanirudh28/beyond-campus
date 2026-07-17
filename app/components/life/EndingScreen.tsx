'use client'

import { useEffect, useRef, useState } from 'react'
import type { Ending, LifeReportItem, Stats, TrailPoint } from '@/lib/life/types'
import { ENDINGS } from '@/lib/life/content/endings'
import ShareCard from './ShareCard'
import GhostVersusCard from './GhostVersusCard'
import LifeTimeline from './LifeTimeline'
import { buzz } from './haptics'
import { chapterHue } from './chapterTheme'
import { trackLife } from '@/lib/life/track'
import type { GhostSummary } from '@/lib/life/ghosts'
import type { DiaryChapter } from '@/lib/life/diary'

export type GhostView = GhostSummary

export interface EndingResult {
  runId: string | null
  ending: Ending
  epilogue: string
  oneLiner: string
  rarity: number
  savingsPercentile?: number | null // vs completed lives with your profile
  stats: Stats
  report: LifeReportItem[]
  shareUrl: string | null
  trail?: TrailPoint[]
  ghosts?: GhostView[]
  diary?: DiaryChapter[]
  challengeUrl?: string | null
  discovered?: number // endings collected on this device, recorded at finale
  endingIsNew?: boolean
  headToHead?: {
    originalEnding: string
    originalEmoji: string
    originalSavings: number
    mySavings: number
    won: boolean
  }
  batchmate?: {
    name: string
    endingName: string
    emoji: string
    savings: number
    ahead: boolean
  }
}

const TONE_COLOR: Record<Ending['tone'], string> = {
  good: '#93BBFF',
  bad: '#FF8F8F',
  weird: '#FFC65C',
}

export default function EndingScreen({
  result,
  onReplay,
}: {
  result: EndingResult
  onReplay: () => void
}) {
  const { ending, epilogue, oneLiner, rarity, stats, report, shareUrl, runId, trail, ghosts, challengeUrl } = result
  const discovered = result.discovered ?? 0
  const isNew = result.endingIsNew ?? false
  // The versus card faces you against your most confronting ghost:
  // the disciplined you if it diverged, else the biggest-swing fork.
  const versusGhost =
    ghosts?.find((g) => g.kind === 'disciplined') ??
    ghosts?.slice().sort((a, b) => Math.abs(b.savingsDelta) - Math.abs(a.savingsDelta))[0] ??
    null
  const cardRef = useRef<HTMLDivElement>(null)
  const versusRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [claimed, setClaimed] = useState(runId === null) // offline runs show everything
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [chronicleOpen, setChronicleOpen] = useState(false)

  // The reveal wears the tone: aurora for earned endings, ember for warnings,
  // amber for the stumbled-into ones.
  const toneGlow = {
    good: 'rgba(79,124,255,0.28)',
    bad: 'rgba(255,107,107,0.22)',
    weird: 'rgba(255,198,92,0.2)',
  }[ending.tone]

  // The reveal moment gets one buzz in the hand, and the view events fire once.
  useEffect(() => {
    buzz(30)
    for (const ghost of ghosts ?? []) {
      trackLife('ghost_viewed', { endingId: ghost.endingId ?? ghost.endingName })
    }
    trackLife('report_viewed', { itemCount: report.length })
    if (discovered > 0) trackLife('collection_viewed', { discovered })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function renderCard(node: HTMLDivElement | null, filename: string, channel: string) {
    if (!node || downloading) return
    trackLife('share_clicked', { channel })
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#0B0B0F',
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      // html2canvas can fail on odd mobile browsers; the wa.me path still works
    }
    setDownloading(false)
  }

  const downloadCard = () => renderCard(cardRef.current, `my-20-years-${ending.id}.png`, 'image')
  const downloadVersus = () =>
    renderCard(versusRef.current, `my-20-years-versus-${ending.id}.png`, 'versus')

  function shareWhatsApp() {
    trackLife('share_clicked', { channel: 'whatsapp' })
    const msg = shareUrl
      ? `I just lived the next 20 years of my career in 20 minutes and ended up as *${ending.name}* ${ending.emoji} Only ${rarity}% of players get this ending. What will yours be? ${shareUrl}`
      : `I just lived the next 20 years of my career in 20 minutes and ended up as *${ending.name}* ${ending.emoji} Play yours: https://www.beyond-campus.in/20years`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function shareChallenge() {
    if (!challengeUrl) return
    trackLife('challenge_created')
    trackLife('share_clicked', { channel: 'challenge' })
    const msg = `I lived a whole 20-year career and got *${ending.name}* ${ending.emoji} Now live MY EXACT life: same cards, same twists, your choices. Beat my ending: ${challengeUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  async function copyLink() {
    if (!shareUrl) return
    trackLife('share_clicked', { channel: 'copy' })
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function claim() {
    if (!runId || claiming) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setClaimError('That email does not look right.')
      return
    }
    setClaiming(true)
    setClaimError('')
    try {
      const res = await fetch('/api/life/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId, email }),
      })
      if (!res.ok) throw new Error('claim failed')
      setClaimed(true)
    } catch {
      setClaimError('Could not save that. Try once more?')
    }
    setClaiming(false)
  }

  const btnGhost: React.CSSProperties = {
    padding: '13px 22px',
    borderRadius: 100,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'var(--fg)',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  }

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '48px 20px 80px',
        textAlign: 'center',
      }}
    >
      <div
        className="mono-label"
        style={{ marginBottom: 24, animation: 'lifeFadeUp 0.5s ease both' }}
      >
        THE LEDGER CLOSES · AGE 45 · 2050
      </div>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          animation: 'lifeChipPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          animationDelay: '0.2s',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -60,
            background: `radial-gradient(circle, ${toneGlow}, transparent 70%)`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', fontSize: 72, lineHeight: 1 }}>{ending.emoji}</div>
      </div>
      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(40px, 10vw, 60px)',
          letterSpacing: -1.5,
          lineHeight: 1.02,
          margin: '0 0 18px',
          background: 'var(--grad)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'lifeFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
          animationDelay: '0.4s',
        }}
      >
        {ending.name}
      </h1>
      <div
        style={{
          display: 'inline-block',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: 2,
          color: TONE_COLOR[ending.tone],
          border: `1px solid ${TONE_COLOR[ending.tone]}55`,
          borderRadius: 100,
          padding: '7px 16px',
          marginBottom: 32,
          animation: 'lifeFadeUp 0.5s ease both',
          animationDelay: '1s',
        }}
      >
        ONLY {rarity}% OF PLAYERS GET THIS ENDING
      </div>

      {discovered > 0 && (
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: 1.5,
            color: 'var(--muted-2)',
            marginTop: -22,
            marginBottom: 30,
            animation: 'lifeFadeUp 0.5s ease both',
            animationDelay: '1.25s',
          }}
        >
          {isNew && <span style={{ color: 'var(--blue-soft)' }}>NEW ENDING · </span>}
          <a href="/20years/collection" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            {discovered} OF {ENDINGS.length} DISCOVERED
          </a>
        </div>
      )}

      {result.headToHead && (
        <div
          className="bc-card"
          style={{
            padding: '22px 20px',
            marginBottom: 30,
            border: `1px solid ${result.headToHead.won ? 'rgba(122,183,255,0.45)' : 'rgba(255,182,92,0.45)'}`,
            animation: 'lifeFadeUp 0.6s ease both',
            animationDelay: '1.4s',
          }}
        >
          <div className="mono-label" style={{ marginBottom: 12 }}>
            ⚔ THE HEAD-TO-HEAD · YOU LIVED THEIR EXACT LIFE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 26 }}>{ending.emoji}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>You</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue-soft)' }}>
                ₹{result.headToHead.mySavings}L
              </div>
            </div>
            <div className="mono-label">VS</div>
            <div>
              <div style={{ fontSize: 26 }}>{result.headToHead.originalEmoji}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>The Original</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                ₹{result.headToHead.originalSavings}L · {result.headToHead.originalEnding}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.55 }}>
            {result.headToHead.won
              ? 'Same cards, same luck, better ledger. Their scoreboard already knows.'
              : 'The original keeps the crown, for now. Same life, one more attempt?'}
          </p>
        </div>
      )}

      {result.batchmate && (
        <div
          className="bc-card"
          style={{
            padding: '22px 20px',
            marginBottom: 30,
            border: '1px solid rgba(255,255,255,0.14)',
            animation: 'lifeFadeUp 0.6s ease both',
            animationDelay: '1.5s',
          }}
        >
          <div className="mono-label" style={{ marginBottom: 12 }}>
            🎓 {result.batchmate.name.toUpperCase()} FROM YOUR SECTION · SAME MARKET, DIFFERENT CHOICES
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 26 }}>{ending.emoji}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>You</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue-soft)' }}>
                ₹{Math.round(stats.savings)}L
              </div>
            </div>
            <div className="mono-label">VS</div>
            <div>
              <div style={{ fontSize: 26 }}>{result.batchmate.emoji}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{result.batchmate.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                ₹{result.batchmate.savings}L · {result.batchmate.endingName}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '14px 0 0', lineHeight: 1.55 }}>
            {result.batchmate.ahead
              ? `Twenty years of the same market, and your ledger finished ahead. ${result.batchmate.name} would never admit to checking. They checked.`
              : `${result.batchmate.name} finished ahead on money. The reunion will mention it once, politely, forever.`}
          </p>
        </div>
      )}

      <div
        style={{
          textAlign: 'left',
          marginBottom: 32,
          animation: 'lifeFadeUp 0.7s ease both',
          animationDelay: '1.5s',
        }}
      >
        {epilogue.split(/\n\n+/).map((para, i) => (
          <p
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.85)',
              margin: '0 0 14px',
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {trail && (
        <div style={{ animation: 'lifeFadeUp 0.7s ease both', animationDelay: '1.9s' }}>
          <LifeTimeline trail={trail} />
        </div>
      )}

      {/* ---- The Chronicle: the whole life, readable ---- */}
      {result.diary && result.diary.length > 0 && (
        <div style={{ marginBottom: 28, animation: 'lifeFadeUp 0.7s ease both', animationDelay: '2s' }}>
          <button
            style={{ ...{
              padding: '13px 22px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'var(--fg)',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }, width: '100%' }}
            onClick={() => setChronicleOpen((v) => !v)}
          >
            {chronicleOpen ? '📖 Close the chronicle' : '📖 Read your whole life back'}
          </button>
          {chronicleOpen && (
            <div className="bc-card" style={{ textAlign: 'left', padding: '22px 20px', marginTop: 10 }}>
              {result.diary.map((chapter) => {
                const hue = chapterHue(chapter.index)
                return (
                  <div key={chapter.index} style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 10,
                        letterSpacing: 2,
                        color: hue.accent,
                        marginBottom: 8,
                      }}
                    >
                      {chapter.title} · AGE {chapter.ageFrom}–{chapter.ageTo} · {chapter.yearFrom}–{chapter.yearTo}
                    </div>
                    {chapter.entries.map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          borderLeft: `2px solid ${entry.pivotal ? hue.accent : 'rgba(255,255,255,0.1)'}`,
                          padding: '2px 0 10px 12px',
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                          {entry.chose}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--serif)',
                            fontStyle: 'italic',
                            fontSize: 14,
                            lineHeight: 1.55,
                            color: 'var(--muted)',
                            marginTop: 3,
                          }}
                        >
                          {entry.outcome}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
              <p style={{ fontSize: 12.5, color: 'var(--muted-2)', margin: '4px 0 0', fontFamily: 'var(--mono)', letterSpacing: 1 }}>
                WRITTEN BY YOUR CHOICES · {result.diary.reduce((n, c) => n + c.entries.length, 0)} ENTRIES
              </p>
            </div>
          )}
        </div>
      )}

      <div
        className="bc-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          padding: '18px 12px',
          marginBottom: 28,
          animation: 'lifeFadeUp 0.6s ease both',
          animationDelay: '2.1s',
        }}
      >
        {[
          ['FINAL CTC', stats.salary > 0 ? `₹${stats.salary.toFixed(1)} LPA` : 'Off payroll'],
          ['NET WORTH', `${stats.savings < 0 ? '-' : ''}₹${Math.abs(stats.savings).toFixed(0)}L`],
          ['BURNOUT', stats.burnout >= 70 ? 'High' : stats.burnout >= 40 ? 'Managed' : 'Low'],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="mono-label" style={{ fontSize: 9.5, marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--fg)' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {typeof result.savingsPercentile === 'number' && (
        <div
          className="mono-label"
          style={{ marginTop: -18, marginBottom: 28, animation: 'lifeFadeUp 0.6s ease both', animationDelay: '2.2s' }}
        >
          A RICHER LEDGER THAN {result.savingsPercentile}% OF LIVES LIKE YOURS
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          marginBottom: 48,
          animation: 'lifeFadeUp 0.6s ease both',
          animationDelay: '2.3s',
        }}
      >
        <button className="btn-primary" style={{ padding: '13px 24px' }} onClick={shareWhatsApp}>
          <span>Share my ending</span>
        </button>
        {challengeUrl && (
          <button style={btnGhost} onClick={shareChallenge}>
            ⚔ Send a friend this exact life
          </button>
        )}
        <button style={btnGhost} onClick={downloadCard}>
          {downloading ? 'Rendering…' : 'Download my card'}
        </button>
        {shareUrl && (
          <button style={btnGhost} onClick={copyLink}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        )}
      </div>

      {/* ---- The roads not taken ---- */}
      {ghosts && ghosts.length > 0 && (
        <div style={{ textAlign: 'left', marginBottom: 44 }}>
          <div className="mono-label" style={{ marginBottom: 8 }}>
            THE ROADS NOT TAKEN
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, letterSpacing: -0.5, margin: '0 0 8px' }}>
            Your parallel lives<em style={{ color: 'var(--blue-soft)' }}>.</em>
          </h2>
          <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
            Same life, same luck, one choice flipped. This is what the simulation says was on the
            other side of the door.
          </p>
          {ghosts.map((ghost, i) => (
            <div
              key={i}
              className="bc-card"
              style={{
                padding: '20px 20px 18px',
                marginBottom: 12,
                borderColor: ghost.kind === 'disciplined' ? 'rgba(123,97,255,0.4)' : undefined,
              }}
            >
              {ghost.kind === 'disciplined' ? (
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)', margin: '0 0 10px' }}>
                  <span className="mono-label" style={{ color: '#b4a6ff', display: 'block', marginBottom: 6 }}>
                    THE DISCIPLINED YOU
                  </span>
                  Same seed, same luck, every single choice the long game. That version of you
                  ended as:
                </p>
              ) : (
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)', margin: '0 0 10px' }}>
                  {ghost.forkTitle && (
                    <span className="mono-label" style={{ color: 'var(--blue-soft)', display: 'block', marginBottom: 6 }}>
                      THE FORK · {ghost.forkTitle}
                    </span>
                  )}
                  {ghost.ageLine} <span style={{ color: 'rgba(255,255,255,0.85)' }}>“{ghost.takenLabel}”</span>
                  <br />
                  In the timeline where you chose{' '}
                  <span style={{ color: 'var(--blue-soft)' }}>“{ghost.otherLabel}”</span> instead:
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 24 }}>{ghost.emoji}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{ghost.endingName}</span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10.5,
                    letterSpacing: 1,
                    padding: '4px 10px',
                    borderRadius: 100,
                    border: `1px solid ${ghost.savingsDelta >= 0 ? 'rgba(122,183,255,0.35)' : 'rgba(255,107,107,0.35)'}`,
                    color: ghost.savingsDelta >= 0 ? 'var(--blue-soft)' : '#FF8F8F',
                  }}
                >
                  {ghost.savingsDelta >= 0 ? '+' : '-'}₹{Math.abs(ghost.savingsDelta).toFixed(0)}L NET WORTH
                </span>
              </div>
            </div>
          ))}
          {versusGhost && (
            <button style={{ ...btnGhost, width: '100%' }} onClick={downloadVersus}>
              {downloading ? 'Rendering…' : '⬇ Download the versus card: you against your ghost'}
            </button>
          )}
        </div>
      )}

      {/* ---- Life Report ---- */}
      <div style={{ textAlign: 'left' }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>
          THE LIFE REPORT
        </div>
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 28,
            letterSpacing: -0.5,
            margin: '0 0 8px',
          }}
        >
          Where your timeline turned<em style={{ color: 'var(--blue-soft)' }}>.</em>
        </h2>
        <p style={{ fontSize: 14.5, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.6 }}>
          The moments that decided this ending, and what to do about them now, at the age where
          they are still cheap to fix.
        </p>

        {(claimed ? report : report.slice(0, 1)).map((item, i) => (
          <div key={i} className="bc-card" style={{ padding: '20px 20px 18px', marginBottom: 12 }}>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 16.5,
                lineHeight: 1.5,
                color: 'var(--fg)',
                margin: '0 0 10px',
              }}
            >
              {item.moment}
            </p>
            <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--muted)', margin: '0 0 10px' }}>
              {item.lesson}
            </p>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.65,
                color: 'rgba(255,255,255,0.85)',
                margin: '0 0 14px',
              }}
            >
              {item.action}
            </p>
            <a
              href={item.cta.href}
              onClick={() => trackLife('report_cta_clicked', { href: item.cta.href })}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11.5,
                letterSpacing: 1.5,
                color: 'var(--blue-soft)',
                textDecoration: 'none',
              }}
            >
              {item.cta.label.toUpperCase()} →
            </a>
          </div>
        ))}

        {!claimed && (
          <div
            className="bc-card"
            style={{ padding: '24px 20px', marginBottom: 12, textAlign: 'center' }}
          >
            <p style={{ fontSize: 15, color: 'var(--fg)', fontWeight: 600, margin: '0 0 6px' }}>
              {report.length - 1} more turning points in your run
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 16px' }}>
              Drop your email and the full Life Report unlocks, free.
            </p>
            <div style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.email"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 100,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--fg)',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                className="btn-primary"
                style={{ padding: '12px 20px', fontSize: 14 }}
                onClick={claim}
                disabled={claiming}
              >
                <span>{claiming ? '…' : 'Unlock'}</span>
              </button>
            </div>
            {claimError && (
              <p style={{ fontSize: 12.5, color: '#FF8F8F', margin: '10px 0 0' }}>{claimError}</p>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={btnGhost} onClick={onReplay}>
          ↺ Live a different life
        </button>
        <a
          href="/resources/resume-roast"
          className="btn-primary"
          style={{ padding: '13px 24px', textDecoration: 'none' }}
        >
          <span>Now fix the real one →</span>
        </a>
      </div>

      <ShareCard ref={cardRef} ending={ending} rarity={rarity} stats={stats} oneLiner={oneLiner} />
      {versusGhost && <GhostVersusCard ref={versusRef} ending={ending} stats={stats} ghost={versusGhost} />}
    </div>
  )
}

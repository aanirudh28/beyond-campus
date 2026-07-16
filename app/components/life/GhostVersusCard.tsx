'use client'

import { forwardRef } from 'react'
import type { Ending, Stats } from '@/lib/life/types'
import type { GhostSummary } from '@/lib/life/ghosts'

// Hidden 1080×1350 node for the me-vs-ghost share card (docs 10 §4, 13 #19).
// html2canvas-safe styles only: no backdrop-filter, no background-clip text.

const GhostVersusCard = forwardRef<
  HTMLDivElement,
  { ending: Ending; stats: Stats; ghost: GhostSummary }
>(function GhostVersusCard({ ending, stats, ghost }, ref) {
  const ghostWon = ghost.savingsDelta >= 0
  const forkLine =
    ghost.kind === 'disciplined'
      ? 'Same seed. Same luck. Every choice the long game.'
      : ghost.forkTitle
        ? `At “${ghost.forkTitle}”, they chose: ${ghost.otherLabel}`
        : `One choice flipped: ${ghost.otherLabel}`

  const block = (
    label: string,
    emoji: string,
    name: string,
    money: string,
    dim: boolean,
  ) => (
    <div style={{ textAlign: 'center', opacity: dim ? 0.92 : 1 }}>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 22,
          letterSpacing: 5,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 22,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 110, lineHeight: 1, marginBottom: 20 }}>{emoji}</div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 62,
          lineHeight: 1.05,
          letterSpacing: -1.5,
          color: '#ffffff',
          marginBottom: 16,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 26,
          letterSpacing: 2,
          color: '#93BBFF',
        }}
      >
        {money}
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          background: '#0B0B0F',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '70px 90px',
          fontFamily: 'var(--sans)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -220,
            left: '50%',
            marginLeft: -400,
            width: 800,
            height: 600,
            background:
              'radial-gradient(ellipse at center, rgba(79,124,255,0.2), rgba(123,97,255,0.1) 50%, transparent 75%)',
          }}
        />
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 22,
            letterSpacing: 8,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          20 YEARS · THE MULTIVERSE VERDICT
        </div>

        {block(
          'THE LIFE I LIVED',
          ending.emoji,
          ending.name,
          `NET WORTH · ${stats.savings < 0 ? '-' : ''}₹${Math.abs(stats.savings).toFixed(0)} LAKHS`,
          false,
        )}

        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(79,124,255,0.6), transparent)',
              marginBottom: 24,
            }}
          />
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 30,
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.8)',
              maxWidth: 820,
              margin: '0 auto 24px',
            }}
          >
            {forkLine}
          </div>
          <div
            style={{
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(123,97,255,0.6), transparent)',
            }}
          />
        </div>

        {block(
          ghost.kind === 'disciplined'
            ? 'THE DISCIPLINED ME'
            : ghostWon
              ? 'THE LIFE I MISSED'
              : 'THE LIFE I DODGED',
          ghost.emoji,
          ghost.endingName,
          `${ghostWon ? '+' : '-'}₹${Math.abs(ghost.savingsDelta)} LAKHS ${ghostWon ? 'RICHER' : 'POORER'}`,
          true,
        )}

        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 24,
            letterSpacing: 4,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          MEET YOUR GHOSTS · beyond-campus.in/20years
        </div>
      </div>
    </div>
  )
})

export default GhostVersusCard

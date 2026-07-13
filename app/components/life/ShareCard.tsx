'use client'

import { forwardRef } from 'react'
import type { Ending, Stats } from '@/lib/life/types'

// Hidden 1080×1350 node rendered to PNG via html2canvas (roast share pattern).
// html2canvas-safe styles only: no backdrop-filter, no background-clip text.

const ShareCard = forwardRef<
  HTMLDivElement,
  { ending: Ending; rarity: number; stats: Stats; oneLiner: string }
>(function ShareCard({ ending, rarity, stats, oneLiner }, ref) {
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
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 90px',
          fontFamily: 'var(--sans)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            left: '50%',
            marginLeft: -400,
            width: 800,
            height: 600,
            background:
              'radial-gradient(ellipse at center, rgba(79,124,255,0.22), rgba(123,97,255,0.10) 50%, transparent 75%)',
          }}
        />
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 22,
            letterSpacing: 8,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 70,
          }}
        >
          20 YEARS IN 60 MINUTES
        </div>
        <div style={{ fontSize: 150, lineHeight: 1, marginBottom: 40 }}>{ending.emoji}</div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 92,
            lineHeight: 1.05,
            letterSpacing: -2,
            color: '#ffffff',
            marginBottom: 28,
          }}
        >
          {ending.name}
        </div>
        <div
          style={{
            width: 140,
            height: 5,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #4F7CFF, #7B61FF)',
            marginBottom: 40,
          }}
        />
        <div
          style={{
            display: 'inline-block',
            fontFamily: 'var(--mono)',
            fontSize: 24,
            letterSpacing: 3,
            color: '#93BBFF',
            border: '2px solid rgba(79,124,255,0.5)',
            borderRadius: 100,
            padding: '14px 36px',
            marginBottom: 60,
          }}
        >
          ONLY {rarity}% OF PLAYERS GET THIS ENDING
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 26,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 2,
            marginBottom: 70,
          }}
        >
          FINAL CTC · {stats.salary > 0 ? `₹${stats.salary.toFixed(1)} LPA` : 'OFF PAYROLL'}
          <br />
          NET WORTH · {stats.savings < 0 ? '-' : ''}₹{Math.abs(stats.savings).toFixed(0)} LAKHS
          <br />
          BURNOUT · {stats.burnout >= 70 ? 'HIGH' : stats.burnout >= 40 ? 'MANAGED' : 'LOW'}
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 34,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 800,
            marginBottom: 80,
          }}
        >
          “{oneLiner}”
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 24,
            letterSpacing: 4,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          PLAY YOUR 20 YEARS · beyond-campus.in/20years
        </div>
      </div>
    </div>
  )
})

export default ShareCard

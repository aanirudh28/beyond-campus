'use client'

import type { Stats } from '@/lib/life/types'

const BARS: { key: keyof Stats; label: string }[] = [
  { key: 'skills', label: 'SKILL' },
  { key: 'network', label: 'NET' },
  { key: 'reputation', label: 'REP' },
  { key: 'burnout', label: 'BURN' },
  { key: 'family', label: 'FAM' },
]

export default function StatBar({
  stats,
  age,
  year,
}: {
  stats: Stats
  age: number
  year: number
}) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(11,11,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hair)',
        padding: '10px 16px 12px',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: 1.5,
        }}
      >
        <span style={{ color: 'var(--fg)' }}>
          AGE {age} <span style={{ color: 'var(--muted-2)' }}>· {year}</span>
        </span>
        <span style={{ color: 'var(--blue-soft)' }}>
          {stats.salary > 0 ? `₹${stats.salary.toFixed(1)} LPA` : 'NO INCOME'}
          <span style={{ color: 'var(--muted-2)' }}>
            {' '}
            · {stats.savings < 0 ? '-' : ''}₹{Math.abs(stats.savings).toFixed(1)}L SAVED
          </span>
        </span>
      </div>
      <div
        style={{
          maxWidth: 560,
          margin: '8px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 10,
        }}
      >
        {BARS.map(({ key, label }) => {
          const v = stats[key]
          const isBurn = key === 'burnout'
          const color = isBurn
            ? v >= 70
              ? '#FF6B6B'
              : v >= 45
                ? '#FFB65C'
                : 'rgba(255,255,255,0.45)'
            : 'var(--blue)'
          return (
            <div key={key}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: 1.5,
                  color: 'var(--muted-2)',
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${v}%`,
                    borderRadius: 2,
                    background: isBurn ? color : 'var(--grad)',
                    transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

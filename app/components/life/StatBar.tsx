'use client'

import { useEffect, useRef, useState } from 'react'
import type { Stats } from '@/lib/life/types'

const BARS: { key: keyof Stats; label: string }[] = [
  { key: 'skills', label: 'SKILL' },
  { key: 'network', label: 'NET' },
  { key: 'reputation', label: 'REP' },
  { key: 'burnout', label: 'BURN' },
  { key: 'family', label: 'FAM' },
]

// Tween a number toward its target so salary/savings feel like they move,
// not snap. rAF-based; settles exactly on the target.
function useCountUp(target: number, ms = 700) {
  const [shown, setShown] = useState(target)
  const latest = useRef(target)
  useEffect(() => {
    latest.current = shown
  }, [shown])
  useEffect(() => {
    const from = latest.current
    if (from === target) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(p >= 1 ? target : from + (target - from) * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return shown
}

interface FloatingDelta {
  key: string
  text: string
  good: boolean
  stamp: number
}

export default function StatBar({
  stats,
  age,
  year,
  facts = [],
  onOpen,
}: {
  stats: Stats
  age: number
  year: number
  facts?: string[]
  onOpen?: () => void
}) {
  const [seen, setSeen] = useState<Stats>(stats)
  const [floats, setFloats] = useState<Record<string, FloatingDelta>>({})
  const salary = useCountUp(stats.salary)
  const savings = useCountUp(stats.savings)

  // Derive the floating "+8 / −6" tags when stats change — the sanctioned
  // adjust-state-during-render pattern, no effect needed.
  if (seen !== stats) {
    setSeen(stats)
    const next: Record<string, FloatingDelta> = {}
    for (const { key } of BARS) {
      const d = Math.round(stats[key] - seen[key])
      if (d === 0) continue
      next[key] = {
        key,
        text: `${d > 0 ? '+' : ''}${d}`,
        good: key === 'burnout' ? d < 0 : d > 0,
        stamp: seen[key],
      }
    }
    if (Object.keys(next).length) setFloats((f) => ({ ...f, ...next }))
  }

  // Tags clear shortly after the last change lands.
  useEffect(() => {
    if (!Object.keys(floats).length) return
    const t = setTimeout(() => setFloats({}), 1400)
    return () => clearTimeout(t)
  }, [floats])

  return (
    <div
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      aria-label={onOpen ? 'Open your life so far' : undefined}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(11,11,15,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--hair)',
        padding: '10px 16px 12px',
        cursor: onOpen ? 'pointer' : undefined,
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
          {salary > 0.05 ? `₹${salary.toFixed(1)} LPA` : 'NO INCOME'}
          <span style={{ color: 'var(--muted-2)' }}>
            {' '}
            · {savings < 0 ? '-' : ''}₹{Math.abs(savings).toFixed(1)}L SAVED
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
          const float = floats[key]
          return (
            <div key={key} style={{ position: 'relative' }}>
              {float && (
                <span
                  key={float.stamp}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: 0,
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: float.good ? 'var(--blue-soft)' : '#FF8F8F',
                    animation: 'lifeDeltaFloat 1.3s ease-out forwards',
                    pointerEvents: 'none',
                  }}
                >
                  {float.text}
                </span>
              )}
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
      {facts.length > 0 && (
        <div
          style={{
            maxWidth: 560,
            margin: '8px auto 0',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--mono)',
            fontSize: 9.5,
            letterSpacing: 1.2,
            color: 'var(--muted-2)',
          }}
        >
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {facts.slice(0, 4).join(' · ').toUpperCase()}
          </span>
          {onOpen && <span style={{ color: 'var(--blue-soft)', flexShrink: 0 }}>· YOUR LIFE ▾</span>}
        </div>
      )}
    </div>
  )
}

'use client'

import type { TrailPoint } from '@/lib/life/types'

// The Life Graph: two stacked single-series panels (never dual-axis).
// Palette validated against #0B0B0F: net worth #4F7CFF, salary #C97F16.

const W = 340
const H = 96
const PAD = { top: 12, right: 44, bottom: 18, left: 8 }

function Panel({
  label,
  unit,
  color,
  points,
  format,
}: {
  label: string
  unit: string
  color: string
  points: { x: number; v: number }[]
  format: (v: number) => string
}) {
  const xs = points.map((p) => p.x)
  const vs = points.map((p) => p.v)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const vMin = Math.min(0, ...vs)
  const vMax = Math.max(...vs, 1)
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const px = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW
  const py = (v: number) => PAD.top + (1 - (v - vMin) / (vMax - vMin)) * plotH

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x).toFixed(1)},${py(p.v).toFixed(1)}`).join(' ')
  const area = `${path} L${px(xMax).toFixed(1)},${py(vMin).toFixed(1)} L${px(xMin).toFixed(1)},${py(vMin).toFixed(1)} Z`
  const last = points[points.length - 1]
  const gid = `lifegrad-${label.replace(/\s/g, '')}`

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--mono)',
          fontSize: 9.5,
          letterSpacing: 1.5,
          color: 'var(--muted-2)',
          marginBottom: 2,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' }} />
        {label} <span style={{ opacity: 0.7 }}>· {unit}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={`${label} over 20 years, ending at ${format(last.v)}`}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + plotH * t}
            y2={PAD.top + plotH * t}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <g key={p.x}>
            <circle cx={px(p.x)} cy={py(p.v)} r="10" fill="transparent">
              <title>{`Age ${p.x}: ${format(p.v)}`}</title>
            </circle>
            <circle cx={px(p.x)} cy={py(p.v)} r="3" fill={color} stroke="#0B0B0F" strokeWidth="2" />
          </g>
        ))}
        <text
          x={px(last.x) + 7}
          y={py(last.v) + 3.5}
          fill="rgba(255,255,255,0.85)"
          fontSize="10.5"
          fontFamily="var(--mono)"
        >
          {format(last.v)}
        </text>
        {points.map((p, i) =>
          i === 0 || i === points.length - 1 || i === 3 ? (
            <text
              key={`t${p.x}`}
              x={px(p.x)}
              y={H - 4}
              fill="rgba(255,255,255,0.35)"
              fontSize="9"
              fontFamily="var(--mono)"
              textAnchor="middle"
            >
              {p.x}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  )
}

export default function LifeTimeline({ trail }: { trail: TrailPoint[] }) {
  if (!trail || trail.length < 3) return null
  return (
    <div className="bc-card" style={{ padding: '18px 16px 10px', marginBottom: 28, textAlign: 'left' }}>
      <div className="mono-label" style={{ marginBottom: 12 }}>
        THE LIFE GRAPH · AGE 21 → 36
      </div>
      <Panel
        label="NET WORTH"
        unit="₹ LAKHS"
        color="#4F7CFF"
        points={trail.map((t) => ({ x: t.age, v: t.savings }))}
        format={(v) => `₹${v.toFixed(0)}L`}
      />
      <Panel
        label="SALARY"
        unit="₹ LPA"
        color="#C97F16"
        points={trail.map((t) => ({ x: t.age, v: t.salary }))}
        format={(v) => (v > 0 ? `₹${v.toFixed(1)}` : '₹0')}
      />
    </div>
  )
}

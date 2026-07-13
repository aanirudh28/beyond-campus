'use client'

import { useState } from 'react'
import type { Card, CardOption } from '@/lib/life/types'

const DELTA_LABELS: Record<string, string> = {
  skills: 'Skill',
  network: 'Network',
  reputation: 'Reputation',
  burnout: 'Burnout',
  family: 'Family',
  savings: 'Savings',
}

function deltaChips(option: CardOption) {
  const chips: { text: string; good: boolean }[] = []
  const fx = option.effects
  if (fx.salary !== undefined) {
    if (typeof fx.salary === 'object') {
      const pct = Math.round((fx.salary.mult - 1) * 100)
      chips.push({ text: `Salary ${pct >= 0 ? '+' : ''}${pct}%`, good: pct >= 0 })
    } else if (fx.salary === 0) {
      chips.push({ text: 'Salary → ₹0', good: false })
    } else {
      chips.push({ text: `Salary +₹${fx.salary} LPA`, good: true })
    }
  }
  for (const [k, label] of Object.entries(DELTA_LABELS)) {
    const v = fx[k as keyof typeof fx]
    if (typeof v !== 'number' || v === 0) continue
    const good = k === 'burnout' ? v < 0 : v > 0
    const text =
      k === 'savings'
        ? `Savings ${v > 0 ? '+' : '-'}₹${Math.abs(v)}L`
        : `${label} ${v > 0 ? '+' : ''}${v}`
    chips.push({ text, good })
  }
  return chips
}

export default function DecisionCard({
  card,
  narration,
  age,
  year,
  onResolved,
}: {
  card: Card
  narration?: string
  age: number
  year: number
  onResolved: (option: CardOption) => void
}) {
  const [picked, setPicked] = useState<CardOption | null>(null)

  return (
    <div
      className="bc-card"
      style={{
        maxWidth: 560,
        margin: '0 auto',
        padding: '28px 24px 24px',
        animation: 'lifeCardIn 0.5s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <span className="mono-label" style={{ color: 'var(--blue-soft)' }}>
          {card.title}
        </span>
        <span className="mono-label">
          {card.kind === 'event' ? 'EVENT · ' : ''}AGE {age} · {year}
        </span>
      </div>

      <p
        style={{
          fontSize: 16.5,
          lineHeight: 1.65,
          color: 'rgba(255,255,255,0.88)',
          margin: '0 0 24px',
        }}
      >
        {narration || card.base}
      </p>

      {!picked ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {card.options.map((option) => (
            <button
              key={option.id}
              onClick={() => setPicked(option)}
              style={{
                textAlign: 'left',
                padding: '15px 18px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.03)',
                color: 'var(--fg)',
                fontSize: 15,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(79,124,255,0.6)'
                e.currentTarget.style.background = 'rgba(79,124,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ animation: 'lifeCardIn 0.4s ease' }}>
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              border: '1px solid rgba(79,124,255,0.3)',
              background: 'rgba(79,124,255,0.06)',
              marginBottom: 16,
            }}
          >
            <div className="mono-label" style={{ marginBottom: 8 }}>
              YOU CHOSE · {picked.label}
            </div>
            <p
              style={{
                fontSize: 15.5,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.82)',
                margin: 0,
                fontStyle: 'italic',
                fontFamily: 'var(--serif)',
              }}
            >
              {picked.outcome}
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
            {deltaChips(picked).map((chip) => (
              <span
                key={chip.text}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10.5,
                  letterSpacing: 1,
                  padding: '4px 10px',
                  borderRadius: 100,
                  border: `1px solid ${chip.good ? 'rgba(122,183,255,0.35)' : 'rgba(255,107,107,0.35)'}`,
                  color: chip.good ? 'var(--blue-soft)' : '#FF8F8F',
                }}
              >
                {chip.text}
              </span>
            ))}
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px 24px' }}
            onClick={() => onResolved(picked)}
          >
            <span>Time moves on</span>
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { Application, todayStr, addDays } from './types'
import { Icon } from './ui'

// Streak = consecutive days (ending today or yesterday) with at least one
// application added or moved to applied. Computed from data, never stored.
export function computeStreak(applications: Application[]): number {
  const activeDays = new Set<string>()
  for (const app of applications) {
    activeDays.add(app.created_at.slice(0, 10))
    if (app.applied_at) activeDays.add(app.applied_at)
  }
  const today = todayStr()
  let cursor = activeDays.has(today) ? today : addDays(today, -1)
  if (!activeDays.has(cursor)) return 0
  let streak = 0
  while (activeDays.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export default function StreakWidget({ applications }: { applications: Application[] }) {
  const streak = computeStreak(applications)
  const active = streak > 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: active
        ? 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))',
      border: `1px solid ${active ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 16, padding: '12px 18px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 38, height: 38, borderRadius: 12,
        background: active ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(249,115,22,0.15))' : 'rgba(255,255,255,0.05)',
        color: active ? '#fbbf24' : 'rgba(255,255,255,0.25)',
        filter: active ? 'drop-shadow(0 0 8px rgba(245,158,11,0.45))' : 'none',
      }}>
        <Icon name="flame" size={20} strokeWidth={1.8} />
      </div>
      <div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 19, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{streak}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>day streak</div>
      </div>
    </div>
  )
}

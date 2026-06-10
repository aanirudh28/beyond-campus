'use client'

import { Application, todayStr, addDays } from './types'

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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 18px' }}>
      <span style={{ fontSize: 24, filter: active ? 'none' : 'grayscale(1) opacity(0.4)' }}>🔥</span>
      <div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{streak}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, marginTop: 3 }}>day streak</div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Application, todayStr } from './types'

function getMonday(): string {
  const d = new Date()
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function appliedThisWeek(applications: Application[]): number {
  const monday = getMonday()
  const today = todayStr()
  return applications.filter(a => a.applied_at && a.applied_at >= monday && a.applied_at <= today).length
}

export default function WeeklyGoalRing({ applications, goal }: { applications: Application[]; goal: number }) {
  const done = appliedThisWeek(applications)
  const pct = Math.min(1, goal > 0 ? done / goal : 0)
  const hit = done >= goal && goal > 0

  const r = 22
  const circ = 2 * Math.PI * r

  // confetti only on the transition into "goal hit", once per week per browser
  const [burst, setBurst] = useState(false)
  const prevHit = useRef(false)
  useEffect(() => {
    if (hit && !prevHit.current) {
      const key = `bc_goal_celebrated_${getMonday()}`
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1')
        const start = setTimeout(() => setBurst(true), 0)
        const stop = setTimeout(() => setBurst(false), 2200)
        prevHit.current = true
        return () => { clearTimeout(start); clearTimeout(stop) }
      }
    }
    prevHit.current = hit
  }, [hit])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: `1px solid ${hit ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 16, padding: '10px 18px', position: 'relative', overflow: 'visible' }}>
      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(70px) rotate(280deg); opacity: 0; } }
        @keyframes ringFill { from { stroke-dashoffset: ${circ}; } }
      `}</style>
      <svg width="54" height="54" viewBox="0 0 54 54">
        <circle cx="27" cy="27" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="27" cy="27" r={r} fill="none"
          stroke={hit ? '#10b981' : 'url(#goalGrad)'}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 27 27)"
          style={{ animation: 'ringFill 0.8s ease-out', transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <defs>
          <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7CFF" />
            <stop offset="100%" stopColor="#7B61FF" />
          </linearGradient>
        </defs>
        <text x="27" y="31" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="inherit">
          {done}/{goal}
        </text>
      </svg>
      <div>
        <div style={{ color: 'white', fontWeight: 700, fontSize: 13.5 }}>{hit ? 'Goal smashed! 🎉' : 'Weekly goal'}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, marginTop: 2 }}>
          {hit ? 'You\'re outworking everyone' : `${goal - done} more application${goal - done === 1 ? '' : 's'} this week`}
        </div>
      </div>

      {burst && (
        <div style={{ position: 'absolute', top: 0, left: '50%', pointerEvents: 'none' }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: (i - 7) * 9,
                top: -6,
                width: 7,
                height: 7,
                borderRadius: i % 2 ? '50%' : 2,
                background: ['#4F7CFF', '#7B61FF', '#10b981', '#f59e0b', '#00D2FF'][i % 5],
                animation: `confettiFall ${0.9 + (i % 5) * 0.25}s ease-in forwards`,
                animationDelay: `${(i % 4) * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

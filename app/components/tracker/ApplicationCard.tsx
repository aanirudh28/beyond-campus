'use client'

import { useState } from 'react'
import { Application, AppStatus, STATUSES, statusMeta, sourceLabel, todayStr, daysBetween } from './types'

export default function ApplicationCard({
  app,
  onOpen,
  onMove,
  onDragStart,
}: {
  app: Application
  onOpen: (app: Application) => void
  onMove: (app: Application, status: AppStatus) => void
  onDragStart: (e: React.DragEvent, app: Application) => void
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const meta = statusMeta(app.status)
  const today = todayStr()
  const followUpDue = app.follow_up_date && app.follow_up_date <= today && !['offer', 'rejected'].includes(app.status)
  const daysOverdue = followUpDue ? daysBetween(app.follow_up_date!, today) : 0

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, app)}
      onClick={() => onOpen(app)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${followUpDue ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 14,
        padding: '12px 14px',
        cursor: 'grab',
        position: 'relative',
        transition: 'transform 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); setShowMoveMenu(v => !v) }}
          title="Move to..."
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 12, padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}
        >
          ⇢
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 100 }}>
          {sourceLabel(app.source)}
        </span>
        {followUpDue && (
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.12)', padding: '3px 8px', borderRadius: 100 }}>
            ⏰ Follow up{daysOverdue > 0 ? ` · ${daysOverdue}d late` : ' today'}
          </span>
        )}
        {app.status === 'applied' && app.applied_at && !followUpDue && (
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>
            {daysBetween(app.applied_at, today)}d ago
          </span>
        )}
      </div>

      {showMoveMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'absolute', top: 36, right: 8, zIndex: 30, background: '#1a2236', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 6, boxShadow: '0 12px 32px rgba(0,0,0,0.5)', minWidth: 150 }}
        >
          {STATUSES.filter(s => s.key !== app.status).map(s => (
            <button
              key={s.key}
              onClick={() => { setShowMoveMenu(false); onMove(app, s.key) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 8, color: 'white', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

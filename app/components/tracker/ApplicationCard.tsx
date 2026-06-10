'use client'

import { useState } from 'react'
import { Application, AppStatus, STATUSES, statusMeta, sourceLabel, todayStr, daysBetween } from './types'
import { CompanyLogo, Icon } from './ui'

export default function ApplicationCard({
  app,
  index = 0,
  onOpen,
  onMove,
  onDragStart,
}: {
  app: Application
  index?: number
  onOpen: (app: Application) => void
  onMove: (app: Application, status: AppStatus) => void
  onDragStart: (e: React.DragEvent, app: Application) => void
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [hover, setHover] = useState(false)
  const meta = statusMeta(app.status)
  const today = todayStr()
  const followUpDue = app.follow_up_date && app.follow_up_date <= today && !['offer', 'rejected'].includes(app.status)
  const daysOverdue = followUpDue ? daysBetween(app.follow_up_date!, today) : 0
  const daysInStage = daysBetween(app.status_changed_at.slice(0, 10), today)

  return (
    <div
      draggable
      onDragStart={e => {
        onDragStart(e, app)
        const el = e.currentTarget as HTMLDivElement
        requestAnimationFrame(() => { el.style.opacity = '0.35'; el.style.transform = 'scale(0.98)' })
      }}
      onDragEnd={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.opacity = '1'
        el.style.transform = 'none'
      }}
      onClick={() => onOpen(app)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setShowMoveMenu(false) }}
      style={{
        background: hover
          ? 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.04))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))',
        border: `1px solid ${followUpDue ? 'rgba(245,158,11,0.45)' : hover ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 15,
        padding: '13px 14px',
        cursor: 'grab',
        position: 'relative',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover
          ? `0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px ${meta.color}26, inset 0 1px 0 rgba(255,255,255,0.07)`
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        transition: 'transform 0.18s ease, border-color 0.18s, box-shadow 0.18s, background 0.18s',
        animation: 'cardIn 0.35s ease both',
        animationDelay: `${Math.min(index, 8) * 45}ms`,
      }}
    >
      {/* status accent rail */}
      <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: 100, background: meta.color, opacity: 0.85 }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, paddingLeft: 5 }}>
        <CompanyLogo company={app.company} jobUrl={app.job_url} size={34} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); setShowMoveMenu(v => !v) }}
          title="Move to..."
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: showMoveMenu ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.55)',
            width: 26, height: 26, cursor: 'pointer', flexShrink: 0,
            opacity: hover || showMoveMenu ? 1 : 0,
            transition: 'opacity 0.15s, background 0.15s',
          }}
        >
          <Icon name="arrowRight" size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 11, flexWrap: 'wrap', alignItems: 'center', paddingLeft: 5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: 100 }}>
          {sourceLabel(app.source)}
        </span>
        {followUpDue && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: '#fbbf24', background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(245,158,11,0.25)', padding: '3px 9px', borderRadius: 100 }}>
            <Icon name="clock" size={11} strokeWidth={2.5} />
            {daysOverdue > 0 ? `${daysOverdue}d late` : 'Follow up today'}
          </span>
        )}
        {app.salary_range && (
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#6ee7b7', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.18)', padding: '3px 9px', borderRadius: 100 }}>
            {app.salary_range}
          </span>
        )}
        {!followUpDue && daysInStage >= 1 && !['offer', 'rejected'].includes(app.status) && (
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 'auto' }}>
            {daysInStage}d here
          </span>
        )}
      </div>

      {showMoveMenu && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', top: 40, right: 10, zIndex: 30,
            background: '#161d30', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 13,
            padding: 5, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', minWidth: 160,
            animation: 'menuIn 0.14s ease both',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '6px 10px 4px' }}>MOVE TO</div>
          {STATUSES.filter(s => s.key !== app.status).map(s => (
            <button
              key={s.key}
              onClick={() => { setShowMoveMenu(false); onMove(app, s.key) }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', background: 'none', border: 'none', borderRadius: 9, color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <span style={{ color: s.color, display: 'flex' }}><Icon name={s.icon} size={14} /></span>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

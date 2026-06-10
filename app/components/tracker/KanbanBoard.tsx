'use client'

import { useState } from 'react'
import { Application, AppStatus, STATUSES } from './types'
import ApplicationCard from './ApplicationCard'
import { Icon } from './ui'

export default function KanbanBoard({
  applications,
  filter = '',
  onOpen,
  onMove,
  onQuickAdd,
}: {
  applications: Application[]
  filter?: string
  onOpen: (app: Application) => void
  onMove: (app: Application, status: AppStatus) => void
  onQuickAdd: (status: AppStatus) => void
}) {
  const [dragOverCol, setDragOverCol] = useState<AppStatus | null>(null)
  const [rejectedOpen, setRejectedOpen] = useState(false)

  const q = filter.trim().toLowerCase()
  const visible = q
    ? applications.filter(a => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
    : applications

  const byStatus = (status: AppStatus) =>
    visible.filter(a => a.status === status).sort((a, b) => a.sort_order - b.sort_order)

  const handleDragStart = (e: React.DragEvent, app: Application) => {
    e.dataTransfer.setData('text/plain', app.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, status: AppStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    const id = e.dataTransfer.getData('text/plain')
    const app = applications.find(a => a.id === id)
    if (app && app.status !== status) onMove(app, status)
  }

  const mainColumns = STATUSES.filter(s => s.key !== 'rejected')
  const rejected = byStatus('rejected')

  return (
    <div>
      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes menuIn { from { opacity: 0; transform: translateY(-4px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes dropPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .bc-board { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 16px; align-items: flex-start; scroll-snap-type: x proximity; }
        .bc-board > div { scroll-snap-align: start; }
      `}</style>

      <div className="bc-board">
        {mainColumns.map(col => {
          const cards = byStatus(col.key)
          const isOver = dragOverCol === col.key
          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.key)}
              style={{
                flex: '0 0 256px',
                minWidth: 256,
                background: isOver
                  ? `linear-gradient(180deg, ${col.color}14, ${col.color}08)`
                  : 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.012))',
                border: `1px solid ${isOver ? `${col.color}59` : 'rgba(255,255,255,0.07)'}`,
                borderTop: `2px solid ${isOver ? col.color : `${col.color}40`}`,
                borderRadius: 18,
                padding: 12,
                transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
                boxShadow: isOver ? `0 0 0 1px ${col.color}33, 0 8px 30px rgba(0,0,0,0.3)` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block', boxShadow: `0 0 10px ${col.color}b3` }} />
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: 0.2 }}>{col.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 100, fontVariantNumeric: 'tabular-nums' }}>{cards.length}</span>
                </div>
                <button
                  onClick={() => onQuickAdd(col.key)}
                  title={`Add to ${col.label}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', width: 24, height: 24, cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}
                  onMouseEnter={e => { const b = e.currentTarget; b.style.background = `${col.color}33`; b.style.color = 'white' }}
                  onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'rgba(255,255,255,0.06)'; b.style.color = 'rgba(255,255,255,0.5)' }}
                >
                  <Icon name="plus" size={13} strokeWidth={2.5} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 70 }}>
                {cards.length === 0 && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    color: isOver ? col.color : 'rgba(255,255,255,0.2)', fontSize: 12.5, textAlign: 'center',
                    padding: '22px 8px', border: `1px dashed ${isOver ? `${col.color}66` : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 13, transition: 'border-color 0.18s, color 0.18s',
                    animation: isOver ? 'dropPulse 1s ease infinite' : 'none',
                  }}>
                    <span style={{ opacity: 0.7 }}><Icon name={col.icon} size={17} /></span>
                    {isOver ? 'Drop it here' : q ? 'No matches' : col.key === 'saved' ? 'Save jobs you find here' : 'Drag cards here'}
                  </div>
                )}
                {cards.map((app, i) => (
                  <ApplicationCard key={app.id} app={app} index={i} onOpen={onOpen} onMove={onMove} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Rejected lane — collapsed by default, no shame in the archive */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOverCol('rejected') }}
        onDragLeave={() => setDragOverCol(null)}
        onDrop={e => handleDrop(e, 'rejected')}
        style={{
          marginTop: 6,
          background: dragOverCol === 'rejected' ? 'rgba(239,68,68,0.07)' : 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.012))',
          border: `1px solid ${dragOverCol === 'rejected' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 16,
          padding: '10px 14px',
          transition: 'background 0.18s, border-color 0.18s',
        }}
      >
        <button
          onClick={() => setRejectedOpen(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', padding: 4 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }} />
          Rejected
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 100, fontVariantNumeric: 'tabular-nums' }}>{rejected.length}</span>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            {rejectedOpen ? 'collapse' : 'expand'}
            <Icon name={rejectedOpen ? 'chevronUp' : 'chevronDown'} size={13} />
          </span>
        </button>
        {rejectedOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(236px, 1fr))', gap: 10, marginTop: 10 }}>
            {rejected.length === 0 && <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12.5, padding: 8 }}>Nothing here. Keep it that way 😤</div>}
            {rejected.map((app, i) => (
              <ApplicationCard key={app.id} app={app} index={i} onOpen={onOpen} onMove={onMove} onDragStart={handleDragStart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

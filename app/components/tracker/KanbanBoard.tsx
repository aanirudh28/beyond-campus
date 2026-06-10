'use client'

import { useState } from 'react'
import { Application, AppStatus, STATUSES } from './types'
import ApplicationCard from './ApplicationCard'

export default function KanbanBoard({
  applications,
  onOpen,
  onMove,
  onQuickAdd,
}: {
  applications: Application[]
  onOpen: (app: Application) => void
  onMove: (app: Application, status: AppStatus) => void
  onQuickAdd: (status: AppStatus) => void
}) {
  const [dragOverCol, setDragOverCol] = useState<AppStatus | null>(null)
  const [rejectedOpen, setRejectedOpen] = useState(false)

  const byStatus = (status: AppStatus) =>
    applications.filter(a => a.status === status).sort((a, b) => a.sort_order - b.sort_order)

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
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        {mainColumns.map(col => {
          const cards = byStatus(col.key)
          return (
            <div
              key={col.key}
              onDragOver={e => { e.preventDefault(); setDragOverCol(col.key) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={e => handleDrop(e, col.key)}
              style={{
                flex: '0 0 250px',
                minWidth: 250,
                background: dragOverCol === col.key ? 'rgba(79,124,255,0.07)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${dragOverCol === col.key ? 'rgba(79,124,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 18,
                padding: 12,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block' }} />
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}>{col.label}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600 }}>{cards.length}</span>
                </div>
                <button
                  onClick={() => onQuickAdd(col.key)}
                  title={`Add to ${col.label}`}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.5)', width: 24, height: 24, fontSize: 15, cursor: 'pointer', lineHeight: 1 }}
                >
                  +
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 60 }}>
                {cards.length === 0 && (
                  <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12.5, textAlign: 'center', padding: '20px 8px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
                    {col.key === 'saved' ? 'Save jobs you find here' : 'Drag cards here'}
                  </div>
                )}
                {cards.map(app => (
                  <ApplicationCard key={app.id} app={app} onOpen={onOpen} onMove={onMove} onDragStart={handleDragStart} />
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
          background: dragOverCol === 'rejected' ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${dragOverCol === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 18,
          padding: '10px 14px',
        }}
      >
        <button
          onClick={() => setRejectedOpen(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', padding: 4 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          Rejected · {rejected.length}
          <span style={{ marginLeft: 'auto', fontSize: 11 }}>{rejectedOpen ? '▲ collapse' : '▼ expand (drop cards here too)'}</span>
        </button>
        {rejectedOpen && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, marginTop: 10 }}>
            {rejected.length === 0 && <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12.5, padding: 8 }}>Nothing here. Keep it that way 😤</div>}
            {rejected.map(app => (
              <ApplicationCard key={app.id} app={app} onOpen={onOpen} onMove={onMove} onDragStart={handleDragStart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

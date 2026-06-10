'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, AppSource, AppStatus, SOURCES, STATUSES, statusMeta } from './types'
import AIComposer from './AIComposer'

interface AppEvent {
  id: string
  event_type: string
  from_status: string | null
  to_status: string | null
  created_at: string
}

export default function ApplicationDrawer({
  app,
  initialTab = 'details',
  onClose,
  onUpdate,
  onDelete,
  onAiCapHit,
}: {
  app: Application
  initialTab?: 'details' | 'ai' | 'timeline'
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Application>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAiCapHit: () => void
}) {
  const [tab, setTab] = useState<'details' | 'ai' | 'timeline'>(initialTab)
  const [events, setEvents] = useState<AppEvent[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()

  // local editable copy
  const [form, setForm] = useState({
    company: app.company,
    role: app.role,
    location: app.location || '',
    job_url: app.job_url || '',
    source: app.source as AppSource,
    status: app.status as AppStatus,
    follow_up_date: app.follow_up_date || '',
    contact_name: app.contact_name || '',
    contact_email: app.contact_email || '',
    salary_range: app.salary_range || '',
    notes: app.notes || '',
  })

  useEffect(() => {
    if (tab !== 'timeline') return
    supabase
      .from('application_events')
      .select('id, event_type, from_status, to_status, created_at')
      .eq('application_id', app.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setEvents(data || []))
  }, [tab, app.id, supabase])

  const set = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    await onUpdate(app.id, {
      company: form.company.trim() || app.company,
      role: form.role.trim() || app.role,
      location: form.location.trim() || null,
      job_url: form.job_url.trim() || null,
      source: form.source,
      status: form.status,
      follow_up_date: form.follow_up_date || null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim() || null,
      salary_range: form.salary_range.trim() || null,
      notes: form.notes.trim() || null,
    })
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    padding: '11px 13px', borderRadius: 11, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13.5, outline: 'none', width: '100%',
  }
  const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.45)', fontSize: 11.5, fontWeight: 600, marginBottom: 5, display: 'block' }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <style>{`@keyframes drawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 460, height: '100%', overflowY: 'auto', background: '#0f1422', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: 26, animation: 'drawerIn 0.22s ease-out' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <h2 style={{ color: 'white', fontSize: 21, fontWeight: 800, margin: 0 }}>{app.company}</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '4px 0 0' }}>{app.role}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', width: 32, height: 32, fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>
        <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 700, color: statusMeta(app.status).color, background: `${statusMeta(app.status).color}1f`, padding: '4px 11px', borderRadius: 100, marginBottom: 18 }}>
          {statusMeta(app.status).emoji} {statusMeta(app.status).label}
        </span>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
          {([['details', 'Details'], ['ai', '✨ AI Writer'], ['timeline', 'Timeline']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                background: tab === key ? 'linear-gradient(135deg, #4F7CFF, #7B61FF)' : 'transparent',
                color: tab === key ? 'white' : 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div><label style={labelStyle}>Company</label><input value={form.company} onChange={e => set('company', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Role</label><input value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div>
                <label style={labelStyle}>Stage</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                  {STATUSES.map(s => <option key={s.key} value={s.key} style={{ background: '#111827' }}>{s.emoji} {s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)} style={{ ...inputStyle, appearance: 'none' }}>
                  {SOURCES.map(s => <option key={s.key} value={s.key} style={{ background: '#111827' }}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div><label style={labelStyle}>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Salary range</label><input value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="e.g. 6-8 LPA" style={inputStyle} /></div>
            </div>
            <div><label style={labelStyle}>Job link</label><input value={form.job_url} onChange={e => set('job_url', e.target.value)} style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Next follow-up</label>
              <input type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div><label style={labelStyle}>Contact name</label><input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="HR / hiring manager" style={inputStyle} /></div>
              <div><label style={labelStyle}>Contact email</label><input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} style={inputStyle} /></div>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} placeholder="Interview prep, who you talked to, anything..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <button onClick={handleSave} style={{ width: '100%', padding: 13, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
              Save changes
            </button>
            {confirmDelete ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onDelete(app.id)} style={{ flex: 1, padding: 11, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Yes, delete forever
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 11, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ width: '100%', padding: 11, borderRadius: 12, background: 'none', border: '1px solid rgba(239,68,68,0.25)', color: 'rgba(248,113,113,0.7)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Delete application
              </button>
            )}
          </div>
        )}

        {tab === 'ai' && <AIComposer app={app} onAiCapHit={onAiCapHit} />}

        {tab === 'timeline' && (
          <div>
            {events.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13.5 }}>No activity yet.</p>}
            {events.map((ev, i) => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ev.to_status ? statusMeta(ev.to_status as AppStatus).color : '#4F7CFF', marginTop: 5, flexShrink: 0 }} />
                  {i < events.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: 18 }}>
                  <p style={{ color: 'white', fontSize: 13.5, fontWeight: 600, margin: 0 }}>
                    {ev.event_type === 'created' && `Added to board (${ev.to_status})`}
                    {ev.event_type === 'status_change' && `Moved ${ev.from_status} → ${ev.to_status}`}
                    {ev.event_type === 'follow_up_sent' && 'Follow-up sent'}
                    {ev.event_type === 'note' && 'Note added'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '3px 0 0' }}>{fmtDate(ev.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

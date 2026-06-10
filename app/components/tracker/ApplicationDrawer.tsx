'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, AppSource, AppStatus, SOURCES, STATUSES, statusMeta, todayStr, addDays } from './types'
import AIComposer from './AIComposer'
import { CompanyLogo, GRAD, Icon, IconName } from './ui'

interface AppEvent {
  id: string
  event_type: string
  from_status: string | null
  to_status: string | null
  created_at: string
}

const TABS: { key: 'details' | 'ai' | 'timeline'; label: string; icon: IconName }[] = [
  { key: 'details', label: 'Details', icon: 'pencil' },
  { key: 'ai', label: 'AI Writer', icon: 'sparkles' },
  { key: 'timeline', label: 'Timeline', icon: 'history' },
]

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

  const meta = statusMeta(app.status)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', animation: 'overlayIn 0.2s ease both' }}>
      <style>{`
        @keyframes drawerIn { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 470, height: '100%', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(180deg, #10162a, #0d1220)', borderLeft: '1px solid rgba(255,255,255,0.1)',
          animation: 'drawerIn 0.28s cubic-bezier(0.32, 0.72, 0, 1) both',
          boxShadow: '-30px 0 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: 26 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <CompanyLogo company={app.company} jobUrl={app.job_url} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>{app.company}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, margin: '3px 0 0' }}>{app.role}</p>
              <div style={{ display: 'flex', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: meta.color, background: `${meta.color}1c`, border: `1px solid ${meta.color}38`, padding: '3.5px 10px', borderRadius: 100 }}>
                  <Icon name={meta.icon} size={11} /> {meta.label}
                </span>
                {app.job_url && (
                  <a
                    href={app.job_url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '3.5px 10px', borderRadius: 100, textDecoration: 'none' }}
                  >
                    <Icon name="external" size={11} /> Job post
                  </a>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', width: 32, height: 32, cursor: 'pointer', flexShrink: 0 }}>
              <Icon name="x" size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700,
                  background: tab === t.key ? GRAD : 'transparent',
                  color: tab === t.key ? 'white' : 'rgba(255,255,255,0.45)',
                  boxShadow: tab === t.key ? '0 4px 14px rgba(79,124,255,0.3)' : 'none',
                  transition: 'color 0.15s',
                }}
              >
                <Icon name={t.icon} size={13} /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div className="form-grid-2">
                <div><label style={labelStyle}>Company</label><input value={form.company} onChange={e => set('company', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Role</label><input value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle} /></div>
              </div>
              <div className="form-grid-2">
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
              <div className="form-grid-2">
                <div><label style={labelStyle}>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Salary range</label><input value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="e.g. 6-8 LPA" style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Job link</label><input value={form.job_url} onChange={e => set('job_url', e.target.value)} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Next follow-up</label>
                <input type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {[2, 5, 7].map(d => (
                    <button
                      key={d}
                      onClick={() => set('follow_up_date', addDays(todayStr(), d))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 100, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
                    >
                      <Icon name="calendar" size={11} /> +{d}d
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid-2">
                <div><label style={labelStyle}>Contact name</label><input value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="HR / hiring manager" style={inputStyle} /></div>
                <div><label style={labelStyle}>Contact email</label><input value={form.contact_email} onChange={e => set('contact_email', e.target.value)} style={inputStyle} /></div>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} placeholder="Interview prep, who you talked to, anything..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {confirmDelete ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onDelete(app.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 11, borderRadius: 12, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    <Icon name="trash" size={13} /> Yes, delete forever
                  </button>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 11, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: 11, borderRadius: 12, background: 'none', border: '1px solid rgba(239,68,68,0.22)', color: 'rgba(248,113,113,0.65)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  <Icon name="trash" size={13} /> Delete application
                </button>
              )}
            </div>
          )}

          {tab === 'ai' && <AIComposer app={app} onAiCapHit={onAiCapHit} />}

          {tab === 'timeline' && (
            <div>
              {events.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13.5 }}>No activity yet.</p>}
              {events.map((ev, i) => {
                const dotColor = ev.to_status ? statusMeta(ev.to_status as AppStatus).color : '#4F7CFF'
                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 12, position: 'relative', animation: 'cardIn 0.3s ease both', animationDelay: `${i * 40}ms` }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, boxShadow: `0 0 8px ${dotColor}80`, marginTop: 5, flexShrink: 0 }} />
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
                )
              })}
            </div>
          )}
        </div>

        {/* Sticky save bar (details tab only) */}
        {tab === 'details' && (
          <div style={{ padding: '14px 26px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(11,15,28,0.9)', backdropFilter: 'blur(10px)' }}>
            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 13, borderRadius: 12, background: GRAD, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,124,255,0.35)' }}>
              <Icon name="check" size={15} /> Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

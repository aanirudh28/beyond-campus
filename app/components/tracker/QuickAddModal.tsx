'use client'

import { useState } from 'react'
import { AppSource, AppStatus, SOURCES, STATUSES, todayStr, addDays } from './types'

export interface NewApplication {
  company: string
  role: string
  location: string | null
  job_url: string | null
  jd_text: string | null
  source: AppSource
  status: AppStatus
  applied_at: string | null
  follow_up_date: string | null
  salary_range: string | null
}

export default function QuickAddModal({
  initialStatus,
  onClose,
  onAdd,
  onAiCapHit,
}: {
  initialStatus: AppStatus
  onClose: () => void
  onAdd: (app: NewApplication) => Promise<boolean>
  onAiCapHit: () => void
}) {
  const [tab, setTab] = useState<'smart' | 'manual'>('smart')
  const [pasted, setPasted] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [jdText, setJdText] = useState('')
  const [source, setSource] = useState<AppSource>('linkedin')
  const [status, setStatus] = useState<AppStatus>(initialStatus)
  const [salaryRange, setSalaryRange] = useState('')
  const [followUpDays, setFollowUpDays] = useState(5)

  const handleExtract = async () => {
    const input = pasted.trim()
    if (!input) { setExtractError('Paste a job link or the job description first.'); return }
    setExtracting(true)
    setExtractError('')

    const isUrl = /^https?:\/\/\S+$/.test(input)
    const res = await fetch('/api/tracker/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isUrl ? { url: input } : { text: input }),
    })
    const data = await res.json()
    setExtracting(false)

    if (data.error === 'AI_CAP_REACHED') { onAiCapHit(); return }
    if (data.needsText) {
      setExtractError("Couldn't read that link (the site blocks bots). Paste the job description text instead — works every time.")
      return
    }
    if (!res.ok || !data.company) {
      setExtractError("Couldn't extract details from that. Try pasting more of the job description, or fill it in manually.")
      return
    }

    setCompany(data.company || '')
    setRole(data.role || '')
    setLocation(data.location || '')
    if (isUrl) setJobUrl(input)
    else setJdText(input.slice(0, 5000))
    if (data.jd_summary && !isUrl) setJdText(input.slice(0, 5000))
    if (data.source && SOURCES.some(s => s.key === data.source)) setSource(data.source)
    if (data.salary_range) setSalaryRange(data.salary_range)
    if (data.follow_up_days) setFollowUpDays(Math.min(10, Math.max(2, data.follow_up_days)))
    setTab('manual')
  }

  const handleSave = async () => {
    if (!company.trim() || !role.trim()) { setError('Company and role are required.'); return }
    setSaving(true)
    setError('')
    const today = todayStr()
    const ok = await onAdd({
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || null,
      job_url: jobUrl.trim() || null,
      jd_text: jdText.trim() || null,
      source,
      status,
      applied_at: status === 'saved' ? null : today,
      follow_up_date: ['offer', 'rejected'].includes(status) ? null : addDays(today, followUpDays),
      salary_range: salaryRange.trim() || null,
    })
    if (ok) onClose()
    else setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none', width: '100%',
  }
  const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 28 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: 0 }}>Add application</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', width: 32, height: 32, fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
          {([['smart', '✨ Smart paste'], ['manual', '✍️ Manual']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: tab === key ? 'linear-gradient(135deg, #4F7CFF, #7B61FF)' : 'transparent',
                color: tab === key ? 'white' : 'rgba(255,255,255,0.45)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'smart' ? (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' }}>
              Paste a job link or the whole job description. AI fills in the company, role, and even suggests when to follow up.
            </p>
            <textarea
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder="https://linkedin.com/jobs/... or paste the full JD text"
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {extractError && <p style={{ color: '#fbbf24', fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>{extractError}</p>}
            <button
              onClick={handleExtract}
              disabled={extracting}
              style={{ width: '100%', marginTop: 14, padding: 13, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: extracting ? 'wait' : 'pointer', opacity: extracting ? 0.7 : 1 }}
            >
              {extracting ? '✨ Reading the job post...' : '✨ Extract details'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Company *</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Zomato" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. BD Associate" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Gurgaon / Remote" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Salary (if known)</label>
                <input value={salaryRange} onChange={e => setSalaryRange(e.target.value)} placeholder="e.g. 6-8 LPA" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Job link</label>
              <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Source</label>
                <select value={source} onChange={e => setSource(e.target.value as AppSource)} style={{ ...inputStyle, appearance: 'none' }}>
                  {SOURCES.map(s => <option key={s.key} value={s.key} style={{ background: '#111827' }}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Stage</label>
                <select value={status} onChange={e => setStatus(e.target.value as AppStatus)} style={{ ...inputStyle, appearance: 'none' }}>
                  {STATUSES.map(s => <option key={s.key} value={s.key} style={{ background: '#111827' }}>{s.emoji} {s.label}</option>)}
                </select>
              </div>
            </div>
            {!['offer', 'rejected'].includes(status) && (
              <div>
                <label style={labelStyle}>Remind me to follow up in</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[3, 5, 7].map(d => (
                    <button
                      key={d}
                      onClick={() => setFollowUpDays(d)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: followUpDays === d ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${followUpDays === d ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`,
                        color: followUpDays === d ? '#93BBFF' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {d} days
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: '100%', padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? '⏳ Adding...' : 'Add to board →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

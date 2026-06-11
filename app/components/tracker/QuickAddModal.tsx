'use client'

import { useState } from 'react'
import { AppSource, AppStatus, SOURCES, STATUSES, todayStr, addDays } from './types'
import { GRAD, Icon } from './ui'

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
  isPro,
  onClose,
  onAdd,
  onProRequired,
}: {
  initialStatus: AppStatus
  isPro: boolean
  onClose: () => void
  onAdd: (app: NewApplication) => Promise<string | null>
  onProRequired: () => void
}) {
  const [tab, setTab] = useState<'smart' | 'manual'>(isPro ? 'smart' : 'manual')
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
    if (!input) { setExtractError('Paste the job description first.'); return }
    if (/^https?:\/\/\S+$/.test(input)) {
      setExtractError("Links aren't supported — most job sites block bots. Open the posting, copy the full description text, and paste that here instead.")
      return
    }
    setExtracting(true)
    setExtractError('')

    const res = await fetch('/api/tracker/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
    const data = await res.json()
    setExtracting(false)

    if (data.error === 'PRO_REQUIRED') { onProRequired(); return }
    if (!res.ok || !data.company) {
      setExtractError("Couldn't extract details from that. Try pasting more of the job description, or fill it in manually.")
      return
    }

    setCompany(data.company || '')
    setRole(data.role || '')
    setLocation(data.location || '')
    setJdText(input.slice(0, 5000))
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
    const failure = await onAdd({
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
    if (!failure) onClose()
    else {
      setSaving(false)
      setError(failure)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none', width: '100%',
  }
  const labelStyle: React.CSSProperties = { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'overlayIn 0.2s ease both' }}
    >
      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          background: 'linear-gradient(180deg, #131a2e, #0f1424)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: 28,
          animation: 'modalIn 0.25s cubic-bezier(0.32, 0.72, 0, 1) both',
          boxShadow: '0 30px 90px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: -0.4 }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 10, background: GRAD, boxShadow: '0 4px 14px rgba(79,124,255,0.4)' }}>
              <Icon name="plus" size={16} strokeWidth={2.5} />
            </span>
            Add application
          </h2>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', width: 32, height: 32, cursor: 'pointer' }}>
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
          {([['smart', 'Smart paste', 'sparkles'], ['manual', 'Manual', 'pencil']] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: tab === key ? GRAD : 'transparent',
                color: tab === key ? 'white' : 'rgba(255,255,255,0.45)',
                boxShadow: tab === key ? '0 4px 14px rgba(79,124,255,0.3)' : 'none',
              }}
            >
              <Icon name={icon} size={13} /> {label}
              {key === 'smart' && !isPro && (
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, padding: '2px 7px', borderRadius: 100, background: 'rgba(123,97,255,0.25)', border: '1px solid rgba(123,97,255,0.45)', color: '#c4b5fd' }}>PRO</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'smart' && !isPro ? (
          <div style={{ textAlign: 'center', padding: '30px 22px', background: 'rgba(123,97,255,0.05)', border: '1px dashed rgba(123,97,255,0.35)', borderRadius: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 14, background: 'rgba(123,97,255,0.15)', color: '#c4b5fd', marginBottom: 14 }}>
              <Icon name="sparkles" size={20} />
            </span>
            <div style={{ color: 'white', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>AI Smart Paste is a Pro feature</div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.65, margin: '0 0 18px' }}>
              Paste any job description and AI fills in the company, role, location, salary and the right
              follow-up date for you — unlimited, in seconds.
            </p>
            <button
              onClick={onProRequired}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 26px', borderRadius: 12, background: GRAD, color: 'white', fontWeight: 800, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(79,124,255,0.35)' }}
            >
              <Icon name="zap" size={14} /> Unlock with Pro — ₹299
            </button>
            <div>
              <button onClick={() => setTab('manual')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Add manually instead
              </button>
            </div>
          </div>
        ) : tab === 'smart' ? (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5, lineHeight: 1.6, margin: '0 0 12px' }}>
              Paste the whole job description. AI fills in the company, role, salary, and even suggests when to follow up.
            </p>
            <textarea
              value={pasted}
              onChange={e => setPasted(e.target.value)}
              placeholder="Paste the full job description text here (links don't work — sites block bots)"
              rows={6}
              autoFocus
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
            {extractError && <p style={{ color: '#fbbf24', fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>{extractError}</p>}
            <button
              onClick={handleExtract}
              disabled={extracting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 14, padding: 13, borderRadius: 12, background: GRAD, color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: extracting ? 'wait' : 'pointer', opacity: extracting ? 0.8 : 1, boxShadow: '0 6px 20px rgba(79,124,255,0.3)' }}
            >
              {extracting ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Reading the job post...
                </>
              ) : (
                <><Icon name="sparkles" size={15} /> Extract details</>
              )}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-grid-2">
              <div>
                <label style={labelStyle}>Company *</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Zomato" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. BD Associate" style={inputStyle} />
              </div>
            </div>
            <div className="form-grid-2">
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
            <div className="form-grid-2">
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
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        background: followUpDays === d ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${followUpDays === d ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`,
                        color: followUpDays === d ? '#93BBFF' : 'rgba(255,255,255,0.5)',
                        transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                      }}
                    >
                      {followUpDays === d && <Icon name="clock" size={12} />}
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
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, borderRadius: 12, background: GRAD, color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.8 : 1, boxShadow: '0 6px 20px rgba(79,124,255,0.3)' }}
            >
              {saving ? (
                <>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Adding...
                </>
              ) : (
                <>Add to board <Icon name="arrowRight" size={15} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

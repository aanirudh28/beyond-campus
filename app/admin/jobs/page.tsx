'use client'

import { useState } from 'react'

// Either the founder's admin password OR the limited intern password works here.
// This page only ever exposes the jobs panel — never bookings, revenue, or leads.
const INTERN_PASSWORD = 'bcjobs2026'
const ADMIN_PASSWORD = 'beyondcampus2024'

interface JobRow { id: string; company: string; role: string; location: string | null; job_url: string; jd_summary: string | null; domain: string; status: string; created_at: string }

const DOMAINS = ['consulting', 'finance', 'marketing', 'bd', 'operations', 'founders_office', 'other']

export default function JobsAdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [pending, setPending] = useState<JobRow[]>([])
  const [published, setPublished] = useState<JobRow[]>([])
  const [counts, setCounts] = useState<{ pending: number; published: number; expired: number }>({ pending: 0, published: 0, expired: 0 })
  const [loading, setLoading] = useState(false)

  const [manualPaste, setManualPaste] = useState('')
  const [manualExtracting, setManualExtracting] = useState(false)
  const [manualForm, setManualForm] = useState<{ company: string; role: string; location: string; job_url: string; jd_summary: string; domain: string } | null>(null)
  const [manualMsg, setManualMsg] = useState('')

  // password is captured at login and reused for every API call
  const [activePassword, setActivePassword] = useState('')

  const adminJobs = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: activePassword, ...payload }),
    })
    return res.json()
  }

  const fetchJobs = async (pwd: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd, action: 'overview' }),
    })
    const data = await res.json()
    if (data.pending) {
      setPending(data.pending)
      setPublished(data.published)
      setCounts(data.counts)
    }
    setLoading(false)
  }

  const login = async () => {
    if (password === INTERN_PASSWORD || password === ADMIN_PASSWORD) {
      setActivePassword(password)
      setAuthed(true)
      fetchJobs(password)
    } else {
      setLoginError('Incorrect password')
    }
  }

  const jobAction = async (action: string, id: string) => {
    await adminJobs({ action, id })
    fetchJobs(activePassword)
  }

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 24px' }}>💼</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Jobs Console</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Beyond Campus · Add jobs to the board</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15, marginBottom: 12, outline: 'none' }}
          />
          {loginError && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{loginError}</p>}
          <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}>
            Login →
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'Inter', sans-serif", padding: '32px 24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF', marginBottom: 6 }}>Beyond Campus</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>Jobs Console</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>Add jobs here and they go live on the public board.</p>
          </div>
          <button onClick={() => fetchJobs(activePassword)} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Add a job manually */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>Add a job</div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Paste a job link (LinkedIn / Naukri / company site) or the full job description text, then hit Extract. Check the details and Publish.</div>
          {!manualForm ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={manualPaste} onChange={e => setManualPaste(e.target.value)} placeholder="Paste job URL or full JD text" style={{ flex: 1, minWidth: 220, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
              <button
                onClick={async () => {
                  if (!manualPaste.trim()) return
                  setManualExtracting(true); setManualMsg('')
                  const isUrl = /^https?:\/\/\S+$/.test(manualPaste.trim())
                  const r = await adminJobs({ action: 'extract', ...(isUrl ? { url: manualPaste.trim() } : { text: manualPaste.trim() }) })
                  setManualExtracting(false)
                  if (r.error) setManualMsg(`❌ ${r.error}`)
                  else setManualForm({ company: r.company || '', role: r.role || '', location: r.location || '', job_url: isUrl ? manualPaste.trim() : '', jd_summary: r.jd_summary || '', domain: r.domain || 'other' })
                }}
                disabled={manualExtracting}
                style={{ padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', border: 'none', color: 'white', fontSize: 12.5, fontWeight: 700, cursor: manualExtracting ? 'wait' : 'pointer' }}
              >
                {manualExtracting ? '✨ Reading...' : '✨ Extract'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                <input value={manualForm.company} onChange={e => setManualForm(f => f && { ...f, company: e.target.value })} placeholder="Company *" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                <input value={manualForm.role} onChange={e => setManualForm(f => f && { ...f, role: e.target.value })} placeholder="Role *" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                <input value={manualForm.location} onChange={e => setManualForm(f => f && { ...f, location: e.target.value })} placeholder="Location" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                <select value={manualForm.domain} onChange={e => setManualForm(f => f && { ...f, domain: e.target.value })} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }}>
                  {DOMAINS.map(d => <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>)}
                </select>
              </div>
              <input value={manualForm.job_url} onChange={e => setManualForm(f => f && { ...f, job_url: e.target.value })} placeholder="Job URL *" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
              <textarea value={manualForm.jd_summary} onChange={e => setManualForm(f => f && { ...f, jd_summary: e.target.value })} placeholder="One-line summary" rows={2} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={async () => {
                    const r = await adminJobs({ action: 'manual_add', ...manualForm, publish: true })
                    if (r.error) setManualMsg(`❌ ${r.error}`)
                    else { setManualMsg('✓ Published — it is live on the board now.'); setManualForm(null); setManualPaste(''); fetchJobs(activePassword) }
                  }}
                  style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Publish now
                </button>
                <button onClick={() => { setManualForm(null); setManualMsg('') }} style={{ padding: '10px 20px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
          {manualMsg && <p style={{ fontSize: 12.5, color: manualMsg.startsWith('❌') ? '#f87171' : '#6ee7b7', margin: '10px 0 0' }}>{manualMsg}</p>}
        </div>

        {/* Pending review */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 12 }}>Pending review ({pending.length})</div>
          {loading && pending.length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Loading…</p>}
          {!loading && pending.length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Nothing waiting. Add a job above 👆</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white' }}>{j.company} — {j.role}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{j.location || 'Location n/a'} · <span style={{ color: '#93BBFF' }}>{j.domain}</span>{j.jd_summary ? ` · ${j.jd_summary}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a href={j.job_url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>View ↗</a>
                  <button onClick={() => jobAction('approve', j.id)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>✓ Publish</button>
                  <button onClick={() => jobAction('reject', j.id)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live on the board */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 12 }}>
            Live on the board ({counts.published}) <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 12 }}>· {counts.expired} expired</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {published.map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '9px 14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ fontWeight: 700, color: 'white' }}>{j.company}</span> — {j.role} <span style={{ color: 'rgba(255,255,255,0.35)' }}>· {j.domain}</span>
                </div>
                <button onClick={() => jobAction('expire', j.id)} style={{ padding: '5px 12px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Take down</button>
              </div>
            ))}
            {published.length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No live jobs yet.</p>}
          </div>
        </div>
      </div>
    </main>
  )
}

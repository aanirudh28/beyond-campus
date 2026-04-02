'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_PASSWORD = 'beyondcampus2024'

type Booking = {
  id: string
  name: string
  email: string
  phone: string
  resume_status: string
  date: string
  time_slot: string
  payment_id: string
  amount: number
  type: string
  created_at: string
}

type Student = {
  id: string
  name: string
  email: string
  stage: number
  cold_emails_sent: number
  interview_calls: number
  is_placed: boolean
  joined_at: string
}

type SummerReg = {
  id: string
  name: string
  email: string
  phone: string
  college: string
  year: string
  domain: string
  payment_status: string
  created_at: string
}

type ResourcePurchase = {
  id: string
  email: string
  payment_id: string
  amount: number
  created_at: string
}

type Lead = {
  id: string
  email: string
  resource: string
  created_at: string
}

const STAGE_LABELS = ['Joined', 'Resume Reviewed', 'Started Outreach', 'Got Interview', 'Placed!']

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState<'bookings' | 'students' | 'summer' | 'resources'>('bookings')
  const [summerRegs, setSummerRegs] = useState<SummerReg[]>([])
  const [summerLoading, setSummerLoading] = useState(false)
  const [summerFilter, setSummerFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)

  const fetchResources = async () => {
    setResourcesLoading(true)
    const [purchasesRes, leadsRes] = await Promise.all([
      supabase.from('resource_purchases').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
    ])
    if (purchasesRes.data) setResourcePurchases(purchasesRes.data)
    if (leadsRes.data) setLeads(leadsRes.data)
    setResourcesLoading(false)
  }

  const fetchSummerRegs = async () => {
    setSummerLoading(true)
    const { data } = await supabase.from('summer_registrations').select('*').order('created_at', { ascending: false })
    if (data) setSummerRegs(data)
    setSummerLoading(false)
  }

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      fetchBookings()
      fetchStudents()
      fetchSummerRegs()
      fetchResources()
    } else {
      setError('Incorrect password')
    }
  }

  const fetchStudents = async () => {
    setStudentsLoading(true)
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD }),
    })
    const json = await res.json()
    if (json.data) setStudents(json.data)
    setStudentsLoading(false)
  }

  const fetchBookings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setBookings(data)
    setLoading(false)
  }

  const filtered = bookings.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || b.type === filter
    return matchSearch && matchFilter
  })

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0)
  const mentorshipCount = bookings.filter(b => b.type === 'mentorship').length
  const cohortCount = bookings.filter(b => b.type === 'cohort').length

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 24px' }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 32 }}>Beyond Campus · Bookings</p>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 15, marginBottom: 12, outline: 'none' }}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}
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
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        table { border-collapse: collapse; width: 100%; }
        th { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
        td { padding: 14px 16px; font-size: 14px; color: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(255,255,255,0.04); }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px; }
        .badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF', marginBottom: 6 }}>Beyond Campus</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>Bookings Dashboard</h1>
          </div>
          <button onClick={fetchBookings} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#4F7CFF' }}>₹{totalRevenue.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>TOTAL BOOKINGS</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'white' }}>{bookings.length}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>MENTORSHIP</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#7B61FF' }}>{mentorshipCount}</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>COHORT</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#06b6d4' }}>{cohortCount}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { key: 'bookings', label: `Bookings (${bookings.length})`, active: activeTab === 'bookings', color: '#4F7CFF', bg: 'rgba(79,124,255,0.15)' },
            { key: 'students', label: `Students (${students.length})`, active: activeTab === 'students', color: '#4F7CFF', bg: 'rgba(79,124,255,0.15)' },
            { key: 'summer', label: `☀️ Summer (${summerRegs.length})`, active: activeTab === 'summer', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
            { key: 'resources', label: `📦 Resources (${resourcePurchases.length})`, active: activeTab === 'resources', color: '#4F7CFF', bg: 'rgba(79,124,255,0.15)' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ padding: '10px 22px', borderRadius: 100, border: '1px solid', borderColor: tab.active ? tab.color : 'rgba(255,255,255,0.1)', background: tab.active ? tab.bg : 'transparent', color: tab.active ? tab.color : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={fetchStudents} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {studentsLoading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading students...</div>
              ) : students.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No students yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Stage</th>
                        <th>Cold Emails</th>
                        <th>Interviews</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'white', marginBottom: 2 }}>{s.name}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{s.email}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: s.stage === 5 ? 'rgba(34,197,94,0.12)' : 'rgba(79,124,255,0.12)', color: s.stage === 5 ? '#4ade80' : '#93BBFF', border: `1px solid ${s.stage === 5 ? 'rgba(34,197,94,0.2)' : 'rgba(79,124,255,0.2)'}`, fontWeight: 600 }}>
                              {STAGE_LABELS[s.stage - 1] ?? 'Joined'}
                            </span>
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{s.cold_emails_sent}</td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{s.interview_calls}</td>
                          <td>
                            {s.is_placed
                              ? <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600 }}>🎉 Placed</span>
                              : <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>In progress</span>
                            }
                          </td>
                          <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(s.joined_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summer Tab */}
        {activeTab === 'summer' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['all', 'paid', 'pending'] as const).map(f => (
                  <button key={f} onClick={() => setSummerFilter(f)} style={{ padding: '8px 16px', borderRadius: 100, border: '1px solid', borderColor: summerFilter === f ? '#f59e0b' : 'rgba(255,255,255,0.1)', background: summerFilter === f ? 'rgba(245,158,11,0.15)' : 'transparent', color: summerFilter === f ? '#f59e0b' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {f}
                  </button>
                ))}
              </div>
              <button onClick={fetchSummerRegs} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {summerLoading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading registrations...</div>
              ) : summerRegs.filter(r => summerFilter === 'all' || r.payment_status === summerFilter).length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No registrations yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>College</th>
                        <th>Year</th>
                        <th>Domain</th>
                        <th>Payment</th>
                        <th>Registered At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summerRegs.filter(r => summerFilter === 'all' || r.payment_status === summerFilter).map(r => (
                        <tr key={r.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'white', marginBottom: 2 }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.email}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{r.phone}</div>
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{r.college}</td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{r.year}</td>
                          <td style={{ color: 'rgba(255,255,255,0.7)' }}>{r.domain}</td>
                          <td>
                            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: r.payment_status === 'paid' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: r.payment_status === 'paid' ? '#4ade80' : '#f59e0b', border: `1px solid ${r.payment_status === 'paid' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`, fontWeight: 600, textTransform: 'capitalize' }}>
                              {r.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div className="stat-card">
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>RESOURCE PACK SALES</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#4F7CFF' }}>{resourcePurchases.length}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>RESOURCE REVENUE</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#10b981' }}>₹{resourcePurchases.reduce((s, r) => s + r.amount, 0).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>EMAIL LEADS</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b' }}>{leads.length}</div>
              </div>
            </div>

            {/* Purchases table */}
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 12 }}>Resource Pack Purchases</div>
            {resourcesLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', padding: 40, textAlign: 'center' }}>Loading...</div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', marginBottom: 32 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Payment ID</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourcePurchases.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 32 }}>No purchases yet</td></tr>
                      ) : resourcePurchases.map(p => (
                        <tr key={p.id}>
                          <td>{p.email || '—'}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.payment_id}</td>
                          <td style={{ color: '#10b981', fontWeight: 700 }}>₹{p.amount}</td>
                          <td style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(p.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Leads table */}
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 12 }}>Email Leads</div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Resource</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 32 }}>No leads yet</td></tr>
                    ) : leads.map(l => (
                      <tr key={l.id}>
                        <td>{l.email}</td>
                        <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{l.resource}</td>
                        <td style={{ color: 'rgba(255,255,255,0.4)' }}>{formatDate(l.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && <>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 14, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {['all', 'mentorship', 'cohort'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '10px 18px', borderRadius: 100, border: '1px solid', borderColor: filter === f ? '#4F7CFF' : 'rgba(255,255,255,0.1)', background: filter === f ? 'rgba(79,124,255,0.15)' : 'transparent', color: filter === f ? '#93BBFF' : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading bookings...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No bookings found</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Date & Slot</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment ID</th>
                    <th>Booked At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'white', marginBottom: 2 }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.email}</div>
                        {b.phone && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.phone}</div>}
                        {b.resume_status && (
                          <div style={{ marginTop: 4 }}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: b.resume_status === 'has_resume' ? 'rgba(34,197,94,0.1)' : 'rgba(251,146,60,0.1)', color: b.resume_status === 'has_resume' ? '#4ade80' : '#fb923c', border: `1px solid ${b.resume_status === 'has_resume' ? 'rgba(34,197,94,0.2)' : 'rgba(251,146,60,0.2)'}`, fontWeight: 600 }}>
                              {b.resume_status === 'has_resume' ? 'Has resume' : 'Needs resume'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.date}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{b.time_slot}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: b.type === 'mentorship' ? 'rgba(79,124,255,0.15)' : 'rgba(6,182,212,0.15)', color: b.type === 'mentorship' ? '#93BBFF' : '#67e8f9', border: `1px solid ${b.type === 'mentorship' ? 'rgba(79,124,255,0.3)' : 'rgba(6,182,212,0.3)'}` }}>
                          {b.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#4F7CFF' }}>₹{b.amount}</td>
                      <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{b.payment_id?.slice(0, 16)}...</td>
                      <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          Showing {filtered.length} of {bookings.length} bookings
        </div>
        </>}

      </div>
    </main>
  )
}

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
  date: string
  time_slot: string
  payment_id: string
  amount: number
  type: string
  created_at: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      fetchBookings()
    } else {
      setError('Incorrect password')
    }
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
      </div>
    </main>
  )
}

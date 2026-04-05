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

type ManualAccess = {
  id: string
  email: string
  access_type: string
  granted_at: string
  granted_by: string
}

type FeedPost = {
  id: string
  type: string
  content: string
  degree: string | null
  college_tier: string | null
  city: string | null
  domain: string | null
  tags: string[]
  upvotes: number
  is_approved: boolean
  created_at: string
}

type FeedReply = {
  id: string
  post_id: string
  content: string
  degree: string | null
  college_tier: string | null
  is_approved: boolean
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'students' | 'summer' | 'resources' | 'feed' | 'manual-access'>('bookings')
  const [summerRegs, setSummerRegs] = useState<SummerReg[]>([])
  const [summerLoading, setSummerLoading] = useState(false)
  const [summerFilter, setSummerFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)

  // ─── Manual Access State ─────────────────────────────────────────────────────
  const [manualAccessList, setManualAccessList] = useState<ManualAccess[]>([])
  const [manualAccessLoading, setManualAccessLoading] = useState(false)
  const [manualAccessEmail, setManualAccessEmail] = useState('')
  const [manualAccessType, setManualAccessType] = useState('Resource Pack (all resources)')
  const [manualAccessSubmitting, setManualAccessSubmitting] = useState(false)
  const [manualAccessError, setManualAccessError] = useState('')
  const [manualAccessSuccess, setManualAccessSuccess] = useState('')

  const fetchManualAccess = async () => {
    setManualAccessLoading(true)
    const { data } = await supabase.from('manual_access').select('*').order('granted_at', { ascending: false })
    if (data) setManualAccessList(data)
    setManualAccessLoading(false)
  }

  const grantAccess = async () => {
    if (!manualAccessEmail.trim()) { setManualAccessError('Email is required'); return }
    setManualAccessSubmitting(true)
    setManualAccessError('')
    setManualAccessSuccess('')
    const { error } = await supabase.from('manual_access').upsert(
      { email: manualAccessEmail.trim().toLowerCase(), access_type: manualAccessType, granted_by: 'admin' },
      { onConflict: 'email' }
    )
    if (error) {
      setManualAccessError('Failed to grant access: ' + error.message)
    } else {
      setManualAccessSuccess(`Access granted to ${manualAccessEmail.trim()}`)
      setManualAccessEmail('')
      await fetchManualAccess()
    }
    setManualAccessSubmitting(false)
  }

  const revokeAccess = async (id: string, email: string) => {
    const { error } = await supabase.from('manual_access').delete().eq('id', id)
    if (!error) {
      setManualAccessList(prev => prev.filter(a => a.id !== id))
      setManualAccessSuccess(`Access revoked for ${email}`)
    }
  }

  // ─── Feed State ──────────────────────────────────────────────────────────────
  const [feedPendingPosts, setFeedPendingPosts] = useState<FeedPost[]>([])
  const [feedApprovedPosts, setFeedApprovedPosts] = useState<FeedPost[]>([])
  const [feedPendingReplies, setFeedPendingReplies] = useState<FeedReply[]>([])
  const [feedApprovedReplies, setFeedApprovedReplies] = useState<FeedReply[]>([])
  const [feedLoading, setFeedLoading] = useState(false)

  const fetchFeed = async () => {
    setFeedLoading(true)
    try {
      const [pendingPostsRes, approvedPostsRes, pendingRepliesRes, approvedRepliesRes] = await Promise.all([
        fetch('/api/feed/posts?approved=false&limit=100'),
        fetch('/api/feed/posts?approved=true&limit=100'),
        fetch('/api/feed/replies?post_id=all&approved=false').catch(() => ({ json: async () => ({ replies: [] }) })),
        fetch('/api/feed/replies?post_id=all&approved=true').catch(() => ({ json: async () => ({ replies: [] }) })),
      ])
      const [pp, ap] = await Promise.all([pendingPostsRes.json(), approvedPostsRes.json()])
      if (pp.posts) setFeedPendingPosts(pp.posts)
      if (ap.posts) setFeedApprovedPosts(ap.posts)
      // Fetch all pending replies separately since we can't pass post_id=all yet — use admin endpoint approach
      const allPendingReplies = await fetchAllFeedReplies(false)
      const allApprovedReplies = await fetchAllFeedReplies(true)
      setFeedPendingReplies(allPendingReplies)
      setFeedApprovedReplies(allApprovedReplies)
    } catch (e) {
      console.error('[admin feed fetch]', e)
    }
    setFeedLoading(false)
  }

  const fetchAllFeedReplies = async (approved: boolean): Promise<FeedReply[]> => {
    try {
      // Fetch replies for all posts by fetching from Supabase directly
      const { data, error } = await supabase
        .from('feed_replies')
        .select('*')
        .eq('is_approved', approved)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error || !data) return []
      return data
    } catch {
      return []
    }
  }

  const approvePost = async (id: string) => {
    try {
      await fetch('/api/feed/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: true }),
      })
      setFeedPendingPosts(prev => prev.filter(p => p.id !== id))
      const approved = feedPendingPosts.find(p => p.id === id)
      if (approved) setFeedApprovedPosts(prev => [{ ...approved, is_approved: true }, ...prev])
    } catch {}
  }

  const rejectPost = async (id: string) => {
    try {
      await fetch('/api/feed/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFeedPendingPosts(prev => prev.filter(p => p.id !== id))
      setFeedApprovedPosts(prev => prev.filter(p => p.id !== id))
    } catch {}
  }

  const approveReply = async (id: string) => {
    try {
      await fetch('/api/feed/replies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: true }),
      })
      setFeedPendingReplies(prev => prev.filter(r => r.id !== id))
      const approved = feedPendingReplies.find(r => r.id === id)
      if (approved) setFeedApprovedReplies(prev => [{ ...approved, is_approved: true }, ...prev])
    } catch {}
  }

  const rejectReply = async (id: string) => {
    try {
      await fetch('/api/feed/replies', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setFeedPendingReplies(prev => prev.filter(r => r.id !== id))
      setFeedApprovedReplies(prev => prev.filter(r => r.id !== id))
    } catch {}
  }

  const feedTypeColor = (type: string) => {
    if (type === 'experience') return { color: '#93BBFF', bg: 'rgba(79,124,255,0.15)', border: 'rgba(79,124,255,0.3)' }
    if (type === 'stipend')    return { color: '#6ee7b7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' }
    return { color: '#fcd34d', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' }
  }

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
      fetchFeed()
      fetchManualAccess()
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
            { key: 'feed', label: `💬 Feed (${feedPendingPosts.length + feedPendingReplies.length} pending)`, active: activeTab === 'feed', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { key: 'manual-access', label: `🔓 Manual Access (${manualAccessList.length})`, active: activeTab === 'manual-access', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
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

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
              <div className="stat-card">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>APPROVED POSTS</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{feedApprovedPosts.length}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>PENDING POSTS</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{feedPendingPosts.length}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>APPROVED REPLIES</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>{feedApprovedReplies.length}</div>
              </div>
              <div className="stat-card">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600 }}>PENDING REPLIES</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>{feedPendingReplies.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button onClick={fetchFeed} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh Feed
              </button>
            </div>

            {feedLoading ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading feed data...</div>
            ) : (
              <>
                {/* Pending Posts */}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '3px 12px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', fontSize: 12, fontWeight: 700 }}>
                    {feedPendingPosts.length} Pending
                  </span>
                  Posts awaiting review
                </div>

                {feedPendingPosts.length === 0 ? (
                  <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#6ee7b7', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
                    ✓ No pending posts
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
                    {feedPendingPosts.map(post => {
                      const tc = feedTypeColor(post.type)
                      return (
                        <div key={post.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderLeft: `4px solid ${tc.border}`, borderRadius: 16, padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg }}>{post.type.toUpperCase()}</span>
                                {post.domain && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{post.domain}</span>}
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{new Date(post.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 10, wordBreak: 'break-word' }}>
                                {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
                              </p>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{[post.degree, post.college_tier, post.city].filter(Boolean).join(' · ')}</span>
                                {post.tags && post.tags.length > 0 && (
                                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {post.tags.map(t => (
                                      <span key={t} style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <button
                                onClick={() => approvePost(post.id)}
                                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => rejectPost(post.id)}
                                style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Approved Posts */}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '3px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 12, fontWeight: 700 }}>
                    {feedApprovedPosts.length} Live
                  </span>
                  Approved posts
                </div>

                {feedApprovedPosts.length === 0 ? (
                  <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
                    No approved posts yet
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
                    {feedApprovedPosts.slice(0, 20).map(post => {
                      const tc = feedTypeColor(post.type)
                      return (
                        <div key={post.id} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${tc.border}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                              <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 700, color: tc.color, background: tc.bg }}>{post.type.toUpperCase()}</span>
                              {post.domain && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{post.domain}</span>}
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>↑{post.upvotes}</span>
                              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>{new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>
                              {post.content.length > 150 ? post.content.slice(0, 150) + '...' : post.content}
                            </p>
                          </div>
                          <button
                            onClick={() => rejectPost(post.id)}
                            style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                          >
                            Delete
                          </button>
                        </div>
                      )
                    })}
                    {feedApprovedPosts.length > 20 && (
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 12 }}>
                        Showing first 20 of {feedApprovedPosts.length} approved posts
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Replies */}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ padding: '3px 12px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', fontSize: 12, fontWeight: 700 }}>
                    {feedPendingReplies.length} Pending
                  </span>
                  Replies awaiting review
                </div>

                {feedPendingReplies.length === 0 ? (
                  <div style={{ padding: '24px', borderRadius: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', color: '#6ee7b7', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
                    ✓ No pending replies
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {feedPendingReplies.map(reply => (
                      <div key={reply.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                            {[reply.degree, reply.college_tier].filter(Boolean).join(' · ')} · {new Date(reply.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, margin: 0, wordBreak: 'break-word' }}>
                            {reply.content.length > 200 ? reply.content.slice(0, 200) + '...' : reply.content}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <button
                            onClick={() => approveReply(reply.id)}
                            style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => rejectReply(reply.id)}
                            style={{ padding: '7px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Manual Access Tab */}
        {activeTab === 'manual-access' && (
          <div>
            {/* Grant form */}
            <div style={{ background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 20, padding: 32, marginBottom: 32 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>Grant Resource Access</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
                Give a specific person full access to all resources — useful for testers, partners, or community members.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={manualAccessEmail}
                  onChange={e => { setManualAccessEmail(e.target.value); setManualAccessError(''); setManualAccessSuccess('') }}
                  onKeyDown={e => e.key === 'Enter' && grantAccess()}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none' }}
                />
                <select
                  value={manualAccessType}
                  onChange={e => setManualAccessType(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 15, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Resource Pack (all resources)">Resource Pack (all resources)</option>
                  <option value="Cold Email Pack only">Cold Email Pack only</option>
                  <option value="LinkedIn Scripts only">LinkedIn Scripts only</option>
                </select>
                {manualAccessError && <div style={{ color: '#f87171', fontSize: 13 }}>{manualAccessError}</div>}
                {manualAccessSuccess && <div style={{ color: '#6ee7b7', fontSize: 13 }}>{manualAccessSuccess}</div>}
                <button
                  onClick={grantAccess}
                  disabled={manualAccessSubmitting}
                  style={{ padding: '13px 24px', borderRadius: 12, background: manualAccessSubmitting ? 'rgba(167,139,250,0.3)' : 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: manualAccessSubmitting ? 'not-allowed' : 'pointer' }}
                >
                  {manualAccessSubmitting ? 'Granting...' : 'Grant Access →'}
                </button>
              </div>
            </div>

            {/* Access list */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Manually Granted Access</div>
              <button onClick={fetchManualAccess} style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {manualAccessLoading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
              ) : manualAccessList.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No manual access granted yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Access Type</th>
                        <th>Granted At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualAccessList.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 500, color: 'white' }}>{a.email}</td>
                          <td>
                            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, background: 'rgba(167,139,250,0.12)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.25)', fontWeight: 600 }}>
                              {a.access_type}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(a.granted_at)}</td>
                          <td>
                            <button
                              onClick={() => revokeAccess(a.id, a.email)}
                              style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

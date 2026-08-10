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

type RoastResult = {
  id: string
  email: string | null
  tone: string
  overall_score: number
  grade: string
  grade_label: string
  domain: string
  created_at: string
}

type ConsultationLead = {
  id: string
  full_name: string
  phone: string
  email: string
  interested_in: string
  college: string | null
  graduation_year: string | null
  source_page: string
  created_at: string
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'students' | 'summer' | 'resources' | 'feed' | 'manual-access' | 'roasts' | 'leads' | 'tracker' | 'jobs' | 'consulting' | 'apti-users' | 'email-health' | 'read-receipts'>('bookings')

  // ─── Jobs Engine State ───────────────────────────────────────────────────────
  interface JobRow { id: string; company: string; role: string; location: string | null; job_url: string; jd_summary: string | null; domain: string; status: string; created_at: string }
  interface JobSource { id: string; company: string; ats: string; slug: string; active: boolean; last_synced_at: string | null }
  const [jobsData, setJobsData] = useState<{ sources: JobSource[]; pending: JobRow[]; published: JobRow[]; counts: { pending: number; published: number; expired: number } } | null>(null)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [syncReport, setSyncReport] = useState<{ source: string; fetched: number; fresh: number; kept: number; expired: number; error?: string }[] | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [srcForm, setSrcForm] = useState({ company: '', ats: 'greenhouse', slug: '' })
  const [srcMsg, setSrcMsg] = useState('')
  const [manualPaste, setManualPaste] = useState('')
  const [manualExtracting, setManualExtracting] = useState(false)
  const [manualForm, setManualForm] = useState<{ company: string; role: string; location: string; job_url: string; jd_summary: string; domain: string } | null>(null)
  const [manualMsg, setManualMsg] = useState('')

  const adminJobs = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, ...payload }),
    })
    return res.json()
  }

  const fetchJobs = async () => {
    setJobsLoading(true)
    const data = await adminJobs({ action: 'overview' })
    if (data.sources) setJobsData(data)
    setJobsLoading(false)
  }

  const jobAction = async (action: string, id: string) => {
    await adminJobs({ action, id })
    fetchJobs()
  }
  const [trackerStats, setTrackerStats] = useState<{
    totalUsers: number; newUsers7d: number; proUsers: number; activeUsers7d: number
    totalApps: number; newApps7d: number; byStatus: Record<string, number>
    aiThisMonth: number; nurtureSent: number; nurtureSent7d: number; optouts: number
    recentUsers: { email: string; name: string | null; is_pro: boolean; created_at: string }[]
  } | null>(null)
  const [trackerLoading, setTrackerLoading] = useState(false)

  // ─── Read Receipts activity (the /read-receipts tool) ───────────────────────
  const [rrStats, setRrStats] = useState<{
    totalUsers: number; activeUsers7d: number; totalTracked: number; tracked7d: number
    totalOpens: number; opens7d: number; openRate: number
    breakdown: { open: number; self: number; bot: number }
    byConfidence: { high: number; medium: number; low: number }
    opened: { label: string | null; subject: string | null; owner_email: string | null; opens: number; lastOpened: string; created_at: string }[]
    topUsers: { email: string | null; tracked: number; opened: number }[]
  } | null>(null)
  const [rrLoading, setRrLoading] = useState(false)

  const fetchRrStats = async () => {
    setRrLoading(true)
    try {
      const res = await fetch('/api/admin/read-receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })
      const json = await res.json()
      if (json.totalTracked !== undefined) setRrStats(json)
    } catch {}
    setRrLoading(false)
  }

  // ─── Email deliverability (Resend webhook events) ───────────────────────────
  const [emailHealth, setEmailHealth] = useState<{
    windowDays: number; sent: number; delivered: number; bounced: number; complained: number; opened: number
    deliveredPct: number; bouncePct: number; complaintPct: number; openPct: number; configured: boolean
    problems: { event_type: string; recipient: string | null; subject: string | null; created_at: string }[]
  } | null>(null)
  const [emailHealthLoading, setEmailHealthLoading] = useState(false)

  const fetchEmailHealth = async () => {
    setEmailHealthLoading(true)
    try {
      const res = await fetch('/api/admin/email-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })
      const json = await res.json()
      if (json.sent !== undefined) setEmailHealth(json)
    } catch {}
    setEmailHealthLoading(false)
  }

  // ─── Apti user analytics (distinct from /admin/apti, the question console) ───
  const [aptiStats, setAptiStats] = useState<{
    totalUsers: number; newUsers7d: number; activatedUsers: number; activeUsers7d: number
    totalSets: number; sets7d: number; totalAttempts: number; accuracy: number; attempts7d: number
    onStreak: number; whatsappOptins: number
    overlap: { aptiTotal: number; trackerTotal: number; both: number; aptiOnly: number; trackerOnly: number }
    laneBreakdown: Record<string, number>
    recentUsers: { email: string; lane: string | null; streak: number; topRating: number | null; alsoTracker: boolean; created_at: string }[]
  } | null>(null)
  const [aptiUsersLoading, setAptiUsersLoading] = useState(false)

  const fetchAptiUsers = async () => {
    setAptiUsersLoading(true)
    try {
      const res = await fetch('/api/admin/apti-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })
      const json = await res.json()
      if (json.totalUsers !== undefined) setAptiStats(json)
    } catch {}
    setAptiUsersLoading(false)
  }

  const fetchTrackerStats = async () => {
    setTrackerLoading(true)
    try {
      const res = await fetch('/api/admin/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })
      const json = await res.json()
      if (json.totalUsers !== undefined) setTrackerStats(json)
    } catch {}
    setTrackerLoading(false)
  }

  // ─── Consulting Casebook page tracker ────────────────────────────────────────
  const [casebookStats, setCasebookStats] = useState<{
    totalDownloads: number; downloads7d: number
    totalLeads: number; leads7d: number; captureRate: number
    perResource: { name: string; downloads: number; leads: number }[]
    recentLeads: { email: string; resource: string; created_at: string }[]
  } | null>(null)
  const [casebookLoading, setCasebookLoading] = useState(false)

  const fetchCasebookStats = async () => {
    setCasebookLoading(true)
    try {
      const res = await fetch('/api/admin/consulting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      })
      const json = await res.json()
      if (json.totalDownloads !== undefined) setCasebookStats(json)
    } catch {}
    setCasebookLoading(false)
  }

  // ─── Weekly cases (the drip the casebook capture promises) ───────────────────
  interface WeeklyCase { id: string; sort_order: number; title: string; prompt: string; hint: string | null; published: boolean; created_at: string }
  const [weeklyCases, setWeeklyCases] = useState<WeeklyCase[]>([])
  const [weeklyCasesLoaded, setWeeklyCasesLoaded] = useState(false)
  const [newCase, setNewCase] = useState({ title: '', prompt: '', hint: '' })
  const [caseMsg, setCaseMsg] = useState('')
  const [caseSaving, setCaseSaving] = useState(false)

  const adminCases = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/weekly-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASSWORD, ...payload }),
    })
    return res.json()
  }

  const fetchWeeklyCases = async () => {
    const json = await adminCases({ action: 'list' })
    if (json.cases) setWeeklyCases(json.cases)
    setWeeklyCasesLoaded(true)
  }

  const addWeeklyCase = async () => {
    if (!newCase.title.trim() || !newCase.prompt.trim()) { setCaseMsg('❌ Title and prompt are required'); return }
    setCaseSaving(true); setCaseMsg('')
    const json = await adminCases({ action: 'add', ...newCase })
    setCaseSaving(false)
    if (json.error) setCaseMsg(`❌ ${json.error}`)
    else { setCaseMsg('✓ Case added (unpublished — publish it to start sending)'); setNewCase({ title: '', prompt: '', hint: '' }); fetchWeeklyCases() }
  }

  const toggleWeeklyCase = async (id: string, published: boolean) => {
    await adminCases({ action: 'toggle', id, published })
    fetchWeeklyCases()
  }

  const deleteWeeklyCase = async (id: string) => {
    if (!window.confirm('Delete this case permanently? People who already received it are unaffected.')) return
    await adminCases({ action: 'delete', id })
    fetchWeeklyCases()
  }
  const [roasts, setRoasts] = useState<RoastResult[]>([])
  const [roastsLoading, setRoastsLoading] = useState(false)
  const [summerRegs, setSummerRegs] = useState<SummerReg[]>([])
  const [summerLoading, setSummerLoading] = useState(false)
  const [summerFilter, setSummerFilter] = useState<'all' | 'paid' | 'pending'>('all')
  const [resourcePurchases, setResourcePurchases] = useState<ResourcePurchase[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [consultationLeads, setConsultationLeads] = useState<ConsultationLead[]>([])
  const [consultationLeadsLoading, setConsultationLeadsLoading] = useState(false)

  const fetchConsultationLeads = async () => {
    setConsultationLeadsLoading(true)
    const { data } = await supabase.from('consultation_leads').select('*').order('created_at', { ascending: false })
    if (data) setConsultationLeads(data)
    setConsultationLeadsLoading(false)
  }

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

  const fetchRoasts = async () => {
    setRoastsLoading(true)
    const { data } = await supabase
      .from('roast_results')
      .select('id, email, tone, overall_score, grade, grade_label, domain, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setRoasts(data)
    setRoastsLoading(false)
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
      fetchRoasts()
      fetchConsultationLeads()
      fetchTrackerStats()
      fetchJobs()
      fetchCasebookStats()
      fetchWeeklyCases()
      fetchAptiUsers()
      fetchEmailHealth()
      fetchRrStats()
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
            { key: 'roasts', label: `🔥 Roasts (${roasts.length})`, active: activeTab === 'roasts', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
            { key: 'leads', label: `📋 Leads (${consultationLeads.length})`, active: activeTab === 'leads', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { key: 'tracker', label: `🎯 Tracker (${trackerStats?.totalUsers ?? '…'})`, active: activeTab === 'tracker', color: '#7B61FF', bg: 'rgba(123,97,255,0.15)' },
            { key: 'jobs', label: `💼 Jobs (${jobsData?.counts.pending ?? '…'} pending)`, active: activeTab === 'jobs', color: '#00D2FF', bg: 'rgba(0,210,255,0.12)' },
            { key: 'consulting', label: `📚 Casebooks (${casebookStats?.totalLeads ?? '…'} leads)`, active: activeTab === 'consulting', color: '#93BBFF', bg: 'rgba(79,124,255,0.15)' },
            { key: 'apti-users', label: `🧮 Apti Users (${aptiStats?.totalUsers ?? '…'})`, active: activeTab === 'apti-users', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
            { key: 'email-health', label: `📧 Email Health${emailHealth ? ` (${emailHealth.bouncePct}% bounce)` : ''}`, active: activeTab === 'email-health', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { key: 'read-receipts', label: `📩 Read Receipts (${rrStats?.totalOpens ?? '…'} opens)`, active: activeTab === 'read-receipts', color: '#7B61FF', bg: 'rgba(123,97,255,0.15)' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ padding: '10px 22px', borderRadius: 100, border: '1px solid', borderColor: tab.active ? tab.color : 'rgba(255,255,255,0.1)', background: tab.active ? tab.bg : 'transparent', color: tab.active ? tab.color : 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {jobsLoading && !jobsData ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading jobs engine...</p>
            ) : !jobsData ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load. Has the jobs SQL been run in Supabase?</p>
            ) : (
              <>
                {/* Sources + sync */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Company watchlist ({jobsData.sources.length})</div>
                    <button
                      onClick={async () => { setSyncing(true); setSyncReport(null); const r = await adminJobs({ action: 'sync_now' }); setSyncReport(r.report || null); setSyncing(false); fetchJobs() }}
                      disabled={syncing}
                      style={{ padding: '9px 18px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', border: 'none', color: 'white', fontSize: 12.5, fontWeight: 700, cursor: syncing ? 'wait' : 'pointer', opacity: syncing ? 0.7 : 1 }}
                    >
                      {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
                    </button>
                  </div>

                  {syncReport && (
                    <div style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                      {syncReport.map((r, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: r.error ? '#f87171' : 'rgba(255,255,255,0.65)', padding: '2px 0' }}>
                          {r.source}: {r.error ? `❌ ${r.error}` : `${r.fetched} fetched · ${r.fresh} new · ${r.kept} kept → pending · ${r.expired} expired`}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add source */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                    <input value={srcForm.company} onChange={e => setSrcForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" style={{ flex: 1, minWidth: 140, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                    <select value={srcForm.ats} onChange={e => setSrcForm(f => ({ ...f, ats: e.target.value }))} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }}>
                      <option value="greenhouse" style={{ background: '#111827' }}>Greenhouse</option>
                      <option value="lever" style={{ background: '#111827' }}>Lever</option>
                      <option value="ashby" style={{ background: '#111827' }}>Ashby</option>
                    </select>
                    <input value={srcForm.slug} onChange={e => setSrcForm(f => ({ ...f, slug: e.target.value }))} placeholder="board slug (e.g. razorpay)" style={{ flex: 1, minWidth: 140, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                    <button
                      onClick={async () => {
                        setSrcMsg('Testing board...')
                        const r = await adminJobs({ action: 'add_source', ...srcForm })
                        if (r.error) setSrcMsg(`❌ ${r.error}`)
                        else { setSrcMsg(`✓ Added — board has ${r.postingCount} live postings`); setSrcForm({ company: '', ats: 'greenhouse', slug: '' }); fetchJobs() }
                      }}
                      style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.35)', color: '#00D2FF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Add
                    </button>
                  </div>
                  {srcMsg && <p style={{ fontSize: 12.5, color: srcMsg.startsWith('❌') ? '#f87171' : '#6ee7b7', margin: '0 0 12px' }}>{srcMsg}</p>}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {jobsData.sources.map(s => (
                      <button
                        key={s.id}
                        onClick={async () => { await adminJobs({ action: 'toggle_source', id: s.id, active: !s.active }); fetchJobs() }}
                        title={s.active ? 'Click to pause' : 'Click to activate'}
                        style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: s.active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${s.active ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.12)'}`, color: s.active ? '#6ee7b7' : 'rgba(255,255,255,0.35)' }}
                      >
                        {s.company} · {s.ats}{!s.active && ' (paused)'}
                      </button>
                    ))}
                    {jobsData.sources.length === 0 && <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>No sources yet — add companies above. Slug = the last part of boards.greenhouse.io/&lt;slug&gt; or jobs.lever.co/&lt;slug&gt;.</span>}
                  </div>
                </div>

                {/* Manual add */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 12 }}>Add a job manually (LinkedIn / Naukri / anywhere)</div>
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
                          {['consulting', 'finance', 'marketing', 'bd', 'operations', 'founders_office', 'other'].map(d => <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>)}
                        </select>
                      </div>
                      <input value={manualForm.job_url} onChange={e => setManualForm(f => f && { ...f, job_url: e.target.value })} placeholder="Job URL *" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                      <textarea value={manualForm.jd_summary} onChange={e => setManualForm(f => f && { ...f, jd_summary: e.target.value })} placeholder="One-line summary" rows={2} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={async () => {
                            const r = await adminJobs({ action: 'manual_add', ...manualForm, publish: true })
                            if (r.error) setManualMsg(`❌ ${r.error}`)
                            else { setManualMsg('✓ Published'); setManualForm(null); setManualPaste(''); fetchJobs() }
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

                {/* Pending queue */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 12 }}>Pending review ({jobsData.pending.length})</div>
                  {jobsData.pending.length === 0 && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Queue is clear 🎉 Run a sync or add sources to fill it.</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {jobsData.pending.map(j => (
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

                {/* Published */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 12 }}>
                    Live on the board ({jobsData.counts.published}) <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600, fontSize: 12 }}>· {jobsData.counts.expired} expired</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jobsData.published.map(j => (
                      <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '9px 14px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
                          <span style={{ fontWeight: 700, color: 'white' }}>{j.company}</span> — {j.role} <span style={{ color: 'rgba(255,255,255,0.35)' }}>· {j.domain}</span>
                        </div>
                        <button onClick={() => jobAction('expire', j.id)} style={{ padding: '5px 12px', borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Take down</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tracker Tab */}
        {activeTab === 'tracker' && (
          <div>
            {trackerLoading && !trackerStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading tracker stats...</p>
            ) : !trackerStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load tracker stats. Has the tracker SQL been run?</p>
            ) : (
              <>
                {/* Headline stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    [String(trackerStats.totalUsers), 'Signups', `+${trackerStats.newUsers7d} this week`, '#7B61FF'],
                    [String(trackerStats.activeUsers7d), 'Active (7d)', 'touched their board', '#4F7CFF'],
                    [String(trackerStats.proUsers), 'Pro users', trackerStats.totalUsers ? `${Math.round((trackerStats.proUsers / trackerStats.totalUsers) * 100)}% conversion` : '—', '#10b981'],
                    [String(trackerStats.totalApps), 'Applications', `+${trackerStats.newApps7d} this week`, '#00D2FF'],
                    [String(trackerStats.aiThisMonth), 'AI generations', 'this month', '#f59e0b'],
                    [String(trackerStats.nurtureSent), 'Nurture emails', `+${trackerStats.nurtureSent7d} this week · ${trackerStats.optouts} opted out`, '#ef4444'],
                  ].map(([num, label, sub, color]) => (
                    <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: color as string }}>{num}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Pipeline breakdown */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>All applications by stage</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(trackerStats.byStatus).map(([status, n]) => {
                      const max = Math.max(1, ...Object.values(trackerStats.byStatus))
                      const colors: Record<string, string> = { saved: '#93BBFF', applied: '#4F7CFF', replied: '#00D2FF', interview: '#f59e0b', offer: '#10b981', rejected: '#ef4444' }
                      return (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 80, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                          <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(n / max) * 100}%`, background: colors[status], borderRadius: 6, minWidth: n > 0 ? 5 : 0 }} />
                          </div>
                          <span style={{ width: 40, fontSize: 13, fontWeight: 800, color: 'white', textAlign: 'right' }}>{n}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent signups */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Latest signups</div>
                  <table>
                    <thead>
                      <tr>
                        {['Name', 'Email', 'Plan', 'Joined'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trackerStats.recentUsers.map(u => (
                        <tr key={u.email}>
                          <td style={{ padding: '10px 12px', fontSize: 13.5, color: 'white', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.name || '—'}</td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,0.55)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: u.is_pro ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)', color: u.is_pro ? '#6ee7b7' : 'rgba(255,255,255,0.45)' }}>
                              {u.is_pro ? 'PRO' : 'FREE'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 12.5, color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Read Receipts Tab */}
        {activeTab === 'read-receipts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Live activity on the <a href="/read-receipts" target="_blank" rel="noopener noreferrer" style={{ color: '#c4b5fd' }}>read-receipts</a> tool — emails students are tracking and which ones are getting opened.</span>
              <button onClick={fetchRrStats} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(123,97,255,0.15)', border: '1px solid rgba(123,97,255,0.3)', color: '#c4b5fd', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            {rrLoading && !rrStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading read-receipts activity...</p>
            ) : !rrStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load. Has the read-receipts SQL been run?</p>
            ) : (
              <>
                {/* Headline stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    [String(rrStats.totalUsers), 'Users', `${rrStats.activeUsers7d} active this week`, '#7B61FF'],
                    [String(rrStats.totalTracked), 'Emails tracked', `+${rrStats.tracked7d} this week`, '#4F7CFF'],
                    [String(rrStats.totalOpens), 'Total opens', `+${rrStats.opens7d} this week`, '#6ee7b7'],
                    [`${rrStats.openRate}%`, 'Open rate', 'emails opened ≥1×', '#f59e0b'],
                  ].map(([num, label, sub, color]) => (
                    <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: color as string }}>{num}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Request classification breakdown (classify-and-store) */}
                {rrStats.breakdown && (
                  <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>Every pixel request, classified</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 }}>Nothing is dropped now. Only genuine opens are counted above; self and bot loads are recorded but excluded.</div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        ['Genuine opens', rrStats.breakdown.open, '#6ee7b7'],
                        ['Self (sender)', rrStats.breakdown.self, 'rgba(255,255,255,0.5)'],
                        ['Bots / scanners', rrStats.breakdown.bot, '#f59e0b'],
                      ].map(([lbl, n, c]) => (
                        <div key={lbl as string}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: c as string }}>{n as number}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{lbl as string}</div>
                        </div>
                      ))}
                      <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 20 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Open confidence</div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
                          <span style={{ color: '#6ee7b7', fontWeight: 700 }}>{rrStats.byConfidence.high}</span> high (direct device) · <span style={{ color: '#93BBFF', fontWeight: 700 }}>{rrStats.byConfidence.medium}</span> medium (via proxy)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emails being opened */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Emails being opened</div>
                  {rrStats.opened.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No opens recorded yet.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          {['Email', 'User', 'Opens', 'Last opened', 'Sent'].map(h => (
                            <th key={h} style={{ textAlign: h === 'Opens' ? 'right' : 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rrStats.opened.map((e, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{e.label || e.subject || 'Untitled'}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{e.owner_email || '—'}</td>
                            <td style={{ fontSize: 13, textAlign: 'right', color: '#6ee7b7', fontWeight: 700 }}>{e.opens}×</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{formatDate(e.lastOpened)}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>{formatDate(e.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Top users */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Most active users</div>
                  {rrStats.topUsers.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No users yet.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          {['User', 'Tracked', 'Opened'].map(h => (
                            <th key={h} style={{ textAlign: h === 'User' ? 'left' : 'right' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rrStats.topUsers.map((u, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{u.email || '—'}</td>
                            <td style={{ fontSize: 13, textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>{u.tracked}</td>
                            <td style={{ fontSize: 13, textAlign: 'right', color: '#6ee7b7', fontWeight: 700 }}>{u.opened}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Email Health Tab */}
        {activeTab === 'email-health' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Deliverability across every email (last 30 days), from Resend webhook events.</span>
              <button onClick={fetchEmailHealth} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            {emailHealthLoading && !emailHealth ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading email health...</p>
            ) : !emailHealth ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load. Has the email_events SQL been run?</p>
            ) : !emailHealth.configured ? (
              <div style={{ background: '#111827', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fcd34d', marginBottom: 10 }}>⚙️ No email events yet — finish setup</div>
                <ol style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                  <li>Run <code>supabase/email-events-schema.sql</code> in Supabase.</li>
                  <li>In Resend → Webhooks, add endpoint <code>https://www.beyond-campus.in/api/webhooks/resend</code> for the delivered / bounced / complained / opened events.</li>
                  <li>Copy that webhook&apos;s signing secret into Vercel as <code>RESEND_WEBHOOK_SECRET</code>, then redeploy.</li>
                </ol>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)', marginTop: 12, marginBottom: 0 }}>Data appears here from the next email sent after that. Nothing to backfill.</p>
              </div>
            ) : (
              <>
                {/* Headline rates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    [`${emailHealth.deliveredPct}%`, 'Delivered', `${emailHealth.delivered.toLocaleString()} of ${emailHealth.sent.toLocaleString()} sent`, '#10b981'],
                    [`${emailHealth.bouncePct}%`, 'Bounced', `${emailHealth.bounced} addresses`, emailHealth.bouncePct >= 5 ? '#ef4444' : emailHealth.bouncePct >= 2 ? '#f59e0b' : '#6ee7b7'],
                    [`${emailHealth.complaintPct}%`, 'Spam complaints', `${emailHealth.complained} flagged`, emailHealth.complaintPct >= 0.3 ? '#ef4444' : emailHealth.complaintPct >= 0.1 ? '#f59e0b' : '#6ee7b7'],
                    [`${emailHealth.openPct}%`, 'Opened', 'approx (privacy skews this)', '#4F7CFF'],
                  ].map(([num, label, sub, color]) => (
                    <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: color as string }}>{num}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Health read */}
                <div style={{ background: emailHealth.bouncePct >= 5 || emailHealth.complaintPct >= 0.3 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)', border: `1px solid ${emailHealth.bouncePct >= 5 || emailHealth.complaintPct >= 0.3 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.25)'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  {emailHealth.complaintPct >= 0.3
                    ? '🔴 Spam complaints are above 0.3% — mailbox providers will start junking you. Stop mailing cold or unengaged addresses and check your content.'
                    : emailHealth.bouncePct >= 5
                    ? '🔴 Bounce rate is above 5% — prune the failing addresses below; high bounces hurt your sender reputation.'
                    : '🟢 Bounce and complaint rates are in the healthy range (bounce under 2%, complaints under 0.1% is ideal).'}
                </div>

                {/* Recent problems */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Recent bounces &amp; complaints</div>
                  {emailHealth.problems.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>None in the last 30 days 🎉</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          {['Type', 'Address', 'Subject', 'When'].map(h => (
                            <th key={h} style={{ textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {emailHealth.problems.map((p, i) => (
                          <tr key={`${p.recipient}-${i}`}>
                            <td>
                              <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: p.event_type === 'email.complained' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', color: p.event_type === 'email.complained' ? '#f87171' : '#fcd34d' }}>
                                {p.event_type === 'email.complained' ? 'SPAM' : 'BOUNCE'}
                              </span>
                            </td>
                            <td style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{p.recipient || '—'}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{p.subject || '—'}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>{formatDate(p.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Apti Users Tab */}
        {activeTab === 'apti-users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Who is actually using <a href="/aptitude" target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b' }}>Apti</a> — separated from job-tracker users despite the shared login.</span>
              <button onClick={fetchAptiUsers} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            {aptiUsersLoading && !aptiStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading Apti user stats...</p>
            ) : !aptiStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load. Has the apti schema been run in Supabase?</p>
            ) : (
              <>
                {/* Headline stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    [String(aptiStats.totalUsers), 'Apti users', `+${aptiStats.newUsers7d} this week`, '#f59e0b'],
                    [String(aptiStats.activeUsers7d), 'Active (7d)', 'completed a set', '#4F7CFF'],
                    [String(aptiStats.activatedUsers), 'Activated', aptiStats.totalUsers ? `${Math.round((aptiStats.activatedUsers / aptiStats.totalUsers) * 100)}% did ≥1 set` : '—', '#10b981'],
                    [String(aptiStats.totalSets), 'Sets done', `+${aptiStats.sets7d} this week`, '#7B61FF'],
                    [`${aptiStats.accuracy}%`, 'Accuracy', `${aptiStats.totalAttempts.toLocaleString()} attempts`, '#00D2FF'],
                    [String(aptiStats.onStreak), 'On a streak', `${aptiStats.whatsappOptins} on WhatsApp`, '#ef4444'],
                  ].map(([num, label, sub, color]) => (
                    <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: color as string }}>{num}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Shared-login overlap — the "who logged in for what" answer */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>Apti vs Job Tracker — same login, different intent</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Every account matched by user id across both products.</div>
                  {(() => {
                    const o = aptiStats.overlap
                    const total = Math.max(1, o.aptiOnly + o.both + o.trackerOnly)
                    const seg = [
                      { label: 'Apti only', n: o.aptiOnly, color: '#f59e0b' },
                      { label: 'Both', n: o.both, color: '#7B61FF' },
                      { label: 'Tracker only', n: o.trackerOnly, color: '#4F7CFF' },
                    ]
                    return (
                      <>
                        <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                          {seg.map(s => s.n > 0 && (
                            <div key={s.label} title={`${s.label}: ${s.n}`} style={{ width: `${(s.n / total) * 100}%`, background: s.color, minWidth: 2 }} />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                          {seg.map(s => (
                            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block' }} />
                              <span style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>{s.n}</span>
                              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Lane breakdown */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>What they&apos;re prepping for (lane)</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Object.entries(aptiStats.laneBreakdown).map(([lane, n]) => {
                      const max = Math.max(1, ...Object.values(aptiStats.laneBreakdown))
                      const labels: Record<string, string> = { big4: 'Big 4', banking: 'Banking', fmcg: 'FMCG', any: 'Any / open', mba: 'MBA', unset: 'Not set' }
                      return (
                        <div key={lane} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ width: 90, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{labels[lane] ?? lane}</span>
                          <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(n / max) * 100}%`, background: '#f59e0b', borderRadius: 6, minWidth: n > 0 ? 5 : 0 }} />
                          </div>
                          <span style={{ width: 40, fontSize: 13, fontWeight: 800, color: 'white', textAlign: 'right' }}>{n}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recent signups */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Latest Apti signups</div>
                  <table>
                    <thead>
                      <tr>
                        {['Email', 'Lane', 'Streak', 'Top rating', 'Also tracker?', 'Joined'].map(h => (
                          <th key={h} style={{ textAlign: 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {aptiStats.recentUsers.map((u, i) => (
                        <tr key={`${u.email}-${i}`}>
                          <td style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{u.email}</td>
                          <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{u.lane || '—'}</td>
                          <td style={{ fontSize: 12.5, color: u.streak > 0 ? '#fcd34d' : 'rgba(255,255,255,0.35)' }}>{u.streak > 0 ? `🔥 ${u.streak}` : '—'}</td>
                          <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>{u.topRating ?? '—'}</td>
                          <td>
                            <span style={{ fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: u.alsoTracker ? 'rgba(79,124,255,0.12)' : 'rgba(255,255,255,0.06)', color: u.alsoTracker ? '#93BBFF' : 'rgba(255,255,255,0.35)' }}>
                              {u.alsoTracker ? 'BOTH' : 'APTI ONLY'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Consulting Casebooks Tab */}
        {activeTab === 'consulting' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Funnel for <a href="/resources/consulting" target="_blank" rel="noopener noreferrer" style={{ color: '#93BBFF' }}>/resources/consulting</a> — downloads → captured leads</span>
              <button onClick={fetchCasebookStats} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(79,124,255,0.15)', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            {casebookLoading && !casebookStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading casebook stats...</p>
            ) : !casebookStats ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load. Do the <code>resource_downloads</code> and <code>leads</code> tables exist?</p>
            ) : (
              <>
                {/* Headline stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  {[
                    [String(casebookStats.totalDownloads), 'Downloads', `+${casebookStats.downloads7d} this week`, '#4F7CFF'],
                    [String(casebookStats.totalLeads), 'Leads captured', `+${casebookStats.leads7d} this week`, '#10b981'],
                    [`${casebookStats.captureRate}%`, 'Capture rate', 'leads ÷ downloads', '#7B61FF'],
                  ].map(([num, label, sub, color]) => (
                    <div key={label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 20px' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: color as string }}>{num}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Per-resource breakdown */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 24, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>By resource</div>
                  <table>
                    <thead>
                      <tr>
                        {['Resource', 'Downloads', 'Leads', 'Capture'].map(h => (
                          <th key={h} style={{ textAlign: h === 'Resource' ? 'left' : 'right' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {casebookStats.perResource.map(r => (
                        <tr key={r.name}>
                          <td style={{ fontWeight: 600, color: 'white' }}>{r.name}</td>
                          <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>{r.downloads}</td>
                          <td style={{ textAlign: 'right', color: '#6ee7b7', fontWeight: 700 }}>{r.leads}</td>
                          <td style={{ textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>{r.downloads ? `${Math.round((r.leads / r.downloads) * 1000) / 10}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Recent leads */}
                <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Latest captured leads</div>
                  {casebookStats.recentLeads.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No leads captured yet.</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          {['Email', 'From resource', 'When'].map(h => (
                            <th key={h} style={{ textAlign: 'left' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {casebookStats.recentLeads.map((l, i) => (
                          <tr key={`${l.email}-${i}`}>
                            <td style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{l.email}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)' }}>{l.resource}</td>
                            <td style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>{formatDate(l.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* Weekly case drip — separate table, shown even if the stats above fail to load */}
            <div style={{ background: '#111827', border: '1px solid rgba(123,97,255,0.2)', borderRadius: 16, padding: 20, marginTop: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 4 }}>🧩 Weekly case drip</div>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: '0 0 16px', lineHeight: 1.6 }}>
                Published cases send every <strong style={{ color: '#c4b5fd' }}>Wednesday</strong> to people who downloaded a casebook — each person gets the next case they haven&apos;t seen, in order. Add cases here; they start unpublished.
              </p>

              {/* Add form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <input value={newCase.title} onChange={e => setNewCase(c => ({ ...c, title: e.target.value }))} placeholder="Case title (e.g. 'Market entry: D2C coffee brand')" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                <textarea value={newCase.prompt} onChange={e => setNewCase(c => ({ ...c, prompt: e.target.value }))} placeholder="The case prompt — the question the reader should crack. Line breaks are preserved." rows={4} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                <input value={newCase.hint} onChange={e => setNewCase(c => ({ ...c, hint: e.target.value }))} placeholder="Framework nudge (optional) — e.g. 'Think market size → competition → entry mode'" style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={addWeeklyCase} disabled={caseSaving} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#7B61FF,#4F7CFF)', border: 'none', color: 'white', fontSize: 12.5, fontWeight: 700, cursor: caseSaving ? 'wait' : 'pointer' }}>
                    {caseSaving ? 'Adding…' : '+ Add case'}
                  </button>
                  {caseMsg && <span style={{ fontSize: 12.5, color: caseMsg.startsWith('❌') ? '#f87171' : '#6ee7b7' }}>{caseMsg}</span>}
                </div>
              </div>

              {/* Case list */}
              {!weeklyCasesLoaded ? (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Loading cases…</p>
              ) : weeklyCases.length === 0 ? (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>No cases yet. Add your first above — nothing sends on Wednesday until at least one is published.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {weeklyCases.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.3)', flexShrink: 0, paddingTop: 2 }}>#{c.sort_order}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white' }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.5, whiteSpace: 'pre-line', maxHeight: 60, overflow: 'hidden' }}>{c.prompt}</div>
                        {c.hint && <div style={{ fontSize: 11.5, color: '#93BBFF', marginTop: 4 }}>💡 {c.hint}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => toggleWeeklyCase(c.id, !c.published)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', background: c.published ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c.published ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`, color: c.published ? '#6ee7b7' : 'rgba(255,255,255,0.4)' }}>
                          {c.published ? '● Live' : 'Draft'}
                        </button>
                        <button onClick={() => deleteWeeklyCase(c.id)} style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* Roasts Tab */}
        {activeTab === 'roasts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={fetchRoasts} style={{ padding: '10px 20px', borderRadius: 100, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
              {roastsLoading ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading roasts...</div>
              ) : roasts.length === 0 ? (
                <div style={{ padding: 60, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No roasts yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Grade</th>
                        <th>Domain</th>
                        <th>Tone</th>
                        <th>Date</th>
                        <th>Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roasts.map(r => (
                        <tr key={r.id}>
                          <td style={{ color: r.email ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)', fontStyle: r.email ? 'normal' : 'italic' }}>
                            {r.email || 'anonymous'}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, color: r.overall_score >= 70 ? '#4ade80' : r.overall_score >= 50 ? '#fcd34d' : '#f87171' }}>
                              {r.overall_score}/100
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 100, fontWeight: 700, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                              {r.grade} · {r.grade_label}
                            </span>
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{r.domain || '—'}</td>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: r.tone === 'savage' ? 'rgba(239,68,68,0.12)' : r.tone === 'recruiter' ? 'rgba(79,124,255,0.12)' : 'rgba(255,255,255,0.06)', color: r.tone === 'savage' ? '#f87171' : r.tone === 'recruiter' ? '#93BBFF' : 'rgba(255,255,255,0.5)', border: '1px solid', borderColor: r.tone === 'savage' ? 'rgba(239,68,68,0.2)' : r.tone === 'recruiter' ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.1)' }}>
                              {r.tone}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(r.created_at)}</td>
                          <td>
                            <a href={`/resources/resume-roast/results/${r.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#93BBFF', fontWeight: 600 }}>
                              View →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
              {roasts.length} roasts total · {roasts.filter(r => r.email).length} with email
            </div>
          </div>
        )}

        {/* Consultation Leads Tab */}
        {activeTab === 'leads' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Consultation Leads</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{consultationLeads.length} total · sorted by newest first</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={fetchConsultationLeads} style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  ↻ Refresh
                </button>
                <button
                  onClick={() => {
                    const headers = ['Name', 'Phone', 'Email', 'Interested In', 'College', 'Grad Year', 'Submitted At']
                    const rows = consultationLeads.map(l => [l.full_name, l.phone, l.email, l.interested_in, l.college || '', l.graduation_year || '', l.created_at])
                    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'consultation_leads.csv'; a.click()
                    URL.revokeObjectURL(url)
                  }}
                  style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  ↓ Export CSV
                </button>
              </div>
            </div>
            {consultationLeadsLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading leads...</div>
            ) : consultationLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>No consultation leads yet. They'll appear here after the first form submission.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Name', 'Phone', 'Email', 'Interested In', 'College', 'Grad Year', 'Submitted At'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consultationLeads.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '12px 12px', fontWeight: 600, color: 'white' }}>{lead.full_name}</td>
                        <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.7)' }}>
                          <a href={`tel:${lead.phone}`} style={{ color: '#93BBFF', textDecoration: 'none' }}>{lead.phone}</a>
                        </td>
                        <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.7)' }}>
                          <a href={`mailto:${lead.email}`} style={{ color: '#93BBFF', textDecoration: 'none' }}>{lead.email}</a>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: lead.interested_in.includes('Placement') ? 'rgba(123,97,255,0.15)' : lead.interested_in.includes('Internship') ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.08)', color: lead.interested_in.includes('Placement') ? '#C4B5FD' : lead.interested_in.includes('Internship') ? '#93BBFF' : 'rgba(255,255,255,0.5)', border: '1px solid', borderColor: lead.interested_in.includes('Placement') ? 'rgba(123,97,255,0.25)' : lead.interested_in.includes('Internship') ? 'rgba(79,124,255,0.25)' : 'rgba(255,255,255,0.1)' }}>
                            {lead.interested_in}
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{lead.college || '—'}</td>
                        <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{lead.graduation_year || '—'}</td>
                        <td style={{ padding: '12px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 12, whiteSpace: 'nowrap' }}>
                          {new Date(lead.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Application, AppStatus, TrackerProfile, todayStr, addDays } from '@/app/components/tracker/types'
import KanbanBoard from '@/app/components/tracker/KanbanBoard'
import QuickAddModal, { NewApplication } from '@/app/components/tracker/QuickAddModal'
import ApplicationDrawer from '@/app/components/tracker/ApplicationDrawer'
import TodayQueue from '@/app/components/tracker/TodayQueue'
import StreakWidget from '@/app/components/tracker/StreakWidget'
import WeeklyGoalRing from '@/app/components/tracker/WeeklyGoalRing'
import InsightsDigest from '@/app/components/tracker/InsightsDigest'
import ShareCardModal from '@/app/components/tracker/ShareCardModal'
import ProUpgradeModal from '@/app/components/tracker/ProUpgradeModal'
import { GRAD, Icon } from '@/app/components/tracker/ui'

export default function TrackerPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TrackerProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [quickAdd, setQuickAdd] = useState<AppStatus | null>(null)
  const [drawer, setDrawer] = useState<{ app: Application; aiTab: boolean } | null>(null)
  const [upgradeReason, setUpgradeReason] = useState<'ai_cap' | 'analytics' | 'extract' | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRoastNudge, setShowRoastNudge] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/tracker'); return }

      // bootstrap profile (covers email signups & pre-existing students)
      await supabase.from('tracker_profiles').upsert(
        { user_id: user.id, email: user.email, name: user.user_metadata?.full_name || user.user_metadata?.name || null },
        { onConflict: 'user_id', ignoreDuplicates: true }
      )

      // server-side entitlement sync (grandfathers resource-pack buyers into Pro)
      fetch('/api/tracker/usage').then(r => r.json()).then(u => {
        if (cancelled) return
        if (u.isPro) setProfile(p => p ? { ...p, is_pro: true } : p)
        if (u.hasRoast === false && !localStorage.getItem('bc_roast_nudge_dismissed')) setShowRoastNudge(true)
      }).catch(() => {})

      const [{ data: prof }, { data: apps }] = await Promise.all([
        supabase.from('tracker_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
      ])
      if (cancelled) return
      if (prof) setProfile(prof)
      setApplications(apps || [])
      setLoading(false)
    }
    loadAll()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keyboard shortcuts: n = new application, / = search, Esc = close overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
      if (e.key === 'Escape') {
        setQuickAdd(null); setDrawer(null); setShowShare(false); setShowSettings(false)
        ;(e.target as HTMLElement)?.blur?.()
        return
      }
      if (typing) return
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setQuickAdd('saved') }
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAdd = async (newApp: NewApplication): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'You are signed out. Refresh and log in again.'
    const { data, error } = await supabase.from('applications').insert({ ...newApp, user_id: user.id }).select().single()
    if (error) {
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        return 'The tracker database is not set up yet. (Admin: run supabase/tracker-schema.sql in the Supabase SQL editor.)'
      }
      return `Could not save: ${error.message}`
    }
    setApplications(apps => [data, ...apps])
    return null
  }

  const handleUpdate = async (id: string, patch: Partial<Application>) => {
    setApplications(apps => apps.map(a => (a.id === id ? { ...a, ...patch } as Application : a)))
    await supabase.from('applications').update(patch).eq('id', id)
    // re-pull the row so trigger-set fields (applied_at, status_changed_at) stay in sync
    const { data } = await supabase.from('applications').select('*').eq('id', id).single()
    if (data) setApplications(apps => apps.map(a => (a.id === id ? data : a)))
  }

  const handleMove = async (app: Application, status: AppStatus) => {
    const patch: Partial<Application> = { status }
    if (status === 'applied' && !app.applied_at) {
      patch.applied_at = todayStr()
      if (!app.follow_up_date) patch.follow_up_date = addDays(todayStr(), 5)
    }
    if (['offer', 'rejected'].includes(status)) patch.follow_up_date = null
    await handleUpdate(app.id, patch)
  }

  const handleDelete = async (id: string) => {
    setApplications(apps => apps.filter(a => a.id !== id))
    setDrawer(null)
    await supabase.from('applications').delete().eq('id', id)
  }

  const handleSnooze = async (app: Application, newDate: string) => {
    await handleUpdate(app.id, { follow_up_date: newDate })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const updateSettings = async (patch: { weekly_goal?: number; email_reminders_enabled?: boolean }) => {
    if (!profile) return
    setProfile({ ...profile, ...patch })
    await supabase.from('tracker_profiles').update(patch).eq('user_id', profile.user_id)
  }

  const openUpgrade = (reason: 'ai_cap' | 'analytics' | 'extract' | null) => {
    setUpgradeReason(reason)
    setShowUpgrade(true)
  }

  const active = applications.filter(a => !['offer', 'rejected'].includes(a.status))
  const replies = applications.filter(a => ['replied', 'interview', 'offer'].includes(a.status)).length
  const interviews = applications.filter(a => ['interview', 'offer'].includes(a.status)).length

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '0 0 80px' }}>
        <style>{`
          @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
          .sk { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 800px 100%; animation: shimmer 1.4s linear infinite; border-radius: 14px; }
        `}</style>
        <div style={{ height: 61, borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 24px 0' }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, alignItems: 'center' }}>
            <div className="sk" style={{ width: 280, height: 44, marginRight: 'auto' }} />
            <div className="sk" style={{ width: 130, height: 62, borderRadius: 16 }} />
            <div className="sk" style={{ width: 170, height: 62, borderRadius: 16 }} />
          </div>
          <div style={{ display: 'flex', gap: 14, overflow: 'hidden' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ flex: '0 0 256px' }}>
                <div className="sk" style={{ height: 34, marginBottom: 12, borderRadius: 12 }} />
                {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
                  <div key={j} className="sk" style={{ height: 88, marginBottom: 10 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '0 0 80px', position: 'relative', overflow: 'clip' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 100px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .bc-navlink { transition: color 0.15s, background 0.15s; }
        .bc-navlink:hover { color: white !important; background: rgba(255,255,255,0.06); }
        .bc-fab:hover { transform: scale(1.07); box-shadow: 0 14px 40px rgba(79,124,255,0.6); }
        .bc-search:focus-within { border-color: rgba(79,124,255,0.5) !important; box-shadow: 0 0 0 3px rgba(79,124,255,0.12); }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .form-grid-2 { grid-template-columns: 1fr; }
          /* inputs under 16px trigger iOS Safari auto-zoom on focus */
          input, select, textarea { font-size: 16px !important; }
        }
      `}</style>

      {/* ambient background glows */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(900px 480px at 85% -8%, rgba(123,97,255,0.13), transparent 65%), radial-gradient(700px 420px at -5% 12%, rgba(79,124,255,0.09), transparent 60%)' }} />

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.82)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '6px 14px', background: GRAD, borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1, boxShadow: '0 4px 16px rgba(79,124,255,0.35)' }}>BEYOND CAMPUS</span>
          </Link>

          {/* segmented nav */}
          <nav style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 3 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, background: 'rgba(255,255,255,0.09)', color: 'white', fontSize: 12.5, fontWeight: 700 }}>
              <Icon name="target" size={13} /><span className="hide-mobile">Board</span>
            </span>
            <Link href="/tracker/jobs" className="bc-navlink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
              <Icon name="briefcase" size={13} /><span className="hide-mobile">Jobs</span>
              <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 100, background: GRAD, color: 'white', letterSpacing: 0.5 }}>NEW</span>
            </Link>
            <Link href="/tracker/analytics" className="bc-navlink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
              <Icon name="chart" size={13} /><span className="hide-mobile">Analytics</span>
            </Link>
            <Link href="/practice" className="bc-navlink" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 13px', borderRadius: 9, color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
              <Icon name="brain" size={13} /><span className="hide-mobile">Apti</span>
              <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 100, background: GRAD, color: 'white', letterSpacing: 0.5 }}>NEW</span>
            </Link>
          </nav>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {profile?.is_pro ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', padding: '5px 11px', borderRadius: 100, letterSpacing: 0.5 }}>
                <Icon name="zap" size={11} /> PRO
              </span>
            ) : (
              <button onClick={() => openUpgrade(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', padding: '5px 11px', borderRadius: 100, letterSpacing: 0.5, cursor: 'pointer' }}>
                <Icon name="zap" size={11} /> GO PRO ₹299
              </button>
            )}
            <button onClick={() => setShowShare(true)} title="Share your stats" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <Icon name="share" size={14} />
            </button>
            <button onClick={() => setShowSettings(v => !v)} title="Settings" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: showSettings ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
              <Icon name="settings" size={14} />
            </button>
            <button onClick={handleSignOut} title="Sign out" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
              <Icon name="logout" size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings popover */}
      {showSettings && profile && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: 24, top: 8, zIndex: 60, background: 'linear-gradient(180deg, #1a2236, #151c2e)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, width: 290, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', animation: 'cardIn 0.18s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700 }}>
              <Icon name="settings" size={14} /> Preferences
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8 }}>Weekly application goal</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[3, 5, 10, 15].map(g => (
                  <button key={g} onClick={() => updateSettings({ weekly_goal: g })} style={{ flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', background: profile.weekly_goal === g ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${profile.weekly_goal === g ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`, color: profile.weekly_goal === g ? '#93BBFF' : 'rgba(255,255,255,0.5)' }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={profile.email_reminders_enabled}
                onChange={e => updateSettings({ email_reminders_enabled: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: '#4F7CFF' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Daily follow-up reminder emails</span>
            </label>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 24px 0', position: 'relative' }}>

        {/* Greeting + stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ marginRight: 'auto' }}>
            <h1 style={{ color: 'white', fontSize: 27, fontWeight: 800, margin: 0, letterSpacing: -0.7 }}>
              {profile?.name ? `Let's go, ${profile.name.split(' ')[0]} 💪` : "Let's get you hired 💪"}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, margin: '4px 0 0' }}>
              {applications.length === 0
                ? 'Add your first application below.'
                : <>{active.length} active · {replies} repl{replies === 1 ? 'y' : 'ies'} · {interviews} interview{interviews === 1 ? '' : 's'}</>}
            </p>
          </div>
          <StreakWidget applications={applications} />
          <WeeklyGoalRing applications={applications} goal={profile?.weekly_goal || 5} />
        </div>

        <TodayQueue
          applications={applications}
          onOpenApp={(app, aiTab) => setDrawer({ app, aiTab })}
          onSnooze={handleSnooze}
        />

        <InsightsDigest isPro={!!profile?.is_pro} appCount={applications.length} onUpgradeClick={() => openUpgrade('analytics')} />

        {/* Resume Roast cross-sell — roast data makes the AI emails sharper */}
        {showRoastNudge && applications.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 18, padding: '14px 18px', marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.14)', color: '#f87171', flexShrink: 0 }}>
              <Icon name="flame" size={17} />
            </span>
            <p style={{ flex: 1, minWidth: 220, color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>
              <span style={{ fontWeight: 700, color: 'white' }}>Make your AI emails sharper.</span> Get your resume roasted (free, 30 seconds) and the AI writer will weave your real achievements into every cold email.
            </p>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <a href="/resources/resume-roast" style={{ padding: '9px 16px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                Roast my resume →
              </a>
              <button
                onClick={() => { localStorage.setItem('bc_roast_nudge_dismissed', '1'); setShowRoastNudge(false) }}
                style={{ display: 'flex', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}
              >
                <Icon name="x" size={14} />
              </button>
            </div>
          </div>
        )}

        {/* First-run empty state */}
        {applications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '54px 20px', background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01))', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 24, marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 24, background: 'linear-gradient(135deg, rgba(79,124,255,0.18), rgba(123,97,255,0.12))', border: '1px solid rgba(79,124,255,0.3)', color: '#93BBFF', marginBottom: 18, boxShadow: '0 0 40px rgba(79,124,255,0.2)' }}>
              <Icon name="target" size={34} strokeWidth={1.6} />
            </div>
            <h2 style={{ color: 'white', fontSize: 21, fontWeight: 800, margin: '0 0 8px', letterSpacing: -0.4 }}>Your pipeline starts here</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.6 }}>
              Paste any job link or JD and AI fills in the details. Every application gets a follow-up reminder, so nothing slips through.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setQuickAdd('saved')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: GRAD, color: 'white', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.35)' }}
              >
                <Icon name="sparkles" size={15} /> Add your first application
              </button>
              <Link
                href="/tracker/jobs"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 14.5, textDecoration: 'none' }}
              >
                <Icon name="briefcase" size={15} /> Browse fresh openings
              </Link>
            </div>
          </div>
        )}

        {/* Board toolbar */}
        {applications.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
            <div className="bc-search" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '9px 14px', width: 300, maxWidth: '100%', transition: 'border-color 0.15s, box-shadow 0.15s' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', display: 'flex' }}><Icon name="search" size={14} /></span>
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search company or role..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 13.5 }}
              />
              {search ? (
                <button onClick={() => setSearch('')} style={{ display: 'flex', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  <Icon name="x" size={13} />
                </button>
              ) : (
                <kbd className="hide-mobile" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px', fontFamily: 'inherit' }}>/</kbd>
              )}
            </div>
            <span className="hide-mobile" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
              press <kbd style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 7px', fontFamily: 'inherit' }}>n</kbd> to add an application
            </span>
          </div>
        )}

        <KanbanBoard
          applications={applications}
          filter={search}
          onOpen={app => setDrawer({ app, aiTab: false })}
          onMove={handleMove}
          onQuickAdd={status => setQuickAdd(status)}
        />
      </div>

      {/* Floating add button */}
      <button
        className="bc-fab"
        onClick={() => setQuickAdd('saved')}
        title="Add application (n)"
        style={{ position: 'fixed', bottom: 26, right: 26, zIndex: 60, width: 58, height: 58, borderRadius: '50%', background: GRAD, border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 10px 30px rgba(79,124,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.18s, box-shadow 0.18s' }}
      >
        <Icon name="plus" size={24} strokeWidth={2.2} />
      </button>

      {quickAdd && (
        <QuickAddModal
          initialStatus={quickAdd}
          isPro={!!profile?.is_pro}
          onClose={() => setQuickAdd(null)}
          onAdd={handleAdd}
          onProRequired={() => { setQuickAdd(null); openUpgrade('extract') }}
        />
      )}

      {drawer && (
        <ApplicationDrawer
          app={applications.find(a => a.id === drawer.app.id) || drawer.app}
          initialTab={drawer.aiTab ? 'ai' : 'details'}
          onClose={() => setDrawer(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAiCapHit={() => openUpgrade('ai_cap')}
        />
      )}

      {showShare && <ShareCardModal applications={applications} name={profile?.name || null} onClose={() => setShowShare(false)} />}

      {showUpgrade && profile && (
        <ProUpgradeModal
          email={profile.email}
          name={profile.name}
          reason={upgradeReason}
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); setProfile({ ...profile, is_pro: true }) }}
        />
      )}
    </main>
  )
}

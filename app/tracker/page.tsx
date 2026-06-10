'use client'

import { useEffect, useState } from 'react'
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

export default function TrackerPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TrackerProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [quickAdd, setQuickAdd] = useState<AppStatus | null>(null)
  const [drawer, setDrawer] = useState<{ app: Application; aiTab: boolean } | null>(null)
  const [upgradeReason, setUpgradeReason] = useState<'ai_cap' | 'analytics' | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showRoastNudge, setShowRoastNudge] = useState(false)
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

  const openUpgrade = (reason: 'ai_cap' | 'analytics' | null) => {
    setUpgradeReason(reason)
    setShowUpgrade(true)
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, animation: 'pulse 1.2s infinite' }}>Loading your pipeline...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '0 0 80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 100px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .form-grid-2 { grid-template-columns: 1fr; }
          /* inputs under 16px trigger iOS Safari auto-zoom on focus */
          input, select, textarea { font-size: 16px !important; }
        }
      `}</style>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1 }}>BEYOND CAMPUS</span>
            <span className="hide-mobile" style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Job Tracker</span>
          </Link>
          {profile?.is_pro ? (
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', padding: '4px 10px', borderRadius: 100, letterSpacing: 0.5 }}>PRO</span>
          ) : (
            <button onClick={() => openUpgrade(null)} style={{ fontSize: 10.5, fontWeight: 800, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', padding: '4px 10px', borderRadius: 100, letterSpacing: 0.5, cursor: 'pointer' }}>
              GO PRO ₹299
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/tracker/jobs" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              💼<span className="hide-mobile"> Jobs</span>
              <span style={{ fontSize: 8.5, fontWeight: 800, padding: '2px 6px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', letterSpacing: 0.5 }}>NEW</span>
            </Link>
            <Link href="/tracker/analytics" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>📊<span className="hide-mobile"> Analytics</span></Link>
            <button onClick={() => setShowShare(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, padding: '7px 12px', cursor: 'pointer' }}>
              <span className="hide-mobile">Share </span>📤
            </button>
            <button onClick={() => setShowSettings(v => !v)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13, padding: '7px 11px', cursor: 'pointer' }}>
              ⚙️
            </button>
            <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12.5, cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Settings popover */}
      {showSettings && profile && (
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ position: 'absolute', right: 24, top: 8, zIndex: 60, background: '#1a2236', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, width: 280, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
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

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 24px 0' }}>

        {/* Greeting + widgets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ marginRight: 'auto' }}>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              {profile?.name ? `Let's go, ${profile.name.split(' ')[0]} 💪` : "Let's get you hired 💪"}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, margin: '4px 0 0' }}>
              {applications.length === 0 ? 'Add your first application below.' : `${applications.length} application${applications.length === 1 ? '' : 's'} in your pipeline`}
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
            <span style={{ fontSize: 22, flexShrink: 0 }}>🔥</span>
            <p style={{ flex: 1, minWidth: 220, color: 'rgba(255,255,255,0.7)', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>
              <span style={{ fontWeight: 700, color: 'white' }}>Make your AI emails sharper.</span> Get your resume roasted (free, 30 seconds) and the AI writer will weave your real achievements into every cold email.
            </p>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <a href="/resources/resume-roast" style={{ padding: '9px 16px', borderRadius: 100, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                Roast my resume →
              </a>
              <button
                onClick={() => { localStorage.setItem('bc_roast_nudge_dismissed', '1'); setShowRoastNudge(false) }}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* First-run empty state */}
        {applications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Your pipeline starts here</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Paste any job link or JD and AI fills in the details. Every application gets a follow-up reminder, so nothing slips through.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setQuickAdd('saved')}
                style={{ padding: '13px 28px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.35)' }}
              >
                ✨ Add your first application
              </button>
              <Link
                href="/tracker/jobs"
                style={{ padding: '13px 28px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 14.5, textDecoration: 'none' }}
              >
                💼 Browse fresh openings →
              </Link>
            </div>
          </div>
        )}

        <KanbanBoard
          applications={applications}
          onOpen={app => setDrawer({ app, aiTab: false })}
          onMove={handleMove}
          onQuickAdd={status => setQuickAdd(status)}
        />
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setQuickAdd('saved')}
        title="Add application"
        style={{ position: 'fixed', bottom: 26, right: 26, zIndex: 60, width: 58, height: 58, borderRadius: '50%', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', border: 'none', color: 'white', fontSize: 26, cursor: 'pointer', boxShadow: '0 10px 30px rgba(79,124,255,0.5)' }}
      >
        +
      </button>

      {quickAdd && (
        <QuickAddModal
          initialStatus={quickAdd}
          onClose={() => setQuickAdd(null)}
          onAdd={handleAdd}
          onAiCapHit={() => { setQuickAdd(null); openUpgrade('ai_cap') }}
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

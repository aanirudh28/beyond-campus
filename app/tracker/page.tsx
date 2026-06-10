'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Application, AppStatus, TrackerProfile, todayStr, addDays, FREE_APP_CAP } from '@/app/components/tracker/types'
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
  const [upgradeReason, setUpgradeReason] = useState<'app_cap' | 'ai_cap' | 'analytics' | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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
        if (!cancelled && u.isPro) setProfile(p => p ? { ...p, is_pro: true } : p)
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

  const handleAdd = async (newApp: NewApplication): Promise<boolean> => {
    const { data, error } = await supabase.from('applications').insert(newApp).select().single()
    if (error) {
      if (error.message.includes('FREE_CAP_REACHED')) {
        setQuickAdd(null)
        setUpgradeReason('app_cap')
        setShowUpgrade(true)
      }
      return false
    }
    setApplications(apps => [data, ...apps])
    return true
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

  const openUpgrade = (reason: 'app_cap' | 'ai_cap' | 'analytics' | null) => {
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
      `}</style>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '6px 14px', background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', borderRadius: 100, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: 1 }}>BEYOND CAMPUS</span>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Job Tracker</span>
          </Link>
          {profile?.is_pro ? (
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', padding: '4px 10px', borderRadius: 100, letterSpacing: 0.5 }}>PRO</span>
          ) : (
            <button onClick={() => openUpgrade(null)} style={{ fontSize: 10.5, fontWeight: 800, color: '#93BBFF', background: 'rgba(79,124,255,0.12)', border: '1px solid rgba(79,124,255,0.3)', padding: '4px 10px', borderRadius: 100, letterSpacing: 0.5, cursor: 'pointer' }}>
              GO PRO ₹299
            </button>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href="/tracker/analytics" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>📊 Analytics</Link>
            <button onClick={() => setShowShare(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontSize: 12.5, fontWeight: 600, padding: '7px 12px', cursor: 'pointer' }}>
              Share 📤
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
              {applications.length === 0 ? 'Add your first application below.' : `${applications.length} application${applications.length === 1 ? '' : 's'} in your pipeline${!profile?.is_pro ? ` · ${FREE_APP_CAP - applications.length} left on free` : ''}`}
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

        {/* First-run empty state */}
        {applications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🎯</div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 8px' }}>Your pipeline starts here</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Paste any job link or JD and AI fills in the details. Every application gets a follow-up reminder, so nothing slips through.
            </p>
            <button
              onClick={() => setQuickAdd('saved')}
              style={{ padding: '13px 28px', borderRadius: 100, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14.5, border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(79,124,255,0.35)' }}
            >
              ✨ Add your first application
            </button>
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

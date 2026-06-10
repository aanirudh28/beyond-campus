'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Application, TrackerProfile, sourceLabel, AppSource } from '@/app/components/tracker/types'
import ProGate from '@/app/components/tracker/ProGate'
import ProUpgradeModal from '@/app/components/tracker/ProUpgradeModal'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TrackerProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/tracker/analytics'); return }
      const [{ data: prof }, { data: apps }] = await Promise.all([
        supabase.from('tracker_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('applications').select('*'),
      ])
      if (prof) setProfile(prof)
      setApplications(apps || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applied = applications.filter(a => a.status !== 'saved')
  const repliedPlus = applied.filter(a => ['replied', 'interview', 'offer'].includes(a.status))
  const interviewPlus = applied.filter(a => ['interview', 'offer'].includes(a.status))
  const offers = applied.filter(a => a.status === 'offer')

  const funnel = [
    { label: 'Applied', count: applied.length, color: '#4F7CFF' },
    { label: 'Got a reply', count: repliedPlus.length, color: '#00D2FF' },
    { label: 'Interview', count: interviewPlus.length, color: '#f59e0b' },
    { label: 'Offer', count: offers.length, color: '#10b981' },
  ]
  const maxFunnel = Math.max(1, applied.length)

  // reply rate by source
  const sourceStats = Object.entries(
    applied.reduce<Record<string, { total: number; replied: number }>>((acc, app) => {
      const s = app.source || 'other'
      acc[s] = acc[s] || { total: 0, replied: 0 }
      acc[s].total++
      if (['replied', 'interview', 'offer'].includes(app.status)) acc[s].replied++
      return acc
    }, {})
  ).sort((a, b) => b[1].total - a[1].total)

  // applications by weekday
  const weekdayCounts = WEEKDAYS.map(() => 0)
  for (const app of applied) {
    if (!app.applied_at) continue
    const day = new Date(app.applied_at + 'T00:00:00').getDay()
    weekdayCounts[day === 0 ? 6 : day - 1]++
  }
  const maxWeekday = Math.max(1, ...weekdayCounts)

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Crunching your numbers...</div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '0 0 80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        @keyframes growBar { from { width: 0; } }
        @keyframes growCol { from { height: 0; } }
      `}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/tracker" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>← Back to board</a>
          <h1 style={{ color: 'white', fontSize: 17, fontWeight: 800, margin: 0 }}>Analytics</h1>
          {profile?.is_pro && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', padding: '4px 10px', borderRadius: 100 }}>PRO</span>}
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '30px 24px 0' }}>

        {applied.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)', fontSize: 14.5, lineHeight: 1.7 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            No applications sent yet — your analytics light up once you start applying.<br />
            <a href="/tracker" style={{ color: '#93BBFF', textDecoration: 'none', fontWeight: 700 }}>Go apply to something →</a>
          </div>
        ) : (
          <>
            {/* Headline numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                [String(applied.length), 'Applications sent'],
                [`${applied.length ? Math.round((repliedPlus.length / applied.length) * 100) : 0}%`, 'Reply rate'],
                [`${applied.length ? Math.round((interviewPlus.length / applied.length) * 100) : 0}%`, 'Interview rate'],
                [String(offers.length), 'Offers'],
              ].map(([num, label]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '18px 20px' }}>
                  <div style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>{num}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Funnel — free for everyone */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
              <h2 style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: '0 0 18px' }}>Your funnel</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {funnel.map((stage, i) => (
                  <div key={stage.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600 }}>{stage.label}</span>
                      <span style={{ color: 'white', fontSize: 13, fontWeight: 800 }}>
                        {stage.count}
                        {i > 0 && funnel[i - 1].count > 0 && (
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}> · {Math.round((stage.count / funnel[i - 1].count) * 100)}% of prev</span>
                        )}
                      </span>
                    </div>
                    <div style={{ height: 26, background: 'rgba(255,255,255,0.04)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(stage.count / maxFunnel) * 100}%`, background: `linear-gradient(90deg, ${stage.color}cc, ${stage.color})`, borderRadius: 8, animation: 'growBar 0.7s ease-out', minWidth: stage.count > 0 ? 8 : 0 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro section: source + weekday */}
            <ProGate isPro={!!profile?.is_pro} onUpgradeClick={() => setShowUpgrade(true)} label="See what's actually working">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
                  <h2 style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>Reply rate by source</h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12.5, margin: '0 0 16px' }}>Double down on what gets replies.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {sourceStats.map(([src, stat]) => {
                      const rate = Math.round((stat.replied / stat.total) * 100)
                      return (
                        <div key={src}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600 }}>{sourceLabel(src as AppSource)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>· {stat.total} sent</span></span>
                            <span style={{ color: rate >= 30 ? '#6ee7b7' : 'white', fontSize: 13, fontWeight: 800 }}>{rate}%</span>
                          </div>
                          <div style={{ height: 18, background: 'rgba(255,255,255,0.04)', borderRadius: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${rate}%`, background: 'linear-gradient(90deg, #4F7CFF, #7B61FF)', borderRadius: 6, animation: 'growBar 0.7s ease-out', minWidth: stat.replied > 0 ? 6 : 0 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
                  <h2 style={{ color: 'white', fontSize: 16, fontWeight: 800, margin: '0 0 6px' }}>When you apply</h2>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12.5, margin: '0 0 16px' }}>Tue–Thu mornings get the most recruiter eyes.</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
                    {WEEKDAYS.map((day, i) => (
                      <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700 }}>{weekdayCounts[i] || ''}</span>
                        <div style={{ width: '100%', maxWidth: 34, height: `${(weekdayCounts[i] / maxWeekday) * 80}%`, minHeight: weekdayCounts[i] > 0 ? 6 : 2, background: weekdayCounts[i] === maxWeekday && weekdayCounts[i] > 0 ? 'linear-gradient(180deg, #7B61FF, #4F7CFF)' : 'rgba(255,255,255,0.1)', borderRadius: 6, animation: 'growCol 0.7s ease-out' }} />
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5 }}>{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ProGate>
          </>
        )}
      </div>

      {showUpgrade && profile && (
        <ProUpgradeModal
          email={profile.email}
          name={profile.name}
          reason="analytics"
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); setProfile({ ...profile, is_pro: true }) }}
        />
      )}
    </main>
  )
}

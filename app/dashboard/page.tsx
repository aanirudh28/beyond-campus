'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Profile = {
  id: string
  name: string
  email: string
  stage: number
  cold_emails_sent: number
  interview_calls: number
  is_placed: boolean
  joined_at: string
}

type Booking = {
  id: string
  type: string
  amount: number
  created_at: string
}

const STAGES = [
  { icon: '🎯', label: 'Joined Beyond Campus' },
  { icon: '📄', label: 'Resume Reviewed' },
  { icon: '📧', label: 'Started Outreach' },
  { icon: '📞', label: 'Got Interview Call' },
  { icon: '🎉', label: 'Got Placed!' },
]

const RESOURCES = [
  { icon: '📧', title: 'Cold Email Templates', desc: '50+ proven templates that get replies', link: 'https://drive.google.com' },
  { icon: '💼', title: 'Resume Template', desc: 'ATS-optimized for the Indian job market', link: 'https://drive.google.com' },
  { icon: '🔗', title: 'LinkedIn DM Scripts', desc: 'Word-for-word scripts for HRs & SDEs', link: 'https://drive.google.com' },
  { icon: '📋', title: 'Company Hit List', desc: '200+ companies actively hiring off-campus', link: 'https://drive.google.com' },
]

const getMonday = () => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

const getMotivationalLine = (stage: number, firstName: string) => {
  if (stage === 1) return `Let's get started, ${firstName}. First up — get your resume sorted.`
  if (stage === 2) return "Resume done. Time to flood inboxes 📧"
  if (stage === 3) return "You're in outreach mode. Consistency wins here. Keep going."
  if (stage === 4) return "Interview calls coming in — now it's prep time 💪"
  return "You got placed! You're an inspiration to the whole community 🎉"
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const [coldEmails, setColdEmails] = useState(0)
  const [gotInterview, setGotInterview] = useState<boolean | null>(null)
  const [mood, setMood] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkinDone, setCheckinDone] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const [profileRes, bookingsRes, checkinRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('bookings').select('id, type, amount, created_at').eq('email', user.email).order('created_at', { ascending: false }),
      supabase.from('checkins').select('id').eq('user_id', user.id).eq('week_start', getMonday()).maybeSingle(),
    ])

    if (profileRes.data) setProfile(profileRes.data)
    if (bookingsRes.data) setBookings(bookingsRes.data)
    if (checkinRes.data) setHasCheckedIn(true)
    setLoading(false)
  }

  const handleCheckin = async () => {
    if (gotInterview === null) { alert('Please answer whether you got any interview calls.'); return }
    if (!mood) { alert('Please select your mood.'); return }
    if (!profile) return
    setCheckingIn(true)

    let newStage = profile.stage
    const newColdEmails = profile.cold_emails_sent + coldEmails
    const newInterviewCalls = gotInterview ? profile.interview_calls + 1 : profile.interview_calls

    if (newColdEmails > 0 && newStage < 3) newStage = 3
    if (gotInterview && newStage < 4) newStage = 4

    await Promise.all([
      supabase.from('checkins').insert({
        user_id: profile.id,
        cold_emails: coldEmails,
        got_interview: gotInterview,
        mood,
        week_start: getMonday(),
      }),
      supabase.from('profiles').update({
        cold_emails_sent: newColdEmails,
        interview_calls: newInterviewCalls,
        stage: newStage,
      }).eq('id', profile.id),
    ])

    setCheckinDone(true)
    setCheckingIn(false)
    setHasCheckedIn(true)
    loadData()
  }

  const handleMarkResumeReviewed = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ stage: 2 }).eq('id', profile.id)
    loadData()
  }

  const handleMarkPlaced = async () => {
    if (!profile) return
    await supabase.from('profiles').update({ stage: 5, is_placed: true }).eq('id', profile.id)
    loadData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>Loading your dashboard...</div>
      </main>
    )
  }

  if (!profile) return null

  const daysSinceJoined = Math.max(0, Math.floor((Date.now() - new Date(profile.joined_at).getTime()) / (1000 * 60 * 60 * 24)))
  const firstName = profile.name.split(' ')[0]

  return (
    <main style={{ minHeight: '100vh', background: '#0B0B0F', fontFamily: "'DM Sans', sans-serif", padding: '32px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        input[type=number] { -moz-appearance: textfield; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#4F7CFF' }}>Beyond Campus</div>
          <button onClick={handleSignOut} style={{ padding: '8px 18px', borderRadius: 100, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>

        {/* ── Section 1: Hero ── */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 36px', marginBottom: 16 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: -0.5 }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: '#4F7CFF', fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>
            Day {daysSinceJoined + 1} on Beyond Campus
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, margin: 0 }}>
            {getMotivationalLine(profile.stage, firstName)}
          </p>
        </div>

        {/* ── Section 2: Journey Progress ── */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 36px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 28px', letterSpacing: -0.2 }}>Your Journey</h2>

          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {STAGES.map((stage, i) => {
              const stageNum = i + 1
              const isCompleted = profile.stage > stageNum
              const isCurrent = profile.stage === stageNum
              const isUpcoming = profile.stage < stageNum
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%',
                      background: isCompleted ? 'rgba(34,197,94,0.15)' : isCurrent ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isCompleted ? '#22c55e' : isCurrent ? '#4F7CFF' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isCompleted ? 20 : 18,
                      color: isCompleted ? '#22c55e' : 'inherit',
                      filter: isUpcoming ? 'grayscale(1) opacity(0.35)' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {isCompleted ? '✓' : stage.icon}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: isCompleted ? '#22c55e' : isCurrent ? '#4F7CFF' : 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.4, fontWeight: isCurrent ? 700 : 500, maxWidth: 68 }}>
                      {stage.label}
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: isCompleted ? '#22c55e' : 'rgba(255,255,255,0.06)', margin: '0 2px', marginBottom: 32, transition: 'background 0.4s' }} />
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {profile.stage === 1 && (
              <button onClick={handleMarkResumeReviewed} style={{ padding: '9px 18px', borderRadius: 100, background: 'rgba(79,124,255,0.08)', border: '1px solid rgba(79,124,255,0.25)', color: '#93BBFF', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                ✓ Mark resume as reviewed
              </button>
            )}
            {profile.stage >= 3 && profile.stage < 4 && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center' }}>Stage advances automatically via your weekly check-ins</span>
            )}
            {profile.stage === 4 && !profile.is_placed && (
              <button onClick={handleMarkPlaced} style={{ padding: '9px 18px', borderRadius: 100, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                🎉 I got placed!
              </button>
            )}
            {profile.stage === 5 && (
              <span style={{ fontSize: 14, color: '#4ade80', fontWeight: 700 }}>🎉 Congratulations! You're placed.</span>
            )}
          </div>
        </div>

        {/* ── Section 3: Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Sessions Booked', value: bookings.length, color: '#4F7CFF', icon: '📅' },
            { label: 'Cold Emails Sent', value: profile.cold_emails_sent, color: '#7B61FF', icon: '📧' },
            { label: 'Interview Calls', value: profile.interview_calls, color: '#06b6d4', icon: '📞' },
            { label: 'Days Active', value: daysSinceJoined + 1, color: '#f59e0b', icon: '🔥' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 20px' }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{stat.icon}</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Section 4: Resources ── */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 36px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 20px' }}>My Resources</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(196px, 1fr))', gap: 14 }}>
            {RESOURCES.map(r => (
              <div key={r.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px 20px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{r.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 18, lineHeight: 1.5 }}>{r.desc}</div>
                <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '8px 18px', borderRadius: 100, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)', color: '#93BBFF', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Download →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 5: Weekly Check-in ── */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 36px', marginBottom: 48 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Weekly Check-in</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 28px' }}>Takes 30 seconds. Keeps your journey on track.</p>

          {hasCheckedIn ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 8 }}>You've checked in this week!</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>Come back next Monday for your next check-in.</div>
              {checkinDone && <p style={{ color: '#4ade80', fontWeight: 600, marginTop: 14 }}>Check-in saved! Keep going 💪</p>}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  How many cold emails did you send this week?
                </label>
                <input
                  type="number"
                  min={0}
                  value={coldEmails}
                  onChange={e => setColdEmails(Math.max(0, Number(e.target.value)))}
                  style={{ width: 90, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 22, fontWeight: 800, outline: 'none', textAlign: 'center' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  Did you get any interview calls?
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ label: 'Yes! 🎉', value: true }, { label: 'Not yet', value: false }].map(opt => (
                    <button key={String(opt.value)} onClick={() => setGotInterview(opt.value)}
                      style={{ padding: '10px 22px', borderRadius: 100, background: gotInterview === opt.value ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${gotInterview === opt.value ? 'rgba(79,124,255,0.4)' : 'rgba(255,255,255,0.08)'}`, color: gotInterview === opt.value ? '#93BBFF' : 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 10, fontWeight: 500 }}>
                  How are you feeling about your search?
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { emoji: '😰', label: 'Struggling', value: 'struggling' },
                    { emoji: '😐', label: 'Getting there', value: 'getting_there' },
                    { emoji: '🔥', label: 'Crushing it', value: 'crushing_it' },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setMood(opt.value)}
                      style={{ padding: '10px 22px', borderRadius: 100, background: mood === opt.value ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${mood === opt.value ? 'rgba(79,124,255,0.4)' : 'rgba(255,255,255,0.08)'}`, color: mood === opt.value ? '#93BBFF' : 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleCheckin} disabled={checkingIn}
                style={{ padding: '14px 36px', borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 15, border: 'none', cursor: checkingIn ? 'not-allowed' : 'pointer', opacity: checkingIn ? 0.7 : 1 }}>
                {checkingIn ? '⏳ Saving...' : 'Submit Check-in'}
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GRAD, COLORS, Card, Mono, PrimaryBtn, AptiStyles, DOMAIN_LABELS } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface PanicSkill {
  skillId: string; skillName: string; topicName: string; domain: string
  mastery: string; sharePct: number; day: number
}
interface PanicData {
  testDate: string | null
  daysLeft?: number
  expired?: boolean
  perDay?: number
  avgScore?: number
  targets?: { slug: string; name: string; score: number; band: string }[]
  plan?: PanicSkill[]
  cut?: { skillName: string; topicName: string }[]
  summary?: string
}

const MASTERY_COLOR: Record<string, string> = {
  unseen: COLORS.muted2, learning: COLORS.blueSoft, familiar: '#A5B4FC',
  proficient: '#fff', mastered: '#F5C518', rusty: COLORS.stretch,
}
const MASTERY_LABEL: Record<string, string> = {
  unseen: 'Unseen', learning: 'Learning', familiar: 'Familiar',
  proficient: 'Proficient', mastered: 'Mastered', rusty: 'Rusty',
}

function todayStr() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

export default function PanicPage() {
  const [data, setData] = useState<PanicData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const load = () => fetch('/api/apti/panic')
    .then((r) => {
      if (r.status === 401) { router.push('/login?next=/practice/panic'); return null }
      if (!r.ok) throw new Error('failed')
      return r.json()
    })
    .then((d: PanicData | null) => { if (d) { setData(d); setEditing(false) } })

  useEffect(() => {
    load().catch(() => setError('Could not load your plan. Refresh to retry.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveDate = async () => {
    if (!dateInput || saving) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/practice/panic'); return }
      await supabase.from('apti_profiles').update({ timeline: dateInput }).eq('user_id', user.id)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const drill = async (skillId: string) => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/apti/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topic', skillId }),
      })
      const d = await res.json()
      if (res.ok) router.push(`/practice/set/${d.setId}`)
    } finally {
      setBusy(false)
    }
  }

  const byDay = useMemo(() => {
    const groups = new Map<number, PanicSkill[]>()
    for (const s of data?.plan ?? []) groups.set(s.day, [...(groups.get(s.day) ?? []), s])
    return [...groups.entries()].sort((a, b) => a[0] - b[0])
  }, [data])

  const needsDate = data && (data.testDate === null || data.expired || editing)

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AptiStyles />
      <div aria-hidden style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 640, height: 420, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.12), rgba(79,124,255,0.05) 55%, transparent 75%)',
        filter: 'blur(46px)', animation: 'aurora-drift 15s ease-in-out infinite alternate',
      }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px', position: 'relative' }}>
        <header className="apti-in" style={{ marginBottom: 24 }}>
          <p className="mono-label" style={{ marginBottom: 10, color: COLORS.stretch }}>◍ Panic Mode</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
            Test soon? <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>Triage, don&rsquo;t panic.</em>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
            No false hope, no &ldquo;master everything.&rdquo; Just the highest-impact skills for the days you actually have.
          </p>
        </header>

        {error && <p style={{ color: COLORS.wrong, fontSize: 14 }}>{error}</p>}
        {!data && !error && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '40px 0' }}>Loading…</p>}

        {/* ---- set / change the test date ---- */}
        {needsDate && (
          <Card className="apti-in" style={{ padding: 22 }}>
            {data?.expired && (
              <p style={{ fontSize: 13.5, color: COLORS.stretch, marginBottom: 12 }}>
                That date has passed. Set your next one.
              </p>
            )}
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>When&rsquo;s your test?</p>
            <p style={{ fontSize: 13, color: COLORS.muted2, marginBottom: 14, lineHeight: 1.5 }}>
              We&rsquo;ll build a day-by-day plan back from it. Not sure of the exact date? Pick your best guess — you can change it anytime.
            </p>
            <input
              type="date"
              value={dateInput}
              min={todayStr()}
              onChange={(e) => setDateInput(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px', fontSize: 16, fontFamily: 'var(--mono)',
                background: 'rgba(255,255,255,0.04)', color: '#fff', colorScheme: 'dark',
                border: `1px solid ${COLORS.hair}`, borderRadius: 14, marginBottom: 16,
              }}
            />
            <PrimaryBtn onClick={saveDate} disabled={!dateInput || saving}>
              {saving ? 'Building your plan…' : 'Build my plan →'}
            </PrimaryBtn>
            {editing && (
              <button onClick={() => setEditing(false)} style={{
                width: '100%', marginTop: 10, padding: '10px', fontSize: 13.5, fontFamily: 'inherit',
                background: 'none', border: 'none', color: COLORS.muted2, cursor: 'pointer',
              }}>Cancel</button>
            )}
          </Card>
        )}

        {/* ---- the plan ---- */}
        {data && !needsDate && data.plan && (
          <>
            {/* countdown + readiness */}
            <Card className="apti-in" style={{ padding: 22, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <Mono style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, color: data.daysLeft! <= 3 ? COLORS.stretch : '#fff' }}>{data.daysLeft}</Mono>
                    <span style={{ fontSize: 15, color: COLORS.muted }}>day{data.daysLeft === 1 ? '' : 's'} left</span>
                  </div>
                  <span style={{ fontSize: 12, color: COLORS.muted2 }}>
                    test on {new Date(data.testDate! + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC' })}
                  </span>
                </div>
                {typeof data.avgScore === 'number' && (
                  <div style={{ textAlign: 'right' }}>
                    <Mono style={{ fontSize: 26, fontWeight: 600, lineHeight: 1, background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{data.avgScore}</Mono>
                    <span style={{ display: 'block', fontSize: 11, color: COLORS.muted2, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--mono)', marginTop: 2 }}>avg readiness</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.65 }}>{data.summary}</p>
              {(data.targets?.length ?? 0) === 0 && (
                <p style={{ fontSize: 12.5, color: COLORS.muted2, marginTop: 10, lineHeight: 1.5 }}>
                  Based on all companies. <Link href="/practice/companies" style={{ color: COLORS.blueSoft }}>Pick your targets</Link> for a sharper plan.
                </p>
              )}
            </Card>

            {/* the day-by-day plan */}
            {byDay.map(([day, daySkills], di) => (
              <div key={day} className="apti-in" style={{ marginBottom: 18, animationDelay: `${Math.min(0.1 + di * 0.05, 0.4)}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, letterSpacing: 1,
                    color: COLORS.blueSoft, background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.3)',
                    padding: '4px 12px', borderRadius: 100,
                  }}>DAY {day}</span>
                  <span style={{ flex: 1, height: 1, background: COLORS.hair }} />
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {daySkills.map((s) => (
                    <button key={s.skillId} onClick={() => drill(s.skillId)} disabled={busy} className="apti-option" style={{
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
                      padding: '14px 16px', borderRadius: 14, fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`, color: '#fff',
                      cursor: busy ? 'default' : 'pointer',
                    }}>
                      <span style={{
                        width: 44, textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700,
                        color: COLORS.stretch,
                      }}>
                        {s.sharePct}%
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, display: 'block' }}>{s.skillName}</span>
                        <span style={{ fontSize: 12, color: COLORS.muted2 }}>
                          {s.topicName} · <span style={{ color: MASTERY_COLOR[s.mastery] }}>{MASTERY_LABEL[s.mastery]}</span> · {DOMAIN_LABELS[s.domain] ?? s.domain}
                        </span>
                      </span>
                      <span style={{ color: COLORS.blueSoft, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Drill →</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {data.plan.length === 0 && (
              <Card className="apti-in" style={{ padding: 22, textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Nothing urgent to cram.</p>
                <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.6 }}>
                  Your target skills are already in good shape. Keep your streak, take a mock to confirm, and rest before the test.
                </p>
              </Card>
            )}

            <p style={{ fontSize: 11.5, color: COLORS.stretch, fontFamily: 'var(--mono)', letterSpacing: 1, marginTop: 6, marginBottom: 10 }}>
              THE 90-SECOND RULE STILL APPLIES ON TEST DAY
            </p>

            {/* honest cut list */}
            {(data.cut?.length ?? 0) > 0 && (
              <div className="apti-in" style={{ marginTop: 8 }}>
                <p className="mono-label" style={{ marginBottom: 10 }}>Set aside for after the test</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.cut!.map((c) => (
                    <span key={c.skillName} style={{
                      padding: '7px 13px', fontSize: 12.5, borderRadius: 100,
                      color: COLORS.muted2, background: 'rgba(255,255,255,0.02)', border: `1px dashed ${COLORS.hair}`,
                    }}>{c.skillName}</span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: COLORS.muted2, marginTop: 10, lineHeight: 1.55 }}>
                  Lower impact for your targets right now. Skipping these before the test is the smart call, not a failure.
                </p>
              </div>
            )}

            <button onClick={() => { setDateInput(data.testDate ?? ''); setEditing(true) }} style={{
              width: '100%', marginTop: 22, padding: '12px', fontSize: 13.5, fontFamily: 'inherit',
              background: 'none', border: `1px dashed ${COLORS.hair}`, borderRadius: 100,
              color: COLORS.muted2, cursor: 'pointer',
            }}>
              Change test date
            </button>
          </>
        )}
      </div>

      <AptiNav active="ready" />
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GRAD, COLORS, Mono, Card, Chip, AptiStyles, DOMAIN_LABELS } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Stats {
  totals: { attempts: number; accuracy: number; activeDays: number }
  skills: {
    slug: string; name: string; domain: string; attempts: number
    accuracy: number; medianSec: number; benchSec: number
    zone: 'ready' | 'slow-sure' | 'rushing' | 'gap'
    rating: number | null; mastery: string
  }[]
  errorMix: Record<string, number>
  calibration: Record<string, { n: number; correct: number }>
}

const ZONE_META: Record<string, { label: string; advice: string; color: string }> = {
  ready:      { label: 'Test-ready',   advice: 'Fast and accurate. Maintain, don’t grind.', color: COLORS.correct },
  'slow-sure': { label: 'Slow but sure', advice: 'Accuracy is there — drill speed, learn the shortcut.', color: COLORS.blueSoft },
  rushing:    { label: 'Rushing',      advice: 'Fast but missing. Slow down 5 seconds on the stem.', color: COLORS.stretch },
  gap:        { label: 'Gap',          advice: 'Method not landed yet. Take the hints, read solutions fully.', color: COLORS.wrong },
}

const ERROR_LABELS: Record<string, string> = {
  concept: 'Didn’t know the method',
  calc: 'Calculation slips',
  misread: 'Misread the question',
  trap: 'Fell for traps',
  time: 'Rushed it',
}

const ERROR_INSIGHT: Record<string, string> = {
  concept: 'Real concept gaps — the solutions and Learn content are your fix, not more grinding.',
  calc: 'You know the methods — your hands are betraying you. Slow the arithmetic, not the thinking.',
  misread: 'You don’t need more theory. You need 5 extra seconds reading what’s actually asked.',
  trap: 'You’re falling for engineered wrong answers. Read the trap explanations closely — they’re written for exactly this.',
  time: 'Pace pressure is costing accuracy. Practice the shortcut methods — they buy the seconds back.',
}

const CONF_LABELS: Record<string, string> = { sure: 'Sure', thinkso: 'Think so', guessing: 'Guessing' }

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/apti/stats')
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/stats'); return null }
        if (!r.ok) throw new Error('failed')
        return r.json()
      })
      .then((d) => { if (d && !cancelled) setStats(d) })
      .catch(() => { if (!cancelled) setError('Could not load stats. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dominantError = stats && Object.keys(stats.errorMix).length > 0
    ? Object.entries(stats.errorMix).sort((a, b) => b[1] - a[1])[0]
    : null
  const totalErrors = stats ? Object.values(stats.errorMix).reduce((a, b) => a + b, 0) : 0

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 28 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>Stats</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
          Numbers that <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>change what you do.</em>
        </h1>
      </header>

      {error && <p style={{ color: COLORS.muted, textAlign: 'center', padding: '40px 0' }}>{error}</p>}
      {!stats && !error && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '40px 0' }}>Crunching…</p>}

      {stats && stats.totals.attempts < 10 && (
        <Card className="apti-in" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 15, color: COLORS.muted, lineHeight: 1.65 }}>
            Your dashboard is earning itself.<br />
            After ~{Math.max(1, Math.ceil((10 - stats.totals.attempts) / 10))} more set{stats.totals.attempts < 1 ? 's' : ''} we&rsquo;ll
            show you patterns even you don&rsquo;t know about yet.
          </p>
          <Mono style={{ display: 'block', marginTop: 16, fontSize: 13, color: COLORS.muted2 }}>
            {stats.totals.attempts}/10 attempts logged
          </Mono>
        </Card>
      )}

      {stats && stats.totals.attempts >= 10 && (
        <>
          {/* totals strip */}
          <div className="apti-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 26 }}>
            {[
              { v: stats.totals.attempts, l: 'questions' },
              { v: `${stats.totals.accuracy}%`, l: 'accuracy' },
              { v: stats.totals.activeDays, l: 'active days' },
            ].map((t) => (
              <Card key={t.l} style={{ padding: '16px 14px', textAlign: 'center' }}>
                <Mono style={{ fontSize: 24, fontWeight: 600, display: 'block' }}>{t.v}</Mono>
                <span style={{ fontSize: 11.5, color: COLORS.muted2, fontFamily: 'var(--mono)', letterSpacing: 1, textTransform: 'uppercase' }}>{t.l}</span>
              </Card>
            ))}
          </div>

          {/* error mix — the insight most students never get */}
          {totalErrors >= 3 && dominantError && (
            <Card className="apti-in" style={{ marginBottom: 18, animationDelay: '0.08s' }}>
              <p className="mono-label" style={{ marginBottom: 14 }}>Why you miss</p>
              {Object.entries(stats.errorMix).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: COLORS.muted }}>{ERROR_LABELS[type] ?? type}</span>
                    <Mono style={{ color: COLORS.muted2 }}>{Math.round((count / totalErrors) * 100)}%</Mono>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(count / totalErrors) * 100}%`,
                      background: type === dominantError[0] ? GRAD : 'rgba(255,255,255,0.18)', borderRadius: 100,
                    }} />
                  </div>
                </div>
              ))}
              <p style={{ margin: '14px 0 0', fontSize: 13.5, color: COLORS.blueSoft, lineHeight: 1.6 }}>
                {ERROR_INSIGHT[dominantError[0]]}
              </p>
            </Card>
          )}

          {/* calibration */}
          {Object.values(stats.calibration).some((c) => c.n >= 3) && (
            <Card className="apti-in" style={{ marginBottom: 18, animationDelay: '0.16s' }}>
              <p className="mono-label" style={{ marginBottom: 4 }}>Calibration</p>
              <p style={{ fontSize: 12.5, color: COLORS.muted2, marginBottom: 16 }}>
                When you say it, how often are you right? Tests with negative marking pay for this instinct.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {(['sure', 'thinkso', 'guessing'] as const).map((k) => {
                  const c = stats.calibration[k]
                  const pct = c.n > 0 ? Math.round((c.correct / c.n) * 100) : null
                  return (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <Mono style={{
                        fontSize: 22, fontWeight: 600, display: 'block',
                        color: pct === null ? COLORS.muted2 : k === 'sure' && pct < 80 ? COLORS.stretch : '#fff',
                      }}>{pct === null ? '—' : `${pct}%`}</Mono>
                      <span style={{ fontSize: 12, color: COLORS.muted2 }}>{CONF_LABELS[k]}</span>
                      <span style={{ display: 'block', fontSize: 10.5, color: COLORS.muted2, fontFamily: 'var(--mono)' }}>{c.n} taps</span>
                    </div>
                  )
                })}
              </div>
              {stats.calibration.sure.n >= 5 && stats.calibration.sure.correct / stats.calibration.sure.n < 0.8 && (
                <p style={{ margin: '14px 0 0', fontSize: 13.5, color: COLORS.stretch, lineHeight: 1.6 }}>
                  When you feel &ldquo;Sure&rdquo;, you&rsquo;re right {Math.round((stats.calibration.sure.correct / stats.calibration.sure.n) * 100)}% of
                  the time. Under negative marking, that gap is marks.
                </p>
              )}
            </Card>
          )}

          {/* skill zones */}
          <Card className="apti-in" style={{ marginBottom: 18, animationDelay: '0.24s' }}>
            <p className="mono-label" style={{ marginBottom: 14 }}>Skill zones · speed × accuracy</p>
            {stats.skills.filter((s) => s.attempts >= 3).map((s) => {
              const z = ZONE_META[s.zone]
              return (
                <div key={s.slug} style={{ padding: '13px 0', borderTop: `1px solid ${COLORS.hair}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600 }}>{s.name}</span>
                    <Chip color={z.color} bg="rgba(255,255,255,0.04)">{z.label}</Chip>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: COLORS.muted2, marginBottom: 4 }}>
                    <span>{DOMAIN_LABELS[s.domain]}</span>
                    <Mono>{s.accuracy}% acc</Mono>
                    <Mono>{s.medianSec}s vs {s.benchSec}s par</Mono>
                    {s.rating !== null && <Mono>{s.rating}</Mono>}
                  </div>
                  <p style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5 }}>{z.advice}</p>
                </div>
              )
            })}
            {stats.skills.filter((s) => s.attempts >= 3).length === 0 && (
              <p style={{ fontSize: 13.5, color: COLORS.muted2 }}>Zones appear once a skill has 3+ attempts.</p>
            )}
          </Card>
        </>
      )}

      <AptiNav active="stats" />
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GRAD, COLORS, Card, PrimaryBtn, Mono, Chip, DOMAIN_LABELS, AptiStyles,
} from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'
import { trackAptiEvent } from '@/app/components/apti/track'

// First-class doorways to the rest of the platform — the tab bar is for
// switching, these are for discovering.
function ExploreCard({ href, glyph, title, line, accent, style, onClick }: {
  href: string; glyph: string; title: string; line: string; accent: string
  style?: React.CSSProperties; onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick} className="apti-option" style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      padding: '18px 16px', borderRadius: 16,
      background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <span aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(135deg, ${accent}, transparent 60%)`,
      }} />
      <span style={{ fontSize: 24, lineHeight: 1 }}>{glyph}</span>
      <span style={{ fontSize: 15.5, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 12.5, color: COLORS.muted, lineHeight: 1.5 }}>{line}</span>
      <span style={{ fontSize: 13, color: COLORS.blueSoft, fontWeight: 600 }}>Open →</span>
    </Link>
  )
}
import type { SetSummary } from '@/app/components/apti/SetPlayer'

interface TodayData {
  set: {
    id: string
    date: string
    cursor: number
    total: number
    completedAt: string | null
    summary: SetSummary | null
    reviewCount: number
  }
  profile: {
    streak: number
    longestStreak: number
    lastSetDate: string | null
    ratings: Record<string, number>
  }
  nextUp: {
    dueReviews: number
    weakestSkill: { id: string; slug: string; name: string; accuracy: number } | null
  }
}

export default function PracticePage() {
  const [data, setData] = useState<TodayData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionBusy, setSessionBusy] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const router = useRouter()

  const startSession = async (payload: { kind: string; skillId?: string }) => {
    if (sessionBusy) return
    setSessionBusy(true)
    setSessionError(null)
    try {
      const res = await fetch('/api/apti/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) { setSessionError(d.error || 'Could not start the session'); return }
      router.push(`/practice/set/${d.setId}`)
    } catch {
      setSessionError('Network hiccup — try again.')
    } finally {
      setSessionBusy(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/apti/daily-set')
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d: TodayData | null) => {
        if (!d || cancelled) return
        // brand-new account → the diagnostic IS the onboarding
        const isFresh = Object.keys(d.profile.ratings ?? {}).length === 0 &&
          d.set.cursor === 0 && !d.set.completedAt && !d.profile.lastSetDate
        if (isFresh && !sessionStorage.getItem('apti_skip_onboarding')) {
          router.replace('/practice/start')
          return
        }
        setData(d)
      })
      .catch(() => { if (!cancelled) setError('Could not load today’s set. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  })

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AptiStyles />

      {/* ambient aurora */}
      <div aria-hidden style={{
        position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
        width: 640, height: 420, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(79,124,255,0.16), rgba(123,97,255,0.06) 55%, transparent 75%)',
        filter: 'blur(40px)', animation: 'aurora-drift 14s ease-in-out infinite alternate',
      }} />

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px 80px', position: 'relative' }}>
        {/* header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 44 }}>
          <Link href="/" style={{ fontFamily: 'var(--serif)', fontSize: 19, letterSpacing: -0.4 }}>
            Beyond Campus <span style={{ color: COLORS.blueSoft, fontStyle: 'italic' }}>Apti</span>
          </Link>
          {data && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
              borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.hair}`,
            }}>
              <span style={{
                fontSize: 15,
                animation: data.profile.streak > 0 ? 'apti-flame 1.8s ease-in-out infinite' : 'none',
                display: 'inline-block',
                filter: data.profile.streak > 0 ? 'none' : 'grayscale(1) opacity(0.5)',
              }}>🔥</span>
              <Mono style={{ fontSize: 14, fontWeight: 600 }}>{data.profile.streak}</Mono>
            </div>
          )}
        </header>

        {error && <p style={{ color: COLORS.muted, textAlign: 'center', padding: '60px 0' }}>{error}</p>}

        {!data && !error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 36, height: 36, margin: '0 auto 18px', borderRadius: '50%',
              border: '3px solid rgba(79,124,255,0.2)', borderTopColor: COLORS.blue,
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: COLORS.muted2, fontSize: 14 }}>Building today&rsquo;s set…</p>
          </div>
        )}

        {data && (() => {
          const { set, profile } = data
          const done = !!set.completedAt
          const started = set.cursor > 0 && !done
          const remaining = set.total - set.cursor
          const freshCount = set.total - set.reviewCount

          return (
            <>
              {/* hero */}
              <div className="apti-in" style={{ marginBottom: 28 }}>
                <p className="mono-label" style={{ marginBottom: 10 }}>{today}</p>
                <h1 style={{
                  fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 40,
                  letterSpacing: -1.2, lineHeight: 1.1, marginBottom: 8,
                }}>
                  {done ? <>That&rsquo;s a <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>wrap.</em></>
                    : started ? <>Pick it back <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>up.</em></>
                    : <>Today&rsquo;s <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>ten.</em></>}
                </h1>
                <p style={{ color: COLORS.muted, fontSize: 15, lineHeight: 1.55 }}>
                  {done
                    ? 'Practice banked. The streak holds. See you tomorrow.'
                    : started
                      ? `${remaining} question${remaining === 1 ? '' : 's'} between you and today’s tick.`
                      : 'One focused set a day beats a panicked weekend before the test.'}
                </p>
              </div>

              {/* set card */}
              <Card style={{ padding: 26, marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
                <div aria-hidden style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(135deg, rgba(79,124,255,0.06), transparent 55%)',
                }} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                  <Chip>{set.total} questions</Chip>
                  {set.reviewCount > 0 && <Chip color={COLORS.stretch} bg={COLORS.stretchBg}>↺ {set.reviewCount} redemption</Chip>}
                  <Chip>~{Math.ceil(set.total * 1.2)} min</Chip>
                </div>

                {!done && (
                  <>
                    {started && (
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden', marginBottom: 18 }}>
                        <div style={{ height: '100%', width: `${(set.cursor / set.total) * 100}%`, background: GRAD, borderRadius: 100 }} />
                      </div>
                    )}
                    <PrimaryBtn onClick={() => router.push(`/practice/set/${set.id}`)}>
                      {started ? `Resume — ${remaining} left` : `Start today’s ${set.total} →`}
                    </PrimaryBtn>
                    {!started && (
                      <p style={{ textAlign: 'center', fontSize: 12.5, color: COLORS.muted2, marginTop: 12 }}>
                        {set.reviewCount > 0
                          ? `${set.reviewCount} question${set.reviewCount === 1 ? '' : 's'} that beat you before, ${freshCount} fresh.`
                          : 'Adaptive — it meets you at your level.'}
                      </p>
                    )}
                  </>
                )}

                {done && set.summary && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                      <Mono style={{ fontSize: 34, fontWeight: 600 }}>
                        {set.summary.correct}<span style={{ color: COLORS.muted2, fontSize: 20 }}>/{set.total}</span>
                      </Mono>
                      <span style={{ color: COLORS.muted, fontSize: 14 }}>correct today</span>
                    </div>
                    {Object.entries(set.summary.ratingDeltas ?? {}).map(([domain, delta]) => (
                      <div key={domain} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '11px 0',
                        borderTop: `1px solid ${COLORS.hair}`, fontSize: 14,
                      }}>
                        <span style={{ color: COLORS.muted }}>{DOMAIN_LABELS[domain] ?? domain}</span>
                        <Mono style={{ color: (delta as number) > 0 ? COLORS.correct : (delta as number) < 0 ? COLORS.wrong : COLORS.muted2, fontWeight: 600 }}>
                          {(delta as number) > 0 ? `▲ +${delta}` : (delta as number) < 0 ? `▼ ${delta}` : '· 0'}
                        </Mono>
                      </div>
                    ))}
                    <Link href={`/practice/review/${set.id}`} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '13px 0 2px', borderTop: `1px solid ${COLORS.hair}`,
                      fontSize: 14, fontWeight: 600, color: COLORS.blueSoft,
                    }}>
                      Review today&rsquo;s answers <span>→</span>
                    </Link>
                  </div>
                )}
              </Card>

              {/* keep going — extra practice with real reasons */}
              {done && (data.nextUp.dueReviews > 0 || data.nextUp.weakestSkill) && (
                <div className="apti-in" style={{ marginBottom: 18 }}>
                  <p className="mono-label" style={{ marginBottom: 12 }}>Keep going?</p>
                  {sessionError && <p style={{ color: COLORS.wrong, fontSize: 13, marginBottom: 10 }}>{sessionError}</p>}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {data.nextUp.dueReviews > 0 && (
                      <button
                        onClick={() => startSession({ kind: 'review' })}
                        disabled={sessionBusy}
                        className="apti-option"
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '16px 18px', borderRadius: 14, fontFamily: 'inherit', fontSize: 15,
                          background: COLORS.stretchBg, border: '1px solid rgba(251,191,36,0.3)',
                          color: '#fff', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span>
                          <strong>↺ Clear your backlog</strong>
                          <span style={{ display: 'block', fontSize: 12.5, color: COLORS.muted, marginTop: 3 }}>
                            {data.nextUp.dueReviews} question{data.nextUp.dueReviews === 1 ? '' : 's'} that beat you, due for redemption
                          </span>
                        </span>
                        <span style={{ color: COLORS.stretch }}>→</span>
                      </button>
                    )}
                    {data.nextUp.weakestSkill && (
                      <button
                        onClick={() => startSession({ kind: 'topic', skillId: data.nextUp.weakestSkill!.id })}
                        disabled={sessionBusy}
                        className="apti-option"
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '16px 18px', borderRadius: 14, fontFamily: 'inherit', fontSize: 15,
                          background: 'rgba(79,124,255,0.07)', border: '1px solid rgba(79,124,255,0.3)',
                          color: '#fff', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span>
                          <strong>◎ Drill {data.nextUp.weakestSkill.name}</strong>
                          <span style={{ display: 'block', fontSize: 12.5, color: COLORS.muted, marginTop: 3 }}>
                            Your weakest skill right now — {data.nextUp.weakestSkill.accuracy}% accuracy
                          </span>
                        </span>
                        <span style={{ color: COLORS.blueSoft }}>→</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ratings */}
              {Object.keys(profile.ratings).length > 0 && (
                <Card style={{ padding: 22, marginBottom: 18 }}>
                  <p className="mono-label" style={{ marginBottom: 14 }}>Apti Rating</p>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Object.keys(profile.ratings).length)}, 1fr)`, gap: 14 }}>
                    {Object.entries(profile.ratings).map(([domain, rating]) => (
                      <div key={domain}>
                        <Mono style={{ fontSize: 26, fontWeight: 600, display: 'block', lineHeight: 1.1 }}>
                          {rating as number}
                        </Mono>
                        <span style={{ fontSize: 12, color: COLORS.muted2 }}>{DOMAIN_LABELS[domain] ?? domain}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '14px 0 0', fontSize: 12, color: COLORS.muted2, lineHeight: 1.5 }}>
                    Provisional until 50 attempts. Every question moves it — up or down. That&rsquo;s the point.
                  </p>
                </Card>
              )}

              {/* the rest of the platform, front and centre */}
              <div className="apti-in" style={{ marginBottom: 18 }}>
                <p className="mono-label" style={{ marginBottom: 12 }}>Go further</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <ExploreCard
                    href="/practice/mocks"
                    glyph="⏱" title="Take a mock"
                    line="15-min checkpoint. Every result ends in a fix plan."
                    accent="rgba(123,97,255,0.10)"
                  />
                  <ExploreCard
                    href="/practice/companies"
                    glyph="🎯" title="Am I ready?"
                    line="Deloitte, ICICI, HUL — one honest number each."
                    accent="rgba(79,124,255,0.10)"
                  />
                  <ExploreCard
                    href="/practice/map"
                    glyph="🗺" title="Mastery map"
                    line="Every skill, its earned colour, your next focus."
                    accent="rgba(52,211,153,0.08)"
                  />
                  <ExploreCard
                    href="/practice/stats"
                    glyph="📈" title="Your patterns"
                    line="Why you miss, when you rush, how you're trending."
                    accent="rgba(251,191,36,0.08)"
                  />
                  <ExploreCard
                    href="/practice/history"
                    glyph="📓" title="Session history"
                    line="Every set and mock you've sat — reopen any question, any solution, any time."
                    accent="rgba(255,255,255,0.045)"
                    style={{ gridColumn: '1 / -1' }}
                  />
                </div>
              </div>

              {/* quiet mentorship doorway — doc 10 surface 3: no badges, no popups */}
              <div className="apti-in" style={{ marginBottom: 18 }}>
                <ExploreCard
                  href="/program"
                  glyph="🧭" title="Mentorship"
                  line="Apti clears the test. Humans clear the interview — cohorts, 1:1 calls, resume."
                  accent="rgba(255,255,255,0.04)"
                  onClick={() => trackAptiEvent('cohort_cta_clicked', { surface: 'nav' })}
                />
              </div>

              {/* longest streak footnote */}
              {profile.longestStreak > 1 && (
                <p style={{ textAlign: 'center', fontSize: 12.5, color: COLORS.muted2 }}>
                  Longest streak: <Mono style={{ color: COLORS.muted }}>{profile.longestStreak} days</Mono>
                </p>
              )}
            </>
          )
        })()}
      </div>
      <AptiNav active="today" />
    </main>
  )
}

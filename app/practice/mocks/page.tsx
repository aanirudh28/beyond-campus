'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { COLORS, Card, Mono, Chip, PrimaryBtn, AptiStyles } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface BlueprintInfo { slug: string; kind: string; name: string; tagline: string; questions: number; minutes: number }
interface AttemptRow { id: string; blueprint_slug: string; kind: string; score: number | null; max_score: number | null; started_at: string; submitted_at: string | null }

// The mock fear ladder (docs/aptitude/07): stakes ramp deliberately —
// checkpoint → section tests → (soon) full sims.
export default function MocksPage() {
  const [blueprints, setBlueprints] = useState<BlueprintInfo[]>([])
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [practiceCount, setPracticeCount] = useState(0)
  const [ritual, setRitual] = useState<BlueprintInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/apti/mock')
      .then((r) => {
        if (r.status === 401) { router.push('/login?next=/practice/mocks'); return null }
        if (!r.ok) throw new Error('load failed')
        return r.json()
      })
      .then((d) => {
        if (!d || cancelled) return
        setBlueprints(d.blueprints)
        setAttempts(d.attempts)
        setPracticeCount(d.practiceCount)
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setError('Could not load. Refresh to retry.') })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submittedCheckpoints = attempts.filter((a) => a.kind === 'checkpoint' && a.submitted_at).length
  const unlocked = (b: BlueprintInfo) =>
    b.kind === 'checkpoint' ? practiceCount >= 20 : submittedCheckpoints >= 1

  const start = async (b: BlueprintInfo) => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/apti/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint: b.slug }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || 'Could not start'); setRitual(null); return }
      router.push(`/practice/mocks/${d.attemptId}`)
    } catch {
      setError('Network hiccup — try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 28 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>Mocks</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
          Nobody likes mocks. <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>That&rsquo;s why yours start small.</em>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
          Fifteen minutes, not sixty. Every result ends in a fix plan, never just a score.
        </p>
      </header>

      {error && <p style={{ color: COLORS.wrong, fontSize: 14, marginBottom: 16 }}>{error}</p>}
      {loading && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '30px 0' }}>Loading…</p>}

      {/* the ladder */}
      {blueprints.map((b, i) => {
        const open = unlocked(b)
        return (
          <Card key={b.slug} className="apti-in" style={{ marginBottom: 14, animationDelay: `${i * 0.07}s`, opacity: open ? 1 : 0.55 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <Chip>{b.questions} questions</Chip>
              <Chip>{b.minutes} min</Chip>
              {b.kind === 'checkpoint' && <Chip color={COLORS.blueSoft} bg="rgba(79,124,255,0.1)">Rung 1</Chip>}
              {b.kind === 'section' && <Chip color="#A5B4FC" bg="rgba(123,97,255,0.1)">Rung 2</Chip>}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{b.name}</h2>
            <p style={{ fontSize: 13.5, color: COLORS.muted, lineHeight: 1.55, marginBottom: 14 }}>{b.tagline}</p>
            {open ? (
              <PrimaryBtn onClick={() => setRitual(b)} style={{ padding: '13px 22px' }}>
                Start {b.name} →
              </PrimaryBtn>
            ) : (
              <p style={{ fontSize: 12.5, color: COLORS.muted2 }}>
                {b.kind === 'checkpoint'
                  ? `Unlocks after ~2 daily sets (${practiceCount}/20 questions practiced) — the ladder starts on solid ground.`
                  : 'Unlocks after your first Checkpoint.'}
              </p>
            )}
          </Card>
        )
      })}

      {/* coming rungs — honest ghosts */}
      <div className="apti-in" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 30px' }}>
        {['Mixed Mock · Rung 3', 'Company Simulations · Rung 4'].map((n) => (
          <span key={n} style={{
            padding: '10px 16px', fontSize: 13, borderRadius: 100,
            color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.12)',
          }}>{n} — as the bank grows</span>
        ))}
      </div>

      {/* history */}
      {attempts.filter((a) => a.submitted_at).length > 0 && (
        <section className="apti-in">
          <p className="mono-label" style={{ marginBottom: 12 }}>History</p>
          {attempts.filter((a) => a.submitted_at).map((a) => (
            <Link key={a.id} href={`/practice/mocks/${a.id}/report`} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 16px', marginBottom: 8, borderRadius: 12,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
            }}>
              <span style={{ fontSize: 14 }}>
                {blueprints.find((b) => b.slug === a.blueprint_slug)?.name ?? a.blueprint_slug}
                <span style={{ display: 'block', fontSize: 11.5, color: COLORS.muted2, marginTop: 2 }}>
                  {new Date(a.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </span>
              <Mono style={{ fontSize: 15, fontWeight: 600, color: COLORS.blueSoft }}>
                {a.score}/{a.max_score} →
              </Mono>
            </Link>
          ))}
        </section>
      )}

      {/* pre-mock ritual (docs/aptitude/07) */}
      {ritual && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="apti-pop" style={{
            background: '#111827', border: `1px solid ${COLORS.hair}`, borderRadius: 18,
            padding: 28, maxWidth: 380, width: '100%',
          }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 24, marginBottom: 12 }}>
              {ritual.name} · {ritual.minutes} min
            </h2>
            <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.7, marginBottom: 22 }}>
              One slow breath first. Then three rules:
              <br />① First pass: answer what flows, mark what doesn&rsquo;t.
              <br />② Anything past 90 seconds — move on. Marked ≠ lost.
              <br />③ No feedback until the end. That&rsquo;s the point.
            </div>
            <PrimaryBtn onClick={() => start(ritual)} disabled={busy}>
              {busy ? 'Building your paper…' : 'Begin →'}
            </PrimaryBtn>
            <button onClick={() => setRitual(null)} style={{
              width: '100%', marginTop: 10, padding: '10px', fontSize: 13.5, fontFamily: 'inherit',
              background: 'none', border: 'none', color: COLORS.muted2, cursor: 'pointer',
            }}>Not now</button>
          </div>
        </div>
      )}

      <AptiNav active="mocks" />
    </main>
  )
}

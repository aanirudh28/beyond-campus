'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GRAD, COLORS, Card, Chip, PrimaryBtn, CountUpNumber, AptiStyles } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Readiness {
  slug: string; name: string; tier: string; vendor: string
  sectionsLine: string; negativeMarking: boolean; season: string
  cutoffNote: string; confidence: string
  score: number; band: string; mockCapped: boolean
  levers: { label: string; skillId?: string }[]
}
interface CompanyLite { slug: string; name: string; tier: string }

const TIER_LABELS: Record<string, string> = {
  big4: 'Big 4', consulting: 'Consulting', banking: 'Banking', fmcg: 'FMCG', newage: 'New-age',
}
const BAND_COLORS: Record<string, string> = {
  'Test-ready': COLORS.correct, 'Almost there': COLORS.blueSoft,
  Building: COLORS.stretch, Foundation: COLORS.muted,
}

// Company readiness (docs/aptitude/08): one number per target, always with
// the levers that move it. Patterns are honest-labeled until verified.
export default function CompaniesPage() {
  const [readiness, setReadiness] = useState<Readiness[]>([])
  const [all, setAll] = useState<CompanyLite[]>([])
  const [targets, setTargets] = useState<string[]>([])
  const [picking, setPicking] = useState(false)
  const [pickSet, setPickSet] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const load = () => fetch('/api/apti/readiness')
    .then((r) => {
      if (r.status === 401) { router.push('/login?next=/practice/companies'); return null }
      if (!r.ok) throw new Error('failed')
      return r.json()
    })
    .then((d) => {
      if (!d) return
      setReadiness(d.readiness)
      setAll(d.allCompanies)
      setTargets(d.targets)
      setPickSet(new Set(d.targets))
      setPicking(d.targets.length === 0)
      setLoading(false)
    })

  useEffect(() => {
    load().catch(() => setError('Could not load readiness. Refresh to retry.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveTargets = async () => {
    if (busy) return
    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/practice/companies'); return }
      await supabase.from('apti_profiles')
        .update({ target_companies: [...pickSet] })
        .eq('user_id', user.id)
      setPicking(false)
      setLoading(true)
      await load()
    } finally {
      setBusy(false)
    }
  }

  const drill = async (skillId: string) => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/apti/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'topic', skillId }),
      })
      const d = await res.json()
      if (res.ok) router.push(`/practice/set/${d.setId}`)
    } finally {
      setBusy(false)
    }
  }

  const shown = targets.length > 0 && !picking
    ? readiness.filter((r) => targets.includes(r.slug))
    : readiness

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px' }}>
      <AptiStyles />

      <header className="apti-in" style={{ marginBottom: 26 }}>
        <p className="mono-label" style={{ marginBottom: 10 }}>Ready</p>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
          Am I ready for <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>Deloitte?</em>
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
          One honest number per company, computed from what they actually test —
          and exactly what moves it.
        </p>
      </header>

      {error && <p style={{ color: COLORS.wrong, fontSize: 14 }}>{error}</p>}
      {loading && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '30px 0' }}>Computing…</p>}

      {/* ---- target picker ---- */}
      {!loading && picking && (
        <div className="apti-in">
          <p style={{ fontSize: 14.5, color: COLORS.muted, marginBottom: 16 }}>
            Pick up to 5 targets. Your daily focus and readiness follow this choice.
          </p>
          {Object.entries(TIER_LABELS).map(([tier, label]) => {
            const companies = all.filter((c) => c.tier === tier)
            if (companies.length === 0) return null
            return (
              <div key={tier} style={{ marginBottom: 18 }}>
                <p className="mono-label" style={{ marginBottom: 10 }}>{label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {companies.map((c) => {
                    const on = pickSet.has(c.slug)
                    return (
                      <button key={c.slug} className="apti-option"
                        onClick={() => setPickSet((s) => {
                          const next = new Set(s)
                          if (on) next.delete(c.slug)
                          else if (next.size < 5) next.add(c.slug)
                          return next
                        })}
                        style={{
                          padding: '11px 16px', fontSize: 14.5, fontFamily: 'inherit', borderRadius: 100,
                          background: on ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.03)',
                          border: on ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
                          color: on ? '#fff' : COLORS.muted, cursor: 'pointer',
                        }}
                      >{on ? '✓ ' : ''}{c.name}</button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          <PrimaryBtn onClick={saveTargets} disabled={busy || pickSet.size === 0} style={{ marginTop: 8 }}>
            {busy ? 'Saving…' : `Track ${pickSet.size} compan${pickSet.size === 1 ? 'y' : 'ies'} →`}
          </PrimaryBtn>
        </div>
      )}

      {/* ---- panic mode doorway ---- */}
      {!loading && !picking && (
        <Link href="/practice/panic" className="apti-in apti-option" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '15px 18px', marginBottom: 20, borderRadius: 16, textDecoration: 'none', color: '#fff',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(79,124,255,0.06))',
          border: '1px solid rgba(251,191,36,0.3)',
        }}>
          <span>
            <span style={{ fontSize: 15, fontWeight: 700, display: 'block' }}>◍ Test coming up?</span>
            <span style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2, display: 'block' }}>
              Get a day-by-day panic plan — the few skills that move your score most, triaged to the days you have.
            </span>
          </span>
          <span style={{ color: COLORS.stretch, fontWeight: 700, whiteSpace: 'nowrap' }}>Plan it →</span>
        </Link>
      )}

      {/* ---- readiness cards ---- */}
      {!loading && !picking && (
        <>
          {shown.map((r, i) => (
            <Card key={r.slug} className="apti-in" style={{ marginBottom: 16, animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700 }}>{r.name}</h2>
                  <p style={{ fontSize: 12, color: COLORS.muted2, marginTop: 2 }}>
                    {r.vendor} · {r.season}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 38, fontWeight: 600, lineHeight: 1,
                    background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    <CountUpNumber to={r.score} from={0} style={{ fontSize: 38, fontWeight: 600 }} />
                  </div>
                  <span style={{ fontSize: 11.5, color: BAND_COLORS[r.band] ?? COLORS.muted, fontWeight: 600 }}>{r.band}</span>
                </div>
              </div>

              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${r.score}%`, background: GRAD, borderRadius: 100, transition: 'width 0.8s cubic-bezier(0.2,0.6,0.2,1)' }} />
              </div>

              <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.55, marginBottom: 6 }}>{r.sectionsLine}</p>
              <p style={{ fontSize: 12.5, color: COLORS.muted2, lineHeight: 1.55, marginBottom: 12 }}>
                {r.cutoffNote}{r.negativeMarking ? ' · negative marking' : ''}
              </p>

              <div style={{ display: 'grid', gap: 8 }}>
                {r.levers.map((l, j) => l.skillId ? (
                  <button key={j} onClick={() => drill(l.skillId!)} disabled={busy} className="apti-option" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
                    padding: '11px 14px', borderRadius: 10, fontFamily: 'inherit', fontSize: 13.5,
                    background: 'rgba(79,124,255,0.06)', border: '1px solid rgba(79,124,255,0.25)',
                    color: '#fff', cursor: 'pointer',
                  }}>
                    <span>▲ {l.label}</span><span style={{ color: COLORS.blueSoft }}>→</span>
                  </button>
                ) : (
                  <Link key={j} href="/practice/mocks" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 14px', borderRadius: 10, fontSize: 13.5,
                    background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)',
                  }}>
                    <span>▲ {l.label}</span><span style={{ color: COLORS.stretch }}>→</span>
                  </Link>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Chip color={COLORS.stretch} bg={COLORS.stretchBg}>pattern: {r.confidence}</Chip>
                <Chip>{TIER_LABELS[r.tier] ?? r.tier}</Chip>
              </div>
            </Card>
          ))}

          <button onClick={() => setPicking(true)} style={{
            width: '100%', padding: '12px', fontSize: 13.5, fontFamily: 'inherit',
            background: 'none', border: `1px dashed ${COLORS.hair}`, borderRadius: 100,
            color: COLORS.muted2, cursor: 'pointer',
          }}>
            Edit targets
          </button>
          <p style={{ fontSize: 12, color: COLORS.muted2, marginTop: 16, lineHeight: 1.6, textAlign: 'center' }}>
            Readiness measures the <em>test</em>. Interviews are a different game —
            that&rsquo;s what the cohort is for. Patterns marked &ldquo;estimated&rdquo; firm up
            as students report real test experiences.
          </p>
        </>
      )}

      <AptiNav active="ready" />
    </main>
  )
}

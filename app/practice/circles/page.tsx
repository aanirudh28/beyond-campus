'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GRAD, COLORS, Card, Mono, PrimaryBtn, AptiStyles } from '@/app/components/apti/ui'
import AptiNav from '@/app/components/apti/Nav'

interface Member { displayName: string; streak: number; setsThisWeek: number; weeklyDelta: number; isYou: boolean }
interface Circle { id: string; name: string; inviteCode: string; memberCount: number; canPokeToday: boolean; members: Member[] }

const wa = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [pokeMsg, setPokeMsg] = useState<Record<string, string>>({})
  const router = useRouter()

  const load = () => fetch('/api/apti/circles')
    .then((r) => {
      if (r.status === 401) { router.push('/login?next=/practice/circles'); return null }
      if (!r.ok) throw new Error('failed')
      return r.json()
    })
    .then((d: { circles: Circle[] } | null) => { if (d) { setCircles(d.circles); setShowForm(d.circles.length === 0) } })

  useEffect(() => {
    load().catch(() => setError('Could not load your circles. Refresh to retry.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setFormError(null)
    try {
      const isCreate = mode === 'create'
      const res = await fetch(isCreate ? '/api/apti/circles' : '/api/apti/circles/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isCreate ? { name, displayName } : { code, displayName }),
      })
      const d = await res.json()
      if (!res.ok) { setFormError(d.error || 'Something went wrong'); return }
      setName(''); setCode(''); setShowForm(false)
      await load()
    } catch {
      setFormError('Network hiccup — try again.')
    } finally {
      setBusy(false)
    }
  }

  const poke = async (circle: Circle) => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/apti/circles/poke', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ circleId: circle.id }),
      })
      const d = await res.json()
      if (res.ok && d.shareText) {
        window.open(wa(d.shareText), '_blank')
        setPokeMsg((m) => ({ ...m, [circle.id]: 'Poke sent 👊' }))
        await load()
      } else {
        setPokeMsg((m) => ({ ...m, [circle.id]: d.error || 'Could not poke' }))
      }
    } finally {
      setBusy(false)
    }
  }

  const shareInvite = (circle: Circle) => {
    const text = `Join my Apti study circle "${circle.name}" 🔥 We keep each other honest on daily aptitude practice. Code: ${circle.inviteCode} — join at https://www.beyond-campus.in/practice/circles`
    window.open(wa(text), '_blank')
  }

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AptiStyles />
      <div aria-hidden style={{
        position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 640, height: 420, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(123,97,255,0.13), rgba(79,124,255,0.05) 55%, transparent 75%)',
        filter: 'blur(46px)', animation: 'aurora-drift 15s ease-in-out infinite alternate',
      }} />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 120px', position: 'relative' }}>
        <header className="apti-in" style={{ marginBottom: 24 }}>
          <p className="mono-label" style={{ marginBottom: 10 }}>Study Circle</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 34, letterSpacing: -1, lineHeight: 1.12, marginBottom: 8 }}>
            Nobody quits <em style={{ fontStyle: 'italic', color: COLORS.blueSoft }}>in front of friends.</em>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.6 }}>
            A shared scoreboard for 5 to 8 friends. Streaks, sets this week, rating gained. No chat here — bring the banter to your WhatsApp group.
          </p>
        </header>

        {error && <p style={{ color: COLORS.wrong, fontSize: 14 }}>{error}</p>}
        {!circles && !error && <p style={{ color: COLORS.muted2, textAlign: 'center', padding: '40px 0' }}>Loading…</p>}

        {/* ---- existing circles ---- */}
        {circles && circles.map((c, ci) => (
          <Card key={c.id} className="apti-in" style={{ marginBottom: 18, padding: 22, animationDelay: `${ci * 0.06}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700 }}>{c.name}</h2>
              <Mono style={{ fontSize: 12, color: COLORS.muted2 }}>{c.memberCount}/8</Mono>
            </div>

            {/* scoreboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '10px 12px', alignItems: 'center', marginBottom: 18 }}>
              <span className="mono-label" style={{ gridColumn: '1 / 3' }}>Member</span>
              <span className="mono-label" style={{ textAlign: 'right' }}>Sets/wk</span>
              <span className="mono-label" style={{ textAlign: 'right' }}>Δ rating</span>
              {c.members.map((m, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <Mono style={{ fontSize: 13, color: COLORS.muted2, textAlign: 'right' }}>{i + 1}</Mono>
                  <span style={{ fontSize: 14, fontWeight: m.isYou ? 700 : 500, color: m.isYou ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.displayName}{m.isYou && <span style={{ color: COLORS.blueSoft, fontSize: 12, fontWeight: 400 }}> · you</span>}
                    {m.streak > 0 && <span style={{ marginLeft: 8, fontSize: 12.5, color: COLORS.stretch }}>🔥{m.streak}</span>}
                  </span>
                  <Mono style={{ fontSize: 14, fontWeight: 600, textAlign: 'right' }}>{m.setsThisWeek}</Mono>
                  <Mono style={{ fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: m.weeklyDelta > 0 ? COLORS.correct : m.weeklyDelta < 0 ? COLORS.wrong : COLORS.muted2 }}>
                    {m.weeklyDelta > 0 ? `+${m.weeklyDelta}` : m.weeklyDelta < 0 ? m.weeklyDelta : '·'}
                  </Mono>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => shareInvite(c)} className="apti-option" style={{
                flex: 1, minWidth: 140, padding: '12px 14px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.hair}`, color: '#fff',
                borderRadius: 100, cursor: 'pointer',
              }}>
                Invite · code {c.inviteCode}
              </button>
              <button onClick={() => poke(c)} disabled={busy || !c.canPokeToday} className="apti-option" style={{
                flex: 1, minWidth: 140, padding: '12px 14px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                background: c.canPokeToday ? GRAD : 'rgba(255,255,255,0.05)',
                border: 'none', color: c.canPokeToday ? '#fff' : COLORS.muted2,
                borderRadius: 100, cursor: c.canPokeToday && !busy ? 'pointer' : 'default',
              }}>
                {c.canPokeToday ? '👊 Poke the group' : 'Poked today ✓'}
              </button>
            </div>
            {pokeMsg[c.id] && <p style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 10 }}>{pokeMsg[c.id]}</p>}
          </Card>
        ))}

        {/* ---- create / join ---- */}
        {circles && !showForm && (
          <button onClick={() => setShowForm(true)} style={{
            width: '100%', padding: '13px', fontSize: 13.5, fontFamily: 'inherit',
            background: 'none', border: `1px dashed ${COLORS.hair}`, borderRadius: 100,
            color: COLORS.muted2, cursor: 'pointer',
          }}>
            {circles.length === 0 ? 'Start one' : 'Create or join another'}
          </button>
        )}

        {circles && showForm && (
          <Card className="apti-in" style={{ padding: 22 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {(['create', 'join'] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setFormError(null) }} style={{
                  flex: 1, padding: '10px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', borderRadius: 100, cursor: 'pointer',
                  background: mode === m ? 'rgba(79,124,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: mode === m ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
                  color: mode === m ? '#fff' : COLORS.muted,
                }}>
                  {m === 'create' ? 'Create a circle' : 'Join with a code'}
                </button>
              ))}
            </div>

            {mode === 'create' ? (
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Circle name — e.g. SRCC Placement Squad"
                style={inputStyle} />
            ) : (
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder="6-character code"
                style={{ ...inputStyle, fontFamily: 'var(--mono)', letterSpacing: 3, textTransform: 'uppercase' }} />
            )}
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={24} placeholder="Your name in the circle (optional)"
              style={{ ...inputStyle, marginTop: 10 }} />

            {formError && <p style={{ color: COLORS.wrong, fontSize: 13, margin: '12px 0 0' }}>{formError}</p>}

            <PrimaryBtn onClick={submit} disabled={busy || (mode === 'create' ? !name.trim() : code.trim().length !== 6)} style={{ marginTop: 16 }}>
              {busy ? 'Working…' : mode === 'create' ? 'Create circle →' : 'Join circle →'}
            </PrimaryBtn>
            {circles.length > 0 && (
              <button onClick={() => setShowForm(false)} style={{
                width: '100%', marginTop: 10, padding: '10px', fontSize: 13.5, fontFamily: 'inherit',
                background: 'none', border: 'none', color: COLORS.muted2, cursor: 'pointer',
              }}>Cancel</button>
            )}
          </Card>
        )}

        {circles && circles.length === 0 && !showForm && (
          <p style={{ fontSize: 12.5, color: COLORS.muted2, marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            Circles are private. Only people with your code can join, and only names, streaks and weekly progress are shown — never your answers.
          </p>
        )}
      </div>

      <AptiNav active="today" />
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: 15, fontFamily: 'inherit',
  background: 'rgba(255,255,255,0.04)', color: '#fff',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
}

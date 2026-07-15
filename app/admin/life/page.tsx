'use client'

import { useState } from 'react'

// Founder-only dashboards for 20 Years (doc 08 §4). Same password-POST
// pattern as the other admin consoles.

interface Dash {
  needsSchema?: boolean
  message?: string
  funnel?: {
    starts: number
    completions: number
    completionRate: number
    shareClicks: number
    shareRate: number
    claims: number
    claimRate: number
    challengesCreated: number
    challengesAccepted: number
    kFactor: number
    ogPageViews: number
    abandons: number
  }
  chapterCompletions?: { chapter: string; n: number }[]
  abandonsByChapter?: { chapter: string; n: number }[]
  shareChannels?: { channel: string; n: number }[]
  aiFallbacks?: { call_type: string; reason: string; n: number }[]
  endings?: { id: string; name: string; tone: string; n: number; realPct: number; prior: number }[]
  lopsidedCards?: { cardId: string; title: string; topOption: string; topPct: number; answers: number }[]
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: 1,
  color: 'var(--muted)',
}

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bc-card" style={{ padding: '16px 18px' }}>
      <div style={{ ...mono, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--fg)' }}>{value}</div>
      {hint && <div style={{ ...mono, fontSize: 10, marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

export default function LifeAdminPage() {
  const [password, setPassword] = useState('')
  const [dash, setDash] = useState<Dash | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/life', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setDash(await res.json())
    } catch (e) {
      setError(e instanceof Error && e.message === '401' ? 'Wrong password.' : 'Could not load.')
    }
    setLoading(false)
  }

  const f = dash?.funnel

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', padding: '48px 20px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>
          ADMIN · 20 YEARS
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, margin: '0 0 24px' }}>
          The funnel and the balance board
        </h1>

        {!dash && (
          <div style={{ display: 'flex', gap: 8, maxWidth: 420 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Admin password"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--fg)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button className="btn-primary" style={{ padding: '12px 22px' }} onClick={load} disabled={loading}>
              <span>{loading ? '…' : 'Open'}</span>
            </button>
          </div>
        )}
        {error && <p style={{ color: '#FF8F8F', fontSize: 13.5, marginTop: 12 }}>{error}</p>}

        {dash?.needsSchema && (
          <div className="bc-card" style={{ padding: 24, marginTop: 20 }}>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{dash.message}</p>
          </div>
        )}

        {f && (
          <>
            <div className="mono-label" style={{ margin: '28px 0 12px' }}>
              RUN FUNNEL · ALL TIME
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
              <Tile label="STARTS" value={f.starts} />
              <Tile label="COMPLETIONS" value={f.completions} hint={`${f.completionRate}% of starts`} />
              <Tile label="K-FACTOR" value={f.kFactor} hint="challenges accepted / endings" />
              <Tile label="SHARE RATE" value={`${f.shareRate}%`} hint={`${f.shareClicks} clicks`} />
              <Tile label="CLAIM RATE" value={`${f.claimRate}%`} hint={`${f.claims} emails`} />
              <Tile label="CHALLENGES" value={`${f.challengesAccepted}/${f.challengesCreated}`} hint="accepted / created" />
              <Tile label="SHARE-PAGE VIEWS" value={f.ogPageViews} />
              <Tile label="ABANDONS" value={f.abandons} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 24 }}>
              <div className="bc-card" style={{ padding: 18 }}>
                <div style={{ ...mono, marginBottom: 10 }}>CHAPTER COMPLETIONS</div>
                {(dash.chapterCompletions ?? []).map((c) => (
                  <div key={c.chapter} style={{ ...mono, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Chapter {Number(c.chapter) + 1}</span>
                    <span style={{ color: 'var(--fg)' }}>{c.n}</span>
                  </div>
                ))}
                <div style={{ ...mono, marginTop: 14, marginBottom: 10 }}>ABANDONS BY CHAPTER</div>
                {(dash.abandonsByChapter ?? []).map((c) => (
                  <div key={c.chapter} style={{ ...mono, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>Chapter {Number(c.chapter) + 1}</span>
                    <span style={{ color: '#FF8F8F' }}>{c.n}</span>
                  </div>
                ))}
              </div>

              <div className="bc-card" style={{ padding: 18 }}>
                <div style={{ ...mono, marginBottom: 10 }}>SHARES BY CHANNEL</div>
                {(dash.shareChannels ?? []).map((c) => (
                  <div key={c.channel} style={{ ...mono, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>{c.channel}</span>
                    <span style={{ color: 'var(--fg)' }}>{c.n}</span>
                  </div>
                ))}
                <div style={{ ...mono, marginTop: 14, marginBottom: 10 }}>AI FALLBACKS</div>
                {(dash.aiFallbacks ?? []).map((c) => (
                  <div key={`${c.call_type}${c.reason}`} style={{ ...mono, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>
                      {c.call_type} · {c.reason}
                    </span>
                    <span style={{ color: '#FFB65C' }}>{c.n}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mono-label" style={{ margin: '28px 0 12px' }}>
              CONTENT BALANCE
            </div>
            {(dash.lopsidedCards ?? []).length > 0 && (
              <div className="bc-card" style={{ padding: 18, marginBottom: 12, borderColor: 'rgba(255,182,92,0.35)' }}>
                <div style={{ ...mono, color: '#FFB65C', marginBottom: 10 }}>
                  FAILED TRADEOFFS (&gt;80/20 real split, ≥20 answers) — rewrite the weak option
                </div>
                {dash.lopsidedCards!.map((c) => (
                  <div key={c.cardId} style={{ ...mono, padding: '3px 0' }}>
                    {c.title} — {c.topPct}% pick “{c.topOption}” ({c.answers} answers)
                  </div>
                ))}
              </div>
            )}
            <div className="bc-card" style={{ padding: 18 }}>
              <div style={{ ...mono, marginBottom: 10 }}>ENDINGS · REAL % VS AUTHORED PRIOR</div>
              {(dash.endings ?? []).map((e) => (
                <div key={e.id} style={{ ...mono, display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span>
                    {e.name} <span style={{ opacity: 0.6 }}>({e.tone})</span>
                  </span>
                  <span>
                    <span style={{ color: 'var(--fg)' }}>{e.realPct}%</span>
                    <span style={{ opacity: 0.6 }}> vs {e.prior}% · n={e.n}</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

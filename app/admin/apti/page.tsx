'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Founder question console (docs/aptitude/13): generate Haiku drafts per
// skill, then review at ~60s/question — solve first, reveal, verdict.
// Keyboard: A–D answer · Y approve · X reject · E edit · S skip.

const COLORS = {
  hair: 'rgba(255,255,255,0.08)', muted: 'rgba(255,255,255,0.55)',
  muted2: 'rgba(255,255,255,0.35)', correct: '#34D399', wrong: '#F87171',
  stretch: '#FBBF24', blue: '#4F7CFF',
}
const GRAD = 'linear-gradient(135deg, #4F7CFF, #7B61FF)'

interface Payload {
  stem_md: string
  options: { key: string; text: string; trap: string | null }[]
  answer: { keys?: string[] }
  solution_md: string
  shortcut_md?: string
  trap_explanations?: Record<string, string>
  hints?: string[]
}
interface Draft {
  id: string
  payload: Payload
  rating: number
  time_benchmark_sec: number
  skill_name: string
  skill_slug: string
  topic_name: string
}
interface SkillRow {
  id: string; slug: string; name: string; topic: string; domain: string
  approved: number; draft: number
}

const REJECT_REASONS = ['wrong answer', 'ambiguous', 'weak traps', 'too similar', 'dull / unrealistic']

export default function AptiConsole() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'review' | 'generate'>('review')
  const [skills, setSkills] = useState<SkillRow[]>([])
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editPayload, setEditPayload] = useState<Payload | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [genSkill, setGenSkill] = useState('')
  const [genCount, setGenCount] = useState(4)
  const [genLog, setGenLog] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const pwRef = useRef('')

  const api = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const res = await fetch('/api/admin/apti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwRef.current, action, ...extra }),
    })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'failed')
    return res.json()
  }, [])

  const loadAll = useCallback(async () => {
    const [ov, q] = await Promise.all([api('overview'), api('queue')])
    setSkills(ov.skills)
    setDrafts(q.drafts)
  }, [api])

  const login = async () => {
    pwRef.current = password
    try {
      await loadAll()
      sessionStorage.setItem('bc_apti_pw', password)
      setAuthed(true)
    } catch {
      setStatus('Wrong password')
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem('bc_apti_pw')
    if (saved) {
      pwRef.current = saved
      loadAll().then(() => setAuthed(true)).catch(() => sessionStorage.removeItem('bc_apti_pw'))
    }
  }, [loadAll])

  const current = drafts[0] ?? null
  const answerKey = current?.payload.answer.keys?.[0]

  const advance = () => {
    setDrafts((d) => d.slice(1))
    setPicked(null); setRevealed(false); setEditing(false); setRejectOpen(false)
  }

  const verdict = async (v: 'approve' | 'reject', reason?: string, publish = false) => {
    if (!current || busy) return
    setBusy(true)
    try {
      await api('verdict', { id: current.id, verdict: v, reason })
      if (v === 'approve' && publish) {
        // also designate for the public /aptitude SEO pages (doc 11 §4)
        try { await api('seo', { id: current.id, on: true }) } catch { /* approval already landed */ }
      }
      setSkills((s) => s.map((sk) => sk.slug === current.skill_slug
        ? { ...sk, draft: Math.max(0, sk.draft - 1), approved: sk.approved + (v === 'approve' ? 1 : 0) }
        : sk))
      advance()
      if (drafts.length <= 2) api('queue').then((q) => setDrafts((d) => {
        const have = new Set(d.map((x) => x.id))
        return [...d, ...q.drafts.filter((x: Draft) => !have.has(x.id))]
      })).catch(() => {})
    } finally { setBusy(false) }
  }

  const saveEdit = async () => {
    if (!current || !editPayload || busy) return
    setBusy(true)
    try {
      await api('update', { id: current.id, payload: editPayload })
      setDrafts((d) => d.map((x) => x.id === current.id ? { ...x, payload: editPayload } : x))
      setEditing(false); setRevealed(false); setPicked(null)
    } finally { setBusy(false) }
  }

  const generate = async () => {
    if (!genSkill || busy) return
    setBusy(true)
    setGenLog((l) => [`Generating ${genCount} for ${genSkill}…`, ...l])
    try {
      const r = await api('generate', { skillSlug: genSkill, count: genCount })
      setGenLog((l) => [
        `✓ ${r.inserted} drafted${r.rejected.length ? `, ${r.rejected.length} auto-rejected` : ''}`,
        ...r.rejected.map((x: { stem: string; reason: string }) => `  ✕ ${x.reason}: ${x.stem}`),
        ...l,
      ])
      loadAll()
    } catch (e) {
      setGenLog((l) => [`✕ ${(e as Error).message}`, ...l])
    } finally { setBusy(false) }
  }

  // keyboard flow
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!authed || tab !== 'review' || editing || !current) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const k = e.key.toUpperCase()
      if (!revealed && ['A', 'B', 'C', 'D'].includes(k)) { setPicked(k); setRevealed(true); return }
      if (!revealed) return
      if (k === 'Y') verdict('approve')
      else if (k === 'P') verdict('approve', undefined, true)
      else if (k === 'X') setRejectOpen(true)
      else if (k === 'E') { setEditPayload(JSON.parse(JSON.stringify(current.payload))); setEditing(true) }
      else if (k === 'S') advance()
      else if (rejectOpen && ['1', '2', '3', '4', '5'].includes(e.key)) {
        verdict('reject', REJECT_REASONS[Number(e.key) - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab, editing, revealed, current, rejectOpen])

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.04)', color: '#fff',
    border: `1px solid ${COLORS.hair}`, borderRadius: 10,
  }
  const btn = (bg: string): React.CSSProperties => ({
    padding: '10px 18px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
    background: bg, color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer',
  })

  if (!authed) {
    return (
      <main style={{ maxWidth: 380, margin: '0 auto', padding: '96px 20px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, marginBottom: 18 }}>Apti Console</h1>
        <input
          type="password" value={password} placeholder="Founder password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          style={inputStyle}
        />
        <button onClick={login} style={{ ...btn(GRAD), width: '100%', marginTop: 12, padding: '13px' }}>Enter</button>
        {status && <p style={{ color: COLORS.wrong, fontSize: 13, marginTop: 10 }}>{status}</p>}
      </main>
    )
  }

  const totalDrafts = skills.reduce((a, s) => a + s.draft, 0)
  const totalApproved = skills.reduce((a, s) => a + s.approved, 0)

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 80px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 22 }}>Apti Console</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['review', 'generate'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...btn(tab === t ? 'rgba(79,124,255,0.18)' : 'transparent'),
              border: tab === t ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.hair}`,
              color: tab === t ? '#fff' : COLORS.muted, fontWeight: 600, textTransform: 'capitalize',
            }}>
              {t}{t === 'review' && totalDrafts > 0 ? ` (${totalDrafts})` : ''}
            </button>
          ))}
        </div>
      </header>

      {/* ================= REVIEW ================= */}
      {tab === 'review' && !current && (
        <p style={{ color: COLORS.muted, textAlign: 'center', padding: '60px 0' }}>
          Queue clear — {totalApproved} approved in the bank. Generate more drafts →
        </p>
      )}

      {tab === 'review' && current && !editing && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.muted2 }}>
              {current.topic_name} · {current.skill_name} · seed {current.rating} · {current.time_benchmark_sec}s
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 12, color: COLORS.muted2 }}>
              {drafts.length} in queue
            </span>
          </div>

          <p style={{ fontSize: 17.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 18 }}>{current.payload.stem_md}</p>

          <div style={{ display: 'grid', gap: 8, marginBottom: 18 }}>
            {current.payload.options.map((o) => {
              const isAnswer = revealed && o.key === answerKey
              const isPickWrong = revealed && picked === o.key && o.key !== answerKey
              return (
                <button
                  key={o.key}
                  disabled={revealed}
                  onClick={() => { setPicked(o.key); setRevealed(true) }}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left',
                    padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', color: '#fff',
                    borderRadius: 12, cursor: revealed ? 'default' : 'pointer',
                    background: isAnswer ? 'rgba(52,211,153,0.10)' : isPickWrong ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isAnswer ? COLORS.correct : isPickWrong ? COLORS.wrong : COLORS.hair}`,
                  }}
                >
                  <strong style={{ fontFamily: 'var(--mono)', fontSize: 13, color: COLORS.muted }}>{o.key}</strong>
                  <span>
                    {o.text}
                    {revealed && o.trap && (
                      <span style={{ display: 'block', fontSize: 12.5, color: COLORS.stretch, marginTop: 4 }}>
                        ⚠ {o.trap}: {current.payload.trap_explanations?.[o.trap] ?? ''}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {!revealed && (
            <p style={{ color: COLORS.muted2, fontSize: 13, textAlign: 'center' }}>
              Solve it first — press A–D or click. Your read on difficulty is the QC.
            </p>
          )}

          {revealed && (
            <>
              <div style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 12,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
                fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
              }}>
                <strong style={{ color: picked === answerKey ? COLORS.correct : COLORS.wrong }}>
                  {picked === answerKey ? '✓ You matched the key.' : `✕ You picked ${picked}; key says ${answerKey}. Suspect the question first.`}
                </strong>
                {'\n\n'}{current.payload.solution_md}
                {current.payload.shortcut_md ? `\n\n★ ${current.payload.shortcut_md}` : ''}
                {current.payload.hints?.length ? `\n\n💡 ${current.payload.hints.join('  ·  ')}` : ''}
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => verdict('approve')} disabled={busy} style={btn('rgba(52,211,153,0.85)')}>
                  Approve <span style={{ opacity: 0.7 }}>(Y)</span>
                </button>
                <button
                  onClick={() => verdict('approve', undefined, true)}
                  disabled={busy}
                  title="Approve and show on the public /aptitude SEO pages"
                  style={btn('rgba(79,124,255,0.75)')}
                >
                  Approve + public <span style={{ opacity: 0.7 }}>(P)</span>
                </button>
                <button onClick={() => setRejectOpen((v) => !v)} disabled={busy} style={btn('rgba(248,113,113,0.8)')}>
                  Reject <span style={{ opacity: 0.7 }}>(X)</span>
                </button>
                <button
                  onClick={() => { setEditPayload(JSON.parse(JSON.stringify(current.payload))); setEditing(true) }}
                  style={btn('rgba(255,255,255,0.1)')}
                >
                  Edit <span style={{ opacity: 0.6 }}>(E)</span>
                </button>
                <button onClick={advance} style={btn('transparent')}>
                  <span style={{ color: COLORS.muted }}>Skip (S)</span>
                </button>
              </div>

              {rejectOpen && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {REJECT_REASONS.map((r, i) => (
                    <button key={r} onClick={() => verdict('reject', r)} style={{
                      ...btn('rgba(255,255,255,0.05)'), fontWeight: 500, fontSize: 13,
                      border: `1px solid ${COLORS.hair}`, color: COLORS.muted,
                    }}>
                      {i + 1}. {r}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ---- inline editor ---- */}
      {tab === 'review' && current && editing && editPayload && (
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ fontSize: 12, color: COLORS.muted2 }}>Stem
            <textarea value={editPayload.stem_md} rows={3} style={{ ...inputStyle, marginTop: 6 }}
              onChange={(e) => setEditPayload({ ...editPayload, stem_md: e.target.value })} />
          </label>
          {editPayload.options.map((o, i) => (
            <div key={o.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setEditPayload({
                  ...editPayload,
                  answer: { keys: [o.key] },
                  options: editPayload.options.map((x) => ({ ...x, trap: x.key === o.key ? null : (x.trap ?? 'calc-slip') })),
                })}
                title="Mark as correct"
                style={{
                  ...btn(editPayload.answer.keys?.[0] === o.key ? 'rgba(52,211,153,0.8)' : 'rgba(255,255,255,0.06)'),
                  padding: '10px 14px', fontFamily: 'var(--mono)',
                }}
              >{o.key}</button>
              <input value={o.text} style={inputStyle}
                onChange={(e) => {
                  const options = [...editPayload.options]
                  options[i] = { ...o, text: e.target.value }
                  setEditPayload({ ...editPayload, options })
                }} />
            </div>
          ))}
          <label style={{ fontSize: 12, color: COLORS.muted2 }}>Solution
            <textarea value={editPayload.solution_md} rows={4} style={{ ...inputStyle, marginTop: 6 }}
              onChange={(e) => setEditPayload({ ...editPayload, solution_md: e.target.value })} />
          </label>
          <label style={{ fontSize: 12, color: COLORS.muted2 }}>Shortcut
            <textarea value={editPayload.shortcut_md ?? ''} rows={2} style={{ ...inputStyle, marginTop: 6 }}
              onChange={(e) => setEditPayload({ ...editPayload, shortcut_md: e.target.value })} />
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveEdit} disabled={busy} style={btn(GRAD)}>Save changes</button>
            <button onClick={() => setEditing(false)} style={btn('rgba(255,255,255,0.08)')}>Cancel</button>
          </div>
          <p style={{ fontSize: 12, color: COLORS.muted2 }}>
            Tip: to change trap explanations or hints, reject instead and regenerate — the library prompt usually does it better than hand-editing.
          </p>
        </div>
      )}

      {/* ================= GENERATE ================= */}
      {tab === 'generate' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <select value={genSkill} onChange={(e) => setGenSkill(e.target.value)}
              style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: 220 }}>
              <option value="">Pick a skill…</option>
              {skills.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.topic} — {s.name} ({s.approved} live, {s.draft} pending)
                </option>
              ))}
            </select>
            <select value={genCount} onChange={(e) => setGenCount(Number(e.target.value))}
              style={{ ...inputStyle, width: 'auto' }}>
              {[3, 4, 5].map((n) => <option key={n} value={n}>{n} drafts</option>)}
            </select>
            <button onClick={generate} disabled={busy || !genSkill} style={{ ...btn(GRAD), opacity: busy || !genSkill ? 0.5 : 1 }}>
              {busy ? 'Drafting…' : 'Generate'}
            </button>
          </div>

          {genLog.length > 0 && (
            <pre style={{
              fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.7, color: COLORS.muted,
              background: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.hair}`,
              borderRadius: 12, padding: 14, whiteSpace: 'pre-wrap', marginBottom: 20, maxHeight: 220, overflowY: 'auto',
            }}>{genLog.join('\n')}</pre>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ color: COLORS.muted2, textAlign: 'left', fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>
                <th style={{ padding: '8px 6px' }}>Skill</th>
                <th style={{ padding: '8px 6px' }}>Topic</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Live</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Pending</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.slug} style={{ borderTop: `1px solid ${COLORS.hair}` }}>
                  <td style={{ padding: '9px 6px' }}>{s.name}</td>
                  <td style={{ padding: '9px 6px', color: COLORS.muted }}>{s.topic}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'right', fontFamily: 'var(--mono)', color: s.approved === 0 ? COLORS.wrong : COLORS.correct }}>{s.approved}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'right', fontFamily: 'var(--mono)', color: s.draft > 0 ? COLORS.stretch : COLORS.muted2 }}>{s.draft}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12.5, color: COLORS.muted2, marginTop: 16, lineHeight: 1.6 }}>
            Each batch runs two AI passes (draft + independent cold-solve) and structure dedupe
            before anything reaches your queue. Nothing goes live without your approve.
          </p>
        </div>
      )}
    </main>
  )
}

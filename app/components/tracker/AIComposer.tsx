'use client'

import { useState } from 'react'
import { Application } from './types'

type Kind = 'cold_email' | 'follow_up' | 'linkedin_dm'
type Tone = 'professional' | 'warm' | 'direct'

interface GenResult { subject: string | null; body: string; tips: string[] }

export default function AIComposer({
  app,
  onAiCapHit,
  onGenerated,
}: {
  app: Application
  onAiCapHit: () => void
  onGenerated?: () => void
}) {
  const [kind, setKind] = useState<Kind>(app.status === 'saved' ? 'cold_email' : 'follow_up')
  const [tone, setTone] = useState<Tone>('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenResult | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/tracker/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: app.id, kind, tone }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error === 'AI_CAP_REACHED') { onAiCapHit(); return }
    if (!res.ok || !data.body) { setError('Generation failed. Try again in a moment.'); return }
    setResult(data)
    onGenerated?.()
  }

  const copyAll = () => {
    if (!result) return
    const text = result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
    background: active ? 'rgba(79,124,255,0.2)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? '#4F7CFF' : 'rgba(255,255,255,0.1)'}`,
    color: active ? '#93BBFF' : 'rgba(255,255,255,0.5)',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {([['cold_email', '📨 Cold email'], ['follow_up', '⏰ Follow-up'], ['linkedin_dm', '💼 LinkedIn DM']] as [Kind, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setKind(k)} style={pillStyle(kind === k)}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {([['professional', 'Professional'], ['warm', 'Warm'], ['direct', 'Direct']] as [Tone, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTone(t)} style={pillStyle(tone === t)}>{label}</button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        style={{ width: '100%', padding: 13, borderRadius: 12, background: 'linear-gradient(135deg, #4F7CFF, #7B61FF)', color: 'white', fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? '✨ Writing for ' + app.company + '...' : result ? '🔄 Regenerate' : `✨ Write my ${kind === 'cold_email' ? 'cold email' : kind === 'follow_up' ? 'follow-up' : 'DM'}`}
      </button>

      {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 10 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16 }}>
            {result.subject && (
              <div style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>Subject: </span>
                <span style={{ color: 'white', fontSize: 13.5, fontWeight: 600 }}>{result.subject}</span>
              </div>
            )}
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{result.body}</p>
          </div>
          <button
            onClick={copyAll}
            style={{ width: '100%', marginTop: 10, padding: 11, borderRadius: 12, background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.12)'}`, color: copied ? '#6ee7b7' : 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
          </button>
          {result.tips?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {result.tips.map((tip, i) => (
                <p key={i} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, lineHeight: 1.5, margin: '6px 0', paddingLeft: 18, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>💡</span> {tip}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
